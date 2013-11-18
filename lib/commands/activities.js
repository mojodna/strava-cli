"use strict";

var util = require("util");

var async = require("async");

module.exports = function(program, strava) {
  return program
    .command("activities")
    .description("List activities")
    .option("-j, --json", "Output JSON")
    .option("-n, --limit <count>", "Fetch <count> activities")
    .option("-u, --athlete <athleteId>", "Fetch activities for <athleteId>")
    .action(function(cmd) {
      var count,
          limit = cmd.limit || Infinity,
          activities = [],
          page = 0;

      async.doWhilst(function(callback) {
        return strava.getActivities({
          athleteId: cmd.athlete,
          page: ++page,
          per_page: Math.min(500, limit)
        }, function(err, data) {
          if (err) {
            return callback(err);
          }

          count = data.length;
          activities = activities.concat(data);

          return callback();
        });
      }, function() {
        return count > 0 && activities.length < limit;
      }, function(err) {
        if (err) {
          throw err;
        }

        activities = activities.slice(0, limit);

        if (cmd.json) {
          console.log("%j", activities);
          return;
        }

        var summary = activities.map(function(x) {
          return util.format("%d\t%s\t%s", x.id, x.type, x.name);
        });

        console.log(summary.join("\n"));
      });
    });
};
