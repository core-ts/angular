"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./core");
var metadata_1 = require("./metadata");
function build(model) {
  if (core_1.resources.cache) {
    var meta = core_1.resources._cache[model.name];
    if (!meta) {
      meta = metadata_1.build(model);
      core_1.resources._cache[model.name] = meta;
    }
    return meta;
  }
  else {
    return metadata_1.build(model);
  }
}
exports.build = build;
function createModel(model) {
  var obj = {};
  if (!model) {
    return obj;
  }
  var attrs = Object.keys(model.attributes);
  for (var _i = 0, attrs_1 = attrs; _i < attrs_1.length; _i++) {
    var k = attrs_1[_i];
    var attr = model.attributes[k];
    switch (attr.type) {
      case 'string':
      case 'text':
        obj[attr.name] = '';
        break;
      case 'integer':
      case 'number':
        obj[attr.name] = 0;
        break;
      case 'array':
        obj[attr.name] = [];
        break;
      case 'boolean':
        obj[attr.name] = false;
        break;
      case 'date':
        obj[attr.name] = new Date();
        break;
      case 'object':
        if (attr.typeof) {
          var object = createModel(attr.typeof);
          obj[attr.name] = object;
          break;
        }
        else {
          obj[attr.name] = {};
          break;
        }
      case 'ObjectId':
        obj[attr.name] = null;
        break;
      default:
        obj[attr.name] = '';
        break;
    }
  }
  return obj;
}
exports.createModel = createModel;
function buildMessageFromStatusCode(status, gv) {
  if (status === 0) {
    return core_1.getString('error_duplicate_key', gv);
  }
  else if (status === 2) {
    return core_1.getString('error_version', gv);
  }
  else if (status === 8) {
    return core_1.getString('error_data_corrupt', gv);
  }
  else {
    return '';
  }
}
exports.buildMessageFromStatusCode = buildMessageFromStatusCode;
function handleVersion(obj, version) {
  if (obj && version && version.length > 0) {
    var v = obj[version];
    if (v && typeof v === 'number') {
      obj[version] = v + 1;
    }
    else {
      obj[version] = 1;
    }
  }
}
exports.handleVersion = handleVersion;
