// HttpService.js: ...

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

/* START FOLD HttpService: DOCUMENTATION */
/*==================================================
= FILE: HttpService.js =
- Variables:
----- HttpService
---------- The HttpService.js module to be exported by module.exports
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
----- ___ '/api/HttpService/___'
---------- ___
==================================================*/
/* END FOLD */

/* START FOLD HttpService: SETUP */
/*==================================================
= HttpService: SETUP =
==================================================*/

var HttpService = {}; // The HttpService.js module to be exported by module.exports

/* END FOLD */

/* START FOLD HttpService: HELPER FUNCTIONS */
/*==================================================
= HttpService: HELPER FUNCTIONS =
==================================================*/

// Console.log with a red "{prefix}" prefix.
function print( ...args) {
	console.log("\x1b[31mHttpService\x1b[0m:", ...args);
}

/* END FOLD */

/* START FOLD HttpService: PRIVATE FUNCTIONS */
/*==================================================
= HttpService: PRIVATE FUNCTIONS =
==================================================*/

// None

/* END FOLD */

/* START FOLD HttpService: PUBLIC FUNCTIONS */
/*==================================================
= HttpService: PUBLIC FUNCTIONS =
==================================================*/

HttpService.JSONEncode = (json) {
	return JSON.stringify(json);
}

HttpService.JSONDecode = (string) {
	return JSON.parse(string);
}

HttpService.PostSync = function(url, body, headers) {
	if (headers == null || headers == undefined)
		headers = { 'Content-Type': 'application/json' };
	else
		headers['Content-Type'] = 'application/json';

	var response = syncRequest('POST', url, {
		'headers': headers,
		'body': body
	});

	try {
		let bodyJSON = JSON.parse(response.getBody());
		return bodyJSON;
	}
	catch {
		return null;
	}
}

HttpService.PostAsync = function(url, body, headers) {
	if (headers == null || headers == undefined)
		headers = { 'Content-Type': 'application/json' };
	else
		headers['Content-Type'] = 'application/json';

	fetch(url, { method: 'POST', body: body, headers: headers })
	.then(function(res) {
		return res.text();
	}).then(function(body) {
		try {
			return { success: true, response: JSON.parse(body) };
		}
		catch {
			return { success: false, response: null }
		}

		return { success: false, response: null }
	});
}

HttpService.GetSync = function(url, headers) {
	var response = syncRequest('GET', url, {
      'headers': headers,
    });

	return response;
}

HttpService.GetAsync = function(url, headers) {
	fetch(url, { method: 'GET', body: null, headers: headers })
	.then(function(res) {
		return res.text();
	}).then(function(body) {
		try {
			return { success: true, response: JSON.parse(body) };
		}
		catch {
			return { success: false, response: null }
		}

		return { success: false, response: null }
	});
}

/* END FOLD */

/* START FOLD HttpService ENDPOINTS */
/*==================================================
= HttpService: ENDPOINTS =
==================================================*/

// None

/* END FOLD */

/* START FOLD MODULE EXPORT */
/*==================================================
= MODULE EXPORTS =
==================================================*/

// The HttpService object will now be accessible to any other file that uses require('./sources/HttpService')
// Any subvariables or functions of the HttpService dictionary will be accessible by whichever variable the require is assigned to
module.exports = HttpService;

/* END FOLD */
