"use strict";

var polyline = require("polyline");

module.exports = function(program, strava) {
  return program
    .command("segment <id>")
    .description("Get segment details")
    // TODO GeoJSON
    .option("-j, --json", "Output JSON")
    .option("-w, --wkt", "Output WKT")
    .action(function(segmentId, cmd) {
      return strava.getSegment(segmentId, function(err, segment) {
        if (err) {
          throw err;
        }

        if (cmd.json) {
          console.log("%j", segment);
          return;
        }

        if (cmd.wkt) {
          var coords = polyline.decodeLine(segment.map.polyline);

          var wkt = coords.map(function(x) {
            return x.reverse().map(function(_) {
              return _.toFixed(5);
            }).join(" ");
          }).join(", ");

          console.log("LINESTRING(%s)", wkt);
          return;
        }

        // TODO human-readable version
        console.log("%j", segment);
      });
    });
};
