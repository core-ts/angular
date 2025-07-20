"use strict"
function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p]
}
Object.defineProperty(exports, "__esModule", { value: true })
var reflect_1 = require("./reflect")
function back(confirm, resource, o1, o2, keys, version) {
  if (!reflect_1.hasDiff(o1, o2, keys, version)) {
    window.history.back()
  } else {
    confirm(resource.msg_confirm_back, function () {
      return window.history.back()
    })
  }
}
exports.back = back
function getNumber(event) {
  var ele = event.currentTarget
  return Number(ele.value)
}
exports.getNumber = getNumber
__export(require("./reflect"))
__export(require("./core"))
__export(require("./edit"))
__export(require("./search"))
__export(require("./angular"))
__export(require("./formutil"))
__export(require("./common"))
__export(require("./diff"))
__export(require("./formatter"))
__export(require("./edit-component"))
__export(require("./message"))
__export(require("./search-component"))
