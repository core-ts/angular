import {Attribute, Format, Locale, MetaModel} from './core';

export interface Currency {
  currencyCode?: string;
  decimalDigits: number;
  currencySymbol: string;
}

// tslint:disable-next-line:class-name
export class resources {
  private static _preg = / |\-|\.|\(|\)/g;
  static format1 = / |,|\$|€|£|¥|'|٬|،| /g;
  static format2 = / |\.|\$|€|£|¥|'|٬|،| /g;
  static currency: (currencyCode: string) => Currency;
  static formatNumber: (value: number, scale: number, locale: Locale) => string;
  static formatPhone: (phone: string) => string;
  static formatFax: (fax: string) => string;

  static removePhoneFormat(phone: string): string {
    if (phone) {
      return phone.replace(resources._preg, '');
    }
    return phone;
  }
  static removeFaxFormat(fax: string): string {
    if (fax) {
      return fax.replace(resources._preg, '');
    }
    return fax;
  }
}

const _rd = '/Date(';
const _rn = /-?\d+/;

function toDate(v: string|number|Date): Date {
  if (!v || v === '') {
    return null;
  }
  if (v instanceof Date) {
    return v;
  } else if (typeof v === 'number') {
    return new Date(v);
  }
  const i = v.indexOf(_rd);
  if (i >= 0) {
    const m = _rn.exec(v);
    const d = parseInt(m[0], null);
    return new Date(d);
  } else {
    if (isNaN(v as any)) {
      return new Date(v);
    } else {
      const d = parseInt(v, null);
      return new Date(d);
    }
  }
}

function jsonToDate(obj, fields: string[]) {
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

export function json<T>(obj: T, m: MetaModel, loc: Locale, cur?: string) {
  jsonToDate(obj, m.dateFields);
  if (resources.removePhoneFormat && m.phoneFields && m.phoneFields.length > 0) {
    for (const p of m.phoneFields) {
      const v = obj[p];
      if (v) {
        obj[p] = resources.removePhoneFormat(v);
      }
    }
  }
  if (resources.removeFaxFormat && m.faxFields && m.faxFields.length > 0) {
    for (const p of m.faxFields) {
      const v = obj[p];
      if (v) {
        obj[p] = resources.removeFaxFormat(v);
      }
    }
  }
  const r1 = resources.format1;
  const r2 = resources.format2;
  if (m.integerFields) {
    if (loc && loc.decimalSeparator !== '.') {
      for (const p of m.integerFields) {
        let v = obj[p];
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
    } else {
      for (const p of m.integerFields) {
        let v = obj[p];
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
      for (const p of m.numberFields) {
        let v = obj[p];
        if (v && typeof v === 'string') {
          v = v.replace(r2, '');
          if (v.indexOf(loc.decimalSeparator) >= 0) {
            v = v.replace(loc.decimalSeparator, '.');
          }
          if (v.indexOf('%') >= 0) {
            const attr: Attribute = m.model.attributes[p];
            if (attr.format === Format.Percentage) {
              v = v.replace('%', '');
            }
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    } else {
      for (const p of m.numberFields) {
        let v = obj[p];
        if (v && typeof v === 'string') {
          v = v.replace(r1, '');
          if (v.indexOf('%') >= 0) {
            const attr: Attribute = m.model.attributes[p];
            if (attr.format === Format.Percentage) {
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
      for (const p of m.currencyFields) {
        let v = obj[p];
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
            obj[p] = parseFloat(v);
          }
        }
      }
    } else {
      for (const p of m.currencyFields) {
        let v = obj[p];
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
            obj[p] = parseFloat(v);
          }
        }
      }
    }
  }
  if (m.objectFields) {
    for (const objectField of m.objectFields) {
      if (obj[objectField.attributeName]) {
        json(obj[objectField.attributeName], objectField, loc, cur);
      }
    }
  }
  if (m.arrayFields) {
    for (const arrayField of m.arrayFields) {
      if (obj[arrayField.attributeName]) {
        const arr = obj[arrayField.attributeName];
        if (Array.isArray(arr)) {
          for (const a of arr) {
            json(a, arrayField, loc, cur);
          }
        }
      }
    }
  }
}

export function format<T>(obj: T, m: MetaModel, loc: Locale, cur?: string, includingCurrencySymbol: boolean = false) {
  if (resources.formatPhone && m.phoneFields) {
    for (const p of m.phoneFields) {
      const v = obj[p];
      if (v) {
        obj[p] = resources.formatPhone(v);
      }
    }
  }
  if (resources.formatFax && m.faxFields) {
    for (const p of m.faxFields) {
      const v = obj[p];
      if (v) {
        obj[p] = resources.formatFax(v);
      }
    }
  }
  if (resources.formatNumber) {
    if (m.integerFields) {
      for (const p of m.integerFields) {
        const v = obj[p];
        if (v && !isNaN(v)) {
          const attr: Attribute = m.model.attributes[p];
          if (attr && !attr.noformat && !attr.key && !attr.version) {
            obj[p] = resources.formatNumber(v, attr.scale, loc);
          }
        }
      }
    }
    if (m.numberFields) {
      for (const p of m.numberFields) {
        const v = obj[p];
        if (v && !isNaN(v)) {
          const attr: Attribute = m.model.attributes[p];
          if (attr && !attr.noformat && !attr.key && !attr.version) {
            let z = resources.formatNumber(v, attr.scale, loc);
            if (attr.format === Format.Percentage) {
              z = z + '%';
            }
            obj[p] = z;
          }
        }
      }
    }
    if (m.currencyFields) {
      for (const p of m.currencyFields) {
        const v = obj[p];
        if (v && !isNaN(v)) {
          const attr: Attribute = m.model.attributes[p];
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
              obj[p] = v2;
            }
          }
        }
      }
    }
  }
  if (m.objectFields && m.objectFields.length > 0) {
    for (const p of m.objectFields) {
      const v = obj[p.attributeName];
      if (v) {
        format(v, p, loc, cur, includingCurrencySymbol);
      }
    }
  }
  if (m.arrayFields) {
    for (const p of m.arrayFields) {
      const arr = obj[p.attributeName];
      if (arr && Array.isArray(arr)) {
        for (const a of arr) {
          format(a, p, loc, cur, includingCurrencySymbol);
        }
      }
    }
  }
}
