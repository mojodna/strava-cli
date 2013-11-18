"use strict";

var fs = require("fs"),
    path = require("path");

var mkdirp = require("mkdirp");

var config = {
  path: process.env.STRAVA_CONFIG ||
        path.join(process.env.HOME, ".config", "strava", "config.json"),

  load: function() {
    try {
      return require(this.path);
    } catch (e) {
      // file does not exist--that's ok
      return {};
    }
  },

  get: function(key) {
    return this.load()[key];
  },

  remove: function(key, callback) {
    var cfg = this.load();

    if (cfg[key]) {
      delete cfg[key];
      return this.write(config, callback);
    }
  },

  set: function(key, value, callback) {
    var cfg = this.load();
    cfg[key] = value;

    return this.write(cfg, callback);
  },

  write: function(cfg, callback) {
    callback = callback || function(err) {
      if (err) {
        throw err;
      }
    };

    return mkdirp(path.dirname(config.path), function(err) {
      if (err) {
        return callback(err);
      }

      return fs.writeFile(config.path, JSON.stringify(cfg), callback);
    });
  }
};

module.exports = config;
