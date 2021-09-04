"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createEditStatus(status) {
  if (status) {
    return status;
  }
  var s = {
    DuplicateKey: 0,
    NotFound: 0,
    Success: 1,
    VersionError: 2,
    Error: 4,
    DataCorrupt: 8
  };
  return s;
}
exports.createEditStatus = createEditStatus;
function createDiffStatus(status) {
  if (status) {
    return status;
  }
  var s = {
    NotFound: 0,
    Success: 1,
    VersionError: 2,
    Error: 4
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
  var m = { message: m2 };
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
