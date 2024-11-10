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
Object.defineProperty(exports, "__esModule", { value: true });
var angular_1 = require("./angular");
var core_1 = require("./core");
var diff_1 = require("./diff");
var edit_1 = require("./edit");
var formatter_1 = require("./formatter");
var formutil_1 = require("./formutil");
var input_1 = require("./input");
var reflect_1 = require("./reflect");
var search_1 = require("./search");
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
    else {
      this.resource = {};
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
    if (this.form) {
      var x = this.form.getAttribute('currency-code');
      if (x) {
        return x;
      }
    }
    return undefined;
  };
  return RootComponent;
}());
exports.RootComponent = RootComponent;
var BaseViewComponent = (function (_super) {
  __extends(BaseViewComponent, _super);
  function BaseViewComponent(sv, param, showError, getLocale, loading, ignoreDate) {
    var _this = _super.call(this, input_1.getResource(param), input_1.getLocaleFunc(param, getLocale)) || this;
    _this.showError = input_1.getErrorFunc(param, showError);
    _this.loading = input_1.getLoadingFunc(param, loading);
    if (sv) {
      if (typeof sv === 'function') {
        _this.loadData = sv;
      }
      else {
        _this.loadData = sv.load;
        if (sv.metadata) {
          var m = sv.metadata();
          if (m) {
            var meta = edit_1.build(m, ignoreDate);
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
    var id = _id;
    if (id && id !== '') {
      this.running = true;
      core_1.showLoading(this.loading);
      var com_1 = this;
      if (this.loadData) {
        this.loadData(id).then(function (obj) {
          if (obj) {
            if (callback) {
              callback(obj, com_1.showModel);
            }
            else {
              com_1.showModel(obj);
            }
          }
          else {
            com_1.handleNotFound(com_1.form);
          }
          com_1.running = false;
          core_1.hideLoading(com_1.loading);
        }).catch(function (err) {
          var data = (err && err.response) ? err.response : err;
          if (data && data.status === 404) {
            com_1.handleNotFound(com_1.form);
          }
          else {
            core_1.error(err, com_1.resourceService.value, com_1.showError);
          }
          com_1.running = false;
          core_1.hideLoading(com_1.loading);
        });
      }
    }
  };
  BaseViewComponent.prototype.handleNotFound = function (form) {
    if (form) {
      formutil_1.setReadOnly(form);
    }
    var msg = core_1.message(this.resourceService.value, 'error_not_found', 'error');
    this.showError(msg.message);
  };
  BaseViewComponent.prototype.getModelName = function () {
    if (this.name && this.name.length > 0) {
      return this.name;
    }
    var n = core_1.getModelName(this.form);
    if (n && n.length > 0) {
      return n;
    }
    else {
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
    _this.onInit = _this.onInit.bind(_this);
    return _this;
  }
  ViewComponent.prototype.onInit = function () {
    this.form = angular_1.initElement(this.viewContainerRef);
    var id = angular_1.buildId(this.route, this.keys);
    if (id) {
      this.load(id);
    }
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
    else {
      return n;
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
    if (!modelName && ctrl.form) {
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
    if (modelName) {
      var ex = this[modelName];
      var dataField = ctrl.getAttribute('data-field');
      var field = (dataField ? dataField : ctrl.name);
      if (type && type.toLowerCase() === 'checkbox') {
        var v = valueOfCheckbox(ctrl);
        reflect_1.setValue(ex, field, v);
      }
      else {
        var v = ctrl.value;
        if (this.uiS1) {
          v = this.uiS1.getValue(ctrl, locale);
        }
        if (ctrl.value != v) {
          reflect_1.setValue(ex, field, v);
        }
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
  function MessageComponent(resourceService, getLocale, loading, ui) {
    var _this = _super.call(this, resourceService, getLocale, ui, loading) || this;
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
  function BaseEditComponent(service, param, showMessage, showError, confirm, getLocale, uis, loading, patchable, ignoreDate, backOnSaveSuccess) {
    var _this = _super.call(this, input_1.getResource(param), input_1.getLocaleFunc(param, getLocale), input_1.getUIService(param, uis), input_1.getLoadingFunc(param, loading)) || this;
    _this.service = service;
    _this.patchable = true;
    _this.backOnSuccess = true;
    _this.ui = input_1.getUIService(param, uis);
    _this.showError = input_1.getErrorFunc(param, showError);
    _this.showMessage = input_1.getMsgFunc(param, showMessage);
    _this.confirm = input_1.getConfirmFunc(param, confirm);
    if (service.metadata) {
      var metadata = service.metadata();
      if (metadata) {
        var meta = edit_1.build(metadata, ignoreDate);
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
    _this.create = _this.create.bind(_this);
    _this.save = _this.save.bind(_this);
    _this.onSave = _this.onSave.bind(_this);
    _this.confirm = _this.confirm.bind(_this);
    _this.validate = _this.validate.bind(_this);
    _this.doSave = _this.doSave.bind(_this);
    _this.succeed = _this.succeed.bind(_this);
    _this.successMessage = _this.successMessage.bind(_this);
    _this.postSave = _this.postSave.bind(_this);
    _this.handleDuplicateKey = _this.handleDuplicateKey.bind(_this);
    return _this;
  }
  BaseEditComponent.prototype.load = function (_id, callback) {
    var id = _id;
    if (id && id !== '') {
      var com_2 = this;
      this.service.load(id).then(function (obj) {
        if (!obj) {
          com_2.handleNotFound(com_2.form);
        }
        else {
          com_2.newMode = false;
          com_2.orginalModel = reflect_1.clone(obj);
          com_2.formatModel(obj);
          if (callback) {
            callback(obj, com_2.showModel);
          }
          else {
            com_2.showModel(obj);
          }
        }
        com_2.running = false;
        core_1.hideLoading(com_2.loading);
      }).catch(function (err) {
        var data = (err && err.response) ? err.response : err;
        if (data && data.status === 404) {
          com_2.handleNotFound(com_2.form);
        }
        else {
          core_1.error(err, com_2.resourceService.value, com_2.showError);
        }
        com_2.running = false;
        core_1.hideLoading(com_2.loading);
      });
    }
    else {
      this.newMode = true;
      this.orginalModel = undefined;
      var obj = this.createModel();
      if (callback) {
        callback(obj, this.showModel);
      }
      else {
        this.showModel(obj);
      }
    }
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
      formutil_1.setReadOnly(form);
    }
    this.showError(msg.message);
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
    if (this.name && this.name.length > 0) {
      return this.name;
    }
    var n = core_1.getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    }
    else {
      return n;
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
    var obj = reflect_1.clone(model);
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
    if (this.service.metadata) {
      var metadata = this.service.metadata();
      if (metadata) {
        var obj = edit_1.createModel(metadata);
        return obj;
      }
    }
    var obj2 = {};
    return obj2;
  };
  BaseEditComponent.prototype.create = function (event) {
    if (!this.form && event && event.currentTarget) {
      var ctrl = event.currentTarget;
      if (ctrl.form) {
        this.form = ctrl.form;
      }
    }
    this.resetState(true, this.createModel(), undefined);
    var u = this.ui;
    var f = this.form;
    if (u && f) {
      setTimeout(function () {
        u.removeFormError(f);
      }, 100);
    }
  };
  BaseEditComponent.prototype.save = function (event, isBack) {
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
    if (this.running) {
      return;
    }
    var com = this;
    var obj = com.getModel();
    if (!this.newMode) {
      var diffObj_1 = reflect_1.makeDiff(this.orginalModel, obj, this.keys, this.version);
      var l = Object.keys(diffObj_1).length;
      if (l === 0) {
        this.showMessage(r.value('msg_no_change'));
      }
      else {
        com.validate(obj, function () {
          var msg = core_1.message(r.value, 'msg_confirm_save', 'confirm', 'yes', 'no');
          _this.confirm(msg.message, function () {
            com.doSave(obj, diffObj_1, isBack);
          }, msg.title, msg.no, msg.yes);
        });
      }
    }
    else {
      com.validate(obj, function () {
        var msg = core_1.message(r.value, 'msg_confirm_save', 'confirm', 'yes', 'no');
        _this.confirm(msg.message, function () {
          com.doSave(obj, obj, isBack);
        }, msg.title, msg.no, msg.yes);
      });
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
  BaseEditComponent.prototype.doSave = function (obj, body, isBack) {
    this.running = true;
    core_1.showLoading(this.loading);
    var isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
    var com = this;
    var m = obj;
    var fn = this.newMode ? this.service.create : this.service.update;
    if (!this.newMode) {
      if (this.patchable === true && this.service.patch && body && Object.keys(body).length > 0) {
        m = body;
        fn = this.service.patch;
      }
    }
    fn(m).then(function (result) {
      com.postSave(result, obj, isBackO);
      com.running = false;
      core_1.hideLoading(com.loading);
    }).then(function (err) {
      core_1.error(err, com.resourceService.value, com.showError);
      com.running = false;
      core_1.hideLoading(com.loading);
    });
  };
  BaseEditComponent.prototype.succeed = function (msg, origin, isBack, model) {
    if (model) {
      this.newMode = false;
      if (model && this.setBack) {
        this.resetState(false, model, reflect_1.clone(model));
      }
      else {
        edit_1.handleVersion(origin, this.version);
      }
    }
    else {
      edit_1.handleVersion(origin, this.version);
    }
    var isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
    this.showMessage(msg);
    if (isBackO) {
      this.back();
    }
  };
  BaseEditComponent.prototype.successMessage = function (msg) {
    this.showMessage(msg);
  };
  BaseEditComponent.prototype.fail = function (result) {
    var f = this.form;
    var u = this.ui;
    if (u && f) {
      var unmappedErrors = u.showFormError(f, result);
      formutil_1.focusFirstError(f);
      if (unmappedErrors && unmappedErrors.length > 0) {
        if (u && u.buildErrorMessage) {
          var msg = u.buildErrorMessage(unmappedErrors);
          this.showError(msg);
        }
        else {
          this.showError(unmappedErrors[0].field + ' ' + unmappedErrors[0].code + ' ' + unmappedErrors[0].message);
        }
      }
    }
    else {
      var t = this.resourceService.value('error');
      if (result.length > 0) {
        this.showError(result[0].field + ' ' + result[0].code + ' ' + result[0].message);
      }
      else {
        this.showError(t);
      }
    }
  };
  BaseEditComponent.prototype.postSave = function (res, origin, isPatch, backOnSave) {
    this.running = false;
    core_1.hideLoading(this.loading);
    var newMod = this.newMode;
    var successMsg = (newMod ? this.insertSuccessMsg : this.updateSuccessMsg);
    var x = res;
    var r = this.resourceService;
    if (Array.isArray(x)) {
      this.fail(x);
    }
    else if (!isNaN(x)) {
      if (x > 0) {
        this.succeed(successMsg, origin, backOnSave);
      }
      else {
        if (newMod && x <= 0) {
          this.handleDuplicateKey();
        }
        else if (!newMod && x === 0) {
          this.handleNotFound();
        }
        else {
          this.showError(r.value('error_version'));
        }
      }
    }
    else {
      var result = x;
      if (isPatch) {
        var keys = Object.keys(result);
        var a = origin;
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
          var k = keys_1[_i];
          a[k] = result[k];
        }
        this.succeed(successMsg, a, backOnSave);
      }
      else {
        this.succeed(successMsg, origin, backOnSave, result);
      }
    }
  };
  BaseEditComponent.prototype.handleDuplicateKey = function (result) {
    var msg = core_1.message(this.resourceService.value, 'error_duplicate_key', 'error');
    this.showError(msg.message);
  };
  return BaseEditComponent;
}(BaseComponent));
exports.BaseEditComponent = BaseEditComponent;
var EditComponent = (function (_super) {
  __extends(EditComponent, _super);
  function EditComponent(viewContainerRef, route, service, param, showMessage, showError, confirm, getLocale, uis, loading, patchable, ignoreDate, backOnSaveSuccess) {
    var _this = _super.call(this, service, param, showMessage, showError, confirm, getLocale, uis, loading, patchable, ignoreDate, backOnSaveSuccess) || this;
    _this.viewContainerRef = viewContainerRef;
    _this.route = route;
    _this.onInit = _this.onInit.bind(_this);
    return _this;
  }
  EditComponent.prototype.onInit = function () {
    var fi = (this.ui ? this.ui.registerEvents : undefined);
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
    _this.itemTotal = 0;
    _this.sequenceNo = 'sequenceNo';
    _this.loadPage = 1;
    _this.pageMaxSize = 7;
    _this.pageSizes = [10, 20, 40, 60, 100, 200, 400, 1000];
    _this.clearQ = function () {
      _this.filter.q = '';
    };
    _this.filter = {};
    if (sv) {
      if (typeof sv === 'function') {
        _this.searchFn = sv;
      }
      else {
        _this.searchFn = sv.search;
        if (sv.keys) {
          _this.keys = sv.keys();
        }
      }
    }
    _this.ui = input_1.getUIService(param, uis);
    _this.showError = input_1.getErrorFunc(param, showError);
    _this.showMessage = input_1.getMsgFunc(param, showMessage);
    _this.toggleFilter = _this.toggleFilter.bind(_this);
    _this.mergeFilter = _this.mergeFilter.bind(_this);
    _this.load = _this.load.bind(_this);
    _this.getSearchForm = _this.getSearchForm.bind(_this);
    _this.setSearchForm = _this.setSearchForm.bind(_this);
    _this.setFilter = _this.setFilter.bind(_this);
    _this.getOriginalFilter = _this.getOriginalFilter.bind(_this);
    _this.getFilter = _this.getFilter.bind(_this);
    _this.getFields = _this.getFields.bind(_this);
    _this.pageSizeChanged = _this.pageSizeChanged.bind(_this);
    _this.search = _this.search.bind(_this);
    _this.resetAndSearch = _this.resetAndSearch.bind(_this);
    _this.doSearch = _this.doSearch.bind(_this);
    _this.callSearch = _this.callSearch.bind(_this);
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
  BaseSearchComponent.prototype.changeView = function (v, event) {
    this.view = v;
  };
  BaseSearchComponent.prototype.toggleFilter = function (event) {
    var x = !this.hideFilter;
    search_1.handleToggle(event.target, !x);
    this.hideFilter = x;
  };
  BaseSearchComponent.prototype.mergeFilter = function (obj, arrs, b) {
    var s = search_1.mergeFilter(obj, b, this.pageSizes, arrs);
    return s;
  };
  BaseSearchComponent.prototype.load = function (s, autoSearch) {
    this.loadTime = new Date();
    var obj2 = search_1.initFilter(s, this);
    this.loadPage = this.pageIndex;
    this.setFilter(obj2);
    var com = this;
    if (autoSearch) {
      setTimeout(function () {
        com.doSearch(true);
      }, 0);
    }
  };
  BaseSearchComponent.prototype.getModelName = function () {
    return 'filter';
  };
  BaseSearchComponent.prototype.setSearchForm = function (form) {
    this.form = form;
  };
  BaseSearchComponent.prototype.getSearchForm = function () {
    return this.form;
  };
  BaseSearchComponent.prototype.setFilter = function (obj) {
    this.filter = obj;
  };
  BaseSearchComponent.prototype.getFilter = function () {
    var locale;
    if (this.getLocale) {
      locale = this.getLocale();
    }
    if (!locale) {
      locale = exports.enLocale;
    }
    var obj = this.filter;
    var sf = this.getSearchForm();
    if (this.ui && sf) {
      var obj2 = this.ui.decodeFromForm(sf, locale, this.getCurrencyCode());
      obj = obj2 ? obj2 : {};
    }
    var obj3 = search_1.buildFilter(obj, this, this.getFields());
    if (this.excluding) {
      obj3.excluding = this.excluding;
    }
    return obj3;
  };
  BaseSearchComponent.prototype.getOriginalFilter = function () {
    return this.filter;
  };
  BaseSearchComponent.prototype.getFields = function () {
    if (this.fields) {
      return this.fields;
    }
    if (!this.initFields) {
      if (this.getSearchForm()) {
        this.fields = search_1.getFields(this.getSearchForm());
      }
      this.initFields = true;
    }
    return this.fields;
  };
  BaseSearchComponent.prototype.onPageSizeChanged = function (event) {
    var ctrl = event.currentTarget;
    this.pageSizeChanged(Number(ctrl.value), event);
  };
  BaseSearchComponent.prototype.pageSizeChanged = function (size, event) {
    search_1.changePageSize(this, size);
    this.tmpPageIndex = 1;
    this.doSearch();
  };
  BaseSearchComponent.prototype.search = function (event) {
    if (event && !this.getSearchForm()) {
      var f = event.currentTarget.form;
      if (f) {
        this.setSearchForm(f);
      }
    }
    this.resetAndSearch();
  };
  BaseSearchComponent.prototype.resetAndSearch = function () {
    if (this.running) {
      this.triggerSearch = true;
      return;
    }
    search_1.reset(this);
    this.tmpPageIndex = 1;
    this.doSearch();
  };
  BaseSearchComponent.prototype.doSearch = function (isFirstLoad) {
    var _this = this;
    var listForm = this.getSearchForm();
    if (listForm && this.ui) {
      this.ui.removeFormError(listForm);
    }
    var s = this.getFilter();
    var com = this;
    this.validateSearch(s, function () {
      if (com.running) {
        return;
      }
      com.running = true;
      core_1.showLoading(_this.loading);
      if (!_this.ignoreUrlParam) {
        search_1.addParametersIntoUrl(s, isFirstLoad);
      }
      com.callSearch(s);
    });
  };
  BaseSearchComponent.prototype.callSearch = function (ft) {
    var s = reflect_1.clone(ft);
    var page = this.pageIndex;
    if (!page || page < 1) {
      page = 1;
    }
    var offset;
    if (ft.limit) {
      if (ft.firstLimit && ft.firstLimit > 0) {
        offset = ft.limit * (page - 2) + ft.firstLimit;
      }
      else {
        offset = ft.limit * (page - 1);
      }
    }
    var limit = (page <= 1 && ft.firstLimit && ft.firstLimit > 0 ? ft.firstLimit : ft.limit);
    var next = (this.nextPageToken && this.nextPageToken.length > 0 ? this.nextPageToken : offset);
    var fields = ft.fields;
    delete ft['page'];
    delete ft['fields'];
    delete ft['limit'];
    delete ft['firstLimit'];
    var com = this;
    if (this.searchFn) {
      this.searchFn(ft, limit, next, fields).then(function (sr) {
        com.showResults(s, sr);
        com.running = false;
        core_1.hideLoading(com.loading);
      }).catch(function (err) {
        core_1.error(err, com.resourceService.value, com.showError);
        com.running = false;
        core_1.hideLoading(com.loading);
      });
    }
  };
  BaseSearchComponent.prototype.validateSearch = function (ft, callback) {
    var valid = true;
    var listForm = this.getSearchForm();
    if (listForm) {
      var locale = exports.enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      if (this.ui && this.ui.validateForm) {
        valid = this.ui.validateForm(listForm, locale);
      }
    }
    if (valid === true) {
      callback();
    }
  };
  BaseSearchComponent.prototype.searchError = function (response) {
    if (this.tmpPageIndex) {
      this.pageIndex = this.tmpPageIndex;
    }
    core_1.error(response, this.resourceService.value, this.showError);
  };
  BaseSearchComponent.prototype.showResults = function (s, sr) {
    var com = this;
    var results = sr.list;
    if (results != null && results.length > 0) {
      var locale = exports.enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      search_1.formatResults(results, this.pageIndex, this.pageSize, this.initPageSize, this.sequenceNo, this.format, locale);
    }
    var appendMode = com.appendMode;
    com.pageIndex = (s.page && s.page >= 1 ? s.page : 1);
    if (appendMode) {
      var limit = s.limit;
      if ((!s.page || s.page <= 1) && s.firstLimit && s.firstLimit > 0) {
        limit = s.firstLimit;
      }
      com.nextPageToken = sr.nextPageToken;
      search_1.handleAppend(com, sr.list, limit, sr.nextPageToken);
      if (this.append && (s.page && s.page > 1)) {
        search_1.append(this.getList(), results);
      }
      else {
        this.setList(results);
      }
    }
    else {
      search_1.showPaging(com, sr.list, s.limit, sr.total);
      com.setList(results);
      com.tmpPageIndex = s.page;
      if (s.limit) {
        this.showMessage(search_1.buildMessage(this.resourceService.resource(), s.page, s.limit, sr.list, sr.total));
      }
    }
    this.running = false;
    core_1.hideLoading(com.loading);
    if (this.triggerSearch) {
      this.triggerSearch = false;
      this.resetAndSearch();
    }
  };
  BaseSearchComponent.prototype.setList = function (list) {
    this.list = list;
  };
  BaseSearchComponent.prototype.getList = function () {
    return this.list;
  };
  BaseSearchComponent.prototype.chkAllOnClick = function (event, selected) {
    var target = event.currentTarget;
    var isChecked = target.checked;
    var list = this.getList();
    reflect_1.setAll(list, selected, isChecked);
    this.handleItemOnChecked(list);
  };
  BaseSearchComponent.prototype.itemOnClick = function (event, selected) {
    var list = this.getList();
    if (this.chkAll != null) {
      this.chkAll.checked = reflect_1.equalAll(list, selected, true);
    }
    this.handleItemOnChecked(list);
  };
  BaseSearchComponent.prototype.handleItemOnChecked = function (list) {
  };
  BaseSearchComponent.prototype.sort = function (event) {
    search_1.handleSortEvent(event, this);
    if (!this.appendMode) {
      this.doSearch();
    }
    else {
      this.resetAndSearch();
    }
  };
  BaseSearchComponent.prototype.showMore = function (event) {
    this.tmpPageIndex = this.pageIndex;
    search_1.more(this);
    this.doSearch();
  };
  BaseSearchComponent.prototype.pageChanged = function (event) {
    if (this.loadTime) {
      var now = new Date();
      var d = Math.abs(this.loadTime.getTime() - now.getTime());
      if (d < 610) {
        if (event) {
          if (event.page && event.itemsPerPage && event.page !== this.loadPage) {
            search_1.changePage(this, this.loadPage, event.itemsPerPage);
          }
        }
        return;
      }
    }
    search_1.changePage(this, event.page, event.itemsPerPage);
    this.doSearch();
  };
  return BaseSearchComponent;
}(BaseComponent));
exports.BaseSearchComponent = BaseSearchComponent;
var SearchComponent = (function (_super) {
  __extends(SearchComponent, _super);
  function SearchComponent(viewContainerRef, sv, param, showMessage, showError, getLocale, uis, loading) {
    var _this = _super.call(this, sv, param, showMessage, showError, getLocale, uis, loading) || this;
    _this.viewContainerRef = viewContainerRef;
    _this.autoSearch = true;
    _this.autoSearch = input_1.getAutoSearch(param);
    _this.onInit = _this.onInit.bind(_this);
    return _this;
  }
  SearchComponent.prototype.onInit = function () {
    var fi = (this.ui ? this.ui.registerEvents : undefined);
    this.form = angular_1.initElement(this.viewContainerRef, fi);
    var s = this.mergeFilter(angular_1.buildFromUrl());
    this.load(s, this.autoSearch);
  };
  return SearchComponent;
}(BaseSearchComponent));
exports.SearchComponent = SearchComponent;
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
    var x = _id;
    if (x && x !== '') {
      this.id = _id;
      this.running = true;
      core_1.showLoading(this.loading);
      var com_3 = this;
      this.service.diff(_id).then(function (dobj) {
        if (!dobj) {
          com_3.handleNotFound(com_3.form);
        }
        else {
          var formatdDiff = diff_1.formatDiffModel(dobj, com_3.formatFields);
          com_3.value = formatdDiff.value;
          com_3.origin = formatdDiff.origin;
          if (com_3.form) {
            diff_1.showDiff(com_3.form, formatdDiff.value, formatdDiff.origin);
          }
        }
        com_3.running = false;
        core_1.hideLoading(com_3.loading);
      }).catch(function (err) {
        var data = (err && err.response) ? err.response : err;
        if (data && data.status === 404) {
          com_3.handleNotFound(com_3.form);
        }
        else {
          core_1.error(err, com_3.resourceService.resource(), com_3.showError);
        }
        com_3.running = false;
        core_1.hideLoading(com_3.loading);
      });
    }
  };
  BaseDiffApprComponent.prototype.handleNotFound = function (form) {
    this.disabled = true;
    var r = this.resourceService.resource();
    this.showError(r['error_not_found']);
  };
  BaseDiffApprComponent.prototype.formatFields = function (value) {
    return value;
  };
  BaseDiffApprComponent.prototype.approve = function (event) {
    event.preventDefault();
    if (this.running) {
      return;
    }
    var com = this;
    var r = this.resourceService.resource();
    if (this.id) {
      this.running = true;
      core_1.showLoading(this.loading);
      this.service.approve(this.id).then(function (status) {
        if (typeof status === 'number' && status > 0) {
          com.showMessage(r['msg_approve_success']);
        }
        else if (status === 0) {
          com.handleNotFound(com.form);
        }
        else {
          com.showMessage(r['msg_approve_version_error']);
        }
        com.end();
      }).catch(function (err) {
        com.handleError(err);
        com.end();
      });
    }
  };
  BaseDiffApprComponent.prototype.reject = function (event) {
    event.preventDefault();
    if (this.running) {
      return;
    }
    var com = this;
    var r = this.resourceService.resource();
    if (this.id) {
      this.running = true;
      core_1.showLoading(this.loading);
      this.service.reject(this.id).then(function (status) {
        if (typeof status === 'number' && status > 0) {
          com.showMessage(r['msg_reject_success']);
        }
        else if (status === 0) {
          com.handleNotFound(com.form);
        }
        else {
          com.showMessage(r['msg_approve_version_error']);
        }
        com.end();
      }).catch(function (err) {
        com.handleError(err);
        com.end();
      });
    }
  };
  BaseDiffApprComponent.prototype.handleError = function (err) {
    var r = this.resourceService.resource();
    var data = (err && err.response) ? err.response : err;
    if (data && (data.status === 404 || data.status === 409)) {
      if (data.status === 404) {
        this.handleNotFound();
      }
      else {
        this.showMessage(r['msg_approve_version_error']);
      }
    }
    else {
      core_1.error(err, r, this.showError);
    }
  };
  BaseDiffApprComponent.prototype.end = function () {
    this.disabled = true;
    this.running = false;
    core_1.hideLoading(this.loading);
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
    _this.onInit = _this.onInit.bind(_this);
    return _this;
  }
  DiffApprComponent.prototype.onInit = function () {
    this.form = angular_1.initElement(this.viewContainerRef);
    var id = angular_1.buildId(this.route, this.service.keys());
    if (id) {
      this.load(id);
    }
  };
  return DiffApprComponent;
}(BaseDiffApprComponent));
exports.DiffApprComponent = DiffApprComponent;
