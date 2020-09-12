"use strict";
Object.defineProperty(exports,"__esModule",{value:true});
var http_1 = require("@angular/common/http");
function getUrlParam(route){
  if (!route){
    return null;
  }
  var param = route.params;
  var obj = param._value;
  return obj;
}
exports.getUrlParam = getUrlParam;
function navigate(router, stateTo, params){
  if (params === void 0){ params = null; }
  var commands = [];
  commands.push(stateTo);
  if (params != null){
    if (typeof params === 'object'){
      for (var _i = 0, params_1 = params; _i < params_1.length; _i++){
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
function getId(id, keys, route){
  if (id){
    return id;
  }
  else {
    return buildId(keys, route);
  }
}
exports.getId = getId;
function buildId(keys, route){
  if (!route || !keys || keys.length === 0){
    return null;
  }
  var param = route.params;
  var obj = param._value;
  if (!(keys && keys.length > 0)){
    return null;
  }
  if (keys.length === 1){
    var x = obj[keys[0]];
    if (x && x !== ''){
      return x;
    }
    return obj['id'];
  }
  var id = {};
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++){
    var key = keys_1[_i];
    var v = obj[key];
    if (!v){
      return null;
    }
    id[key] = v;
  }
  return id;
}
exports.buildId = buildId;
function buildFromUrl(){
  return buildParameters(window.location.search);
}
exports.buildFromUrl = buildFromUrl;
function buildParameters(url){
  var urlSearch = url;
  var i = urlSearch.indexOf('?');
  if (i >= 0){
    urlSearch = url.substr(i + 1);
  }
  var obj = {};
  var httpParams = new http_1.HttpParams({ fromString: urlSearch });
  for (var _i = 0, _a = httpParams.keys(); _i < _a.length; _i++){
    var key = _a[_i];
    obj[key] = httpParams.get(key);
  }
  return obj;
}
exports.buildParameters = buildParameters;
function initElement(viewContainerRef, initForm, initMat){
  if (!viewContainerRef){
    return null;
  }
  var nativeElement = viewContainerRef;
  if (viewContainerRef.element && viewContainerRef.element.nativeElement){
    nativeElement = viewContainerRef.element.nativeElement;
  }
  if (nativeElement.querySelector){
    var form = nativeElement.querySelector('form');
    if (form && initForm){
      initForm(form, initMat);
    }
    return form;
  }
}
exports.initElement = initElement;
