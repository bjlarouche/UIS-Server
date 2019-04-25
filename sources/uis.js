// uis.js: Functionality to handle communication with uis

// Author(s): Brandon LaRouche

/* START FOLD REQUIRE MODULES */
/*==================================================
= REQUIRE MODULES =
==================================================*/

// For Express App
var app = require(__dirname + '/../app'); //Uncomment this line if you need to use the Express() app.

// For the POST and GET HTTP requests
var fetch = require('node-fetch');
var request = require('request');
var syncRequest = require('sync-request');

// To read/write files
var fs = require('fs');

// For console progress bar
const cliProgress = require('cli-progress');

/* END FOLD */

/* START FOLD REQUIRE OTHER SOURCE FILES */
/*==================================================
= REQUIRE OTHER SOURCE FILES =
==================================================*/

//Used to read config file JSON
const config = require(__dirname + '/../config/config');

// Used to read communicate with Parse
var ParseServer = require(__dirname + '/../sources/ParseServer');

// Official parse npm module
const Parse = require('parse/node');
Parse.initialize("uIGaipSp2UYvOjNl6qrSTUsfZVmn9l5Ig8J2LuSS", "OW9jaqSwKdYw93xuL43whvw1258bbcZVBFpqMAvp", "MldAU91v4yGkdWKvj2YnNsapjce8HNFwRXGWbV9z");
Parse.serverURL = 'https://parseapi.back4app.com'

// Used for Http requests
var HttpService = require(__dirname + '/../sources/HttpService');

/* END FOLD */

/* START FOLD UIS: DOCUMENTATION */
/*==================================================
= FILE: uis.js =
- Variables:
----- uis
---------- The uis.js module to be exported by module.exports
- Globals:
----- .___
---------- ___
- Helper Functions:
----- ___()
---------- ___
- Private Functions:
----- ___()
---------- ___
- Public Functions:
----- .___()
---------- ___
- ENDPOINTS:
----- POST '/api/uis/start'
---------- Listen for a remote webhook to start the task
---------- i.e. http://localhost:4000/api/uis/start
==================================================*/
/* END FOLD */

/* START FOLD UIS: SETUP */
/*==================================================
= UIS: SETUP =
==================================================*/

var uis = {}; // The uis.js module to be exported by module.exports

uis.DEBUG_MODE = false;
uis.USE_SAVED = false;
uis.UISURL = "https://registration.bc.edu/servlet";

uis.Username = process.env.username;//config.UIS.username;
uis.Password = process.env.password;//config.UIS.password;

uis.Session = ";jsessionid=02BB40FB884B67D8E4E9165621CDEEB6";
uis.SavedCache = null;
uis.LastPostTime = null;
uis.TotalInterim = 0;
uis.TotalPosts = 0;

uis.Total = 0;
uis.Current = 0;
uis.LastHeartBeat = null;

uis.UISProgressBar = new cliProgress.Bar({ format: 'Fetching courses from UIS [{bar}] {percentage}% | {value}/{total} Departments'}, cliProgress.Presets.shades_classic);
uis.UpdateProgressBar = new cliProgress.Bar({ format: 'Updating courses in Parse andd fetching rating from Avalanche if needed [{bar}] {percentage}% | {value}/{total} Courses'}, cliProgress.Presets.shades_classic);


uis.SavedMasterList = JSON.parse(fs.readFileSync(__dirname + '/../data/saved_masterList.js', 'utf8')); // Reading the .json file Synchronously and parsing into JSON

/* END FOLD */

/* START FOLD UIS: HELPER FUNCTIONS */
/*==================================================
= UIS: HELPER FUNCTIONS =
==================================================*/

// Console.log with a red "{prefix}" prefix.
function print( ...args) {
	console.log("\x1b[31mUIS\x1b[0m:", ...args);
}

function existsInTable(str, tab) {
  if (str.length <= 0)
  return false;
  Object.keys(tab).forEach(function(key) {
    if (str == tab[key])
    return true
  });
  return false;
}

