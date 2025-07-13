"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
function getResource(p) {
  var x = p
  if (x.value && x.format && typeof x.value === "function") {
    return x
  } else {
    return x.resource
  }
}
exports.getResource = getResource
function getAutoSearch(p) {
  var x = p
  if (x.value && x.format && typeof x.value === "function") {
    return true
  }
  return x.auto
}
exports.getAutoSearch = getAutoSearch
function getUIService(p, ui0) {
  if (ui0) {
    return ui0
  }
  return p.ui
}
exports.getUIService = getUIService
function getLoadingFunc(p, ui0) {
  if (ui0) {
    return ui0
  }
  return p.loading
}
exports.getLoadingFunc = getLoadingFunc
function getMsgFunc(p, showMsg) {
  if (showMsg) {
    return showMsg
  }
  return p.showMessage
}
exports.getMsgFunc = getMsgFunc
function getConfirmFunc(p, cf) {
  if (cf) {
    return cf
  }
  return p.confirm
}
exports.getConfirmFunc = getConfirmFunc
function getLocaleFunc(p, getLoc) {
  if (getLoc) {
    return getLoc
  }
  return p.getLocale
}
exports.getLocaleFunc = getLocaleFunc
function getErrorFunc(p, showErr) {
  if (showErr) {
    return showErr
  }
  return p.showError
}
exports.getErrorFunc = getErrorFunc
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
