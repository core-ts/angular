"use strict"
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b
          }) ||
        function (d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]
        }
      return extendStatics(d, b)
    }
    return function (d, b) {
      extendStatics(d, b)
      function __() {
        this.constructor = d
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
    }
  })()
Object.defineProperty(exports, "__esModule", { value: true })
var angular_1 = require("./angular")
var common_1 = require("./common")
var core_1 = require("./core")
var edit_1 = require("./edit")
var formatter_1 = require("./formatter")
var formutil_1 = require("./formutil")
var metadata_1 = require("./metadata")
var reflect_1 = require("./reflect")
function getModelName(form) {
  if (form) {
    var a = form.getAttribute("model-name")
    if (a && a.length > 0) {
      return a
    }
    var b = form.name
    if (b) {
      if (b.endsWith("Form")) {
        return b.substring(0, b.length - 4)
      }
      return b
    }
  }
  return ""
}
exports.getModelName = getModelName
function build(attributes, ignoreDate, name) {
  if (core_1.resources.cache && name && name.length > 0) {
    var meta = core_1.resources._cache[name]
    if (!meta) {
      meta = metadata_1.build(attributes, ignoreDate)
      core_1.resources._cache[name] = meta
    }
    return meta
  } else {
    return metadata_1.build(attributes, ignoreDate)
  }
}
exports.build = build
function valueOfCheckbox(ctrl) {
  var ctrlOnValue = ctrl.getAttribute("data-on-value")
  var ctrlOffValue = ctrl.getAttribute("data-off-value")
  if (ctrlOnValue && ctrlOffValue) {
    var onValue = ctrlOnValue ? ctrlOnValue : true
    var offValue = ctrlOffValue ? ctrlOffValue : false
    return ctrl.checked === true ? onValue : offValue
  } else {
    return ctrl.checked === true
  }
}
exports.valueOfCheckbox = valueOfCheckbox
function handleVersion(obj, version) {
  if (obj && version && version.length > 0) {
    var v = obj[version]
    if (v && typeof v === "number") {
      obj[version] = v + 1
    } else {
      obj[version] = 1
    }
  }
}
exports.handleVersion = handleVersion
var BaseEditComponent = (function () {
  function BaseEditComponent(service, resource, showMessage, showError, confirm, getLocale, ui, loading, patchable, ignoreDate, backOnSaveSuccess) {
    this.service = service
    this.resource = resource
    this.showMessage = showMessage
    this.showError = showError
    this.confirm = confirm
    this.getLocale = getLocale
    this.ui = ui
    this.loading = loading
    this.patchable = true
    this.backOnSuccess = true
    this.back = this.back.bind(this)
    if (service.metadata) {
      var metadata = service.metadata()
      if (metadata) {
        var meta = build(metadata, ignoreDate)
        this.keys = meta.keys
        this.version = meta.version
        this.metadata = metadata
        this.metamodel = meta
      }
    }
    if (!this.keys && service.keys) {
      var k = service.keys()
      if (k) {
        this.keys = k
      }
    }
    if (!this.keys) {
      this.keys = []
    }
    if (patchable === false) {
      this.patchable = patchable
    }
    if (backOnSaveSuccess === false) {
      this.backOnSuccess = backOnSaveSuccess
    }
    this.insertSuccessMsg = this.resource.msg_save_success
    this.updateSuccessMsg = this.resource.msg_save_success
    this.getModelName = this.getModelName.bind(this)
    var n = this.getModelName()
    this[n] = {}
    this.load = this.load.bind(this)
    this.resetState = this.resetState.bind(this)
    this.handleNotFound = this.handleNotFound.bind(this)
    this.createModel = this.createModel.bind(this)
    this.formatModel = this.formatModel.bind(this)
    this.showModel = this.showModel.bind(this)
    this.getModel = this.getModel.bind(this)
    this.getRawModel = this.getRawModel.bind(this)
    this.create = this.create.bind(this)
    this.save = this.save.bind(this)
    this.onSave = this.onSave.bind(this)
    this.validate = this.validate.bind(this)
    this.doSave = this.doSave.bind(this)
    this.succeed = this.succeed.bind(this)
    this.successMessage = this.successMessage.bind(this)
    this.postSave = this.postSave.bind(this)
    this.handleDuplicateKey = this.handleDuplicateKey.bind(this)
  }
  BaseEditComponent.prototype.currencySymbol = function () {
    return this.includeCurrencySymbol
  }
  BaseEditComponent.prototype.getCurrencyCode = function () {
    if (this.form) {
      var x = this.form.getAttribute("currency-code")
      if (x) {
        return x
      }
    }
    return undefined
  }
  BaseEditComponent.prototype.back = function () {
    window.history.back()
  }
  BaseEditComponent.prototype.load = function (_id, callback) {
    var _this = this
    var id = _id
    if (id && id !== "") {
      var com_1 = this
      this.service
        .load(id)
        .then(function (obj) {
          if (!obj) {
            com_1.handleNotFound(com_1.form)
          } else {
            com_1.newMode = false
            com_1.orginalModel = reflect_1.clone(obj)
            com_1.formatModel(obj)
            if (callback) {
              callback(obj, com_1.showModel)
            } else {
              com_1.showModel(obj)
            }
          }
          com_1.running = false
          common_1.hideLoading(com_1.loading)
        })
        .catch(function (err) {
          var data = err && err.response ? err.response : err
          if (data && data.status === 404) {
            com_1.handleNotFound(com_1.form)
          } else {
            common_1.error(err, _this.resource, com_1.showError)
          }
          com_1.running = false
          common_1.hideLoading(com_1.loading)
        })
    } else {
      this.newMode = true
      this.orginalModel = undefined
      var obj = this.createModel()
      if (callback) {
        callback(obj, this.showModel)
      } else {
        this.showModel(obj)
      }
    }
  }
  BaseEditComponent.prototype.resetState = function (newMod, model, originalModel) {
    this.newMode = newMod
    this.orginalModel = originalModel
    this.formatModel(model)
    this.showModel(model)
  }
  BaseEditComponent.prototype.handleNotFound = function (form) {
    if (this.form) {
      formutil_1.setReadOnly(form)
    }
    this.showError(this.resource.error_not_found, undefined, this.resource.error)
  }
  BaseEditComponent.prototype.formatModel = function (obj) {
    if (this.metamodel) {
      var locale = common_1.enLocale
      if (this.getLocale) {
        locale = this.getLocale()
      }
      formatter_1.format(obj, this.metamodel, locale, this.getCurrencyCode(), this.currencySymbol())
    }
  }
  BaseEditComponent.prototype.getModelName = function () {
    if (this.name && this.name.length > 0) {
      return this.name
    }
    var n = getModelName(this.form)
    if (!n || n.length === 0) {
      return "model"
    } else {
      return n
    }
  }
  BaseEditComponent.prototype.showModel = function (model) {
    var n = this.getModelName()
    this[n] = model
  }
  BaseEditComponent.prototype.getRawModel = function () {
    var name = this.getModelName()
    var model = this[name]
    return model
  }
  BaseEditComponent.prototype.getModel = function () {
    var name = this.getModelName()
    var model = this[name]
    var obj = reflect_1.clone(model)
    if (this.metamodel) {
      var locale = common_1.enLocale
      if (this.getLocale) {
        locale = this.getLocale()
      }
      formatter_1.json(obj, this.metamodel, locale, this.getCurrencyCode())
    }
    return obj
  }
  BaseEditComponent.prototype.createModel = function () {
    if (this.service.metadata) {
      var metadata = this.service.metadata()
      if (metadata) {
        var obj = edit_1.createModel(metadata)
        return obj
      }
    }
    var obj2 = {}
    return obj2
  }
  BaseEditComponent.prototype.create = function (event) {
    if (!this.form && event && event.currentTarget) {
      var ctrl = event.currentTarget
      if (ctrl.form) {
        this.form = ctrl.form
      }
    }
    this.resetState(true, this.createModel(), undefined)
    var u = this.ui
    var f = this.form
    if (u && f) {
      setTimeout(function () {
        u.removeFormError(f)
      }, 100)
    }
  }
  BaseEditComponent.prototype.save = function (event, isBack) {
    if (!this.form && event && event.currentTarget) {
      this.form = event.currentTarget.form
    }
    if (isBack) {
      this.onSave(isBack)
    } else {
      this.onSave(this.backOnSuccess)
    }
  }
  BaseEditComponent.prototype.onSave = function (isBack) {
    var _this = this
    if (this.running) {
      return
    }
    var com = this
    var obj = com.getModel()
    if (!this.newMode) {
      var diffObj_1 = reflect_1.makeDiff(this.orginalModel, obj, this.keys, this.version)
      var l = Object.keys(diffObj_1).length
      if (l === 0) {
        this.showMessage(this.resource.msg_no_change)
      } else {
        com.validate(obj, function () {
          _this.confirm(
            _this.resource.msg_confirm_save,
            function () {
              com.doSave(obj, diffObj_1, isBack)
            },
            _this.resource.confirm,
            _this.resource.no,
            _this.resource.yes,
          )
        })
      }
    } else {
      com.validate(obj, function () {
        _this.confirm(
          _this.resource.msg_confirm_save,
          function () {
            com.doSave(obj, obj, isBack)
          },
          _this.resource.confirm,
          _this.resource.no,
          _this.resource.yes,
        )
      })
    }
  }
  BaseEditComponent.prototype.validate = function (obj, callback) {
    if (this.ui) {
      var locale = common_1.enLocale
      if (this.getLocale) {
        locale = this.getLocale()
      }
      var valid = this.ui.validateForm(this.form, locale)
      if (valid) {
        callback(obj)
      }
    } else {
      callback(obj)
    }
  }
  BaseEditComponent.prototype.doSave = function (obj, body, isBack) {
    var _this = this
    this.running = true
    common_1.showLoading(this.loading)
    var isBackO = isBack == null || isBack === undefined ? this.backOnSuccess : isBack
    var com = this
    var m = obj
    var fn = this.newMode ? this.service.create : this.service.update
    if (!this.newMode) {
      if (this.patchable === true && this.service.patch && body && Object.keys(body).length > 0) {
        m = body
        fn = this.service.patch
      }
    }
    fn(m)
      .then(function (result) {
        com.postSave(result, obj, isBackO)
        com.running = false
        common_1.hideLoading(com.loading)
      })
      .then(function (err) {
        common_1.error(err, _this.resource, com.showError)
        com.running = false
        common_1.hideLoading(com.loading)
      })
  }
  BaseEditComponent.prototype.succeed = function (msg, origin, isBack, model) {
    if (model) {
      this.newMode = false
      if (model && this.setBack) {
        this.resetState(false, model, reflect_1.clone(model))
      } else {
        handleVersion(origin, this.version)
      }
    } else {
      handleVersion(origin, this.version)
    }
    var isBackO = isBack == null || isBack === undefined ? this.backOnSuccess : isBack
    this.showMessage(msg)
    if (isBackO) {
      this.back()
    }
  }
  BaseEditComponent.prototype.successMessage = function (msg) {
    this.showMessage(msg)
  }
  BaseEditComponent.prototype.fail = function (result) {
    var f = this.form
    var u = this.ui
    if (u && f) {
      var unmappedErrors = u.showFormError(f, result)
      formutil_1.focusFirstError(f)
      if (unmappedErrors && unmappedErrors.length > 0) {
        if (u && u.buildErrorMessage) {
          var msg = u.buildErrorMessage(unmappedErrors)
          this.showError(msg)
        } else {
          this.showError(unmappedErrors[0].field + " " + unmappedErrors[0].code + " " + unmappedErrors[0].message)
        }
      }
    } else {
      var t = this.resource.error
      if (result.length > 0) {
        this.showError(result[0].field + " " + result[0].code + " " + result[0].message)
      } else {
        this.showError(t)
      }
    }
  }
  BaseEditComponent.prototype.postSave = function (res, origin, isPatch, backOnSave) {
    this.running = false
    common_1.hideLoading(this.loading)
    var newMod = this.newMode
    var successMsg = newMod ? this.insertSuccessMsg : this.updateSuccessMsg
    var x = res
    if (Array.isArray(x)) {
      this.fail(x)
    } else if (!isNaN(x)) {
      if (x > 0) {
        this.succeed(successMsg, origin, backOnSave)
      } else {
        if (newMod && x <= 0) {
          this.handleDuplicateKey()
        } else if (!newMod && x === 0) {
          this.handleNotFound()
        } else {
          this.showError(this.resource.error_version)
        }
      }
    } else {
      var result = x
      if (isPatch) {
        var keys = Object.keys(result)
        var a = origin
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
          var k = keys_1[_i]
          a[k] = result[k]
        }
        this.succeed(successMsg, a, backOnSave)
      } else {
        this.succeed(successMsg, origin, backOnSave, result)
      }
    }
  }
  BaseEditComponent.prototype.handleDuplicateKey = function (result) {
    this.showError(this.resource.error_duplicate_key, undefined, this.resource.error)
  }
  return BaseEditComponent
})()
exports.BaseEditComponent = BaseEditComponent
var EditComponent = (function (_super) {
  __extends(EditComponent, _super)
  function EditComponent(viewContainerRef, route, service, resource, param, patchable, ignoreDate, backOnSaveSuccess) {
    var _this =
      _super.call(
        this,
        service,
        resource,
        param.showMessage,
        param.showError,
        param.confirm,
        param.getLocale,
        param.ui,
        param.loading,
        patchable,
        ignoreDate,
        backOnSaveSuccess,
      ) || this
    _this.viewContainerRef = viewContainerRef
    _this.route = route
    _this.onInit = _this.onInit.bind(_this)
    return _this
  }
  EditComponent.prototype.onInit = function () {
    var fi = this.ui ? this.ui.registerEvents : undefined
    this.form = angular_1.initElement(this.viewContainerRef, fi)
    var id = common_1.buildId(this.route, this.keys)
    this.load(id)
  }
  return EditComponent
})(BaseEditComponent)
exports.EditComponent = EditComponent
