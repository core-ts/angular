"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./core");
var metadata_1 = require("./metadata");
function build(attributes, ignoreDate, name) {
  if (core_1.resources.cache && name && name.length > 0) {
    var meta = core_1.resources._cache[name];
    if (!meta) {
      meta = metadata_1.build(attributes, ignoreDate);
      core_1.resources._cache[name] = meta;
    }
    return meta;
  }
  else {
    return metadata_1.build(attributes, ignoreDate);
  }
}
exports.build = build;
function createModel(attributes) {
  var obj = {};
  if (!attributes) {
    return obj;
  }
  var attrs = Object.keys(attributes);
  for (var _i = 0, attrs_1 = attrs; _i < attrs_1.length; _i++) {
    var k = attrs_1[_i];
    var attr = attributes[k];
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
function handleStatus(x, st, gv, se) {
  var title = core_1.getString('error', gv);
  if (x === st.VersionError) {
    se(core_1.getString('error_version', gv), title);
  }
  else if (x === st.DataCorrupt) {
    se(core_1.getString('error_data_corrupt', gv), title);
  }
  else {
    se(core_1.getString('error_internal', gv), title);
  }
}
exports.handleStatus = handleStatus;
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
