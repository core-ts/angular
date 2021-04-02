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
  resources._cache = {};
  resources.cache = true;
  resources._preg = / |\-|\.|\(|\)/g;
  resources.format1 = / |,|\$|€|£|¥|'|٬|،| /g;
  resources.format2 = / |\.|\$|€|£|¥|'|٬|،| /g;
  return resources;
}());
exports.resources = resources;
function message(gv, msg, title, yes, no) {
  var m2 = (msg && msg.length > 0 ? gv(msg) : '');
  var m = {
    message: m2
  };
  if (title && title.length > 0) {
    m.title = gv(title);
  }
  if (yes && yes.length > 0) {
    m.yes = gv(yes);
  }
  if (no && no.length > 0) {
    m.no = gv(no);
  }
  return m;
}
exports.message = message;
function messageByHttpStatus(status, gv) {
  var msg = gv('error_internal');
  if (status === 401) {
    msg = gv('error_unauthorized');
  }
  else if (status === 403) {
    msg = gv('error_forbidden');
  }
  else if (status === 404) {
    msg = gv('error_not_found');
  }
  else if (status === 410) {
    msg = gv('error_gone');
  }
  else if (status === 503) {
    msg = gv('error_service_unavailable');
  }
  return msg;
}
exports.messageByHttpStatus = messageByHttpStatus;
function error(err, gv, ae) {
  var title = gv('error');
  var msg = gv('error_internal');
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
