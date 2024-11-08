"use strict";
function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
function isAuthorized(ur, router, to, url, m, home) {
  if (!ur) {
    if (to && to.length > 0 && router) {
      router.navigate([to]);
    }
    return false;
  }
  else {
    if (!m) {
      return true;
    }
    else {
      if (!url) {
        return true;
      }
      var p = m.get(url);
      if (p) {
        return true;
      }
      else {
        if (router && home && home.length > 0) {
          router.navigate([home]);
        }
        return false;
      }
    }
  }
}
exports.isAuthorized = isAuthorized;
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
function getNumber(event) {
  var ele = event.currentTarget;
  return Number(ele.value);
}
exports.getNumber = getNumber;
__export(require("./angular"));
__export(require("./formutil"));
__export(require("./core"));
__export(require("./edit"));
__export(require("./diff"));
__export(require("./components"));
__export(require("./formatter"));
__export(require("./search"));
__export(require("./reflect"));
