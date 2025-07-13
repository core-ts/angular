"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.pageSizes = [12, 24, 60, 100, 120, 180, 300, 600]
exports.sizes = exports.pageSizes
var resources = (function () {
  function resources() {}
  resources.removePhoneFormat = function (phone) {
    if (phone) {
      return phone.replace(resources.phone, "")
    }
    return phone
  }
  resources.removeFaxFormat = function (fax) {
    if (fax) {
      return fax.replace(resources.phone, "")
    }
    return fax
  }
  resources.phone = / |\-|\.|\(|\)/g
  resources._cache = {}
  resources.cache = true
  resources.fields = "fields"
  resources.page = "page"
  resources.limit = "limit"
  resources.defaultLimit = 24
  resources.limits = exports.pageSizes
  resources.format1 = / |,|\$|€|£|¥|'|٬|،| /g
  resources.format2 = / |\.|\$|€|£|¥|'|٬|،| /g
  return resources
})()
exports.resources = resources
