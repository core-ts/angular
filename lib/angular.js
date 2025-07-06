"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var http_1 = require("@angular/common/http")
var rxjs_1 = require("rxjs")
function initElement(viewContainerRef, initMat) {
  if (!viewContainerRef) {
    return undefined
  }
  var nativeElement = viewContainerRef
  if (viewContainerRef.element && viewContainerRef.element.nativeElement) {
    nativeElement = viewContainerRef.element.nativeElement
  }
  if (nativeElement.querySelector) {
    var form = nativeElement.querySelector("form")
    if (form) {
      initForm(form, initMat)
    }
    return form
  }
  return undefined
}
exports.initElement = initElement
function initForm(form, initMat) {
  if (form) {
    setTimeout(function () {
      if (initMat) {
        initMat(form)
      }
      focusFirstElement(form)
    }, 100)
  }
  return form
}
exports.initForm = initForm
function focusFirstElement(form) {
  var i = 0
  var len = form.length
  for (i = 0; i < len; i++) {
    var ctrl = form[i]
    if (!(ctrl.readOnly || ctrl.disabled)) {
      var nodeName = ctrl.nodeName
      var type = ctrl.getAttribute("type")
      if (type) {
        var t = type.toUpperCase()
        if (t === "BUTTON" || t === "SUBMIT") {
          ctrl.focus()
        }
        if (nodeName === "INPUT") {
          nodeName = t
        }
      }
      if (nodeName !== "BUTTON" && nodeName !== "RESET" && nodeName !== "SUBMIT" && nodeName !== "CHECKBOX" && nodeName !== "RADIO") {
        ctrl.focus()
        return
      }
    }
  }
}
exports.focusFirstElement = focusFirstElement
function buildFromUrl() {
  return buildParameters(window.location.search)
}
exports.buildFromUrl = buildFromUrl
function buildParameters(url) {
  var urlSearch = url
  var i = urlSearch.indexOf("?")
  if (i >= 0) {
    urlSearch = url.substring(i + 1)
  }
  var obj = {}
  var httpParams = new http_1.HttpParams({ fromString: urlSearch })
  for (var _i = 0, _a = httpParams.keys(); _i < _a.length; _i++) {
    var key = _a[_i]
    obj[key] = httpParams.get(key)
  }
  return obj
}
exports.buildParameters = buildParameters
var HttpRequest = (function () {
  function HttpRequest(http, getHttpOptions) {
    this.http = http
    this.getHttpOptions = getHttpOptions
    this.getOptions = this.getOptions.bind(this)
    this.get = this.get.bind(this)
    this.delete = this.delete.bind(this)
    this.post = this.post.bind(this)
    this.put = this.put.bind(this)
    this.patch = this.patch.bind(this)
  }
  HttpRequest.prototype.getOptions = function () {
    if (this.getHttpOptions) {
      return this.getHttpOptions()
    } else {
      var httpOptions = {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
      }
      return Promise.resolve(httpOptions)
    }
  }
  HttpRequest.prototype.get = function (url, opts) {
    var _this = this
    if (opts) {
      return rxjs_1.lastValueFrom(this.http.get(url, opts))
    } else {
      return this.getOptions().then(function (x) {
        return rxjs_1.lastValueFrom(_this.http.get(url, x))
      })
    }
  }
  HttpRequest.prototype.delete = function (url, opts) {
    var _this = this
    if (opts) {
      return rxjs_1.lastValueFrom(this.http.delete(url, opts))
    } else {
      return this.getOptions().then(function (x) {
        return rxjs_1.lastValueFrom(_this.http.delete(url, x))
      })
    }
  }
  HttpRequest.prototype.post = function (url, obj, opts) {
    var _this = this
    if (opts) {
      return rxjs_1.lastValueFrom(this.http.post(url, obj, opts))
    } else {
      return this.getOptions().then(function (x) {
        return rxjs_1.lastValueFrom(_this.http.post(url, obj, x))
      })
    }
  }
  HttpRequest.prototype.put = function (url, obj, opts) {
    var _this = this
    if (opts) {
      return rxjs_1.lastValueFrom(this.http.put(url, obj, opts))
    } else {
      return this.getOptions().then(function (x) {
        return rxjs_1.lastValueFrom(_this.http.put(url, obj, x))
      })
    }
  }
  HttpRequest.prototype.patch = function (url, obj, opts) {
    var _this = this
    if (opts) {
      return rxjs_1.lastValueFrom(this.http.patch(url, obj, opts))
    } else {
      return this.getOptions().then(function (x) {
        return rxjs_1.lastValueFrom(_this.http.patch(url, obj, x))
      })
    }
  }
  return HttpRequest
})()
exports.HttpRequest = HttpRequest
