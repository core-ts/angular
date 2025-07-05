"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
function createModel(attributes) {
  var obj = {}
  if (!attributes) {
    return obj
  }
  var attrs = Object.keys(attributes)
  for (var _i = 0, attrs_1 = attrs; _i < attrs_1.length; _i++) {
    var k = attrs_1[_i]
    var attr = attributes[k]
    if (attr.name) {
      switch (attr.type) {
        case "string":
        case "text":
          obj[attr.name] = ""
          break
        case "integer":
        case "number":
          obj[attr.name] = 0
          break
        case "array":
          obj[attr.name] = []
          break
        case "boolean":
          obj[attr.name] = false
          break
        case "date":
          obj[attr.name] = new Date()
          break
        case "object":
          if (attr.typeof) {
            var object = createModel(attr.typeof)
            obj[attr.name] = object
            break
          } else {
            obj[attr.name] = {}
            break
          }
        case "ObjectId":
          obj[attr.name] = null
          break
        default:
          obj[attr.name] = ""
          break
      }
    }
  }
  return obj
}
exports.createModel = createModel
function isSuccessful(x) {
  if (Array.isArray(x)) {
    return false
  } else if (typeof x === "object") {
    return true
  } else if (typeof x === "number" && x > 0) {
    return true
  }
  return false
}
exports.isSuccessful = isSuccessful
function afterSaved(res, form, resource, showFormError, alertSuccess, alertError) {
  if (Array.isArray(res)) {
    showFormError(form, res)
  } else if (isSuccessful(res)) {
    alertSuccess(resource.msg_save_success, function () {
      return window.history.back()
    })
  } else if (res === 0) {
    alertError(resource.error_not_found)
  } else {
    alertError(resource.error_conflict)
  }
}
exports.afterSaved = afterSaved
