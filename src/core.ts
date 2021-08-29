
// tslint:disable-next-line:class-name
export interface Currency {
  currencyCode?: string;
  decimalDigits: number;
  currencySymbol: string;
}

// tslint:disable-next-line:class-name
export class resources {
  static _cache: any = {};
  static cache = true;
  static ignoreDate?: boolean;
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

export type Type = 'ObjectId' | 'date' | 'datetime' | 'time'
    | 'boolean' | 'number' | 'integer' | 'string' | 'text'
    | 'object' | 'array' | 'primitives' | 'binary';
export type Format = 'currency' | 'percentage' | 'email' | 'url' | 'phone' | 'fax' | 'ipv4' | 'ipv6';

export interface StringMap {
  [key: string]: string;
}
export interface ResourceService {
  resource(): StringMap;
  value(key: string, param?: any): string;
  format(f: string, ...args: any[]): string;
}
export interface Message {
  message: string;
  title?: string;
  yes?: string;
  no?: string;
}
export function getString(key: string, gv: StringMap|((key: string) => string)): string {
  if (typeof gv === 'function') {
    return gv(key);
  } else {
    return gv[key];
  }
}
export function message(gv: StringMap|((key: string) => string), msg: string, title?: string, yes?: string, no?: string): Message {
  const m2 = (msg && msg.length > 0 ? getString(msg, gv) : '');
    const m: Message = { message: m2 };
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
export function messageByHttpStatus(status: number, gv: StringMap|((key: string) => string)): string {
  const k = 'status_' + status;
  let msg = getString(k, gv);
    if (!msg || msg.length === 0) {
      msg = getString('error_internal', gv);
    }
    return msg;
}

export interface Locale {
  id?: string;
  countryCode: string;
  dateFormat: string;
  firstDayOfWeek: number;
  decimalSeparator: string;
  groupSeparator: string;
  decimalDigits: number;
  currencyCode: string;
  currencySymbol: string;
  currencyPattern: number;
  currencySample?: string;
}

export interface LoadingService {
  showLoading(firstTime?: boolean): void;
  hideLoading(): void;
}

export interface ErrorMessage {
  field: string;
  code: string;
  param?: string|number|Date;
  message?: string;
}
export interface UIService {
  getValue(el: HTMLInputElement, locale?: Locale, currencyCode?: string): string|number|boolean;
  decodeFromForm(form: HTMLFormElement, locale?: Locale, currencyCode?: string): any;

  validateForm(form: HTMLFormElement, locale?: Locale, focusFirst?: boolean, scroll?: boolean): boolean;
  removeFormError(form: HTMLFormElement): void;
  removeError(el: HTMLInputElement): void;
  showFormError(form: HTMLFormElement, errors: ErrorMessage[], focusFirst?: boolean): ErrorMessage[];
  buildErrorMessage(errors: ErrorMessage[]): string;

  registerEvents?(form: HTMLFormElement): void;
}
export interface AlertService {
  confirm(msg: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void): void;
  alertError(msg: string, header?: string, detail?: string, callback?: () => void): void;
}

export interface Metadata {
  name?: string;
  attributes: Attributes;
  source?: string;
}
export interface Attributes {
  [key: string]: Attribute;
}
export interface Attribute {
  name?: string;
  field?: string;
  type: Type;
  format?: Format;
  key?: boolean;
  version?: boolean;
  ignored?: boolean;
  typeof?: Metadata;
  scale?: number;
  noformat?: boolean;
}
export interface MetaModel {
  model: Metadata;
  attributeName?: string;
  keys?: string[];
  dateFields?: string[];
  integerFields?: string[];
  numberFields?: string[];
  currencyFields?: string[];
  phoneFields?: string[];
  faxFields?: string[];
  objectFields?: MetaModel[];
  arrayFields?: MetaModel[];
  version?: string;
}
export function error(err: any, gv: StringMap|((key: string) => string), ae: (msg: string, header?: string, detail?: string, callback?: () => void) => void) {
  const title = getString('error', gv);
  let msg = getString('error_internal', gv);
  if (!err) {
    ae(msg, title);
    return;
  }
  const data = err && err.response ? err.response : err;
  if (data) {
    const status = data.status;
    if (status && !isNaN(status)) {
      msg = messageByHttpStatus(status, gv);
    }
    ae(msg, title);
  } else {
    ae(msg, title);
  }
}
export function getModelName(form: HTMLFormElement): string {
  if (form) {
    const a = form.getAttribute('model-name');
    if (a && a.length > 0) {
      return a;
    }
    const b = form.name;
    if (b) {
      if (b.endsWith('Form')) {
        return b.substr(0, b.length - 4);
      }
      return b;
    }
  }
  return '';
}
