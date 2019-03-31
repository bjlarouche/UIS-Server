// template.js: A template for imlementing new JavaScript modules in the project
// Basic description for what template.js module does

// Author(s): Author 1, Author 2, etc.

/*==================================================
= REQUIRE MODULES =
==================================================*/

// For Express App
//var app = require(__dirname + '/../app'); //Uncomment this line if you need to use the Express() app.

// For ContentStack Express App
//var contentstackApp = require(__dirname + '/../contentstackApp'); //Uncomment this line if you need to use the ContentStack Express() app.

// Requre any NPM modules here

/*==================================================
= REQUIRE OTHER SOURCE FILES =
==================================================*/

// Require any other modules from __dirname here
// Make sure that the file you are requiring correctly uses module.exports

// An overview of the module and its components (i.e Variables, Functions, Webhooks)
// Notice that
/*==================================================
= FILE: template.js =
- Variables:
----- template
---------- The template.js module to be exported by module.exports
- Functions:
----- helperFunction()
---------- Brief description of the function, which will be local to template.js
---------- Sample helper function
----- .publicFunction()
---------- Brief description of the function, which will accessible to any other file that requires template.js via modules.export
---------- Ex: dictionary fetched from Content Stack
----- privateFunction() {
---------- Brief description of the function, which will be local to template.js
---------- Try to keep all functions local if possible (there's no need to make everything excessible to module.exports)
- ENDPOINTS:
----- GET 'samplewebhook'
---------- Listen for a remote webhook to start the task, does not expect to come from ContentStack
---------- i.e. http://domain.com/samplewebhook
==================================================*/

/*==================================================
= TEMPLATE SETUP =
==================================================*/

var template = {}; // The template.js module to be exported by module.exports

// Declare any global variables

// Try to break the code up into functional categories
// For example, this category could be used for helper functions
/*==================================================
= HELPER FUNCTIONS =
==================================================*/

// Brief description of the function, which will be local to template.js
// Sample helper function
function helperFunction() {

}

// Try to break the code up into functional categories
// For example, this category could be used for all public functions
/*==================================================
= SUBCATEGORY ONE: PUBLIC FUNCTIONS =
==================================================*/

// Declare any variables shared by this category (for organizational purposes)

// Brief description of the function, which will accessible to any other file that requires template.js via modules.export
// Ex: dictionary fetched from Content Stack
template.publicFunction = function() {

}

// For example, this category could be used for all private functions
/*==================================================
= SUBCATEGORY TWO: PRIVATE FUNCTIONS =
==================================================*/

// Declare any variables shared by this category (for organizational purposes)

// Brief description of the function, which will be local to template.js
// Try to keep all functions local if possible (there's no need to make everything excessible to module.exports)
function privateFunction() {

}

// For example, this category could be used for all endpoints
/*==================================================
= TEMPLATE ENDPOINTS =
==================================================*/

// Listen for a remote webhook to start the task, does not expect to come from ContentStack
// i.e. http://domain.com/samplewebhook
app.get(['/api/samplewebhook'], function(req, res) {
  // Send a 200 response for success
  res.send("Success");
  res.end(200);

  // Do something
});

// Include this subcategory if any functions need to be called with the module starts up
/*==================================================
= INITIALIZE MODULE =
==================================================*/

// Call any functions needed to startup the module (ex: initialize())
// Or perhaps the function is triggered by an app webhook
// function initialize() {
//   // Launch the module
// }

// If the module listens to express webhooks on 'app', you do not need to call app.listen() as it was done in 'index.js'

// Export the module in this subcategory
/*==================================================
= MODULE EXPORTS =
==================================================*/

// The template object will now be accessible to any other file that uses require('./sources/template')
// Any subvariables or functions of the template dictionary will be accessible by whichever variable the require is assigned to
module.exports = template;
