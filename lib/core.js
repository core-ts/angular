"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var resources = (function () {
  function resources() {
  }
  resources.removePhoneFormat = function (phone) {
    if (phone) {
      return phone.replace(resources._preg, '');
    }
    return phone;
  };
  resources.removeFaxFormat = function (fax) {
    if (fax) {
      return fax.replace(resources._preg, '');
    }
    return fax;
  };
  resources.fields = "fields";
  resources.page = "page";
  resources.defaultLimit = 24;
  resources.limit = "limit";
  resources.limits = [12, 24, 60, 100, 120, 180, 300, 600];
  resources._cache = {};
  resources.cache = true;
  resources._preg = / |\-|\.|\(|\)/g;
  resources.format1 = / |,|\$|€|£|¥|'|٬|،| /g;
  resources.format2 = / |\.|\$|€|£|¥|'|٬|،| /g;
  return resources;
}());
exports.resources = resources;
function getString(key, gv) {
  if (typeof gv === 'function') {
    return gv(key);
  }
  else {
    return gv[key];
  }
}
exports.getString = getString;
function message(gv, msg, title, yes, no) {
  var m2 = (msg && msg.length > 0 ? getString(msg, gv) : '');
  var m = { message: m2, title: '' };
  if (title && title.length > 0) {
    m.title = getString(title, gv);
  }
  if (yes && yes.length > 0) {
    m.yes = getString(yes, gv);
  }
  if (no && no.length > 0) {
    m.no = getString(no, gv);
  }
  return m;
}
exports.message = message;
function messageByHttpStatus(status, gv) {
  var k = 'error_' + status;
  var msg = getString(k, gv);
  if (!msg || msg.length === 0) {
    msg = getString('error_500', gv);
  }
  return msg;
}
exports.messageByHttpStatus = messageByHttpStatus;
function error(err, gv, ae) {
  var title = getString('error', gv);
  var msg = getString('error_internal', gv);
  if (!err) {
    ae(msg, undefined, title);
    return;
  }
  var data = err && err.response ? err.response : err;
  if (data) {
    var status_1 = data.status;
    if (status_1 && !isNaN(status_1)) {
      msg = messageByHttpStatus(status_1, gv);
    }
    ae(msg, undefined, title);
  }
  else {
    ae(msg, undefined, title);
  }
}
exports.error = error;
function getModelName(form) {
  if (form) {
    var a = form.getAttribute('model-name');
    if (a && a.length > 0) {
      return a;
    }
    var b = form.name;
    if (b) {
      if (b.endsWith('Form')) {
        return b.substring(0, b.length - 4);
      }
      return b;
    }
  }
  return '';
}
exports.getModelName = getModelName;
exports.scrollToFocus = function (e, isUseTimeOut) {
  try {
    var element = e.target;
    var form = element.form;
    if (form) {
      var container_1 = form.childNodes[1];
      var elementRect_1 = element.getBoundingClientRect();
      var absoluteElementTop = elementRect_1.top + window.pageYOffset;
      var middle_1 = absoluteElementTop - (window.innerHeight / 2);
      var scrollTop_1 = container_1.scrollTop;
      var timeOut = isUseTimeOut ? 300 : 0;
      var isChrome_1 = navigator.userAgent.search('Chrome') > 0;
      setTimeout(function () {
        if (isChrome_1) {
          var scrollPosition = scrollTop_1 === 0 ? (elementRect_1.top + 64) : (scrollTop_1 + middle_1);
          container_1.scrollTo(0, Math.abs(scrollPosition));
        }
        else {
          container_1.scrollTo(0, Math.abs(scrollTop_1 + middle_1));
        }
      }, timeOut);
    }
  }
  catch (e) {
    console.log(e);
  }
};
function showLoading(loading) {
  if (loading) {
    if (typeof loading === 'function') {
      loading();
    }
    else {
      loading.showLoading();
    }
  }
}
exports.showLoading = showLoading;
function hideLoading(loading) {
  if (loading) {
    if (typeof loading === 'function') {
      loading();
    }
    else {
      loading.hideLoading();
    }
  }
}
exports.hideLoading = hideLoading;