function PostJSON(body, url) {
  var headers = { 'Content-Type': 'application/json' };

  let newBody = HttpService.JSONEncode(body)

  let response;
  [success, response] = HttpService.PostAsync(url, newBody)

  return response;
}

function getTime() {
  let date = new Date();
  return date.getTime();
}

function getMatches(string, regex, index) {
  index || (index = 1); // default to the first capturing group
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}

function OwnUrlEncode(dataToEncode) {
  let encoded = "";
  let count = 0;
  Object.keys(dataToEncode).forEach(function(key) {
    let value = dataToEncode[key];

    if (count == 0)
      encoded = encoded + key.toString() + "=" + value.toString();
    else
      encoded = encoded + "&" + key.toString() + "=" + value.toString();

    count = count + 1;
  });

  return encoded;
}

// Checks if tables are equal. I think I got this off of StackOverflow or something (thanks to whoever wrote it!)
let equals = function( x, y ) {
  if ( x === y ) return true;
    // if both x and y are null or undefined and exactly the same

  if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
    // if they are not strictly equal, they both need to be Objects

  if ( x.constructor !== y.constructor ) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

  for ( var p in x ) {
    if ( ! x.hasOwnProperty( p ) ) continue;
      // other properties were tested using x.constructor === y.constructor

    if ( ! y.hasOwnProperty( p ) ) return false;
      // allows to compare x[ p ] and y[ p ] when set to undefined

    if ( x[ p ] === y[ p ] ) continue;
      // if they have the same strict value or identity then they are equal

    if ( typeof( x[ p ] ) !== "object" ) return false;
      // Numbers, Strings, Functions, Booleans must be strictly equal

    if ( ! Object.equals( x[ p ],  y[ p ] ) ) return false;
      // Objects and Arrays must be tested recursively
  }

  for ( p in y ) {
    if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
      // allows x[ p ] to be set to undefined
  }
  return true;
}

/* END FOLD */

/* START FOLD UIS: PRIVATE FUNCTIONS */
/*==================================================
= UIS: PRIVATE FUNCTIONS =
==================================================*/

// Prints list of created courses
// Only called if uis.DEBUG_MODE == true
function outputMasterList(masterList) {
  Object.keys(masterList).forEach(function(collegeKey) {
    let college = masterList[collegeKey];
    Object.keys(college).forEach(function(departmentKey) {
      let department = college[departmentKey];
      Object.keys(department).forEach(function(index) {
        let course = department[index];
        print("Class " + index + ": {")
        Object.keys(course).forEach(function(key) {
          let value = course[key];
          print("\t" + key + ": ", value)
        });
        print("}")
      });
    });
  });
}

// Determines if a course has changed from CLOSED to OPEN status
let shouldSendOpenPush = function(UISClass, parseClass) {
  if (UISClass == null || UISClass == undefined)
    return false
  if (parseClass == null || parseClass == undefined)
    return false

  if (UISClass.Comment == parseClass.get("Comment"))
    return false;
  if (!(parseClass.get("Comment").includes("CLOSED")))
    return false;
  if (!(UISClass.Comment.includes("CLOSED")))
    return true;

  return false;
}

// Determines if a course has changed from OPEN to CLOSED status
let shouldSendClosePush = function(UISClass, parseClass) {
  if (UISClass == null || UISClass == undefined)
    return false
  if (parseClass == null || parseClass == undefined)
    return false

  if (UISClass.Comment.toString() == parseClass.get("Comment"))
    return false;
    if (!(UISClass.Comment.includes("CLOSED")))
      return false;
    if (!(parseClass.get("Comment").includes("CLOSED")))
      return true;

  return false
}

// Uses ParseServer to trigger Cloud Code "push" function to send a push notification to clients subscribing to the given Course identifier
let sendPushForClass = function(parseClass, message) {
  let data = {
    "alert": message,
    "sender": "UIS",
    "badge": "increment",
    "sound": "solemn.mp3",
    "target": parseClass.get("Course"),
  }

  let response = ParseServer.CloudCode("push", data);
}

