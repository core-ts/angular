import { Attribute, Locale, MetaModel, resources } from './core';

const _datereg = '/Date(';
const _re = /-?\d+/;

function toDate(v: any): Date | null | undefined {
  if (!v) {
    return null;
  }
  if (v instanceof Date) {
    return v;
  } else if (typeof v === 'number') {
    return new Date(v);
  }
  const i = v.indexOf(_datereg);
  if (i >= 0) {
    const m = _re.exec(v);
    if (m !== null) {
      const d = parseInt(m[0], 10);
      return new Date(d);
    } else {
      return null;
    }
  } else {
    if (isNaN(v)) {
      return new Date(v);
    } else {
      const d = parseInt(v, 10);
      return new Date(d);
    }
  }
}

function jsonToDate(obj: any, fields?: string[]) {
  if (!obj || !fields) {
    return obj;
  }
  if (!Array.isArray(obj)) {
    for (const field of fields) {
      const val = obj[field];
      if (val && !(val instanceof Date)) {
        obj[field] = toDate(val);
      }
    }
  }
}

export function json<T>(obj: T, m: MetaModel, loc: Locale, cur?: string | null) {
  jsonToDate(obj, m.dateFields);
  if (resources.removePhoneFormat && m.phoneFields && m.phoneFields.length > 0) {
    for (const p of m.phoneFields) {
      const v = (obj as any)[p];
      if (v) {
        (obj as any)[p] = resources.removePhoneFormat(v);
      }
    }
  }
  if (resources.removeFaxFormat && m.faxFields && m.faxFields.length > 0) {
    for (const p of m.faxFields) {
      const v = (obj as any)[p];
      if (v) {
        (obj as any)[p] = resources.removeFaxFormat(v);
      }
    }
  }
  const r1 = resources.format1;
  const r2 = resources.format2;
  if (m.integerFields) {
    if (loc && loc.decimalSeparator !== '.') {
      for (const p of m.integerFields) {
        let v = (obj as any)[p];
        if (v && typeof v === 'string') {
          v = v.replace(r2, '');
          if (v.indexOf(loc.decimalSeparator) >= 0) {
            v = v.replace(loc.decimalSeparator, '.');
          }
          if (!isNaN(v)) {
            (obj as any)[p] = parseFloat(v);
          }
        }
      }
    } else {
      for (const p of m.integerFields) {
        let v = (obj as any)[p];
        if (v && typeof v === 'string') {
          v = v.replace(r1, '');
          if (!isNaN(v)) {
            (obj as any)[p] = parseFloat(v);
          }
        }
      }
    }
  }
  if (m.numberFields) {
    if (loc && loc.decimalSeparator !== '.') {
      for (const p of m.numberFields) {
        let v = (obj as any)[p];
        if (v && typeof v === 'string') {
          v = v.replace(r2, '');
          if (v.indexOf(loc.decimalSeparator) >= 0) {
            v = v.replace(loc.decimalSeparator, '.');
          }
          if (v.indexOf('%') >= 0) {
            const attr: Attribute = m.attributes[p];
            if (attr.format === 'percentage') {
              v = v.replace('%', '');
            }
          }
          if (!isNaN(v)) {
            (obj as any)[p] = parseFloat(v);
          }
        }
      }
    } else {
      for (const p of m.numberFields) {
        let v = (obj as any)[p];
        if (v && typeof v === 'string') {
          v = v.replace(r1, '');
          if (v.indexOf('%') >= 0) {
            const attr: Attribute = m.attributes[p];
            if (attr.format === 'percentage') {
              v = v.replace('%', '');
            }
          }
          if (!isNaN(v)) {
            (obj as any)[p] = parseFloat(v);
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
      for (const p of m.currencyFields) {
        let v = (obj as any)[p];
        if (v && typeof v === 'string') {
          if (resources.currency && cur) {
            const currency = resources.currency(cur);
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
            (obj as any)[p] = parseFloat(v);
          }
        }
      }
    } else {
      for (const p of m.currencyFields) {
        let v = (obj as any)[p];
        if (v && typeof v === 'string') {
          v = v.replace(r1, '');
          if (resources.currency && cur) {
            const currency = resources.currency(cur);
            if (currency && v.indexOf(currency.currencySymbol) >= 0) {
              v = v.replace(currency.currencySymbol, '');
            }
          }
          if (loc && v.indexOf(loc.currencySymbol) >= 0) {
            v = v.replace(loc.currencySymbol, '');
          }
          if (!isNaN(v)) {
            (obj as any)[p] = parseFloat(v);
          }
        }
      }
    }
  }
  if (m.objectFields) {
    for (const of of m.objectFields) {
      if (of.attributeName && (obj as any)[of.attributeName]) {
        json((obj as any)[of.attributeName], of, loc, cur);
      }
    }
  }
  if (m.arrayFields) {
    for (const af of m.arrayFields) {
      if (af.attributeName && (obj as any)[af.attributeName]) {
        const arr = (obj as any)[af.attributeName];
        if (Array.isArray(arr)) {
          for (const a of arr) {
            json(a, af, loc, cur);
          }
        }
      }
    }
  }
}

export function format<T>(obj: T, m: MetaModel, loc: Locale, cur?: string | null, includingCurrencySymbol: boolean = false) {
  if (resources.formatPhone && m.phoneFields) {
    for (const p of m.phoneFields) {
      const v = (obj as any)[p];
      if (v) {
        (obj as any)[p] = resources.formatPhone(v);
      }
    }
  }
  if (resources.formatFax && m.faxFields) {
    for (const p of m.faxFields) {
      const v = (obj as any)[p];
      if (v) {
        (obj as any)[p] = resources.formatFax(v);
      }
    }
  }
  if (resources.formatNumber) {
    if (m.integerFields) {
      for (const p of m.integerFields) {
        const v = (obj as any)[p];
        if (v && !isNaN(v)) {
          const attr: Attribute = m.attributes[p];
          if (attr && !attr.noformat && !attr.key && !attr.version) {
            (obj as any)[p] = resources.formatNumber(v, attr.scale, loc);
          }
        }
      }
    }
    if (m.numberFields) {
      for (const p of m.numberFields) {
        const v = (obj as any)[p];
        if (v && !isNaN(v)) {
          const attr: Attribute = m.attributes[p];
          if (attr && !attr.noformat && !attr.key && !attr.version) {
            let z = resources.formatNumber(v, attr.scale, loc);
            if (attr.format === 'percentage') {
              z = z + '%';
            }
            (obj as any)[p] = z;
          }
        }
      }
    }
    if (m.currencyFields) {
      for (const p of m.currencyFields) {
        const v = (obj as any)[p];
        if (v && !isNaN(v)) {
          const attr: Attribute = m.attributes[p];
          if (attr && !attr.noformat && (cur || attr.scale) && !attr.key && !attr.version) {
            let scale = attr.scale;
            let currency;
            if (resources.currency && cur) {
              currency = resources.currency(cur);
              if (currency) {
                scale = currency.decimalDigits;
              }
            }
            if (scale && currency) {
              let v2 = resources.formatNumber(v, scale, loc);
              if (loc && includingCurrencySymbol) {
                const symbol = (loc.currencyCode === cur ? loc.currencySymbol : currency.currencySymbol);
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
              (obj as any)[p] = v2;
            }
          }
        }
      }
    }
  }
  if (m.objectFields && m.objectFields.length > 0) {
    for (const p of m.objectFields) {
      if (p.attributeName) {
        const v = (obj as any)[p.attributeName];
        if (v) {
          format(v, p, loc, cur, includingCurrencySymbol);
        }
      }
    }
  }
  if (m.arrayFields) {
    for (const p of m.arrayFields) {
      if (p.attributeName) {
        const arr = (obj as any)[p.attributeName];
        if (arr && Array.isArray(arr)) {
          for (const a of arr) {
            format(a, p, loc, cur, includingCurrencySymbol);
          }
        }
      }
    }
  }
}
