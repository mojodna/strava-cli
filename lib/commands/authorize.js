"use strict";

var exec = require("child_process").exec,
    http = require("http"),
    url = require("url");

var opener = require("opener"),
    qs = require("qs");

var config = require("../config");

var HTTP_PORT = process.env.PORT || 8080;

module.exports = function(program, strava) {
  return program
    .command("authorize")
    .description("Generate a user token")
    .action(function() {
      if (!strava.id) {
        console.error("Client ID is missing (strava config id <id>)");
        process.exit(1);
      }

      if (!strava.secret) {
        console.error("Client secret is missing (strava config secret <secret>)");
        process.exit(1);
      }

      // open the authorization url in a browser
      opener(strava.getAuthorizationUrl({
          redirectUri: "http://localhost:" + HTTP_PORT + "/"
        }));

      // start up an HTTP server to handle the redirect
      var server = http.createServer(function(req, res) {
        var code = qs.parse(url.parse(req.url).query).code;

        if (code) {
          return strava.acquireToken(code, function(err, token) {
            if (err) {
              throw err;
            }

            return config.set("token", token, function(err) {
              if (err) {
                throw err;
              }

              res.writeHead(200, {"Content-Type": "text/plain"});
              res.end("All set!\nYour token is " + token);

              console.log("Configuration updated with access token.");

              process.exit();
            });
          });
        }
      });

      server.listen(HTTP_PORT);
    });
};