let getCourseFromList = function(course_id, masterList) {
  Object.keys(masterList).forEach(function(collegeKey) {
    let college = masterList[collegeKey];
    Object.keys(college).forEach(function(departmentKey) {
      let department = college[departmentKey];
      Object.keys(department).forEach(function(index) {
        let course = department[index];
        uis.LastHeartBeat = getTime();
        if (course.Course == given_course)
          return course;
      });
    });
  });
  return null
}

let CheckParse = async function(limit, skip) {
  const Courses = Parse.Object.extend("Courses");
  const query = new Parse.Query(Courses);
  query.limit(100000);
  const results = await query.find();
  print("Successfully retrieved " + results.length + " courses.");

  let responseSuccess = results.length <= 0 ? false : true;
  if (!(responseSuccess)) {
     // Request failed: skip the wait time and try again
     print("CheckParse not successful.")
     return [];
  }

  return results;
}

let classNeedsUpdate = function(UISClass, parseClass) {
  if (UISClass == null || UISClass == undefined)
    return false
  if (parseClass == null || parseClass == undefined)
    return false
  Object.keys(UISClass).forEach(function(key) {
    let value = UISClass[key];
    if (value != parseClass.get(key))
      return true
  });
  return false
}

let updateClass = async function (UISClass, parseClass) {
  if (UISClass == null || UISClass == undefined)
    return false
  if (UISClass.Course == "-19Fall(E")
    return false
  if (UISClass.Course == "-20Fall(E")
    return false
  if (UISClass.Course == "-21Fall(E")
    return false
  if (UISClass.Level == "er")
    return false
  if( UISClass.Title == " U for Summer, S for Sp")
    return false
  if (UISClass.Raw == "=2018-19 Fall  (Enter U for Summer, S for Spring)")
    return false
  if (UISClass.Raw == "=2019-20 Fall  (Enter U for Summer, S for Spring)")
    return false
  if (UISClass.Raw == "=2020-21 Fall  (Enter U for Summer, S for Spring)")
    return false
  if (UISClass.Raw == "2018-19 Spring")
    return false
  if (UISClass.Raw == "2019-20 Spring")
    return false
  if (UISClass.Raw == "2020-21 Spring")
    return false
  if (UISClass.Raw == "=2018-19 Spring                                  ")
    return false
  if (UISClass.Index == "=2018")
    return false
  if (UISClass.Index == "=2019")
    return false
  if (UISClass.Raw == "=2019-20 Spring                                  ")
     return false
 if (UISClass.Raw == "=2020")
        return false
  if (UISClass.Raw == "=2020-21 Fall                                  ")
     return false

  if (parseClass != null && parseClass != undefined) { // Course is in the database, update the exisiting one
    parseClass.set("Index", UISClass.Index);
    parseClass.set("Course", UISClass.Course);
    parseClass.set("Credit", UISClass.Credit);
    parseClass.set("Level", UISClass.Level);
    parseClass.set("Title", UISClass.Title);
    parseClass.set("Schedule", UISClass.Schedule);
    parseClass.set("Professor", UISClass.Professor);
    parseClass.set("Comment", UISClass.Comment);
    parseClass.set("Raw", UISClass.Raw);
    parseClass.set("Location", UISClass.Location);
    parseClass.set("College", UISClass.College);
    parseClass.set("Department", UISClass.Department);
    parseClass.set("Ranking", parseClass.get("Ranking"));

    let updatedClass = await parseClass.save();
  }
  else { // Course is not yet in the database, create a new one
    // Only update ranking if class didnt previously exist on database
    let averages, averageTotal;
    [averages, averageTotal] = await getCourseReviewAverage(UISClass.Course)
    UISClass.Ranking = "" + averageTotal

    var Courses = Parse.Object.extend("Courses");
    var parseClass = new Courses();

    parseClass.set("Index", UISClass.Index);
    parseClass.set("Course", UISClass.Course);
    parseClass.set("Credit", UISClass.Credit);
    parseClass.set("Level", UISClass.Level);
    parseClass.set("Title", UISClass.Title);
    parseClass.set("Schedule", UISClass.Schedule);
    parseClass.set("Professor", UISClass.Professor);
    parseClass.set("Comment", UISClass.Comment);
    parseClass.set("Raw", UISClass.Raw);
    parseClass.set("Location", UISClass.Location);
    parseClass.set("College", UISClass.College);
    parseClass.set("Department", UISClass.Department);
    parseClass.set("Ranking", averageTotal.toString());

    let updatedClass = await parseClass.save();
  }

  return true;
}

