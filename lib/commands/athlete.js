"use strict";

module.exports = function(program, strava) {
  return program
    .command("athlete [id]")
    .description("Display athlete info")
    .option("-j, --json", "Output JSON")
    .action(function(athleteId, cmd) {
      switch (arguments.length) {
      case 1:
        cmd = arguments[0];
        athleteId = null;
        break;
      }

      return strava.getAthlete(athleteId, function(err, data) {
        if (err) {
          throw err;
        }

        if (cmd.json) {
          console.log("%j", data);
          return;
        }

        // TODO pretty-print
        console.log("%j", data);
      });
    });
};
