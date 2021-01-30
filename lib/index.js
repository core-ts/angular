"use strict";
function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
function getUrlParam(route) {
  if (!route) {
    return null;
  }
  var param = route.params;
  var obj = param._value;
  return obj;
}
exports.getUrlParam = getUrlParam;
function navigate(router, stateTo, params) {
  var commands = [];
  commands.push(stateTo);
  if (params) {
    if (typeof params === 'object') {
      for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
        var param = params_1[_i];
        commands.push(param);
      }
    }
    router.navigate(commands);
  }
  else {
    router.navigate([stateTo]);
  }
}
exports.navigate = navigate;
__export(require("./angular"));
__export(require("./core"));
__export(require("./edit"));
var diff_1 = require("./diff");
exports.BaseDiffApprComponent = diff_1.BaseDiffApprComponent;
exports.DiffApprComponent = diff_1.DiffApprComponent;
__export(require("./components"));
__export(require("./formatter"));
