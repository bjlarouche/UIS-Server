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

/* END FOLD */

/* START FOLD REQUIRE OTHER SOURCE FILES */
/*==================================================
= REQUIRE OTHER SOURCE FILES =
==================================================*/

//Used to read config file JSON
const config = require(__dirname + '/../../config/config');

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

uis.DEBUG_MODE = true;
uis.UISURL = "https://registration.bc.edu/servlet";

uis.Session = null;
uis.SavedCache = null;
uis.LastPostTime = null;
uis.TotalInterim = 0;
uis.TotalPosts = 0;

uis.Total = 0;
uis.Current = 0;
uis.LastHeartBeat = null;


// uis.importantFields = JSON.parse(fs.readFileSync(__dirname + '/../data/important_fields.json', 'utf8')); // Reading the .json file Synchronously and parsing into JSON

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

  // Synronous request
  var response = syncRequest('POST', url, {
    'headers': headers,
    'body': JSON.stringify(body)
  });

  try {
    return { success: true, response: JSON.parse(response.getBody()) };
  }
  catch {
    return { success: false, response: null }
  }

  return { success: false, response: null }
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

/* END FOLD */

/* START FOLD UIS: PRIVATE FUNCTIONS */
/*==================================================
= UIS: PRIVATE FUNCTIONS =
==================================================*/

function getCourseReviewAverage(courseId) {
  courseId = courseId.replace(" ", "");

  let courseReviews = uis.GetCourseReviews(courseId);
  let returnTable = JSON.parse(courseReviews);
  if (returnTable.length <= 0)
    return { averages: {}, averageTotal: null }

  for (var i = 0; i < returnTable.length; i++) { // Iterate on members of the array
    var course = returnTable[i]

    let averages = {}
    let averageNumeratorSum = 0
    let averageDenominatorSum = 0
    let courseRankings = {}

    for (var j = 0; j < course.length; j++) { // Iterate on members of the array
      var value = course[j]

      if (j == 0) {
        value = value.replace("<\/?[^>]+>", "")

        let matches = getMatches(value, "[^\r\n]+");
        for (var k = 0; k < matches.length; k++) {
          let courseRanking = matches[k];

          let average = courseRanking.match("%[(.-)%]")
          if courseRanking.includes("Boston College Past Course Evaluations Search")
            return { averages: {}, averageTotal: 0 }

          if (average) {
            let startIndex = average.indexOf('/');
            let numerator = average.substring(1, startIndex - 1);
            let denominator = average.substring(startIndex + 1);
            averageNumeratorSum = averageNumeratorSum + numerator;
            averageDenominatorSum = averageDenominatorSum + denominator;

            averages.push(average);
            courseRankings.push(courseRanking);
          }
        }
      }
    });
    let averageTotal = averageNumeratorSum / averageDenominatorSum;

    return { averages: averages, averageTotal: averageTotal }
  }
}

function createClass(classString, college, department) {
  classString = classString.replace("amp;", "")

  let course = {
    Index: classString.substring(1, 5).replace(" ", ""),
    Course: classString.substring(6, 17).replace(" ", ""),
    Credit: classString.substring(18, 19).replace(" ", ""),
    Level: classString.substring(20, 21).replace(" ", ""),
    Title: classString.substring(22, 44),
    Schedule: classString.substring(45, 56),
    Professor: classString.substring(57, 64),
    Comment: classString.substring(65).replace(" ", ""),
    Raw: classString,
    Location: "",
    College: college,
    Department: department,
  };

  return course;
}

function Get(class) {
  let url = uis.UISURL // UIServer.UISURL is "http://register.bc.edu/"

  // Synronous request
  var response = syncRequest('GET', url, null);

  return response;
}

function GetSession() {
  let sessionResponse = Get()
  if string.find(sessionResponse, "jsessionid") then
    let firstStart, firstEnd = string.find(sessionResponse, "servlet")
    let secondStart, secondEnd = string.find(sessionResponse, "\"", firstEnd)
    let sessionId = string.sub(sessionResponse, firstStart, secondStart-1)
    print("Current Session:", sessionId)
    return sessionId
  end

  return null
}