async function getCourseReviewAverage(courseId) {
  if (courseId == undefined || courseId == null)
    return [{}, null];

  courseId = courseId.replace(" ", "");

  let returnTable = await uis.GetCourseReviews(courseId);
  if (Object.keys(returnTable).length <= 0)
    return [{}, null]

  for (let key in returnTable) { // Iterate on members of the array
    var course = returnTable[key]

    let averages = []
    let averageNumeratorSum = 0
    let averageDenominatorSum = 0
    let courseRankings = []

    for (var j = 0; j < course.length; j++) { // Iterate on members of the array
      var value = course[j]
      if (j == 0) {
        value = value.replace("<\/?[^>]+>", "")

        let matches = value.match(/[^\r\n]+/g);
        for (var k = 0; k < matches.length; k++) {
          let courseRanking = matches[k];

          let average = courseRanking.match(/[1-9][0-9]*\/[1-9][0-9]*/)
          if (courseRanking.includes("Boston College Past Course Evaluations Search"))
            return [{}, 0]

          if (average != null) {
            average = average.toString();
            let startIndex = average.indexOf('/');
            let numerator = average.substring(0, startIndex);
            let denominator = average.substring(startIndex + 1);
            averageNumeratorSum = averageNumeratorSum + parseInt(numerator);
            averageDenominatorSum = averageDenominatorSum + parseInt(denominator);

            averages.push(average);
            courseRankings.push(courseRanking);
          }
        }
      }
    }
    let averageTotal = averageNumeratorSum / averageDenominatorSum;

    return [averages, averageTotal]
  }

  return [[], 0]
}

function createClass(classString, college, department) {
  classString = classString.replace("amp;", "")

  let course = {
    Index: classString.substring(0, 4).replace(" ", ""),
    Course: classString.substring(5, 16).replace(" ", ""),
    Credit: classString.substring(17, 18).replace(" ", ""),
    Level: classString.substring(19, 20).replace(" ", ""),
    Title: classString.substring(21, 43),
    Schedule: classString.substring(44, 55),
    Professor: classString.substring(56, 63),
    Comment: classString.substring(64).replace(" ", ""),
    Raw: classString,
    Location: "",
    College: college,
    Department: department
  };

  return course;
}

function getSessionResponse() {
  let url = uis.UISURL; // UIServer.UISURL is "http://register.bc.edu/"

  // Synronous request
  var response = HttpService.GetSync(url, null);

  return response;
}

function GetSession() {
  let sessionResponse = JSON.stringify(getSessionResponse().headers["set-cookie"])
  if (sessionResponse.includes("JSESSIONID")) {
    let firstLookup = "JSESSIONID="
    let firstStart = sessionResponse.indexOf(firstLookup);
    let newString = sessionResponse.substring(firstStart + firstLookup.length);
    let firstEnd = newString.indexOf(";");
    let sessionId = newString.substring(0, firstEnd - 1);
    sessionId = ";jsessionid=" + sessionId;
    print("Current Session: ", sessionId)
    return sessionId
  }

  return null;
}

