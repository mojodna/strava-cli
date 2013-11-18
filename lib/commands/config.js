"use strict";

var config = require("../config");

module.exports = function(program) {
  return program
    .command("config [name] [value]")
    .usage("config [name [value]]")
    .description("Edit the strava configuration")
    .option("--get <name>", "get value: name")
    .option("--unset <name>", "remove a variable: name")
    .action(function(name, value, cmd) {
      var val;

      switch (true) {
      case !!cmd.get:
        val = config.get(cmd.get);

        if (val) {
          console.log(val);
        }

        break;

      case !!cmd.unset:
        config.remove(cmd.unset);

        break;

      case !!value:
        config.set(name, value);
        break;

      case !!name:
        val = config.get(name);

        if (val) {
          console.log(val);
        }

        break;

      default:
        cmd.help();
      }
    });
};
