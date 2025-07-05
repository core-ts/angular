"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var resources = (function () {
  function resources() {}
  resources.removePhoneFormat = function (phone) {
    if (phone) {
      return phone.replace(resources._preg, "")
    }
    return phone
  }
  resources.removeFaxFormat = function (fax) {
    if (fax) {
      return fax.replace(resources._preg, "")
    }
    return fax
  }
  resources.fields = "fields"
  resources.page = "page"
  resources.defaultLimit = 24
  resources.limit = "limit"
  resources.limits = [12, 24, 60, 100, 120, 180, 300, 600]
  resources._cache = {}
  resources.cache = true
  resources._preg = / |\-|\.|\(|\)/g
  resources.format1 = / |,|\$|€|£|¥|'|٬|،| /g
  resources.format2 = / |\.|\$|€|£|¥|'|٬|،| /g
  return resources
})()
exports.resources = resources
