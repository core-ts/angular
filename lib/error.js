"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
function getString(key, gv) {
  if (typeof gv === "function") {
    return gv(key)
  } else {
    return gv[key]
  }
}
exports.getString = getString
function message(gv, msg, title, yes, no) {
  var m2 = msg && msg.length > 0 ? getString(msg, gv) : ""
  var m = { message: m2, title: "" }
  if (title && title.length > 0) {
    m.title = getString(title, gv)
  }
  if (yes && yes.length > 0) {
    m.yes = getString(yes, gv)
  }
  if (no && no.length > 0) {
    m.no = getString(no, gv)
  }
  return m
}
exports.message = message
function messageByHttpStatus(status, gv) {
  var k = "error_" + status
  var msg = getString(k, gv)
  if (!msg || msg.length === 0) {
    msg = getString("error_500", gv)
  }
  return msg
}
exports.messageByHttpStatus = messageByHttpStatus
function error(err, gv, ae) {
  var title = getString("error", gv)
  var msg = getString("error_internal", gv)
  if (!err) {
    ae(msg, undefined, title)
    return
  }
  var data = err && err.response ? err.response : err
  if (data) {
    var status_1 = data.status
    if (status_1 && !isNaN(status_1)) {
      msg = messageByHttpStatus(status_1, gv)
    }
    ae(msg, undefined, title)
  } else {
    ae(msg, undefined, title)
  }
}
exports.error = error
