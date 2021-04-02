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
var search_utilities_1 = require("search-utilities");
var angular_1 = require("./angular");
var core_1 = require("./core");
var edit_1 = require("./edit");
var formatter_1 = require("./formatter");
var formutil_1 = require("./formutil");
var input_1 = require("./input");
exports.enLocale = {
  'id': 'en-US',
  'countryCode': 'US',
  'dateFormat': 'M/d/yyyy',
  'firstDayOfWeek': 1,
  'decimalSeparator': '.',
  'groupSeparator': ',',
  'decimalDigits': 2,
  'currencyCode': 'USD',
  'currencySymbol': '$',
  'currencyPattern': 0
};
var RootComponent = (function () {
  function RootComponent(resourceService, getLocale) {
    this.resourceService = resourceService;
    this.getLocale = getLocale;
    if (resourceService) {
      this.resource = resourceService.resource();
    }
    this.currencySymbol = this.currencySymbol.bind(this);
    this.getCurrencyCode = this.getCurrencyCode.bind(this);
    this.back = this.back.bind(this);
  }
  RootComponent.prototype.back = function () {
    window.history.back();
  };
  RootComponent.prototype.currencySymbol = function () {
    return this.includeCurrencySymbol;
  };
  RootComponent.prototype.getCurrencyCode = function () {
    return (this.form ? this.form.getAttribute('currency-code') : null);
  };
  return RootComponent;
}());
exports.RootComponent = RootComponent;
var BaseViewComponent = (function (_super) {
  __extends(BaseViewComponent, _super);
  function BaseViewComponent(sv, param, showError, getLocale, loading) {
    var _this = _super.call(this, input_1.getResource(param), input_1.getLocaleFunc(param, getLocale)) || this;
    _this.showError = input_1.getErrorFunc(param, showError);
    _this.loading = input_1.getLoadingFunc(param, loading);
    if (sv) {
      if (typeof sv === 'function') {
        _this.loadFn = sv;
      }
      else {
        _this.service = sv;
        if (_this.service.metadata) {
          var m = _this.service.metadata();
          if (m) {
            _this.metadata = m;
            var meta = edit_1.build(m);
            _this.keys = meta.keys;
          }
        }
      }
    }
    _this.getModelName = _this.getModelName.bind(_this);
    var n = _this.getModelName();
    _this[n] = {};
    _this.load = _this.load.bind(_this);
    _this.showModel = _this.showModel.bind(_this);
    _this.getModel = _this.getModel.bind(_this);
    _this.handleNotFound = _this.handleNotFound.bind(_this);
    return _this;
  }
  BaseViewComponent.prototype.load = function (_id, callback) {
    return __awaiter(this, void 0, void 0, function () {
      var id, ctx, obj, err_1, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            id = _id;
            if (!(id && id !== '')) return [3, 8];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            this.running = true;
            if (this.loading) {
              this.loading.showLoading();
            }
            ctx = {};
            obj = void 0;
            if (!this.loadFn) return [3, 3];
            return [4, this.loadFn(id, ctx)];
          case 2:
            obj = _a.sent();
            return [3, 5];
          case 3: return [4, this.service.load(id, ctx)];
          case 4:
            obj = _a.sent();
            _a.label = 5;
          case 5:
            if (obj) {
              if (callback) {
                callback(obj, this.showModel);
              }
              else {
                this.showModel(obj);
              }
            }
            else {
              this.handleNotFound(this.form);
            }
            return [3, 8];
          case 6:
            err_1 = _a.sent();
            data = (err_1 && err_1.response) ? err_1.response : err_1;
            if (data && data.status === 404) {
              this.handleNotFound(this.form);
            }
            else {
              core_1.error(err_1, this.resourceService.value, this.showError);
            }
            return [3, 8];
          case 7:
            this.running = false;
            if (this.loading) {
              this.loading.hideLoading();
            }
            return [7];
          case 8: return [2];
        }
      });
    });
  };
  BaseViewComponent.prototype.handleNotFound = function (form) {
    if (form) {
      formutil_1.readOnly(form);
    }
    var msg = core_1.message(this.resourceService.value, 'error_not_found', 'error');
    this.showError(msg.message, msg.title);
  };
  BaseViewComponent.prototype.getModelName = function () {
    if (this.metadata) {
      return this.metadata.name;
    }
    var n = core_1.getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    }
  };
  BaseViewComponent.prototype.showModel = function (model) {
    var name = this.getModelName();
    this[name] = model;
  };
  BaseViewComponent.prototype.getModel = function () {
    var name = this.getModelName();
    var model = this[name];
    return model;
  };
  return BaseViewComponent;
}(RootComponent));
exports.BaseViewComponent = BaseViewComponent;
var ViewComponent = (function (_super) {
  __extends(ViewComponent, _super);
  function ViewComponent(viewContainerRef, route, sv, param, showError, getLocale, loading) {
    var _this = _super.call(this, sv, param, showError, getLocale, loading) || this;
    _this.viewContainerRef = viewContainerRef;
    _this.route = route;
    _this.ngOnInit = _this.ngOnInit.bind(_this);
    return _this;
  }
  ViewComponent.prototype.ngOnInit = function () {
    this.form = angular_1.initElement(this.viewContainerRef);
    var id = angular_1.buildId(this.route, this.keys);
    this.load(id);
  };
  return ViewComponent;
}(BaseViewComponent));
exports.ViewComponent = ViewComponent;
var BaseComponent = (function (_super) {
  __extends(BaseComponent, _super);
  function BaseComponent(resourceService, getLocale, ui, loading) {
    var _this = _super.call(this, resourceService, getLocale) || this;
    _this.loading = loading;
    _this.uiS1 = ui;
    _this.getModelName = _this.getModelName.bind(_this);
    _this.includes = _this.includes.bind(_this);
    _this.updateState = _this.updateState.bind(_this);
    _this.updateStateFlat = _this.updateStateFlat.bind(_this);
    return _this;
  }
  BaseComponent.prototype.getModelName = function () {
    var n = core_1.getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    }
  };
  BaseComponent.prototype.includes = function (checkedList, v) {
    return v && checkedList && Array.isArray(checkedList) ? checkedList.includes(v) : false;
  };
  BaseComponent.prototype.updateState = function (event) {
    var locale = exports.enLocale;
    if (this.getLocale) {
      locale = this.getLocale();
    }
    this.updateStateFlat(event, locale);
  };
  BaseComponent.prototype.updateStateFlat = function (e, locale) {
    if (!locale) {
      locale = exports.enLocale;
    }
    var ctrl = e.currentTarget;
    var modelName = this.getModelName();
    if (!modelName) {
      modelName = ctrl.form.getAttribute('model-name');
    }
    var type = ctrl.getAttribute('type');
    var isPreventDefault = type && (['checkbox', 'radio'].indexOf(type.toLowerCase()) >= 0 ? false : true);
    if (isPreventDefault) {
      e.preventDefault();
    }
    if (this.uiS1 && ctrl.nodeName === 'SELECT' && ctrl.value && ctrl.classList.contains('invalid')) {
      this.uiS1.removeError(ctrl);
    }
    var ex = this[modelName];
    var dataField = ctrl.getAttribute('data-field');
    var field = (dataField ? dataField : ctrl.name);
    if (type && type.toLowerCase() === 'checkbox') {
      var v = valueOfCheckbox(ctrl);
      reflectx_1.setValue(ex, field, v);
    }
    else {
      var v = ctrl.value;
      if (this.uiS1) {
        v = this.uiS1.getValue(ctrl, locale);
      }
      if (ctrl.value != v) {
        reflectx_1.setValue(ex, field, v);
      }
    }
  };
  return BaseComponent;
}(RootComponent));
exports.BaseComponent = BaseComponent;
function valueOfCheckbox(ctrl) {
  var ctrlOnValue = ctrl.getAttribute('data-on-value');
  var ctrlOffValue = ctrl.getAttribute('data-off-value');
  if (ctrlOnValue && ctrlOffValue) {
    var onValue = ctrlOnValue ? ctrlOnValue : true;
    var offValue = ctrlOffValue ? ctrlOffValue : false;
    return ctrl.checked === true ? onValue : offValue;
  }
  else {
    return ctrl.checked === true;
  }
}
exports.valueOfCheckbox = valueOfCheckbox;
var MessageComponent = (function (_super) {
  __extends(MessageComponent, _super);
  function MessageComponent(resourceService, getLocale, ui, loading) {
    var _this = _super.call(this, resourceService, getLocale, ui, loading) || this;
    _this.loading = loading;
    _this.message = '';
    _this.alertClass = '';
    _this.showMessage = _this.showMessage.bind(_this);
    _this.showError = _this.showError.bind(_this);
    _this.hideMessage = _this.hideMessage.bind(_this);
    return _this;
  }
  MessageComponent.prototype.showMessage = function (msg, field) {
    this.alertClass = 'alert alert-info';
    this.message = msg;
  };
  MessageComponent.prototype.showError = function (msg, field) {
    this.alertClass = 'alert alert-danger';
    this.message = msg;
  };
  MessageComponent.prototype.hideMessage = function (field) {
    this.alertClass = '';
    this.message = '';
  };
  return MessageComponent;
}(BaseComponent));
exports.MessageComponent = MessageComponent;
var BaseEditComponent = (function (_super) {
  __extends(BaseEditComponent, _super);
  function BaseEditComponent(service, param, showMessage, showError, confirm, getLocale, uis, loading, patchable, backOnSaveSuccess) {
    var _this = _super.call(this, input_1.getResource(param), input_1.getLocaleFunc(param, getLocale), input_1.getUIService(param, uis), input_1.getLoadingFunc(param, loading)) || this;
    _this.service = service;
    _this.patchable = true;
    _this.backOnSuccess = true;
    _this.addable = true;
    _this.editable = true;
    _this.ui = input_1.getUIService(param, uis);
    _this.showError = input_1.getErrorFunc(param, showError);
    _this.showMessage = input_1.getMsgFunc(param, showMessage);
    _this.confirm = input_1.getConfirmFunc(param, confirm);
    if (service.metadata) {
      var metadata = service.metadata();
      if (metadata) {
        var meta = edit_1.build(metadata);
        _this.keys = meta.keys;
        _this.version = meta.version;
        _this.metadata = metadata;
        _this.metamodel = meta;
      }
    }
    if (!_this.keys && service.keys) {
      var k = service.keys();
      if (k) {
        _this.keys = k;
      }
    }
    if (!_this.keys) {
      _this.keys = [];
    }
    if (patchable === false) {
      _this.patchable = patchable;
    }
    if (backOnSaveSuccess === false) {
      _this.backOnSuccess = backOnSaveSuccess;
    }
    _this.insertSuccessMsg = _this.resourceService.value('msg_save_success');
    _this.updateSuccessMsg = _this.resourceService.value('msg_save_success');
    _this.getModelName = _this.getModelName.bind(_this);
    var n = _this.getModelName();
    _this[n] = {};
    _this.load = _this.load.bind(_this);
    _this.resetState = _this.resetState.bind(_this);
    _this.handleNotFound = _this.handleNotFound.bind(_this);
    _this.createModel = _this.createModel.bind(_this);
    _this.formatModel = _this.formatModel.bind(_this);
    _this.showModel = _this.showModel.bind(_this);
    _this.getModel = _this.getModel.bind(_this);
    _this.getRawModel = _this.getRawModel.bind(_this);
    _this.newOnClick = _this.newOnClick.bind(_this);
    _this.saveOnClick = _this.saveOnClick.bind(_this);
    _this.onSave = _this.onSave.bind(_this);
    _this.confirm = _this.confirm.bind(_this);
    _this.validate = _this.validate.bind(_this);
    _this.save = _this.save.bind(_this);
    _this.succeed = _this.succeed.bind(_this);
    _this.successMessage = _this.successMessage.bind(_this);
    _this.save = _this.save.bind(_this);
    _this.postSave = _this.postSave.bind(_this);
    _this.handleDuplicateKey = _this.handleDuplicateKey.bind(_this);
    return _this;
  }
  BaseEditComponent.prototype.load = function (_id, callback) {
    return __awaiter(this, void 0, void 0, function () {
      var id, com, obj, err_2, data, obj;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            id = _id;
            if (!(id && id !== '')) return [3, 6];
            com = this;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4, this.service.load(id)];
          case 2:
            obj = _a.sent();
            if (!obj) {
              com.handleNotFound(com.form);
            }
            else {
              this.newMode = false;
              this.orginalModel = reflectx_1.clone(obj);
              this.formatModel(obj);
              if (callback) {
                callback(obj, this.showModel);
              }
              else {
                this.showModel(obj);
              }
            }
            return [3, 5];
          case 3:
            err_2 = _a.sent();
            data = (err_2 && err_2.response) ? err_2.response : err_2;
            if (data && data.status === 404) {
              com.handleNotFound(com.form);
            }
            else {
              core_1.error(err_2, this.resourceService.value, this.showError);
            }
            return [3, 5];
          case 4:
            com.running = false;
            if (this.loading) {
              this.loading.hideLoading();
            }
            return [7];
          case 5: return [3, 7];
          case 6:
            this.newMode = true;
            this.orginalModel = null;
            obj = this.createModel();
            if (callback) {
              callback(obj, this.showModel);
            }
            else {
              this.showModel(obj);
            }
            _a.label = 7;
          case 7: return [2];
        }
      });
    });
  };
  BaseEditComponent.prototype.resetState = function (newMod, model, originalModel) {
    this.newMode = newMod;
    this.orginalModel = originalModel;
    this.formatModel(model);
    this.showModel(model);
  };
  BaseEditComponent.prototype.handleNotFound = function (form) {
    var msg = core_1.message(this.resourceService.value, 'error_not_found', 'error');
    if (this.form) {
      formutil_1.readOnly(form);
    }
    this.showError(msg.message, msg.title);
  };
  BaseEditComponent.prototype.formatModel = function (obj) {
    if (this.metamodel) {
      var locale = exports.enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      formatter_1.format(obj, this.metamodel, locale, this.getCurrencyCode(), this.currencySymbol());
    }
  };
  BaseEditComponent.prototype.getModelName = function () {
    if (this.metadata) {
      return this.metadata.name;
    }
    var n = core_1.getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    }
  };
  BaseEditComponent.prototype.showModel = function (model) {
    var n = this.getModelName();
    this[n] = model;
  };
  BaseEditComponent.prototype.getRawModel = function () {
    var name = this.getModelName();
    var model = this[name];
    return model;
  };
  BaseEditComponent.prototype.getModel = function () {
    var name = this.getModelName();
    var model = this[name];
    var obj = reflectx_1.clone(model);
    if (this.metamodel) {
      var locale = exports.enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      formatter_1.json(obj, this.metamodel, locale, this.getCurrencyCode());
    }
    return obj;
  };
  BaseEditComponent.prototype.createModel = function () {
    var metadata = this.service.metadata();
    if (metadata) {
      var obj = edit_1.createModel(metadata);
      return obj;
    }
    else {
      var obj = {};
      return obj;
    }
  };
  BaseEditComponent.prototype.newOnClick = function (event) {
    if (!this.form && event && event.currentTarget) {
      var ctrl = event.currentTarget;
      if (ctrl.form) {
        this.form = ctrl.form;
      }
    }
    this.resetState(true, this.createModel(), null);
    var u = this.ui;
    var f = this.form;
    if (u && f) {
      setTimeout(function () {
        u.removeFormError(f);
      }, 100);
    }
  };
  BaseEditComponent.prototype.saveOnClick = function (event, isBack) {
    if (!this.form && event && event.currentTarget) {
      this.form = event.currentTarget.form;
    }
    if (isBack) {
      this.onSave(isBack);
    }
    else {
      this.onSave(this.backOnSuccess);
    }
  };
  BaseEditComponent.prototype.onSave = function (isBack) {
    var _this = this;
    var r = this.resourceService;
    if (this.newMode && this.addable !== true) {
      var msg = core_1.message(r.value, 'error_permission_add', 'error_permission');
      this.showError(msg.message, msg.title);
      return;
    }
    else if (!this.newMode && this.editable !== true) {
      var msg = core_1.message(r.value, 'error_permission_edit', 'error_permission');
      this.showError(msg.message, msg.title);
      return;
    }
    else {
      if (this.running) {
        return;
      }
      var com_1 = this;
      var obj_1 = com_1.getModel();
      if (!this.newMode) {
        var diffObj_1 = reflectx_1.makeDiff(this.orginalModel, obj_1, this.keys, this.version);
        var l = Object.keys(diffObj_1).length;
        if (l === 0) {
          this.showMessage(r.value('msg_no_change'));
        }
        else {
          com_1.validate(obj_1, function () {
            var msg = core_1.message(r.value, 'msg_confirm_save', 'confirm', 'yes', 'no');
            _this.confirm(msg.message, msg.title, function () {
              com_1.save(obj_1, diffObj_1, isBack);
            }, msg.no, msg.yes);
          });
        }
      }
      else {
        com_1.validate(obj_1, function () {
          var msg = core_1.message(r.value, 'msg_confirm_save', 'confirm', 'yes', 'no');
          _this.confirm(msg.message, msg.title, function () {
            com_1.save(obj_1, obj_1, isBack);
          }, msg.no, msg.yes);
        });
      }
    }
  };
  BaseEditComponent.prototype.validate = function (obj, callback) {
    if (this.ui) {
      var locale = exports.enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      var valid = this.ui.validateForm(this.form, locale);
      if (valid) {
        callback(obj);
      }
    }
    else {
      callback(obj);
    }
  };
  BaseEditComponent.prototype.save = function (obj, body, isBack) {
    return __awaiter(this, void 0, void 0, function () {
      var isBackO, com, ctx, result, result, result, err_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.running = true;
            if (this.loading) {
              this.loading.showLoading();
            }
            isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
            com = this;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 9, , 10]);
            ctx = {};
            if (!!this.newMode) return [3, 6];
            if (!(this.patchable === true && this.service.patch && body && Object.keys(body).length > 0)) return [3, 3];
            return [4, this.service.patch(body, ctx)];
          case 2:
            result = _a.sent();
            com.postSave(result, isBackO);
            return [3, 5];
          case 3: return [4, this.service.update(obj, ctx)];
          case 4:
            result = _a.sent();
            com.postSave(result, isBackO);
            _a.label = 5;
          case 5: return [3, 8];
          case 6:
            reflectx_1.trim(obj);
            return [4, this.service.insert(obj, ctx)];
          case 7:
            result = _a.sent();
            com.postSave(result, isBackO);
            _a.label = 8;
          case 8: return [3, 10];
          case 9:
            err_3 = _a.sent();
            core_1.error(err_3, this.resourceService.value, this.showError);
            return [3, 10];
          case 10: return [2];
        }
      });
    });
  };
  BaseEditComponent.prototype.succeed = function (msg, backOnSave, result) {
    if (result) {
      var model = result.value;
      this.newMode = false;
      if (model && this.setBack) {
        if (!this.backOnSuccess) {
          this.resetState(false, model, reflectx_1.clone(model));
        }
      }
      else {
        edit_1.handleVersion(this.getRawModel(), this.version);
      }
    }
    else {
      edit_1.handleVersion(this.getRawModel(), this.version);
    }
    this.successMessage(msg);
    if (backOnSave) {
      this.back();
    }
  };
  BaseEditComponent.prototype.successMessage = function (msg) {
    this.showMessage(msg);
  };
  BaseEditComponent.prototype.fail = function (result) {
    var errors = result.errors;
    var f = this.form;
    var u = this.ui;
    if (u) {
      var unmappedErrors = u.showFormError(f, errors);
      if (!result.message) {
        if (errors && errors.length === 1) {
          result.message = errors[0].message;
        }
        else {
          result.message = u.buildErrorMessage(unmappedErrors);
        }
      }
      formutil_1.focusFirstError(f);
    }
    else if (errors && errors.length === 1) {
      result.message = errors[0].message;
    }
    var t = this.resourceService.value('error');
    this.showError(result.message, t);
  };
  BaseEditComponent.prototype.postSave = function (res, backOnSave) {
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
    var newMod = this.newMode;
    var successMsg = (newMod ? this.insertSuccessMsg : this.updateSuccessMsg);
    var x = res;
    if (!isNaN(x)) {
      if (x > 0) {
        this.succeed(successMsg, backOnSave);
      }
      else {
        if (newMod) {
          this.handleDuplicateKey();
        }
        else {
          this.handleNotFound();
        }
      }
    }
    else {
      var result = x;
      if (result.status === 1) {
        this.succeed(successMsg, backOnSave, result);
      }
      else if (result.status === 4) {
        this.fail(result);
      }
      else if (newMod && result.status === 0) {
        this.handleDuplicateKey(result);
      }
      else {
        var msg = edit_1.buildMessageFromStatusCode(result.status, this.resourceService.value);
        var r = this.resourceService;
        var title = r.value('error');
        if (msg && msg.length > 0) {
          this.showError(msg, title);
        }
        else if (result.message && result.message.length > 0) {
          this.showError(result.message, title);
        }
        else {
          this.showError(r.value('error_internal'), title);
        }
      }
    }
  };
  BaseEditComponent.prototype.handleDuplicateKey = function (result) {
    var msg = core_1.message(this.resourceService.value, 'error_duplicate_key', 'error');
    this.showError(msg.message, msg.title);
  };
  return BaseEditComponent;
}(BaseComponent));
exports.BaseEditComponent = BaseEditComponent;
var EditComponent = (function (_super) {
  __extends(EditComponent, _super);
  function EditComponent(viewContainerRef, route, service, param, showMessage, showError, confirm, getLocale, uis, loading, patchable, backOnSaveSuccess) {
    var _this = _super.call(this, service, param, showMessage, showError, confirm, getLocale, uis, loading, patchable, backOnSaveSuccess) || this;
    _this.viewContainerRef = viewContainerRef;
    _this.route = route;
    _this.ngOnInit = _this.ngOnInit.bind(_this);
    return _this;
  }
  EditComponent.prototype.ngOnInit = function () {
    var fi = (this.ui ? this.ui.registerEvents : null);
    this.form = angular_1.initElement(this.viewContainerRef, fi);
    var id = angular_1.buildId(this.route, this.keys);
    this.load(id);
  };
  return EditComponent;
}(BaseEditComponent));
exports.EditComponent = EditComponent;
var BaseSearchComponent = (function (_super) {
  __extends(BaseSearchComponent, _super);
  function BaseSearchComponent(sv, param, showMessage, showError, getLocale, uis, loading) {
    var _this = _super.call(this, input_1.getResource(param), input_1.getLocaleFunc(param, getLocale), input_1.getUIService(param, uis), input_1.getLoadingFunc(param, loading)) || this;
    _this.initPageSize = 20;
    _this.pageSize = 20;
    _this.pageIndex = 1;
    _this.sequenceNo = 'sequenceNo';
    _this.loadPage = 1;
    _this.pageMaxSize = 7;
    _this.pageSizes = [10, 20, 40, 60, 100, 200, 400, 1000];
    _this.viewable = true;
    _this.addable = true;
    _this.editable = true;
    _this.approvable = true;
    _this.deletable = true;
    _this.clearKeyworkOnClick = function () {
      _this.state.keyword = '';
    };
    _this.state = {};
    if (sv) {
      if (typeof sv === 'function') {
        _this.searchFn = sv;
      }
      else {
        _this.service = sv;
        if (_this.service.keys) {
          _this.keys = _this.service.keys();
        }
      }
    }
    _this.ui = input_1.getUIService(param, uis);
    _this.showError = input_1.getErrorFunc(param, showError);
    _this.showMessage = input_1.getMsgFunc(param, showMessage);
    _this.toggleFilter = _this.toggleFilter.bind(_this);
    _this.mergeSearchModel = _this.mergeSearchModel.bind(_this);
    _this.load = _this.load.bind(_this);
    _this.getSearchForm = _this.getSearchForm.bind(_this);
    _this.setSearchForm = _this.setSearchForm.bind(_this);
    _this.setSearchModel = _this.setSearchModel.bind(_this);
    _this.getOriginalSearchModel = _this.getOriginalSearchModel.bind(_this);
    _this.getSearchModel = _this.getSearchModel.bind(_this);
    _this.getDisplayFields = _this.getDisplayFields.bind(_this);
    _this.pageSizeChanged = _this.pageSizeChanged.bind(_this);
    _this.searchOnClick = _this.searchOnClick.bind(_this);
    _this.resetAndSearch = _this.resetAndSearch.bind(_this);
    _this.doSearch = _this.doSearch.bind(_this);
    _this.search = _this.search.bind(_this);
    _this.validateSearch = _this.validateSearch.bind(_this);
    _this.showResults = _this.showResults.bind(_this);
    _this.setList = _this.setList.bind(_this);
    _this.getList = _this.getList.bind(_this);
    _this.sort = _this.sort.bind(_this);
    _this.showMore = _this.showMore.bind(_this);
    _this.pageChanged = _this.pageChanged.bind(_this);
    var rs = _this.resourceService;
    _this.deleteHeader = rs.value('msg_delete_header');
    _this.deleteConfirm = rs.value('msg_delete_confirm');
    _this.deleteFailed = rs.value('msg_delete_failed');
    _this.pageChanged = _this.pageChanged.bind(_this);
    return _this;
  }
  BaseSearchComponent.prototype.toggleFilter = function (event) {
    this.hideFilter = !this.hideFilter;
  };
  BaseSearchComponent.prototype.mergeSearchModel = function (obj, arrs, b) {
    return search_utilities_1.mergeSearchModel(obj, this.pageSizes, arrs, b);
  };
  BaseSearchComponent.prototype.load = function (s, autoSearch) {
    this.loadTime = new Date();
    var obj2 = search_utilities_1.initSearchable(s, this);
    this.loadPage = this.pageIndex;
    this.setSearchModel(obj2);
    var com = this;
    if (autoSearch) {
      setTimeout(function () {
        com.doSearch(true);
      }, 0);
    }
  };
  BaseSearchComponent.prototype.getModelName = function () {
    return 'state';
  };
  BaseSearchComponent.prototype.setSearchForm = function (form) {
    this.form = form;
  };
  BaseSearchComponent.prototype.getSearchForm = function () {
    return this.form;
  };
  BaseSearchComponent.prototype.setSearchModel = function (obj) {
    this.state = obj;
  };
  BaseSearchComponent.prototype.getSearchModel = function () {
    var locale = exports.enLocale;
    if (this.getLocale) {
      locale = this.getLocale();
    }
    var obj = this.state;
    if (this.ui) {
      var obj2 = this.ui.decodeFromForm(this.getSearchForm(), locale, this.getCurrencyCode());
      obj = obj2 ? obj2 : {};
    }
    var obj3 = search_utilities_1.optimizeSearchModel(obj, this, this.getDisplayFields());
    if (this.excluding) {
      obj3.excluding = this.excluding;
    }
    if (this.keys && this.keys.length === 1) {
      var l = this.getList();
      if (l && l.length > 0) {
        var refId = l[l.length - 1][this.keys[0]];
        if (refId) {
          obj3.refId = '' + refId;
        }
      }
    }
    return obj3;
  };
  BaseSearchComponent.prototype.getOriginalSearchModel = function () {
    return this.state;
  };
  BaseSearchComponent.prototype.getDisplayFields = function () {
    if (this.displayFields) {
      return this.displayFields;
    }
    if (!this.initDisplayFields) {
      if (this.getSearchForm()) {
        this.displayFields = search_utilities_1.getDisplayFields(this.getSearchForm());
      }
      this.initDisplayFields = true;
    }
    return this.displayFields;
  };
  BaseSearchComponent.prototype.onPageSizeChanged = function (event) {
    var ctrl = event.currentTarget;
    this.pageSizeChanged(Number(ctrl.value), event);
  };
  BaseSearchComponent.prototype.pageSizeChanged = function (size, event) {
    search_utilities_1.changePageSize(this, size);
    this.tmpPageIndex = 1;
    this.doSearch();
  };
  BaseSearchComponent.prototype.searchOnClick = function (event) {
    if (event && !this.getSearchForm()) {
      this.setSearchForm(event.currentTarget.form);
    }
    this.resetAndSearch();
  };
  BaseSearchComponent.prototype.resetAndSearch = function () {
    if (this.running) {
      this.triggerSearch = true;
      return;
    }
    search_utilities_1.reset(this);
    this.tmpPageIndex = 1;
    this.doSearch();
  };
  BaseSearchComponent.prototype.doSearch = function (isFirstLoad) {
    var _this = this;
    var listForm = this.getSearchForm();
    if (listForm && this.ui) {
      this.ui.removeFormError(listForm);
    }
    var s = this.getSearchModel();
    var com = this;
    this.validateSearch(s, function () {
      if (com.running) {
        return;
      }
      com.running = true;
      if (_this.loading) {
        _this.loading.showLoading();
      }
      search_utilities_1.addParametersIntoUrl(s, isFirstLoad);
      com.search(s);
    });
  };
  BaseSearchComponent.prototype.search = function (se) {
    return __awaiter(this, void 0, void 0, function () {
      var ctx, sr, result, err_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, 6, 7]);
            ctx = {};
            if (!this.searchFn) return [3, 2];
            return [4, this.searchFn(se, ctx)];
          case 1:
            sr = _a.sent();
            this.showResults(se, sr);
            return [3, 4];
          case 2: return [4, this.service.search(se, ctx)];
          case 3:
            result = _a.sent();
            this.showResults(se, result);
            _a.label = 4;
          case 4: return [3, 7];
          case 5:
            err_4 = _a.sent();
            core_1.error(err_4, this.resourceService.value, this.showError);
            return [3, 7];
          case 6:
            this.running = false;
            if (this.loading) {
              this.loading.hideLoading();
            }
            return [7];
          case 7: return [2];
        }
      });
    });
  };
  BaseSearchComponent.prototype.validateSearch = function (se, callback) {
    var valid = true;
    var listForm = this.getSearchForm();
    if (listForm) {
      var locale = exports.enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      if (this.ui) {
        valid = this.ui.validateForm(listForm, locale);
      }
    }
    if (valid === true) {
      callback();
    }
  };
  BaseSearchComponent.prototype.searchError = function (response) {
    this.pageIndex = this.tmpPageIndex;
    core_1.error(response, this.resourceService.value, this.showError);
  };
  BaseSearchComponent.prototype.showResults = function (s, sr) {
    var com = this;
    var results = sr.results;
    if (results != null && results.length > 0) {
      var locale = exports.enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      search_utilities_1.formatResults(results, this.pageIndex, this.pageSize, this.initPageSize, this.sequenceNo, this.format, locale);
    }
    var appendMode = com.appendMode;
    search_utilities_1.showResults(s, sr, com);
    if (!appendMode) {
      com.setList(results);
      com.tmpPageIndex = s.page;
      this.showMessage(search_utilities_1.buildSearchMessage(s, sr, this.resourceService));
    }
    else {
      if (this.append && s.page > 1) {
        search_utilities_1.append(this.getList(), results);
      }
      else {
        this.setList(results);
      }
    }
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
    if (this.triggerSearch) {
      this.triggerSearch = false;
      this.resetAndSearch();
    }
  };
  BaseSearchComponent.prototype.setList = function (results) {
    this.list = results;
  };
  BaseSearchComponent.prototype.getList = function () {
    return this.list;
  };
  BaseSearchComponent.prototype.chkAllOnClick = function (event, selected) {
    var target = event.currentTarget;
    var isChecked = target.checked;
    var list = this.getList();
    reflectx_1.setAll(list, selected, isChecked);
    this.handleItemOnChecked(list);
  };
  BaseSearchComponent.prototype.itemOnClick = function (event, selected) {
    var list = this.getList();
    if (this.chkAll != null) {
      this.chkAll.checked = reflectx_1.equalAll(list, selected, true);
    }
    this.handleItemOnChecked(list);
  };
  BaseSearchComponent.prototype.handleItemOnChecked = function (list) {
  };
  BaseSearchComponent.prototype.sort = function (event) {
    search_utilities_1.handleSortEvent(event, this);
    if (!this.appendMode) {
      this.doSearch();
    }
    else {
      this.resetAndSearch();
    }
  };
  BaseSearchComponent.prototype.showMore = function (event) {
    this.tmpPageIndex = this.pageIndex;
    search_utilities_1.more(this);
    this.doSearch();
  };
  BaseSearchComponent.prototype.pageChanged = function (event) {
    if (this.loadTime) {
      var now = new Date();
      var d = Math.abs(this.loadTime.getTime() - now.getTime());
      if (d < 610) {
        if (event) {
          if (event.page && event.itemsPerPage && event.page !== this.loadPage) {
            search_utilities_1.changePage(this, this.loadPage, event.itemsPerPage);
          }
        }
        return;
      }
    }
    search_utilities_1.changePage(this, event.page, event.itemsPerPage);
    this.doSearch();
  };
  return BaseSearchComponent;
}(BaseComponent));
exports.BaseSearchComponent = BaseSearchComponent;
var SearchComponent = (function (_super) {
  __extends(SearchComponent, _super);
  function SearchComponent(viewContainerRef, sv, param, showMessage, showError, getLocale, uis, loading, autoSearch) {
    var _this = _super.call(this, sv, param, showMessage, showError, getLocale, uis, loading) || this;
    _this.viewContainerRef = viewContainerRef;
    _this.autoSearch = true;
    _this.autoSearch = input_1.getAutoSearch(param);
    _this.ngOnInit = _this.ngOnInit.bind(_this);
    return _this;
  }
  SearchComponent.prototype.ngOnInit = function () {
    var fi = (this.ui ? this.ui.registerEvents : null);
    this.form = angular_1.initElement(this.viewContainerRef, fi);
    var s = this.mergeSearchModel(angular_1.buildFromUrl());
    this.load(s, this.autoSearch);
  };
  return SearchComponent;
}(BaseSearchComponent));
exports.SearchComponent = SearchComponent;