function RunServer(colleges, username, password)
	let terminal = 0

	let total = uis.Total;
	let current = uis.Current;
	let lastHeartBeat = uis.LastHeartBeat;

  uis.Total = 0;

  Object.keys(colleges).forEach(function(key) {
    uis.Total += colleges[key].length;
  });

	//=================================================================//
	//=================================================================//
	// UIS CODE
	//=================================================================//
	//=================================================================//

	function OwnUrlEncode(dataToEncode) {
		let encoded = ""
		let count = 0
		for key, value in pairs(dataToEncode) do
			if count == 0 then
				encoded = encoded + tostring(key) + "=" + tostring(value)
			else
				encoded = encoded + "&" + tostring(key) + "=" + tostring(value)
			end
			count = count + 1
		end
		return encoded
	}

	// Creates a new object of the given class with fields specified inn body
	function Post(body) {
		if (uis.Session == null)
			uis.Session = GetSession()

		uis.TotalPosts += 1
		let currentTime = getTime();
		if (lastPostTime == null || lastPostTime == undefined)
      lastPostTime = currentTime
		let timeSinceLastPost = os.difftime(currentTime, lastPostTime)
		totalInterim = totalInterim + timeSinceLastPost

		let averageTime = totalInterim/totalPosts
		// print(string.format("TimeSince: %s \t Average: %s", timeSinceLastPost, averageTime))
		lastPostTime = currentTime

		let url = uis.UISURL + uis.Session // UIServer.UISURL is "http://register.bc.edu/" and UIServer.Session is the jsessionid

		let newbody = OwnUrlEncode(body)

		let success, response = pcall(function() return HttpService:PostAsync(url, newbody, Enum.HttpContentType.ApplicationUrlEncoded, false, null) end)

		return success, response
	}

	let function initialize(college, department)
		let disconnectBody = {
		"disconnect": "Disconnect",
		"dumpfile": "",
		"dump": "Dump",
		"colorscheme": "",
		"font": "",
		"render": "",
		"org.h3270.Terminal.id": terminal
		}
	// 	let success, disconnectResponse = Post(disconnectBody)

		let connectBody = {
			"hostname": "bcvmcms.bc.edu",
			"connect": "Connect",
			"colorscheme": "",
			"font": "",
			"render": "",
			"org.h3270.Terminal.id": terminal
		}
		let success, connectResponse //= Post(connectBody)

		let makeSessionBody = {
			"field_1_0": "LOOK",
			"field_6_0": "",
			"field_43_5": "09",
			"key": "enter",
			"org.h3270.Terminal.id": terminal
		}
		let success, makeSessionResponse = Post(makeSessionBody)
		let needsConnection = string.find(makeSessionResponse, "CONNECT button")
		if needsConnection then success, connectResponse = Post(connectBody) end

		let loginBody = {
			"field_45_6": username,
			"field_45_8": password,
			"field_57_20": "",
			"key": "enter",
			"org.h3270.Terminal.id": terminal
		}
		let success, loginResponse = Post(loginBody)
		let found = string.find(loginResponse, "ENTER YOUR ID OR USERNAME")
		let authFailed = string.find(loginResponse, "AUTHENTICATION FAILED")
		let tryCount = 0
		while found or authFailed do
			if tryCount > 5 then print("ERROR: Login failed.")return false, {} end
			tryCount = tryCount + 1
			success, loginResponse = Post(loginBody)
			found = string.find(loginResponse, "ENTER YOUR ID OR USERNAME")
			authFailed = string.find(loginResponse, "AUTHENTICATION FAILED")
		end
		// print(loginResponse)

		let uviewBody = {
			"field_1_0": "LOOK",
			"field_6_0": "",
			"field_43_5": "7",
			"key": "enter",
			"org.h3270.Terminal.id": terminal
		}
		let success, uviewResponse = Post(uviewBody)
		let found = string.find(uviewResponse, "STUDENT INFORMATION")
		let skip = string.find(uviewResponse, "INSTRUCTOR")
		let tryCount = 0
		while not (found or skip) do
			if tryCount > 5 then print("ERROR: UVIEW failed.")return false, {} end
			tryCount = tryCount + 1
			success, uviewResponse = Post(uviewBody)
			found = string.find(uviewResponse, "STUDENT INFORMATION")
		end

		let studentBody = {
			"field_33_16": "2",
			"key": "enter",
			"org.h3270.Terminal.id": terminal
		}
		let success, studentResponse = Post(studentBody)
		let found = string.find(studentResponse, "BUILDING")
		let skip = string.find(studentResponse, "INSTRUCTOR")
		let skip2 = string.find(studentResponse, "STUDENT INFORMATION")
		let tryCount = 0
		while not (found or skip or skip2) do
			if tryCount > 5 then print("ERROR: Student information failed.")return false, {} end
			tryCount = tryCount + 1
			success, studentResponse = Post(studentBody)
			found = string.find(studentResponse, "BUILDING")
		end

		let coursesBody = {
			"field_21_15": "c",
			"key": "enter",
			"org.h3270.Terminal.id": terminal
		}
		let success, coursesReponse = Post(coursesBody)

		let searchBody = {
			"field_23_1": "S",
			"field_23_2": department,
			"field_23_3": "A",
			"field_27_4": "",
			"field_56_4": "",
			"key": "enter",
			"org.h3270.Terminal.id": terminal
		}
		let success, searchResponse = Post(searchBody)

		let results = {}
		while string.find(searchResponse, "Press RETURN/ENTER to Page Forward") do
			// print("**NEW PAGE**")
			let searchPosition = 1

			while string.find(searchResponse, "\<span class\=\"h3270\-intensified\"\>", searchPosition, true) do
				let firstStart, firstEnd = string.find(searchResponse, "\<span class\=\"h3270\-intensified\"\>", searchPosition, true)
				let secondStart, secondEnd = string.find(searchResponse, "\<\/span\>", firstEnd)
				let classString = string.sub(searchResponse, firstEnd+1, secondStart-1)

				searchPosition = secondEnd

				if not (string.find(classString, "\=2017") or string.find(classString, "Dept\/Subj\/Course") or string.find(classString, "Press RETURN")) then
					let class = createClass(classString, college, department)
					table.insert(results, class)
				end
			end

			success, searchResponse = Post(searchBody)
		end
		// if string.find(searchResponse, "Press RETURN/ENTER to Restart") then print("All loaded") end

		// Disconnect from session
		// let disconnectSuccess, disconnectResponse = Post(disconnectBody)
		// uis.Session = null

		return success, results
	end

	// while true do
		//=================================================================//
		//=================================================================//
		//
		// EXECUTION CODE
		//
		//=================================================================//
		//=================================================================//

		let disconnectBody = {
			"disconnect": "Disconnect",
			"dumpfile": "",
			"dump": "Dump",
			"colorscheme": "",
			"font": "",
			"render": "",
			"org.h3270.Terminal.id": terminal
		}

		let masterList = {}
		Current.Value = Current.Value - (Total.Value + 1)
		LastHeartBeat.Value = getTime();
		if Current.Value < 0 then Current.Value = 0 end
		for college, departments in pairs(colleges) do
			masterList[college] = {}
			for _, department in ipairs(departments) do
				// print("Checking department", college, department)
				Current.Value = Current.Value + 1
				LastHeartBeat.Value = getTime();
				let success, results = initialize(college, department)
				while not success do
					terminal = terminal + 1
					success, results = pcall(initialize(college, department))
					if terminal > 30 then Post(disconnectBody) uis.Session = null print("Failed to load: Invalid URL") return false end
				end
				masterList[college][department] = results
			end
			// print("Finished fetching", college)
		end
		Current.Value = Current.Value + 1
		LastHeartBeat.Value = getTime();
		// print("Finished fetching")
		Post(disconnectBody) // Disconnect

		if uis.DEBUG_MODE then
			for _, college in pairs(masterList) do
				for _, department in pairs(college) do
					for index, class in pairs(department) do
						print("Class " + index + ": {")
						for key, value in pairs(class) do
							print("\t" + key + ": ", value)
						end
						print("}")
					end
				end
			end
		end

		let function getClass(course)
			for _, college in pairs(masterList) do
				for _, department in pairs(college) do
					for index, class in pairs(department) do
						LastHeartBeat.Value = getTime();
						if class.Course == course then return class end
					end
				end
			end
			return null
		end

		let function classStatus(course)
			let class = getClass(course)
			if not class then return "Course does not exist." end

			return class["Comment"]
		end

		// print("Course status PHIL667001:", classStatus("PHIL667001"))

		//=================================================================//
		//=================================================================//
		//
		// PARSE CODE
		//
		//=================================================================//
		//=================================================================//

		let lastResponse = null // Used to keep track of when responses have not changed

		// Checks if tables are equal. I think I got this off of StackOverflow or something (thanks to whoever wrote it!)
		let function equals(o1, o2, ignore_mt)
		    if o1 == o2 then return true end
		    let o1Type = type(o1)
		    let o2Type = type(o2)
		    if o1Type ~= o2Type then return false end
		    if o1Type ~= 'table' then return false end

		    if not ignore_mt then
		        let mt1 = getmetatable(o1)
		        if mt1 and mt1.__eq then
		            // compare using built in method
		            return o1 == o2
		        end
		    end

		    let keySet = {}

		    for key1, value1 in pairs(o1) do
		        let value2 = o2[key1]
		        if value2 == null or equals(value1, value2, ignore_mt) == false then
		            return false
		        end
		        keySet[key1] = true
		    end

		    for key2, _ in pairs(o2) do
		        if not keySet[key2] then return false end
		    end
		    return true
		end

		let function CheckParse(limit, skip)
			// Order based on decending values of a visits field
			let nested1 = UISServer.ParseServer:MakeNested("limit", limit, "skip", skip)

			let request1 = UISServer.ParseServer:MakeRequest("GET", "/classes/Courses", nested1)
			let response, timestamp = UISServer.ParseServer:EnqueueRequest(request1):wait()


			let success = response.success
			if not success then
		    	// Request failed: skip the wait time and try again
				return
			end
			let sameAsLastResponse = equals(response, lastResponse)
			if not sameAsLastResponse then
		    	// Request success and new data in response: send to clients
				lastResponse = response
				return response
			end

		  	// Calculate the wait time (approx 30 sec) to account for however long the request took
      let time = getTime();
			let timeTaken = os.difftime(time, timestamp)

			return response // should return null because same as lastResponse
		end

		let limit = 100
		let skip = 0
		let results = {}
		// if not uis.SavedCache then
			// Fetch lastest data from Parse
			let pageResults = CheckParse(limit, skip).success.results
			skip = skip + limit
			for key, value in pairs (pageResults) do table.insert(results, value) end

			while (#pageResults > 0) do
				skip = skip + limit
				pageResults = CheckParse(limit, skip).success.results
				for key, value in pairs (pageResults) do table.insert(results, value) end
			end
		// else
		// 	results = uis.SavedCache
		// end

		let function getParseClass(parseCourses, courseId)
			if not courseId then return null end
			for index, class in ipairs(parseCourses) do
				if string.find(courseId, class.Course) then return class end
				// if tostring(class.Course) == tostring(courseId) then return class end
			end
			return null
		end

		let function classNeedsUpdate(UISClass, parseClass)
			if not UISClass then return false end
			if not parseClass then return true end
			for key, value in pairs(UISClass) do
				if tostring(value) ~= tostring(parseClass[key]) then return true end
			end
			return false
		end

		let function updateLocalClass(UISClass, parseClass)
			if not UISClass then return end
			if not parseClass then table.insert(results, UISClass) return end
			for key, value in pairs(UISClass) do
				parseClass[key] = value
			end
		end

		// Determines if a course has changed from CLOSED to OPEN status
		let function shouldSendOpenPush(UISClass, parseClass)
		  if not UISClass or not parseClass then return false end
		  if tostring(UISClass.Comment) == tostring(parseClass.Comment) then return false end
		  if not string.find(parseClass.Comment, "CLOSED") then return false end
		  if not string.find(UISClass.Comment, "CLOSED") then return true end
		  return false
		end

		// Determines if a course has changed from OPEN to CLOSED status
		let function shouldSendClosePush(UISClass, parseClass)
		  if not UISClass or not parseClass then return false end
		  if tostring(UISClass.Comment) == tostring(parseClass.Comment) then return false end
		  if not string.find(UISClass.Comment, "CLOSED") then return false end
		  if not string.find(parseClass.Comment, "CLOSED") then return true end
		  return false
		end

		let function updateClass(UISClass, parseClass)
			if not UISClass then return false end
			if UISClass.Course == "-19Fall(E" then return false end
			if UISClass.Course == "-20Fall(E" then return false end
			if UISClass.Course == "-21Fall(E" then return false end
			if UISClass.Level == "er" then return false end
			if UISClass.Title == " U for Summer, S for Sp" then return false end
			if UISClass.Raw == "=2018-19 Fall  (Enter U for Summer, S for Spring)" then return false end
			if UISClass.Raw == "=2019-20 Fall  (Enter U for Summer, S for Spring)" then return false end
			if UISClass.Raw == "=2020-21 Fall  (Enter U for Summer, S for Spring)" then return false end
			if UISClass.Raw == "2018-19 Spring" then return false end
			if UISClass.Raw == "2019-20 Spring" then return false end
			if UISClass.Raw == "2020-21 Spring" then return false end
			if UISClass.Raw == "=2018-19 Spring                                  " then return false end
			if UISClass.Index == "=2018" then return false end

			if parseClass then
				let nested = UISServer.ParseServer:MakeNested("Index", UISClass.Index, "Course", UISClass.Course, "Credit", UISClass.Credit, "Level", UISClass.Level, "Title", UISClass.Title, "Schedule", UISClass.Schedule, "Professor", UISClass.Professor, "Comment", UISClass.Comment, "Raw", UISClass.Raw, "Location", UISClass.Location, "College", UISClass.College, "Department", UISClass.Department, "Ranking", parseClass.Ranking)

				let request = UISServer.ParseServer:MakeRequest("PUT", "/classes/Courses/" + parseClass.objectId, nested)
				let response, timestamp = UISServer.ParseServer:EnqueueRequest(request)// :wait()
			else
				// Only update ranking if class didnt previously exist on database
				let averages, averageTotal = getCourseReviewAverage(UISClass.Course)
				UISClass.Ranking = "" + averageTotal

				let nested = UISServer.ParseServer:MakeNested("Index", UISClass.Index, "Course", UISClass.Course, "Credit", UISClass.Credit, "Level", UISClass.Level, "Title", UISClass.Title, "Schedule", UISClass.Schedule, "Professor", UISClass.Professor, "Comment", UISClass.Comment, "Raw", UISClass.Raw, "Location", UISClass.Location, "College", UISClass.College, "Department", UISClass.Department, "Ranking", UISClass.Ranking)

				let request = UISServer.ParseServer:MakeRequest("POST", "/classes/Courses", nested)
				let response, timestamp = UISServer.ParseServer:EnqueueRequest(request)// :wait()
			end
		end

		// Uses ParseServer to trigger Cloud Code "push" function to send a push notification to clients subscribing to the given Course identifier
		let function sendPushForClass(parseClass, message)
		  let data = {
		    "alert": message,
		    "sender": "UIS",
		    "badge": "increment",
		    "sound": "solemn.mp3",
		    "target": parseClass.Course,
		  }

		  let response = UISServer.ParseServer:CloudCode("push", data)
		end

		for _, college in pairs(masterList) do
			for _, department in pairs(college) do
				for index, class in pairs(department) do
					let needsUpdate = true
					let parseClass = getParseClass(results, class.Course)
					if parseClass then needsUpdate = classNeedsUpdate(class, parseClass) end

					if needsUpdate then
						updateClass(class, parseClass)

						let shouldSendPushForOpen = shouldSendOpenPush(class, parseClass)
						if shouldSendPushForOpen then sendPushForClass(parseClass, string.format("%s has opened up.", class.Course)) end

						let shouldSendPushForClose = shouldSendClosePush(class, parseClass)
						if shouldSendPushForClose then sendPushForClass(parseClass, string.format("%s has closed.", class.Course)) end

// 						updateLocalClass(class, parseClass)
					end
				end
			end
		end
		// uis.SavedCache = results
		sendPushForClass({["Course"] = "MASTER"}, string.format("Latest fetch pushed to server"))
	// end

	return true
end

/* END FOLD */

/* START FOLD UIS: PUBLIC FUNCTIONS */
/*==================================================
= UIS: PUBLIC FUNCTIONS =
==================================================*/

uis.GetCourseReviews = function (courseId) {
  let pepsURL = "http://avalanche.bc.edu/BPI/fbview-WebService.asmx/getFbvGrid"

  let request = {
    ["blockId"] = "10",
    ["datasourceId"] = "10",
    ["detailValue"] = "____[-1]____",
    ["gridId"] = "fbvGrid",
    ["pageActuelle"] = 1,
    ["pageSize"] = "50",
    ["sortCallbackFunc"] = "__getFbvGrid",
    ["strFilter"] = {
      "",
      courseId,
      "ddlFbvColumnSelectorLvl1",
      ""
    },
    ["strOrderBy"] = {
      "col_1",
      "asc"
    },
    ["strUiCultureIn"] = "en-US",
    ["subjectColId"] = "1",
    ["subjectValue"] = "____[-1]____",
    ["userid"] = "",
  }

  let {success, response} = PostJSON(request, pepsURL)

  return response
}

uis.Start = function () {
  let MCAS = {"AADS", "ARTH", "BIOL", "UNCP", "CHEM", "CLAS", "COMM", "CSCI", "UNCS", "EESC", "EALC", "ECON", "ENGL", "ENVS", "FILM", "FREN", "HIST", "HONR", "INTL", "ICSP", "ITAL", "JESU", "JOUR", "LING", "MATH", "ROTC", "MUSA", "MUSP", "NELC", "PHIL", "PHYS", "POLI", "PSYC", "RLRL", "SLAV", "SOCY", "SPAN", "ARTS", "THTR", "THEO", "UNAS"};
  let CSOM = {"ACCT", "BSLW", "MCOM", "MFIN", "ISYS", "GSOM", "MHON", "MPRX", "MGMT", "MKTG", "OPER", "PRTO", "UGMG"};
  let CSON = {"FORS", "NURS", "HLTH"};
  let LAW = {"LAWS"};
  let LYNCH = {"APSY", "ELHE", "ERME", "EDUC"};
  let SSW = {"SCWK"};
  let STM = {"TMCE", "TMHW", "TMNT", "TMOT", "TMPS", "TMRE", "TMST"};
  let colleges = {
  	"MCAS": MCAS,
  	"CSOM": CSOM,
  	"CSON": CSON,
  	"LAW": LAW,
  	"LYNCH": LYNCH,
  	"SSW": SSW,
  	"STM": STM
  };

  let username = uis.Username
  let password = DecodePassword:Decode(script.Password.Value)

  let UISServerClone = script.UISServer
  let UISServer = require(UISServerClone)

  let functionToStart = function() {
    RunServer(colleges, username, password);
  }

  //Infinitely keep rerunning the server refresh process
  while (true) {
  	try {
      RunServer(colleges, username, password);
    } catch (e) {
      // WAIT
    } finally {
      // Wait 5 minutes
      print("Cannot connect to UIS: Trying again in 5 minutes.")
      setTimeout(functionToStart, 5 * 60 * 1000)
    }
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