// Creates a new object of the given class with fields specified inn body
async function Post(body) {
  if (uis.Session == null)
    uis.Session = GetSession();

  uis.TotalPosts += 1
  let currentTime = getTime();
  if (uis.LastPostTime == null || uis.LastPostTime == undefined)
    uis.LastPostTime = currentTime
  let timeSinceLastPost = currentTime - uis.LastPostTime
  uis.TotalInterim = uis.TotalInterim + timeSinceLastPost

  let averageTime = uis.TotalInterim / uis.TotalPosts
  // print(string.format("TimeSince: %s \t Average: %s", timeSinceLastPost, averageTime))
  uis.LastPostTime = currentTime

  let url = uis.UISURL + uis.Session // UIServer.UISURL is "http://register.bc.edu/" and UIServer.Session is the jsessionid

  //let newBody = OwnUrlEncode(body)

  try {
    let response = await HttpService.PostUISAsync(url, body, null).catch((err) => { console.log(err) });;
    let success = response.length <= 0 ? false : true;
    //print("Posted to [" + url + "] with body \n\t" + JSON.stringify(body))
    //print(response);
    return [success, response]; // Returns in form: [success, response]
  } catch (err) {
    //print("Posted to [" + url + "] with body \n\t" + JSON.stringify(body))
    print('ERROR:' + err);
    return [false, ""];
  }

  // let response = await HttpService.PostSync(url, body, null);
  // let success = response.length <= 0 ? false : true;
  //
  // return [success, response]; // Returns in form: [success, response]
}

async function initialize(terminal) {
  let disconnectBody = {
    "disconnect": "Disconnect",
    "dumpfile": "",
    "dump": "Dump",
    "colorscheme": "",
    "font": "",
    "render": "",
    "org.h3270.Terminal.id": terminal
  };
  // Success already declared
  //let success;
  let disconnectSuccess, disconnectResponse;
  //[disconnectSuccess, disconnectResponse] = await Post(disconnectBody)

  let connectBody = {
    "hostname": "bcvmcms.bc.edu",
    "connect": "Connect",
    "colorscheme": "",
    "font": "",
    "render": "",
    "org.h3270.Terminal.id": terminal
  };
  let connectResponse;
  [success, connectResponse] = await Post(connectBody);

  let makeSessionBody = {
    "field_1_0": "LOOK",
    "field_6_0": "",
    "field_43_5": "09",
    "key": "enter",
    "org.h3270.Terminal.id": terminal
  };
  let makeSessionResponse;
  //[success, makeSessionResponse] = await Post(makeSessionBody).catch((err) => { console.log(err) });;
  needsConnection = connectResponse.includes("CONNECT button");
  if (needsConnection)
    [success, makeSessionResponse] = await Post(makeSessionBody).catch((err) => { console.log(err) });;

  let loginBody = {
    "field_45_6": uis.Username,
    "field_45_8": uis.Password,
    "field_57_20": "",
    "key": "enter",
    "org.h3270.Terminal.id": terminal
  };
  let loginResponse
  [success, loginResponse] = await Post(loginBody);
  let found = loginResponse.includes("ENTER YOUR ID OR USERNAME");
  let authFailed = loginResponse.includes("AUTHENTICATION FAILED");
  let tryCount = 0;
  while (found || authFailed) {
    if (tryCount > 5) {
      let tempDisconnect = await Post(disconnectBody);
      throw "ERROR: Login failed.";
    }
    tryCount = tryCount + 1;
    [success, loginResponse] = await Post(loginBody);
    found = loginResponse.includes("ENTER YOUR ID OR USERNAME");
    authFailed = loginResponse.includes("AUTHENTICATION FAILED");
  }
  // print(loginResponse)

  let uviewBody = {
    "field_1_0": "LOOK",
    "field_6_0": "",
    "field_43_5": "7",
    "key": "enter",
    "org.h3270.Terminal.id": terminal
  };
  let uviewResponse;
  [success, uviewResponse] = await Post(uviewBody);
  found = uviewResponse.includes("STUDENT INFORMATION");
  let skip = uviewResponse.includes("INSTRUCTOR");
  tryCount = 0;
  while (!(found || skip)) {
    if (tryCount > 5) {
      print("ERROR: UIVIEW failed.");
      return [false, {}];
    }
    tryCount = tryCount + 1;
    [success, uviewResponse] = await Post(uviewBody);
    found = uviewResponse.includes("STUDENT INFORMATION");
  }

  let studentBody = {
    "field_33_16": "2",
    "key": "enter",
    "org.h3270.Terminal.id": terminal
  };
  let studentResponse;
  [success, studentResponse] = await Post(studentBody);
  found = studentResponse.includes("BUILDING");
  skip = studentResponse.includes("INSTRUCTOR");
  let skip2 = studentResponse.includes("STUDENT INFORMATION");
  tryCount = 0;
  while (!(found || skip || skip2)) {
    if (tryCount > 5) {
      print("ERROR: Student information failed.");
      [false, {}];
    }
    tryCount += 1;
    [success, studentResponse] = await Post(studentBody);
    found = studentResponse.includes("BUILDING")
  }

  let coursesBody = {
    "field_21_15": "c",
    "key": "enter",
    "org.h3270.Terminal.id": terminal
  };
  let coursesReponse;
  [success, coursesReponse] = await Post(coursesBody);

  let initializeSuccess = coursesReponse.includes("SEARCH COURSES") ? true : false;

  return initializeSuccess
}

