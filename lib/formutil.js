"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function readOnly(form) {
  if (!form) {
    return;
  }
  var len = form.length;
  for (var i = 0; i < len; i++) {
    var ctrl = form[i];
    var name_1 = ctrl.getAttribute('name');
    if (name_1 != null && name_1.length > 0 && name_1 !== 'btnBack') {
      var nodeName = ctrl.nodeName;
      var type = ctrl.getAttribute('type');
      if (nodeName === 'INPUT' && type !== null) {
        nodeName = type.toUpperCase();
      }
      if (nodeName !== 'BUTTON'
        && nodeName !== 'RESET'
        && nodeName !== 'SUBMIT'
        && nodeName !== 'SELECT') {
        switch (type) {
          case 'checkbox':
            ctrl.disabled = true;
            break;
          case 'radio':
            ctrl.disabled = true;
            break;
          default:
            ctrl.readOnly = true;
        }
      }
      else {
        ctrl.disabled = true;
      }
    }
  }
}
exports.readOnly = readOnly;
function focusFirstElement(form) {
  var i = 0;
  var len = form.length;
  for (i = 0; i < len; i++) {
    var ctrl = form[i];
    if (!(ctrl.readOnly || ctrl.disabled)) {
      var nodeName = ctrl.nodeName;
      var type = ctrl.getAttribute('type');
      if (type) {
        var t = type.toUpperCase();
        if (t === 'BUTTON' || t === 'SUBMIT') {
          ctrl.focus();
        }
        if (nodeName === 'INPUT') {
          nodeName = t;
        }
      }
      if (nodeName !== 'BUTTON'
        && nodeName !== 'RESET'
        && nodeName !== 'SUBMIT'
        && nodeName !== 'CHECKBOX'
        && nodeName !== 'RADIO') {
        ctrl.focus();
        try {
          ctrl.setSelectionRange(0, ctrl.value.length);
        }
        catch (err) {
        }
        return;
      }
    }
  }
}
exports.focusFirstElement = focusFirstElement;
function focusFirstError(form, className) {
  if (!form) {
    return;
  }
  var len = form.length;
  if (className && className.length > 0) {
    for (var i = 0; i < len; i++) {
      var ctrl = form[i];
      var parent_1 = ctrl.parentElement;
      if (ctrl.classList.contains(className)
        || (parent_1 && parent_1.classList.contains(className))) {
        ctrl.focus();
        ctrl.scrollIntoView();
        return;
      }
    }
  }
  else {
    for (var i = 0; i < len; i++) {
      var ctrl = form[i];
      var parent_2 = ctrl.parentElement;
      if (ctrl.classList.contains('invalid')
        || ctrl.classList.contains('.ng-invalid')
        || (parent_2 && parent_2.classList.contains('invalid'))) {
        ctrl.focus();
        ctrl.scrollIntoView();
        return;
      }
    }
  }
}
exports.focusFirstError = focusFirstError;
