"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
function messageByHttpStatus(status, resource) {
  var k = "error_" + status
  var msg = resource[k]
  if (!msg || msg.length === 0) {
    msg = resource.error_500
  }
  return msg
}
exports.messageByHttpStatus = messageByHttpStatus
function error(err, resource, ae) {
  var title = resource.error
  var msg = resource.error_internal
  if (!err) {
    ae(msg, undefined, title)
    return
  }
  var data = err && err.response ? err.response : err
  if (data) {
    var status_1 = data.status
    if (status_1 && !isNaN(status_1)) {
      msg = messageByHttpStatus(status_1, resource)
    }
    ae(msg, undefined, title)
  } else {
    ae(msg, undefined, title)
  }
}
exports.error = error