async function extractCourses(college, department, terminal) {
  let searchBody = {
    "field_23_1": "S",
    "field_23_2": department,
    "field_23_3": "A",
    "field_27_4": "",
    "field_56_4": "",
    "key": "enter",
    "org.h3270.Terminal.id": terminal
  };
  let success, searchResponse;
  [success, searchResponse] = await Post(searchBody);

  let results = []
  while (searchResponse.includes("Press RETURN/ENTER to Page Forward")) {
    // print("**NEW PAGE**")
    let searchPosition = 0;

    while (searchResponse.includes("\<span class\=\"h3270\-intensified\"\>", searchPosition)) {
      let firstLookup = "\<span class\=\"h3270\-intensified\"\>";
      let firstStart = searchResponse.indexOf(firstLookup, searchPosition);
      let firstEnd = firstStart + firstLookup.length;
      let secondLookup = "\<\/span\>";
      let secondStart = searchResponse.indexOf(secondLookup, firstEnd)
      let secondEnd = secondStart + secondLookup.length
      let classString = searchResponse.substring(firstEnd, secondStart)

      searchPosition = secondEnd

      if (!(classString.includes("\=2019-20 Spring") || classString.includes("er U for Summer") || classString.includes("Dept\/Subj\/Course") || classString.includes("Press RETURN"))) {
        let course = createClass(classString, college, department);
        results.push(course);
        //print("Found course: " + JSON.stringify(course));
      }
    }

    [success, searchResponse] = await Post(searchBody)
  }
  // if searchResponse.includes(, "Press RETURN/ENTER to Restart") { print("All loaded") }

  // Disconnect from session
  // let disconnectSuccess, disconnectResponse = await Post(disconnectBody)
  // uis.Session = null

  return [success, results];
}

function getParseClass(parseCourses, courseId) {
  if (courseId == null || courseId == undefined)
    return null;
  for (let i = 0; i < parseCourses.length; i++) {
    let parseClass = parseCourses[i];
    if (parseClass.get('Course') == courseId)
      return parseClass;
  }
  return null;
}

async function terminateSession(terminal) {
  let disconnectBody = {
		"disconnect": "Disconnect",
		"dumpfile": "",
		"dump": "Dump",
		"colorscheme": "",
		"font": "",
		"render": "",
		"org.h3270.Terminal.id": terminal
	};

  let backBody = {
    "field_23_1": "",
    "field_23_2": "QUIT",
    "field_23_3": "",
    "field_27_4": "",
    "field_56_4": "",
    "key": "enter",
    "org.h3270.Terminal.id": terminal
  };

  let logoutBody = {
    "field_21_15": "L",
    "key": "enter",
    "org.h3270.Terminal.id": terminal
  };

  let tempPostBack = await Post(backBody);
  let tempPostLogout = await Post(logoutBody);
  let tempPostDisconnect = await Post(disconnectBody);

  return true;
}

