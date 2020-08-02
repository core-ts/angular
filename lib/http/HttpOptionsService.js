"use strict";
Object.defineProperty(exports,"__esModule",{value:true});
var storage_1 = require("../storage");
var HttpOptionsService = (function () {
  function HttpOptionsService() {
  }
  HttpOptionsService.prototype.getHttpOptions = function () {
    var token = storage_1.storage.getToken();
    if (token === null) {
      return {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      };
    }
    else {
      return {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': 'Bearer ' + token
        }
      };
    }
  };
  return HttpOptionsService;
}());
exports.httpOptionsService = new HttpOptionsService();
