"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
function build(attributes, ignoreDate) {
  var meta = { attributes: attributes }
  var pks = new Array()
  var dateFields = new Array()
  var integerFields = new Array()
  var numberFields = new Array()
  var currencyFields = new Array()
  var phoneFields = new Array()
  var faxFields = new Array()
  var objectFields = new Array()
  var arrayFields = new Array()
  var keys = Object.keys(attributes)
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i]
    var attr = attributes[key]
    if (attr) {
      attr.name = key
      if (attr.version) {
        meta.version = attr.name
      }
      if (attr.ignored !== true) {
        if (attr.key) {
          pks.push(attr.name)
        }
      }
      switch (attr.type) {
        case "string": {
          switch (attr.format) {
            case "phone":
              phoneFields.push(attr.name)
              break
            case "fax":
              faxFields.push(attr.name)
              break
            default:
              break
          }
          break
        }
        case "number": {
          switch (attr.format) {
            case "currency":
              currencyFields.push(attr.name)
              break
            default:
              numberFields.push(attr.name)
              break
          }
          break
        }
        case "integer": {
          integerFields.push(attr.name)
          break
        }
        case "date": {
          if (ignoreDate) {
            dateFields.push(attr.name)
          }
          break
        }
        case "datetime": {
          dateFields.push(attr.name)
          break
        }
        case "object": {
          if (attr.typeof) {
            var x = build(attr.typeof, ignoreDate)
            x.attributeName = key
            objectFields.push(x)
          }
          break
        }
        case "array": {
          if (attr.typeof) {
            var y = build(attr.typeof, ignoreDate)
            y.attributeName = key
            arrayFields.push(y)
          }
          break
        }
        default:
          break
      }
    }
  }
  if (pks.length > 0) {
    meta.keys = pks
  }
  if (dateFields.length > 0) {
    meta.dateFields = dateFields
  }
  if (integerFields.length > 0) {
    meta.integerFields = integerFields
  }
  if (numberFields.length > 0) {
    meta.numberFields = numberFields
  }
  if (currencyFields.length > 0) {
    meta.currencyFields = currencyFields
  }
  if (phoneFields.length > 0) {
    meta.phoneFields = phoneFields
  }
  if (faxFields.length > 0) {
    meta.faxFields = faxFields
  }
  if (objectFields.length > 0) {
    meta.objectFields = objectFields
  }
  if (arrayFields.length > 0) {
    meta.arrayFields = arrayFields
  }
  return meta
}
exports.build = build