async function RunServer(colleges, username, password) {
	let terminal = 0

	let total = uis.Total;
	let current = uis.Current;
	let lastHeartBeat = uis.LastHeartBeat;

  uis.Total = 0;

  // Calculate total needed progress
  Object.keys(colleges).forEach(function(key) {
    uis.Total += colleges[key].length;
  });

  uis.LastHeartBeat = getTime();
  uis.Current -= (uis.Total + 1);
  if (uis.Current < 0)
    uis.Current = 0; // Reset progress if starting at the beginning again

  let masterList = {};
  if (uis.USE_SAVED) {
    masterList = uis.SavedMasterList;
    print("Using saved courses from file.")
  }
  else {
    let initializeSuccess = await initialize(terminal);
    while (!(initializeSuccess)) {
      terminal += 1;
      [initializeSuccess, results] = await initialize(terminal);
      if (terminal > 30) {
        let tempTerminate = await terminateSession(terminal);
        uis.Session = null;
        print("Failed to load: Invalid URL");
        return false;
      }
    }

    uis.UISProgressBar.start(uis.Total, 0);
    for (let collegeKey in colleges) {
      let college = colleges[collegeKey];
      //let departments = colleges[college];
  		masterList[collegeKey] = {};

      for (let departmentKey in college) {
        let department = college[departmentKey];
        // print("Checking department", college, department)
        uis.Current += 1;
        uis.LastHeartBeat = getTime();

        let success, results;
        [success, results] = await extractCourses(collegeKey, department, terminal);

        masterList[collegeKey][department] = results

        uis.UISProgressBar.increment();
      }
    }
    uis.UISProgressBar.stop();
    //console.log(JSON.stringify(masterList))
    fs.writeFileSync(__dirname + '/../data/saved_masterList.js', JSON.stringify(masterList, null, 3)); // Save backup of courses to file
    print("FINISHED SEARCHING")
  }

	uis.Current += 1;
	uis.LastHeartBeat = getTime();

	//let tempPost = await Post(disconnectBody); // Disconnect

	if (uis.DEBUG_MODE)
    outputMasterList(masterList)

	let getCourseStatus = function(course_id) {
		let course = getCourseFromList(course_id, masterList)
		if (course == null)
      return "Course does not exist."

		return course["Comment"]
	}

	// print("Course status PHIL667001:", getCourseStatus("PHIL667001"))

  let parseClassList = await CheckParse();

  // Calculate number of fetched courses
  let numOfCourses = 0
	for (let collegeKey in masterList) {
    let college = masterList[collegeKey];
    for (let departmentKey in college) {
      let department = college[departmentKey];
      for (let courseIndex in department) {
        let course = department[courseIndex];
        numOfCourses += 1;
      }
    }
  }
  uis.UpdateProgressBar.start(numOfCourses, 0);

  for (let collegeKey in masterList) {
    let college = masterList[collegeKey];
    for (let departmentKey in college) {
      let department = college[departmentKey];
      for (let courseIndex in department) {
        let course = department[courseIndex];

				let needsUpdate = true;
				let parseClass = getParseClass(parseClassList, course.Course);
				if (parseClass != null && parseClass != undefined)
          needsUpdate = classNeedsUpdate(course, parseClass)

				if (needsUpdate) {
					let temp = await updateClass(course, parseClass).catch((err) => { console.log(err) });

					let shouldSendPushForOpen = shouldSendOpenPush(course, parseClass)
					if (shouldSendPushForOpen) {
            let message = course.Course + " has opened up.";
            sendPushForClass(parseClass, message)
          }

					let shouldSendPushForClose = shouldSendClosePush(course, parseClass)
          if (shouldSendPushForClose) {
            let message = course.Course + " has closed.";
            sendPushForClass(parseClass, message)
          }
        }

				uis.UpdateProgressBar.increment();
      }
    }
  }
  uis.UpdateProgressBar.stop();
  print("FINISHED UPDATING")

  // Send push to master
  let data = {
    "alert": "Latest fetch pushed to server",
    "sender": "UIS",
    "badge": "increment",
    "sound": "solemn.mp3",
    "target": "Master",
  }

  let response = ParseServer.CloudCode("push", data);

  // Go back and invalidate the session -> Logout and disconnectBody
	if (uis.USE_SAVED == false)
		await terminateSession(terminal);

	return true
}

/* END FOLD */

