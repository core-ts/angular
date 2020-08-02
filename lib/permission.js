"use strict";
Object.defineProperty(exports,"__esModule",{value:true});
var storage_1 = require("./storage");
function setSearchPermission(user, url, permissionBuilder, com) {
  if (permissionBuilder) {
    var permission = permissionBuilder.buildPermission(storage_1.storage.getUser(), url);
    com.viewable = permission.viewable;
    com.addable = permission.addable;
    com.editable = permission.editable;
    com.approvable = permission.approvable;
    com.deletable = permission.deletable;
  }
}
exports.setSearchPermission = setSearchPermission;
function setEditPermission(user, url, permissionBuilder, com) {
  if (permissionBuilder) {
    var permission = permissionBuilder.buildPermission(storage_1.storage.getUser(), url);
    com.addable = permission.addable;
    com.editable = permission.editable;
    com.deletable = permission.deletable;
  }
}
exports.setEditPermission = setEditPermission;
