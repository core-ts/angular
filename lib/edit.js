"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./core");
var metadata_1 = require("./metadata");
var Status;
(function (Status) {
  Status[Status["DuplicateKey"] = 0] = "DuplicateKey";
  Status[Status["NotFound"] = 0] = "NotFound";
  Status[Status["Success"] = 1] = "Success";
  Status[Status["VersionError"] = 2] = "VersionError";
  Status[Status["Error"] = 4] = "Error";
  Status[Status["DataCorrupt"] = 8] = "DataCorrupt";
})(Status = exports.Status || (exports.Status = {}));
var resource = (function () {
  function resource() {
  }
  resource._cache = {};
  resource.cache = true;
  return resource;
}());
exports.resource = resource;
function build(model) {
  if (resource.cache) {
    var meta = resource._cache[model.name];
    if (!meta) {
      meta = metadata_1.build(model);
      resource._cache[model.name] = meta;
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
  var attrs = Object.keys(model.attributes);
  for (var _i = 0, attrs_1 = attrs; _i < attrs_1.length; _i++) {
    var k = attrs_1[_i];
    var attr = model.attributes[k];
    switch (attr.type) {
      case core_1.Type.String:
      case core_1.Type.Text:
        obj[attr.name] = '';
        break;
      case core_1.Type.Integer:
      case core_1.Type.Number:
        obj[attr.name] = 0;
        break;
      case core_1.Type.Array:
        obj[attr.name] = [];
        break;
      case core_1.Type.Boolean:
        obj[attr.name] = false;
        break;
      case core_1.Type.Date:
        obj[attr.name] = new Date();
        break;
      case core_1.Type.Object:
        if (attr.typeof) {
          var object = this.createModel(attr.typeof);
          obj[attr.name] = object;
          break;
        }
        else {
          obj[attr.name] = {};
          break;
        }
      case core_1.Type.ObjectId:
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
function buildMessageFromStatusCode(status, r) {
  if (status === Status.DuplicateKey) {
    return r.value('error_duplicate_key');
  }
  else if (status === Status.VersionError) {
    return r.value('error_version');
  }
  else if (status === Status.DataCorrupt) {
    return r.value('error_data_corrupt');
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
