"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createEditStatus(status) {
  if (status) {
    return status;
  }
  var s = {
    duplicate_key: 0,
    not_found: 0,
    success: 1,
    version_error: 2,
    error: 4,
    data_corrupt: 8
  };
  return s;
}
exports.createEditStatus = createEditStatus;
function createDiffStatus(status) {
  if (status) {
    return status;
  }
  var s = {
    not_found: 0,
    success: 1,
    version_error: 2,
    error: 4
  };
  return s;
}
exports.createDiffStatus = createDiffStatus;
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
  resources.limit = 24;
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
  var k = 'status_' + status;
  var msg = getString(k, gv);
  if (!msg || msg.length === 0) {
    msg = getString('error_internal', gv);
  }
  return msg;
}
exports.messageByHttpStatus = messageByHttpStatus;
function error(err, gv, ae) {
  var title = getString('error', gv);
  var msg = getString('error_internal', gv);
  if (!err) {
    ae(msg, title);
    return;
  }
  var data = err && err.response ? err.response : err;
  if (data) {
    var status_1 = data.status;
    if (status_1 && !isNaN(status_1)) {
      msg = messageByHttpStatus(status_1, gv);
    }
    ae(msg, title);
  }
  else {
    ae(msg, title);
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
        return b.substr(0, b.length - 4);
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
function handleToggle(target, on) {
  if (target) {
    if (on) {
      if (!target.classList.contains('on')) {
        target.classList.add('on');
      }
    }
    else {
      target.classList.remove('on');
    }
  }
}
exports.handleToggle = handleToggle;
