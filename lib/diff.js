"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reflect_1 = require("./reflect");
function showDiff(form, value, origin) {
  if (!origin) {
    origin = {};
  }
  var differentKeys = reflect_1.diff(origin, value);
  for (var _i = 0, differentKeys_1 = differentKeys; _i < differentKeys_1.length; _i++) {
    var differentKey = differentKeys_1[_i];
    var y = form.querySelector('.' + differentKey);
    if (y) {
      if (y.childNodes.length === 3) {
        y.children[1].classList.add('highlight');
        y.children[2].classList.add('highlight');
      }
      else {
        y.classList.add('highlight');
      }
    }
  }
}
exports.showDiff = showDiff;
function formatDiffModel(obj, formatFields) {
  if (!obj) {
    return obj;
  }
  var obj2 = reflect_1.clone(obj);
  if (!obj2.origin) {
    obj2.origin = {};
  }
  else {
    if (typeof obj2.origin === 'string') {
      obj2.origin = JSON.parse(obj2.origin);
    }
    if (formatFields && typeof obj2.origin === 'object' && !Array.isArray(obj2.origin)) {
      obj2.origin = formatFields(obj2.origin);
    }
  }
  if (!obj2.value) {
    obj2.value = {};
  }
  else {
    if (typeof obj2.value === 'string') {
      obj2.value = JSON.parse(obj2.value);
    }
    if (formatFields && typeof obj2.value === 'object' && !Array.isArray(obj2.value)) {
      obj2.value = formatFields(obj2.value);
    }
  }
  return obj2;
}
exports.formatDiffModel = formatDiffModel;
