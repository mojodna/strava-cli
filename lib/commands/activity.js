"use strict";

var util = require("util");

var d3 = require("d3");

var DEFAULT_TYPES = "time,distance,altitude,heartrate,cadence,watts,watts_calc,temp,moving," +
  "resting,outlier,grade_smooth,velocity_smooth,total_elevation";

// "time,distance,grade_adjusted_distance,altitude,heartrate,cadence,watts,watts_calc,temp,moving,resting,outlier,grade_smooth,velocity_smooth,grade_adjusted_speed,total_elevation,latlng",

module.exports = function(program, strava) {
  program
    .command("activity [id]")
    .description("Get activity details")
    .option("-j, --json", "Output JSON")
    .option("-s, --segments", "Output segments covered")
    .action(function(activityId, cmd) {
      return strava.getActivity(activityId, function(err, activity) {
        if (err) {
          throw err;
        }

        switch(true) {
        case cmd.json:
          console.log("%j", activity);
          break;

        case cmd.segments:
          var segments = activity.segment_efforts.map(function(x) {
            return util.format("%d\t%s", x.segment.id, x.segment.name);
          });

          console.log(segments.join("\n"));
          break;
        
        default:
          // TODO human-readable version
          console.log("%j", activity);
        }
      });
    });

  program
    .command("activity-stream [id]")
    .description("Get activity stream details")
    // TODO make this the default?
    .option("-c, --csv", "Output CSV")
    // TODO GeoJSON
    .option("-j, --json", "Output JSON")
    .option("-s, --sql", "Output SQL")
    // TODO series type
    // TODO resolution
    .option("-t, --types [types]", "Include specified types in output")
    .action(function(activityId, cmd) {
      var types = cmd.types || DEFAULT_TYPES;

      return strava.getActivityStream(activityId, types,
        {
          resolution: "high",
          series_type: "time"
        }, function(err, stream) {
          if (err) {
            throw err;
          }

          if (cmd.json) {
            console.log("%j", stream);
            return;
          }

          // extract column names
          var columns = stream.map(function(x) {
            return x.type;
          });

          // extract stream data
          var streamData = stream.map(function(x) {
            return x.data;
          });

          // split lat/lng into separate columns
          var idx = columns.indexOf("latlng");

          if (idx >= 0) {
            columns = columns.concat(["lat", "lng"]);

            var lat = streamData[idx].map(function(latlng) {
              return latlng[0];
            });

            var lng = streamData[idx].map(function(latlng) {
              return latlng[1];
            });

            // attach new columns
            streamData = streamData.concat([lat, lng]);

            // generate headings
            var headings = d3.pairs(streamData[idx]).map(function(pair) {
              var curr = pair[0];
              var next = pair[1];

              var dx = next[1] - curr[1],
                  dy = next[0] - curr[0];

              return (450 - Math.round(Math.atan2(dy, dx) * 180 / Math.PI)) % 360;
            });

            // add a heading to the final row
            headings.push(0);

            columns.push("heading");
            streamData.push(headings);

            columns.splice(idx, 1);
            streamData.splice(idx, 1);
          }

          var rows = d3.zip.apply(null, streamData);

          switch(true) {
          case cmd.csv:
            // header row
            console.log(d3.csv.formatRows([columns]));

            // data
            console.log(d3.csv.formatRows(rows));

            break;

          case cmd.sql:
            var latIdx = columns.indexOf("lat"),
                lngIdx = columns.indexOf("lng");

            rows.forEach(function(row, i) {
              var lat = row[latIdx],
                  lng = row[lngIdx];

              var attrs = row
                .map(function(x, j) {
                  var key = columns[j];

                  if (key === "lat" || key === "lng") {
                    return;
                  }

                  return util.format("%s=>%s", key, x);
                })
                .filter(function(x) {
                  return !!x;
                })
                .join(",");

              // TODO hstore isn't awesome for this since values are text records
              // TODO output the schema for this somewhere
              // TODO use COPY commands instead
              console.log("INSERT INTO %s (%s) VALUES (%s);",
                          "activity_events",
                          "activity_id,idx,geom,attrs",
                          util.format("%d, %d, 'SRID=4326;POINT(%s %s)'::geometry, '%s'",
                                      activityId,
                                      i,
                                      lng,
                                      lat,
                                      attrs));
            });

            break;

          default:
            cmd.help();
          }
        });
    });
};
