#!/usr/bin/env node
"use strict";

var Strava = require("strav3");
var program = require("commander");

var config = require("../lib/config");

var cfg = config.load();

// suppress EPIPE errors
process.stdout.on("error", function(err) {
  if (err.code === "EPIPE") {
    process.exit();
  }
});

var strava = new Strava(cfg);

require("../lib/commands/activities")(program, strava);
require("../lib/commands/activity")(program, strava);
require("../lib/commands/athlete")(program, strava);
require("../lib/commands/authorize")(program, strava);
require("../lib/commands/config")(program, strava);
require("../lib/commands/segment")(program, strava);
require("../lib/commands/segment_leaderboard")(program, strava);
require("../lib/commands/segments")(program, strava);

program.parse(process.argv);
