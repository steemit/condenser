const util = require("util")

const ansi = {
  "reset": "\x1B[0m",
  "hicolor": "\x1B[1m",
  "underline": "\x1B[4m",
  "inverse": "\x1B[7m",
  // foreground colors
  "black": "\x1B[30m",
  "red": "\x1B[31m",
  "green": "\x1B[32m",
  "yellow": "\x1B[33m",
  "blue": "\x1B[34m",
  "magenta": "\x1B[35m",
  "cyan": "\x1B[36m",
  "white": "\x1B[37m",
  // background colors
  "bg_black": "\x1B[40m",
  "bg_red": "\x1B[41m",
  "bg_green": "\x1B[42m",
  "bg_yellow": "\x1B[43m",
  "bg_blue": "\x1B[44m",
  "bg_magenta": "\x1B[45m",
  "bg_cyan": "\x1B[46m",
  "bg_white": "\x1B[47m"
}

var logger = {
  test: function() {
    if (!console || !console.log) throw "unknown system"
  },
  log: function() {
    console.log.apply(null, arguments)
  },
  emptyLine: function() {
    console.log();
  },
  print: function(label, value, condensed) {
    if (typeof label === 'string') {
      if (typeof value === 'object') {
        console.log([label, util.inspect(value, {depth: 3})].join(": "));
      } else {
        console.log([label, value].join(": "));
      }
    }
    if (!condensed) console.log();
  }
}

var Logger = function Logger(loggerName, options) {
  if (!(this instanceof Logger)) {
    return new Logger(loggerName, options);
  }
  var _logger = logger;
  var i = this;
  this.loggerName = loggerName
  this.options = options || {}
  this.time = function() {
    return '[' + moment().format() + ']'
  }
  this.labelFormat = function(color, printTime, label) {
    return color + (printTime ? this.time() + ' ': '') + (this.loggerName ? this.loggerName + " - " : '') + ansi.reset + label
  }
  this.print = function(label, value, condensed) {
    var l = i.labelFormat(ansi.hicolor, !i.options.skipTime && i.options.printWithTime, label)
    return _logger.print(l, value, condensed)
  }
  this.base = function(color, printTime, args) {
    args[0] = this.labelFormat(color, printTime, args[0]);
    return console.log.apply(null, args)
  }
  this.warn = function() {
    return this.base(ansi.cyan, !i.options.skipTime,
      Array.prototype.slice.call(arguments, 0))
  }
  this.error = function() {
    return this.base(ansi.red, !i.options.skipTime,
      Array.prototype.slice.call(arguments, 0))
  }
  this.info = function() {
    return this.base(ansi.green, !i.options.skipTime,
      Array.prototype.slice.call(arguments, 0))
  }
  return this;
}

logger.getLogger = Logger
module.exports = logger
