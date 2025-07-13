"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var angular_1 = require("./angular")
var common_1 = require("./common")
var input_1 = require("./input")
var reflect_1 = require("./reflect")
function showDiff(form, value, origin) {
  if (!origin) {
    origin = {}
  }
  var differentKeys = reflect_1.diff(origin, value)
  for (var _i = 0, differentKeys_1 = differentKeys; _i < differentKeys_1.length; _i++) {
    var differentKey = differentKeys_1[_i]
    var y = form.querySelector("." + differentKey)
    if (y) {
      if (y.childNodes.length === 3) {
        y.children[1].classList.add("highlight")
        y.children[2].classList.add("highlight")
      } else {
        y.classList.add("highlight")
      }
    }
  }
}
exports.showDiff = showDiff
function formatDiffModel(obj, formatFields) {
  if (!obj) {
    return obj
  }
  var obj2 = reflect_1.clone(obj)
  if (!obj2.origin) {
    obj2.origin = {}
  } else {
    if (typeof obj2.origin === "string") {
      obj2.origin = JSON.parse(obj2.origin)
    }
    if (formatFields && typeof obj2.origin === "object" && !Array.isArray(obj2.origin)) {
      obj2.origin = formatFields(obj2.origin)
    }
  }
  if (!obj2.value) {
    obj2.value = {}
  } else {
    if (typeof obj2.value === "string") {
      obj2.value = JSON.parse(obj2.value)
    }
    if (formatFields && typeof obj2.value === "object" && !Array.isArray(obj2.value)) {
      obj2.value = formatFields(obj2.value)
    }
  }
  return obj2
}
exports.formatDiffModel = formatDiffModel
var DiffApprComponent = (function () {
  function DiffApprComponent(viewContainerRef, route, service, param, showMessage, showError, loading) {
    this.viewContainerRef = viewContainerRef
    this.route = route
    this.service = service
    this.resourceService = input_1.getResource(param)
    this.resource = this.resourceService.resource()
    this.loading = input_1.getLoadingFunc(param, loading)
    this.showError = input_1.getErrorFunc(param, showError)
    this.showMessage = input_1.getMsgFunc(param, showMessage)
    this.back = this.back.bind(this)
    var x = {}
    this.origin = x
    this.value = x
    this.approve = this.approve.bind(this)
    this.reject = this.reject.bind(this)
    this.handleError = this.handleError.bind(this)
    this.end = this.end.bind(this)
    this.formatFields = this.formatFields.bind(this)
    this.load = this.load.bind(this)
    this.handleNotFound = this.handleNotFound.bind(this)
  }
  DiffApprComponent.prototype.back = function () {
    window.history.back()
  }
  DiffApprComponent.prototype.onInit = function () {
    this.form = angular_1.initElement(this.viewContainerRef)
    var id = input_1.buildId(this.route, this.service.keys())
    if (id) {
      this.load(id)
    }
  }
  DiffApprComponent.prototype.load = function (_id) {
    var x = _id
    if (x && x !== "") {
      this.id = _id
      this.running = true
      input_1.showLoading(this.loading)
      var com_1 = this
      this.service
        .diff(_id)
        .then(function (dobj) {
          if (!dobj) {
            com_1.handleNotFound(com_1.form)
          } else {
            var formatdDiff = formatDiffModel(dobj, com_1.formatFields)
            com_1.value = formatdDiff.value
            com_1.origin = formatdDiff.origin
            if (com_1.form) {
              showDiff(com_1.form, formatdDiff.value, formatdDiff.origin)
            }
          }
          com_1.running = false
          input_1.hideLoading(com_1.loading)
        })
        .catch(function (err) {
          var data = err && err.response ? err.response : err
          if (data && data.status === 404) {
            com_1.handleNotFound(com_1.form)
          } else {
            common_1.error(err, com_1.resourceService.resource(), com_1.showError)
          }
          com_1.running = false
          input_1.hideLoading(com_1.loading)
        })
    }
  }
  DiffApprComponent.prototype.handleNotFound = function (form) {
    this.disabled = true
    var r = this.resourceService.resource()
    this.showError(r["error_not_found"])
  }
  DiffApprComponent.prototype.formatFields = function (value) {
    return value
  }
  DiffApprComponent.prototype.approve = function (event) {
    event.preventDefault()
    if (this.running) {
      return
    }
    var com = this
    var r = this.resourceService.resource()
    if (this.id) {
      this.running = true
      input_1.showLoading(this.loading)
      this.service
        .approve(this.id)
        .then(function (status) {
          if (typeof status === "number" && status > 0) {
            com.showMessage(r["msg_approve_success"])
          } else if (status === 0) {
            com.handleNotFound(com.form)
          } else {
            com.showMessage(r["msg_approve_version_error"])
          }
          com.end()
        })
        .catch(function (err) {
          com.handleError(err)
          com.end()
        })
    }
  }
  DiffApprComponent.prototype.reject = function (event) {
    event.preventDefault()
    if (this.running) {
      return
    }
    var com = this
    var r = this.resourceService.resource()
    if (this.id) {
      this.running = true
      input_1.showLoading(this.loading)
      this.service
        .reject(this.id)
        .then(function (status) {
          if (typeof status === "number" && status > 0) {
            com.showMessage(r["msg_reject_success"])
          } else if (status === 0) {
            com.handleNotFound(com.form)
          } else {
            com.showMessage(r["msg_approve_version_error"])
          }
          com.end()
        })
        .catch(function (err) {
          com.handleError(err)
          com.end()
        })
    }
  }
  DiffApprComponent.prototype.handleError = function (err) {
    var r = this.resourceService.resource()
    var data = err && err.response ? err.response : err
    if (data && (data.status === 404 || data.status === 409)) {
      if (data.status === 404) {
        this.handleNotFound()
      } else {
        this.showMessage(r["msg_approve_version_error"])
      }
    } else {
      common_1.error(err, r, this.showError)
    }
  }
  DiffApprComponent.prototype.end = function () {
    this.disabled = true
    this.running = false
    input_1.hideLoading(this.loading)
  }
  return DiffApprComponent
})()
exports.DiffApprComponent = DiffApprComponent
