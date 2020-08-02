"use strict";
Object.defineProperty(exports,"__esModule",{value:true});
function toMap(map, forms) {
  if (!map || !forms) {
    return;
  }
  for (var _i = 0, forms_1 = forms; _i < forms_1.length; _i++) {
    var form = forms_1[_i];
    map.set(form.path, form);
  }
  for (var _a = 0, forms_2 = forms; _a < forms_2.length; _a++) {
    var form = forms_2[_a];
    if (form.children && Array.isArray(form.children)) {
      toMap(map, form.children);
    }
  }
}
exports.toMap = toMap;
function sortPrivileges(forms) {
  forms.sort(sortBySequence);
  for (var _i = 0, forms_3 = forms; _i < forms_3.length; _i++) {
    var form = forms_3[_i];
    if (form.children && Array.isArray(form.children)) {
      form.children = sortPrivileges(form.children);
    }
  }
  return forms;
}
exports.sortPrivileges = sortPrivileges;
function sortBySequence(a, b) {
  if (!a.sequence) {
    a.sequence = 99;
  }
  if (!b.sequence) {
    b.sequence = 99;
  }
  return (a.sequence - b.sequence);
}
exports.sortBySequence = sortBySequence;
