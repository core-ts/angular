"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getResource(p) {
  var x = p;
  if (x.value && x.format && typeof x.value === 'function') {
    return x;
  }
  else {
    return x.resource;
  }
}
exports.getResource = getResource;
function getAutoSearch(p) {
  var x = p;
  if (x.value && x.format && typeof x.value === 'function') {
    return true;
  }
  return x.auto;
}
exports.getAutoSearch = getAutoSearch;
function getUIService(p, ui0) {
  if (ui0) {
    return ui0;
  }
  return p.ui;
}
exports.getUIService = getUIService;
function getLoadingFunc(p, ui0) {
  if (ui0) {
    return ui0;
  }
  return p.loading;
}
exports.getLoadingFunc = getLoadingFunc;
function getMsgFunc(p, showMsg) {
  if (showMsg) {
    return showMsg;
  }
  return p.showMessage;
}
exports.getMsgFunc = getMsgFunc;
function getConfirmFunc(p, cf) {
  if (cf) {
    return cf;
  }
  return p.confirm;
}
exports.getConfirmFunc = getConfirmFunc;
function getLocaleFunc(p, getLoc) {
  if (getLoc) {
    return getLoc;
  }
  return p.getLocale;
}
exports.getLocaleFunc = getLocaleFunc;
function getErrorFunc(p, showErr) {
  if (showErr) {
    return showErr;
  }
  return p.showError;
}
exports.getErrorFunc = getErrorFunc;