/* START FOLD UIS: PUBLIC FUNCTIONS */
/*==================================================
= UIS: PUBLIC FUNCTIONS =
==================================================*/

uis.GetCourseReviews = async function (courseId) {
  let pepsURL = "https://avalanche.bc.edu/BPI/fbview-WebService.asmx/getFbvGrid";

  let request = {
    "blockId": "10",
    "datasourceId": "10",
    "detailValue": "____[-1]____",
    "gridId": "fbvGrid",
    "pageActuelle": 1,
    "pageSize": "50",
    "sortCallbackFunc": "__getFbvGrid",
    "strFilter": [
      "",
      courseId,
      "ddlFbvColumnSelectorLvl1",
      ""
    ],
    "strOrderBy": [
      "col_1",
      "asc"
    ],
    "strUiCultureIn": "en-US",
    "subjectColId": "1",
    "subjectValue": "____[-1]____",
    "userid": "",
  };

  try {
    let response = await HttpService.PostJSONAsync(pepsURL, request, null).catch((err) => { console.log(err) });
    //print("Posted to [" + pepsURL + "] with body \n\t" + JSON.stringify(request))
    return response; // Returns in form: [success, response]
  } catch (err) {
    //print("Posted to [" + pepsURL + "] with body \n\t" + JSON.stringify(request))
    print('ERROR:' + err);
    return {};
  }
}

uis.Start = async function () {
  let MCAS = ["AADS", "ARTH", "BIOL", "UNCP", "CHEM", "CLAS", "COMM", "CSCI", "UNCS", "EESC", "EALC", "ECON", "ENGL", "ENVS", "FILM", "FREN", "HIST", "HONR", "INTL", "ICSP", "ITAL", "JESU", "JOUR", "LING", "MATH", "ROTC", "MUSA", "MUSP", "NELC", "PHIL", "PHYS", "POLI", "PSYC", "RLRL", "SLAV", "SOCY", "SPAN", "ARTS", "THTR", "THEO", "UNAS"];
  let CSOM = ["ACCT", "BSLW", "MCOM", "MFIN", "ISYS", "GSOM", "MHON", "MPRX", "MGMT", "MKTG", "OPER", "PRTO", "UGMG"];
  let CSON = ["FORS", "NURS", "HLTH"];
  let LAW = ["LAWS"];
  let LYNCH = ["APSY", "ELHE", "ERME", "EDUC"];
  let SSW = ["SCWK"];
  let STM = ["TMCE", "TMHW", "TMNT", "TMOT", "TMPS", "TMRE", "TMST"];
  let colleges = {
  	"MCAS": MCAS,
  	"CSOM": CSOM,
  	"CSON": CSON,
  	"LAW": LAW,
  	"LYNCH": LYNCH,
  	"SSW": SSW,
  	"STM": STM
  };

  let username = uis.Username;
  let password = uis.Password;

  let functionToStart = async function() {
    await RunServer(colleges, username, password);
  }

  //Infinitely keep rerunning the server refresh process
  print("Starting");
  try {
    await RunServer(colleges, username, password);
    print("Will check again in 5 minutes...");
    setTimeout(uis.Start, 5 * 60 * 1000) // Will check again in 5 minutes
  } catch (err) {
    print("RunServer Failed: " + err);
    let tempTerminate = await terminateSession(0);
  }
}

// UIS

/* END FOLD */

/* START FOLD UIS ENDPOINTS */
/*==================================================
= UIS: ENDPOINTS =
==================================================*/

// Listen for a remote webhook to start the task
// i.e. http://localhost:4000/api/uis/start
app.get(['/api/uis/start'], function(req, res) {
  // Send a 200 response for success
  res.send("Success");
  res.end(200);

  uis.Start()
});

/* END FOLD */

/* START FOLD MODULE EXPORT */
/*==================================================
= MODULE EXPORTS =
==================================================*/

// The uis object will now be accessible to any other file that uses require('./sources/uis')
// Any subvariables or functions of the uis dictionary will be accessible by whichever variable the require is assigned to
module.exports = uis;

/* END FOLD */
