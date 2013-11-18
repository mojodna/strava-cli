"use strict";

var util = require("util");

module.exports = function(program, strava) {
  return program
    .command("segments")
    .description("Get segments for an activity")
    .option("-j, --json", "Output JSON")
    .action(function(segmentId, cmd) {
      return strava.getActivity(segmentId, function(err, activity) {
        if (err) {
          throw err;
        }

        if (cmd.json) {
          // TODO this makes this equivalent to `activity`
          console.log("%j", activity);
          return;
        }

        var segments = activity.segment_efforts.map(function(x) {
          return util.format("%d\t%s", x.segment.id, x.segment.name);
        });

        console.log(segments.join("\n"));
      });
    });
};
