"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./core");
var _datereg = '/Date(';
var _re = /-?\d+/;
function toDate(v) {
  if (!v) {
    return null;
  }
  if (v instanceof Date) {
    return v;
  }
  else if (typeof v === 'number') {
    return new Date(v);
  }
  var i = v.indexOf(_datereg);
  if (i >= 0) {
    var m = _re.exec(v);
    if (m !== null) {
      var d = parseInt(m[0], 10);
      return new Date(d);
    }
    else {
      return null;
    }
  }
  else {
    if (isNaN(v)) {
      return new Date(v);
    }
    else {
      var d = parseInt(v, 10);
      return new Date(d);
    }
  }
}
function jsonToDate(obj, fields) {
  if (!obj || !fields) {
    return obj;
  }
  if (!Array.isArray(obj)) {
    for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
      var field = fields_1[_i];
      var val = obj[field];
      if (val && !(val instanceof Date)) {
        obj[field] = toDate(val);
      }
    }
  }
}
function json(obj, m, loc, cur) {
  jsonToDate(obj, m.dateFields);
  if (core_1.resources.removePhoneFormat && m.phoneFields && m.phoneFields.length > 0) {
    for (var _i = 0, _a = m.phoneFields; _i < _a.length; _i++) {
      var p = _a[_i];
      var v = obj[p];
      if (v) {
        obj[p] = core_1.resources.removePhoneFormat(v);
      }
    }
  }
  if (core_1.resources.removeFaxFormat && m.faxFields && m.faxFields.length > 0) {
    for (var _b = 0, _c = m.faxFields; _b < _c.length; _b++) {
      var p = _c[_b];
      var v = obj[p];
      if (v) {
        obj[p] = core_1.resources.removeFaxFormat(v);
      }
    }
  }
  var r1 = core_1.resources.format1;
  var r2 = core_1.resources.format2;
  if (m.integerFields) {
    if (loc && loc.decimalSeparator !== '.') {
      for (var _d = 0, _e = m.integerFields; _d < _e.length; _d++) {
        var p = _e[_d];
        var v = obj[p];
        if (v && typeof v === 'string') {
          v = v.replace(r2, '');
          if (v.indexOf(loc.decimalSeparator) >= 0) {
            v = v.replace(loc.decimalSeparator, '.');
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
    else {
      for (var _f = 0, _g = m.integerFields; _f < _g.length; _f++) {
        var p = _g[_f];
        var v = obj[p];
        if (v && typeof v === 'string') {
          v = v.replace(r1, '');
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
  }
  if (m.numberFields) {
    if (loc && loc.decimalSeparator !== '.') {
      for (var _h = 0, _j = m.numberFields; _h < _j.length; _h++) {
        var p = _j[_h];
        var v = obj[p];
        if (v && typeof v === 'string') {
          v = v.replace(r2, '');
          if (v.indexOf(loc.decimalSeparator) >= 0) {
            v = v.replace(loc.decimalSeparator, '.');
          }
          if (v.indexOf('%') >= 0) {
            var attr = m.attributes[p];
            if (attr.format === 'percentage') {
              v = v.replace('%', '');
            }
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
    else {
      for (var _k = 0, _l = m.numberFields; _k < _l.length; _k++) {
        var p = _l[_k];
        var v = obj[p];
        if (v && typeof v === 'string') {
          v = v.replace(r1, '');
          if (v.indexOf('%') >= 0) {
            var attr = m.attributes[p];
            if (attr.format === 'percentage') {
              v = v.replace('%', '');
            }
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
  }
  if (m.currencyFields) {
    if (cur) {
      cur = cur.toUpperCase();
    }
    if (loc && loc.decimalSeparator !== '.') {
      for (var _m = 0, _o = m.currencyFields; _m < _o.length; _m++) {
        var p = _o[_m];
        var v = obj[p];
        if (v && typeof v === 'string') {
          if (core_1.resources.currency && cur) {
            var currency = core_1.resources.currency(cur);
            if (currency && v.indexOf(currency.currencySymbol) >= 0) {
              v = v.replace(currency.currencySymbol, '');
            }
          }
          if (loc && v.indexOf(loc.currencySymbol) >= 0) {
            v = v.replace(loc.currencySymbol, '');
          }
          v = v.replace(r2, '');
          if (v.indexOf(loc.decimalSeparator) >= 0) {
            v = v.replace(loc.decimalSeparator, '.');
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
    else {
      for (var _p = 0, _q = m.currencyFields; _p < _q.length; _p++) {
        var p = _q[_p];
        var v = obj[p];
        if (v && typeof v === 'string') {
          v = v.replace(r1, '');
          if (core_1.resources.currency && cur) {
            var currency = core_1.resources.currency(cur);
            if (currency && v.indexOf(currency.currencySymbol) >= 0) {
              v = v.replace(currency.currencySymbol, '');
            }
          }
          if (loc && v.indexOf(loc.currencySymbol) >= 0) {
            v = v.replace(loc.currencySymbol, '');
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
  }
  if (m.objectFields) {
    for (var _r = 0, _s = m.objectFields; _r < _s.length; _r++) {
      var of = _s[_r];
      if (of.attributeName && obj[of.attributeName]) {
        json(obj[of.attributeName], of, loc, cur);
      }
    }
  }
  if (m.arrayFields) {
    for (var _t = 0, _u = m.arrayFields; _t < _u.length; _t++) {
      var af = _u[_t];
      if (af.attributeName && obj[af.attributeName]) {
        var arr = obj[af.attributeName];
        if (Array.isArray(arr)) {
          for (var _v = 0, arr_1 = arr; _v < arr_1.length; _v++) {
            var a = arr_1[_v];
            json(a, af, loc, cur);
          }
        }
      }
    }
  }
}
exports.json = json;
function format(obj, m, loc, cur, includingCurrencySymbol) {
  if (includingCurrencySymbol === void 0) { includingCurrencySymbol = false; }
  if (core_1.resources.formatPhone && m.phoneFields) {
    for (var _i = 0, _a = m.phoneFields; _i < _a.length; _i++) {
      var p = _a[_i];
      var v = obj[p];
      if (v) {
        obj[p] = core_1.resources.formatPhone(v);
      }
    }
  }
  if (core_1.resources.formatFax && m.faxFields) {
    for (var _b = 0, _c = m.faxFields; _b < _c.length; _b++) {
      var p = _c[_b];
      var v = obj[p];
      if (v) {
        obj[p] = core_1.resources.formatFax(v);
      }
    }
  }
  if (core_1.resources.formatNumber) {
    if (m.integerFields) {
      for (var _d = 0, _e = m.integerFields; _d < _e.length; _d++) {
        var p = _e[_d];
        var v = obj[p];
        if (v && !isNaN(v)) {
          var attr = m.attributes[p];
          if (attr && !attr.noformat && !attr.key && !attr.version) {
            obj[p] = core_1.resources.formatNumber(v, attr.scale, loc);
          }
        }
      }
    }
    if (m.numberFields) {
      for (var _f = 0, _g = m.numberFields; _f < _g.length; _f++) {
        var p = _g[_f];
        var v = obj[p];
        if (v && !isNaN(v)) {
          var attr = m.attributes[p];
          if (attr && !attr.noformat && !attr.key && !attr.version) {
            var z = core_1.resources.formatNumber(v, attr.scale, loc);
            if (attr.format === 'percentage') {
              z = z + '%';
            }
            obj[p] = z;
          }
        }
      }
    }
    if (m.currencyFields) {
      for (var _h = 0, _j = m.currencyFields; _h < _j.length; _h++) {
        var p = _j[_h];
        var v = obj[p];
        if (v && !isNaN(v)) {
          var attr = m.attributes[p];
          if (attr && !attr.noformat && (cur || attr.scale) && !attr.key && !attr.version) {
            var scale = attr.scale;
            var currency = void 0;
            if (core_1.resources.currency && cur) {
              currency = core_1.resources.currency(cur);
              if (currency) {
                scale = currency.decimalDigits;
              }
            }
            if (scale && currency) {
              var v2 = core_1.resources.formatNumber(v, scale, loc);
              if (loc && includingCurrencySymbol) {
                var symbol = (loc.currencyCode === cur ? loc.currencySymbol : currency.currencySymbol);
                switch (loc.currencyPattern) {
                  case 0:
                    v2 = symbol + v2;
                    break;
                  case 1:
                    v2 = '' + v2 + symbol;
                    break;
                  case 2:
                    v2 = symbol + ' ' + v2;
                    break;
                  case 3:
                    v2 = '' + v2 + ' ' + symbol;
                    break;
                  default:
                    break;
                }
              }
              obj[p] = v2;
            }
          }
        }
      }
    }
  }
  if (m.objectFields && m.objectFields.length > 0) {
    for (var _k = 0, _l = m.objectFields; _k < _l.length; _k++) {
      var p = _l[_k];
      if (p.attributeName) {
        var v = obj[p.attributeName];
        if (v) {
          format(v, p, loc, cur, includingCurrencySymbol);
        }
      }
    }
  }
  if (m.arrayFields) {
    for (var _m = 0, _o = m.arrayFields; _m < _o.length; _m++) {
      var p = _o[_m];
      if (p.attributeName) {
        var arr = obj[p.attributeName];
        if (arr && Array.isArray(arr)) {
          for (var _p = 0, arr_2 = arr; _p < arr_2.length; _p++) {
            var a = arr_2[_p];
            format(a, p, loc, cur, includingCurrencySymbol);
          }
        }
      }
    }
  }
}
exports.format = format;
