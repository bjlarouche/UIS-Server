// app.js: Initializes express() app for project
// Referencing app.js in any other file will access the express() app

// Author(s): Brandon LaRouche

/*==================================================
= REQUIRE MODULES
==================================================*/

// For intitializing express app
var express = require('express');
var bodyParser = require('body-parser');

/*==================================================
= FILE: app.js =
- Variables:
----- app
---------- The express app
==================================================*/

/*==================================================
= SETUP APP =
==================================================*/

var app = express(); // The express app

// Configure the app
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

/*==================================================
= MODULE EXPORTS =
==================================================*/

// The app object will now be accessible to any other file that uses require('./app')
module.exports = app;
