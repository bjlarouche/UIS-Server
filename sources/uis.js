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

// uis.importantFields = JSON.parse(fs.readFileSync(__dirname + '/../data/important_fields.json', 'utf8')); // Reading the .json file Synchronously and parsing into JSON

/* END FOLD */

/* START FOLD UIS: HELPER FUNCTIONS */
/*==================================================
= UIS: HELPER FUNCTIONS =
==================================================*/

// None

/* END FOLD */

/* START FOLD UIS: PRIVATE FUNCTIONS */
/*==================================================
= UIS: PRIVATE FUNCTIONS =
==================================================*/

// None

/* END FOLD */

/* START FOLD UIS: PUBLIC FUNCTIONS */
/*==================================================
= UIS: PUBLIC FUNCTIONS =
==================================================*/

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

  // Do something
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
