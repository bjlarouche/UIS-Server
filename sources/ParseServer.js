// ParseServer.js: ...

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

// Used for Http requests
var HttpService = require(__dirname + '/../sources/HttpService');

/* END FOLD */

/* START FOLD ParseServer: DOCUMENTATION */
/*==================================================
= FILE: ParseServer.js =
- Variables:
----- ParseServer
---------- The ParseServer.js module to be exported by module.exports
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
----- ___ '/api/ParseServer/___'
---------- ___
==================================================*/
/* END FOLD */

/* START FOLD ParseServer: SETUP */
/*==================================================
= ParseServer: SETUP =
==================================================*/

var ParseServer = {}; // The ParseServer.js module to be exported by module.exports

ParseServer.Url = "https://parseapi.back4app.com"
ParseServer.AppId = "uIGaipSp2UYvOjNl6qrSTUsfZVmn9l5Ig8J2LuSS"
ParseServer.AppName = "UIS"
ParseServer.MongoDBURI = "mongodb://admin:xJ1LT4g3diwDL2UyRlrBA41C@mongodb7.back4app.com:27017/493bddb3e41b4d2ba6d85ced800a236b?ssl=true"
ParseServer.ClientKey = "yuoMkn5l5RQKUY948CWQ61QNVvWHBH14BN9fOOPl"
ParseServer.JavascriptKey = "OW9jaqSwKdYw93xuL43whvw1258bbcZVBFpqMAvp"
ParseServer.NETKey = "fAMr0hPU9kslJ2bPTm2cAX1Inr8vVgCCojPnRJuU"
ParseServer.RESTKey = "vq7SCj0ScjyEwUmLeoNkvKu5tJ2NBi8l0tU21W7H"
ParseServer.WebhookKey = "d9qr9xGuuImq8VYfFQVRuCeJn5UVSuUyd2YDutrn"
ParseServer.FileKey = "75be8818-34d3-4097-a1e0-fff5dee5676d"
ParseServer.MasterKey = "MldAU91v4yGkdWKvj2YnNsapjce8HNFwRXGWbV9z"

//ParseServer.Queue = PriorityQueue.new(comparator)

//ParseServer.TimeOut = 10
//ParseServer.BatchLimit = 50 // Parse has a max of 50 requests allowed per batch

//let stepTime = 0
//let batching = false


/* END FOLD */

/* START FOLD ParseServer: HELPER FUNCTIONS */
/*==================================================
= ParseServer: HELPER FUNCTIONS =
==================================================*/

// Console.log with a red "{prefix}" prefix.
function print( ...args) {
	console.log("\x1b[31mParseServer\x1b[0m:", ...args);
}

// Reverse of default comparator
function comparator(a, b) {
	if (a > b)
		return true
	else
		return false
}

/* END FOLD */

/* START FOLD ParseServer: PRIVATE FUNCTIONS */
/*==================================================
= ParseServer: PRIVATE FUNCTIONS =
==================================================*/

// Splits data up into needed URL formatting
function makeBody(data) {
	let body = "";
	for i,v in pairs(data) {
		body = body + "&" + i + '=' + encodeURI(v);
	}
	return body
}

/* END FOLD */

/* START FOLD ParseServer: PUBLIC FUNCTIONS */
/*==================================================
= ParseServer: PUBLIC FUNCTIONS =
==================================================*/

// let PriorityQueue = require(script.PriorityQueue)
// let Signal = require(script.Signal)

// Returns a table where the odd parameters are the key and even parameters are the value
ParseServer.MakeNested = function(...args) {
	let packed = {...args};
	let unpacked = {};

  Object.keys(packed).forEach(function(key) {
    if (key % 2 == 1) {
      let value = packed[key];
			unpacked[value] = packed[key+1];
		}
  });

	return unpacked
}

// Formats the request as Parse is expecting from REST for batching
ParseServer.MakeRequest = function(method, path, body) {
	let operation = {
		"method": method,
		"path": path,
		"body": body
	};
	return operation;
}

// Returns objects in the specified class
ParseServer.Get = function(course) {
	let url = ParseServer.Url + "classes" + course;

	let header = {
		"X-Parse-Application-Id": ParseServer.AppId,
		"X-Parse-REST-API-Key": ParseServer.RESTKey,
		//"X-Parse-Master-Key": ParseServer.MasterKey // Optional. Less secure.
	}

	let get = HttpService.GetSync(url, header)
	return get
}

