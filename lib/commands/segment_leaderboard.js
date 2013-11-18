"use strict";

var util = require("util");

var d3 = require("d3");

module.exports = function(program, strava) {
  return program
    .command("segment-leaderboard")
    .description("Get the leaderboard for a segment")
    .option("-j, --json", "Output JSON")
    .action(function(segmentId, cmd) {
      return strava.getSegmentLeaderboard(segmentId, function(err, data) {
        if (err) {
          throw err;
        }

        switch(true) {
        case cmd.json:
          console.log("%j", data);
          break;

        default:
          var formatTime = d3.time.format("%H:%M:%S");

          var summary = data.entries
            .filter(function(x, i) {
              // don't display folks around "me"
              return x.rank === i + 1;
            })
            .map(function(x) {
              var epochTime = new Date(2013, 0, 1, 0, 0, x.elapsed_time);
              return util.format("%d\t%s\t%d\t%d\t%s",
                                x.effort_id,
                                x.athlete_name,
                                x.athlete_id,
                                x.activity_id,
                                formatTime(epochTime));
            });

          console.log(summary.join("\n"));
        }
      });
    });
};
