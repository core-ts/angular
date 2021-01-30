"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./core");
function build(model) {
  if (model && !model.source) {
    model.source = model.name;
  }
  var meta = { model: model };
  var pks = new Array();
  var dateFields = new Array();
  var integerFields = new Array();
  var numberFields = new Array();
  var currencyFields = new Array();
  var phoneFields = new Array();
  var faxFields = new Array();
  var objectFields = new Array();
  var arrayFields = new Array();
  var keys = Object.keys(model.attributes);
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i];
    var attr = model.attributes[key];
    if (attr) {
      attr.name = key;
      if (attr.version) {
        meta.version = attr.name;
      }
      if (attr.ignored !== true) {
        if (attr.key) {
          pks.push(attr.name);
        }
      }
      switch (attr.type) {
        case core_1.Type.String: {
          switch (attr.format) {
            case core_1.Format.Phone:
              phoneFields.push(attr.name);
              break;
            case core_1.Format.Fax:
              faxFields.push(attr.name);
              break;
            default:
              break;
          }
          break;
        }
        case core_1.Type.Number: {
          switch (attr.format) {
            case core_1.Format.Currency:
              currencyFields.push(attr.name);
              break;
            default:
              numberFields.push(attr.name);
              break;
          }
          break;
        }
        case core_1.Type.Integer: {
          integerFields.push(attr.name);
          break;
        }
        case core_1.Type.Date: {
          dateFields.push(attr.name);
          break;
        }
        case core_1.Type.Object: {
          if (attr.typeof) {
            var x = build(attr.typeof);
            x.attributeName = key;
            objectFields.push(x);
          }
          break;
        }
        case core_1.Type.Array: {
          if (attr.typeof) {
            var y = build(attr.typeof);
            y.attributeName = key;
            arrayFields.push(y);
          }
          break;
        }
        default:
          break;
      }
    }
  }
  if (pks.length > 0) {
    meta.keys = pks;
  }
  if (dateFields.length > 0) {
    meta.dateFields = dateFields;
  }
  if (integerFields.length > 0) {
    meta.integerFields = integerFields;
  }
  if (numberFields.length > 0) {
    meta.numberFields = numberFields;
  }
  if (currencyFields.length > 0) {
    meta.currencyFields = currencyFields;
  }
  if (phoneFields.length > 0) {
    meta.phoneFields = phoneFields;
  }
  if (faxFields.length > 0) {
    meta.faxFields = faxFields;
  }
  if (objectFields.length > 0) {
    meta.objectFields = objectFields;
  }
  if (arrayFields.length > 0) {
    meta.arrayFields = arrayFields;
  }
  return meta;
}
exports.build = build;