// Creates a new object of the given class with fields specified inn body
ParseServer.Post = function(class, body) {
	let url = ParseServer.Url + "classes" + course;


	let newbody = HttpService.JSONEncode(body)

	let header = {
		["X-Parse-Application-Id"] = ParseServer.AppId,
		["X-Parse-REST-API-Key"] = ParseServer.RESTKey,
		//["X-Parse-Master-Key"] = ParseServer.MasterKey  // Optional. Less secure.
	}

	let {success, response} = HttpService.PostAsync(url, newbody, header)

	return response
}

// Triggers functionId in the ParseServer's main.js with rawContent parameters for that function
ParseServer.CloudCode = function (functionId, rawContent) {
	// functionId and actionId must be supported/handled by cloud code
	let url = ParseServer.Url + "classes" + course;
	let header = {
		["X-Parse-Application-Id"] = ParseServer.AppId,
		["X-Parse-REST-API-Key"] = ParseServer.RESTKey,
		// ["X-Parse-Master-Key"] = ParseServer.MasterKey  // Optional. Less secure.
	}

	let body = makeBody(rawContent)

	let {success, response} = HttpService.PostAsync(url, body, header)
	return response
}

// POSTs batch table of requests and returns table of responses
// ParseServer.BatchPost = function(requests) {
// 	let url = string.format("%s/batch", ParseServer.Url)
//
// 	let body = {
// 		["requests"] = requests
// 	}
//
// 	let newbody = HttpService.JSONEncode(body)
//
// 	let header = {
// 		["X-Parse-Application-Id"] = ParseServer.AppId,
// 		["X-Parse-REST-API-Key"] = ParseServer.RESTKey,
// 		["X-Parse-Master-Key"] = ParseServer.MasterKey // Optional. Less secure.
// 	}
//
// 	let success, post = pcall(function() return HttpService.PostAsync(url, newbody, header) end)
// 	while not success do
// 		success, post = pcall(function() return HttpService.PostAsync(url, newbody, header) end)
// 	end
// 	return post
// }

// Adds a request to the PriorityQueue based on timestamp (oldest = highest)
// ParseServer.EnqueueRequest = function(request) {
// 	let signal = Signal.Create()
// 	let timestamp = os.time()
//
// 	let queueRequest = {
// 		["request"] = request,
// 		["signal"] = signal,
// 		["timestamp"] = timestamp,
// 	}
//
// 	ParseServer.Queue:Add(queueRequest, timestamp)
//
// 	return signal
// }

// Pops BatchLimit number of requests from PriorityQueue, bundles them into a requests table for ParseServer:BatchPost(), and then fires the responses and timestamps back to whoever is listening for a reponse (the senders)
// ParseServer.ExecuteQueue = function() {
// 	let requests = {}
// 	let timestamps = {}
// 	let signals = {}
//
// 	let queueSize = ParseServer.Queue:Size()
// 	if queueSize > ParseServer.BatchLimit then queueSize = ParseServer.BatchLimit end // Limited requests per batch
//
// 	for i=1, queueSize do
// 		let queueRequest = ParseServer.Queue:Pop()
// 		table.insert(requests, queueRequest.request)
// 		table.insert(signals, queueRequest.signal)
// 		table.insert(timestamps, queueRequest.timestamp)
// 	end
//
// 	let batchResponse = ParseServer:BatchPost(requests)
// 	let responseTable = HttpService.JSONDecode(batchResponse)
//
// 	for i=1, #responseTable do
// 		signals[i]:fire(responseTable[i], timestamps[i])
// 	end
//
// 	return true
// }

// Requests will be sent every stepTime seconds, or when the BatchLimit is hit.
// game:GetService("RunService").Heartbeat:Connect(function(step)
// 	stepTime = stepTime + step
//
// 	let queueSize = ParseServer.Queue:Size()
// 	if (queueSize >= ParseServer.BatchLimit or stepTime >= ParseServer.TimeOut) and not (batching or queueSize == 0) then
// 		stepTime = 0
// 		batching = true
// 		let success = pcall(ParseServer:ExecuteQueue())
// 		batching = false
// 	end
// end)
//
// // Forces queue to execute when server is ending
// game.OnClose = function()
// 	stepTime = 0
// 	batching = true
// 	let success = pcall(ParseServer:ExecuteQueue())
// 	batching = false
// end

/* END FOLD */

/* START FOLD ParseServer ENDPOINTS */
/*==================================================
= ParseServer: ENDPOINTS =
==================================================*/

// None

/* END FOLD */

/* START FOLD MODULE EXPORT */
/*==================================================
= MODULE EXPORTS =
==================================================*/

// The ParseServer object will now be accessible to any other file that uses require('./sources/ParseServer')
// Any subvariables or functions of the ParseServer dictionary will be accessible by whichever variable the require is assigned to
module.exports = ParseServer;

/* END FOLD */
