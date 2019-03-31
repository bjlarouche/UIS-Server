/**
* UIS Server
*/

// index.js: Starts the node app

// Author(s): Brandon LaRouche

/*==================================================
= REQUIRE MODULES =
==================================================*/

// For intitializing express app
var bodyParser = require('body-parser');
var express = require('express');
var app = require(__dirname + '/app');
var xhub = require('express-x-hub');

/*==================================================
= REQUIRE OTHER SOURCE FILES =
==================================================*/

// Used to read config file JSON
var config = require(__dirname + '/config/config');

// Used to translate with UIS
var uis = require(__dirname + '/sources/uis');

/*==================================================
= FILE: index.js =
- Variables:
----- token
---------- Token to be used by app
==================================================*/

/*==================================================
= SETUP APP =
==================================================*/

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));

var token = process.env.TOKEN || 'token'; // Token to be used by app

app.get('/', function(req, res) {
  res.send("UIS Server Active");
  res.end(200);
});

// Start app
app.listen();
