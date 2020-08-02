"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports,"__esModule",{value:true});
var core_1 = require("@angular/core");
var HttpOptionsService_1 = require("./http/HttpOptionsService");
var storage_1 = require("./storage");
var DefaultHttpRequest = (function () {
  function DefaultHttpRequest(http) {
    this.http = http;
  }
  DefaultHttpRequest.prototype.get = function (url, options) {
    return this.http.get(url, options ? options : HttpOptionsService_1.httpOptionsService.getHttpOptions()).toPromise();
  };
  DefaultHttpRequest.prototype.delete = function (url, options) {
    return this.http.delete(url, options ? options : HttpOptionsService_1.httpOptionsService.getHttpOptions()).toPromise();
  };
  DefaultHttpRequest.prototype.post = function (url, obj, options) {
    return this.http.post(url, obj, options ? options : HttpOptionsService_1.httpOptionsService.getHttpOptions()).toPromise();
  };
  DefaultHttpRequest.prototype.put = function (url, obj, options) {
    return this.http.put(url, obj, options ? options : HttpOptionsService_1.httpOptionsService.getHttpOptions()).toPromise();
  };
  DefaultHttpRequest.prototype.patch = function (url, obj, options) {
    return this.http.patch(url, obj, options ? options : HttpOptionsService_1.httpOptionsService.getHttpOptions()).toPromise();
  };
  DefaultHttpRequest = __decorate([
    core_1.Injectable()
  ], DefaultHttpRequest);
  return DefaultHttpRequest;
}());
exports.DefaultHttpRequest = DefaultHttpRequest;
var AuthenticationService = (function () {
  function AuthenticationService(router) {
    this.router = router;
  }
  AuthenticationService.prototype.canActivate = function (route, state) {
    var user = storage_1.storage.getUser();
    if (user) {
      return true;
    }
    else {
      this.router.navigate([storage_1.storage.authentication]);
      return false;
    }
  };
  AuthenticationService = __decorate([
    core_1.Injectable()
  ], AuthenticationService);
  return AuthenticationService;
}());
exports.AuthenticationService = AuthenticationService;
var AuthorizationService = (function () {
  function AuthorizationService(router) {
    this.router = router;
  }
  AuthorizationService.prototype.canActivate = function (route, state) {
    var user = storage_1.storage.getUser();
    if (!user) {
      this.router.navigate([storage_1.storage.authentication]);
      return false;
    }
    else {
      var privileges = storage_1.storage.privileges();
      var p = privileges.get(state.url);
      if (p) {
        return true;
      }
      else {
        this.router.navigate([storage_1.storage.home]);
        return false;
      }
    }
  };
  AuthorizationService = __decorate([
    core_1.Injectable()
  ], AuthorizationService);
  return AuthorizationService;
}());
exports.AuthorizationService = AuthorizationService;
