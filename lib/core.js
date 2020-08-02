"use strict";
Object.defineProperty(exports,"__esModule",{value:true});
var http_1 = require("@angular/common/http");
var storage_1 = require("./storage");
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
  if (params === void 0) { params = null; }
  var commands = [];
  commands.push(stateTo);
  if (params != null) {
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
function getId(id, keys, route) {
  if (id) {
    return id;
  }
  else {
    return buildId(keys, route);
  }
}
exports.getId = getId;
function buildId(keys, route) {
  if (!route || !keys || keys.length === 0) {
    return null;
  }
  var param = route.params;
  var obj = param._value;
  if (!(keys && keys.length > 0)) {
    return null;
  }
  if (keys.length === 1) {
    var x = obj[keys[0]];
    if (x && x !== '') {
      return x;
    }
    return obj['id'];
  }
  var id = {};
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i];
    var v = obj[key];
    if (!v) {
      return null;
    }
    id[key] = v;
  }
  return id;
}
exports.buildId = buildId;
function buildFromUrl() {
  return buildParameters(window.location.search);
}
exports.buildFromUrl = buildFromUrl;
function buildParameters(url) {
  var urlSearch = url;
  var i = urlSearch.indexOf('?');
  if (i >= 0) {
    urlSearch = url.substr(i + 1);
  }
  var obj = {};
  var httpParams = new http_1.HttpParams({ fromString: urlSearch });
  for (var _i = 0, _a = httpParams.keys(); _i < _a.length; _i++) {
    var key = _a[_i];
    obj[key] = httpParams.get(key);
  }
  return obj;
}
exports.buildParameters = buildParameters;
function focusFirstElement(form) {
  var i = 0;
  var len = form.length;
  for (i = 0; i < len; i++) {
    var ctrl = form[i];
    if (!(ctrl.readOnly || ctrl.disabled)) {
      var nodeName = ctrl.nodeName;
      var type = ctrl.getAttribute('type');
      if (nodeName === 'INPUT' && type !== null) {
        nodeName = type.toUpperCase();
      }
      if (nodeName !== 'BUTTON'
        && nodeName !== 'RESET'
        && nodeName !== 'SUBMIT'
        && nodeName !== 'CHECKBOX'
        && nodeName !== 'RADIO') {
        ctrl.focus();
        ctrl.scrollIntoView();
        try {
          ctrl.setSelectionRange(0, ctrl.value.length);
        }
        catch (error) {
        }
        return;
      }
    }
  }
}
exports.focusFirstElement = focusFirstElement;
function initForm(viewContainerRef, initMat) {
  if (!viewContainerRef) {
    return null;
  }
  var nativeElement = viewContainerRef;
  if (viewContainerRef.element && viewContainerRef.element.nativeElement) {
    nativeElement = viewContainerRef.element.nativeElement;
  }
  if (nativeElement.querySelector) {
    var form_1 = nativeElement.querySelector('form');
    if (form_1) {
      if (!form_1.getAttribute('date-format')) {
        var df = storage_1.storage.getDateFormat();
        form_1.setAttribute('date-format', df);
      }
      setTimeout(function () {
        if (initMat) {
          initMat(form_1);
        }
        focusFirstElement(form_1);
      }, 100);
    }
    return form_1;
  }
}
exports.initForm = initForm;
function initMaterial(form) {
  storage_1.storage.ui().initMaterial(form);
}
exports.initMaterial = initMaterial;
function showToast(msg) {
  storage_1.storage.toast().showToast(msg);
}
exports.showToast = showToast;
function alertError(msg, header, detail, callback) {
  storage_1.storage.alert().alertError(msg, header, detail, callback);
}
exports.alertError = alertError;
