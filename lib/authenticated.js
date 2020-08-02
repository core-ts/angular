"use strict";
Object.defineProperty(exports,"__esModule",{value:true});
var storage_1 = require("./storage");
function authenticated() {
  var user = storage_1.storage.getUser();
  if (user) {
    return true;
  }
  else {
    return false;
  }
}
exports.authenticated = authenticated;
