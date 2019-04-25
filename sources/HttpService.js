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
const config = require(__dirname + '/../config/config');

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

HttpService.JSONEncode = function (json) {
	return JSON.stringify(json);
}

HttpService.JSONDecode = function (str) {
	return JSON.parse(str);
}

HttpService.PostSync = function(url, body, header) {
	if (header == null || header == undefined)
		header = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'cache-control': 'no-cache',
		};
	else {
		header['cache-control'] = 'no-cache';
		header['Content-Type'] = 'application/x-www-form-urlencoded';
	}

	var response = syncRequest('POST', url, {
		'headers': header,
		'body': JSON.stringify(body)
	});

	try {
		let responseString = response.getBody().toString();
		return responseString;
	}
	catch (err) {
		return "";
	}
}

HttpService.PostUISAsync = function(url, body, header) {
	var options = { method: 'POST',
  url: url,
  headers:
   { 'cache-control': 'no-cache',
     'Content-Type': 'application/x-www-form-urlencoded' },
  form: body };

	return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) reject(error);
            if (response.statusCode != 200) {
                reject('Invalid status code <' + response.statusCode + '>');
            }
            resolve(body);
        });
    });
	// if (header == null || header == undefined)
	// 	header = {
	// 		'Content-Type': 'application/x-www-form-urlencoded',
	// 		'cache-control': 'no-cache',
	// 	};
	// else {
	// 	header['cache-control'] = 'no-cache';
	// 	header['Content-Type'] = 'application/x-www-form-urlencoded';
	// }
	//
	// var response = syncRequest('POST', url, {
	// 	'headers': header,
	// 	'json': body
	// });
	//
	// try {
	// 	let responseString = response.getBody().toString();
	// 	print("Got response " + responseString)
	// 	return responseString;
	// }
	// catch (err) {
	// 	print(err);
	// 	return "";
	// }
}

HttpService.PostJSONAsync = function(url, body, header) {
	var options = { method: 'POST',
  url: url,
  headers:
   { 'cache-control': 'no-cache',
     'Content-Type': 'application/json' },
  body: body,
	json: true };

	return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) reject(error);
            if (response.statusCode != 200) {
                reject('Invalid status code <' + response.statusCode + '>');
            }
            resolve(body);
        });
    });
}

HttpService.PostAsync = function(url, body, header) {
	if (header == null || header == undefined)
		header = { 'Content-Type': 'application/json' };
	else
		header['Content-Type'] = 'application/json';

	fetch(url, { method: 'POST', body: body, headers: header })
	.then(function(res) {
		return res.text();
	}).then(function(body) {
		try {
			return [true, JSON.parse(body)];
		}
		catch (err) {
			return [false, null];
		}

		return [false, null];
	});

	return [false, null];
}

HttpService.GetSync = function(url, header) {
	var response = syncRequest('GET', url, {
      'headers': header,
    });

	return response;
}

HttpService.GetAsync = function(url, header) {
	fetch(url, { method: 'GET', body: null, headers: header })
	.then(function(res) {
		return res.text();
	}).then(function(body) {
		try {
			return [true, JSON.parse(body)];
		}
		catch (err) {
			return [false, null];
		}

		return [false, null];
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
