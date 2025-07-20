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
function showLoading(loading) {
  if (loading) {
    if (typeof loading === "function") {
      loading()
    } else {
      loading.showLoading()
    }
  }
}
exports.showLoading = showLoading
function hideLoading(loading) {
  if (loading) {
    if (typeof loading === "function") {
      loading()
    } else {
      loading.hideLoading()
    }
  }
}
exports.hideLoading = hideLoading
exports.enLocale = {
  id: "en-US",
  countryCode: "US",
  dateFormat: "M/d/yyyy",
  firstDayOfWeek: 1,
  decimalSeparator: ".",
  groupSeparator: ",",
  decimalDigits: 2,
  currencyCode: "USD",
  currencySymbol: "$",
  currencyPattern: 0,
}
function getId(route, keys, id) {
  if (id) {
    return id
  } else {
    return buildId(route, keys)
  }
}
exports.getId = getId
function buildId(route, keys) {
  if (!route) {
    return null
  }
  var param = route.params
  var obj = param._value
  if (!keys || keys.length === 0) {
    return obj["id"]
  }
  if (!(keys && keys.length > 0)) {
    return null
  }
  if (keys.length === 1) {
    var x = obj[keys[0]]
    if (x && x !== "") {
      return x
    }
    return obj["id"]
  }
  var id = {}
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i]
    var v = obj[key]
    if (!v) {
      return null
    }
    id[key] = v
  }
  return id
}
exports.buildId = buildId
