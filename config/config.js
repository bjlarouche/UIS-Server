// slack.js: config for DevRel-Node-Service app modules
// Should be treated as immutable

// Author(s): Brandon LaRouche

//var authStash = JSON.parse(require('fs').readFileSync(__dirname + '/../config/auth_stash.js', "utf8"));

var config = {
  "UIS": {
    username: "larouchb",
    password: authStash.UIS.larouchb
  }
}

module.exports = config;
