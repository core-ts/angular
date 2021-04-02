"use strict";
var __extends = (this && this.__extends) || (function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
  };
  return function (d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0: case 1: t = op; break;
        case 4: _.label++; return { value: op[1], done: false };
        case 5: _.label++; y = op[1]; op = [0]; continue;
        case 7: op = _.ops.pop(); _.trys.pop(); continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
          if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
          if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
          if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
          if (t[2]) _.ops.pop();
          _.trys.pop(); continue;
      }
      op = body.call(thisArg, _);
    } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};
Object.defineProperty(exports, "__esModule", { value: true });
var reflectx_1 = require("reflectx");
var angular_1 = require("./angular");
var core_1 = require("./core");
var input_1 = require("./input");
var Status;
(function (Status) {
  Status[Status["NotFound"] = 0] = "NotFound";
  Status[Status["Success"] = 1] = "Success";
  Status[Status["VersionError"] = 2] = "VersionError";
  Status[Status["Error"] = 4] = "Error";
})(Status = exports.Status || (exports.Status = {}));
var BaseDiffApprComponent = (function () {
  function BaseDiffApprComponent(service, param, showMessage, showError, loading) {
    this.service = service;
    this.resourceService = input_1.getResource(param);
    this.resource = this.resourceService.resource();
    this.loading = input_1.getLoadingFunc(param, loading);
    this.showError = input_1.getErrorFunc(param, showError);
    this.showMessage = input_1.getMsgFunc(param, showMessage);
    this.back = this.back.bind(this);
    var x = {};
    this.origin = x;
    this.value = x;
    this.approve = this.approve.bind(this);
    this.reject = this.reject.bind(this);
    this.handleError = this.handleError.bind(this);
    this.end = this.end.bind(this);
    this.formatFields = this.formatFields.bind(this);
    this.load = this.load.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
  }
  BaseDiffApprComponent.prototype.back = function () {
    window.history.back();
  };
  BaseDiffApprComponent.prototype.load = function (_id) {
    return __awaiter(this, void 0, void 0, function () {
      var x, ctx, dobj, formatdDiff, err_1, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            x = _id;
            if (!(x && x !== '')) return [3, 5];
            this.id = _id;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            this.running = true;
            if (this.loading) {
              this.loading.showLoading();
            }
            ctx = {};
            return [4, this.service.diff(_id, ctx)];
          case 2:
            dobj = _a.sent();
            if (!dobj) {
              this.handleNotFound(this.form);
            }
            else {
              formatdDiff = formatDiffModel(dobj, this.formatFields);
              this.value = formatdDiff.value;
              this.origin = formatdDiff.origin;
              showDiff(this.form, formatdDiff.value, formatdDiff.origin);
            }
            return [3, 5];
          case 3:
            err_1 = _a.sent();
            data = (err_1 && err_1.response) ? err_1.response : err_1;
            if (data && data.status === 404) {
              this.handleNotFound(this.form);
            }
            else {
              core_1.error(err_1, this.resourceService.value, this.showError);
            }
            return [3, 5];
          case 4:
            this.running = false;
            if (this.loading) {
              this.loading.hideLoading();
            }
            return [7];
          case 5: return [2];
        }
      });
    });
  };
  BaseDiffApprComponent.prototype.handleNotFound = function (form) {
    this.disabled = true;
    var r = this.resourceService;
    this.showError(r.value('error_not_found'), r.value('error'));
  };
  BaseDiffApprComponent.prototype.formatFields = function (value) {
    return value;
  };
  BaseDiffApprComponent.prototype.approve = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var r, ctx, status_1, err_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            event.preventDefault();
            if (this.running) {
              return [2];
            }
            r = this.resourceService;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            this.running = true;
            if (this.loading) {
              this.loading.showLoading();
            }
            ctx = {};
            return [4, this.service.approve(this.id, ctx)];
          case 2:
            status_1 = _a.sent();
            if (status_1 === Status.Success) {
              this.showMessage(r.value('msg_approve_success'));
            }
            else if (status_1 === Status.VersionError) {
              this.showMessage(r.value('msg_approve_version_error'));
            }
            else if (status_1 === Status.NotFound) {
              this.handleNotFound(this.form);
            }
            else {
              this.showError(r.value('error_internal'), r.value('error'));
            }
            return [3, 5];
          case 3:
            err_2 = _a.sent();
            this.handleError(err_2);
            return [3, 5];
          case 4:
            this.end();
            return [7];
          case 5: return [2];
        }
      });
    });
  };
  BaseDiffApprComponent.prototype.reject = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var r, ctx, status_2, err_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            event.preventDefault();
            if (this.running) {
              return [2];
            }
            r = this.resourceService;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            this.running = true;
            if (this.loading) {
              this.loading.showLoading();
            }
            ctx = {};
            return [4, this.service.reject(this.id, ctx)];
          case 2:
            status_2 = _a.sent();
            if (status_2 === Status.Success) {
              this.showMessage(r.value('msg_reject_success'));
            }
            else if (status_2 === Status.VersionError) {
              this.showMessage(r.value('msg_approve_version_error'));
            }
            else if (status_2 === Status.NotFound) {
              this.handleNotFound(this.form);
            }
            else {
              this.showError(r.value('error_internal'), r.value('error'));
            }
            return [3, 5];
          case 3:
            err_3 = _a.sent();
            this.handleError(err_3);
            return [3, 5];
          case 4:
            this.end();
            return [7];
          case 5: return [2];
        }
      });
    });
  };
  BaseDiffApprComponent.prototype.handleError = function (err) {
    var r = this.resourceService;
    var data = (err && err.response) ? err.response : err;
    if (data && (data.status === 404 || data.status === 409)) {
      if (data.status === 404) {
        this.handleNotFound();
      }
      else {
        this.showMessage(r.value('msg_approve_version_error'));
      }
    }
    else {
      core_1.error(err, r.value, this.showError);
    }
  };
  BaseDiffApprComponent.prototype.end = function () {
    this.disabled = true;
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
  };
  return BaseDiffApprComponent;
}());
exports.BaseDiffApprComponent = BaseDiffApprComponent;
var DiffApprComponent = (function (_super) {
  __extends(DiffApprComponent, _super);
  function DiffApprComponent(viewContainerRef, route, service, param, showMessage, showError, loading) {
    var _this = _super.call(this, service, param, showMessage, showError, loading) || this;
    _this.viewContainerRef = viewContainerRef;
    _this.route = route;
    _this.ngOnInit = _this.ngOnInit.bind(_this);
    return _this;
  }
  DiffApprComponent.prototype.ngOnInit = function () {
    this.form = angular_1.initElement(this.viewContainerRef);
    var id = angular_1.buildId(this.route, this.service.keys());
    this.load(id);
  };
  return DiffApprComponent;
}(BaseDiffApprComponent));
exports.DiffApprComponent = DiffApprComponent;
function showDiff(form, value, origin) {
  if (!origin) {
    origin = {};
  }
  var differentKeys = reflectx_1.diff(origin, value);
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
  var obj2 = reflectx_1.clone(obj);
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
