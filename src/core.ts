export interface ElementRef<T = any> {
  nativeElement: T;
}
export interface ViewContainerRef {
  element: ElementRef;
}
export interface SearchPermission {
  viewable?: boolean;
  addable?: boolean;
  editable?: boolean;
  deletable?: boolean;
  approvable?: boolean;
}
export interface LocaleFormatter<T> {
  format(obj: T, locale: Locale): T;
}
export interface Filter {
  page?: number;
  limit?: number;
  firstLimit?: number;
  fields?: string[];
  sort?: string;

  q?: string;
  excluding?: any;
  refId?: string | number;
}
export interface SearchResult<T> {
  total?: number;
  list: T[];
  nextPageToken?: string;
  last?: boolean;
}
export interface SearchService<T, S extends Filter> {
  keys?(): string[];
  search(s: S, limit?: number, offset?: number | string, fields?: string[]): Promise<SearchResult<T>>;
}
export interface SearchParameter {
  resource: ResourceService;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  ui?: UIService;
  getLocale?: (profile?: string) => Locale;
  loading?: LoadingService;
  auto?: boolean;
}
export interface ViewParameter {
  resource: ResourceService;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  getLocale?: (profile?: string) => Locale;
  loading?: LoadingService;
}
export interface ViewService<T, ID> {
  metadata?(): Attributes | undefined;
  keys?(): string[];
  load(id: ID, ctx?: any): Promise<T | null>;
}

export interface EditStatusConfig {
  duplicate_key: number | string;
  not_found: number | string;
  success: number | string;
  version_error: number | string;
  error?: number | string;
  data_corrupt?: number | string;
}
export function createEditStatus(status?: EditStatusConfig): EditStatusConfig {
  if (status) {
    return status;
  }
  const s: EditStatusConfig = {
    duplicate_key: 0,
    not_found: 0,
    success: 1,
    version_error: 2,
    error: 4,
    data_corrupt: 8
  };
  return s;
}
export interface DiffStatusConfig {
  not_found: number | string;
  success: number | string;
  version_error: number | string;
  error?: number | string;
}
export function createDiffStatus(status?: DiffStatusConfig): DiffStatusConfig {
  if (status) {
    return status;
  }
  const s: DiffStatusConfig = {
    not_found: 0,
    success: 1,
    version_error: 2,
    error: 4
  };
  return s;
}
export interface DiffParameter {
  resource: ResourceService;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  loading?: LoadingService;
  status?: DiffStatusConfig;
}
export interface DiffModel<T, ID> {
  id?: ID;
  origin?: T;
  value: T;
}
export interface DiffService<T, ID> {
  keys(): string[];
  diff(id: ID, ctx?: any): Promise<DiffModel<T, ID>>;
}
export interface ApprService<ID> {
  approve(id: ID, ctx?: any): Promise<number | string>;
  reject(id: ID, ctx?: any): Promise<number | string>;
}
export interface DiffApprService<T, ID> extends DiffService<T, ID>, ApprService<ID> {
}

export interface Currency {
  currencyCode?: string;
  decimalDigits: number;
  currencySymbol: string;
}
export interface Headers {
  [key: string]: any;
}
// tslint:disable-next-line:class-name
export class resources {
  static limit = 24;
  static _cache: any = {};
  static cache = true;
  static ignoreDate?: boolean;
  private static _preg = / |\-|\.|\(|\)/g;
  static format1 = / |,|\$|€|£|¥|'|٬|،| /g;
  static format2 = / |\.|\$|€|£|¥|'|٬|،| /g;
  static currency?: (currencyCode: string) => Currency | undefined;
  static formatNumber?: (value: number, scale?: number, locale?: Locale) => string;
  static formatPhone?: (phone: string) => string;
  static formatFax?: (fax: string) => string;
  static options?: () => { headers?: Headers };

  static removePhoneFormat?(phone: string): string {
    if (phone) {
      return phone.replace(resources._preg, '');
    }
    return phone;
  }
  static removeFaxFormat?(fax: string): string {
    if (fax) {
      return fax.replace(resources._preg, '');
    }
    return fax;
  }
}

export type Type = 'ObjectId' | 'date' | 'datetime' | 'time'
  | 'boolean' | 'number' | 'integer' | 'string' | 'text'
  | 'object' | 'array' | 'binary'
  | 'primitives' | 'booleans' | 'numbers' | 'integers' | 'strings' | 'dates' | 'datetimes' | 'times';

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
  title: string;
  yes?: string;
  no?: string;
}
export function getString(key: string, gv: StringMap | ((key: string) => string)): string {
  if (typeof gv === 'function') {
    return gv(key);
  } else {
    return gv[key];
  }
}
export function message(gv: StringMap | ((key: string) => string), msg: string, title?: string, yes?: string, no?: string): Message {
  const m2 = (msg && msg.length > 0 ? getString(msg, gv) : '');
  const m: Message = { message: m2, title: '' };
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
export function messageByHttpStatus(status: number, gv: StringMap | ((key: string) => string)): string {
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
  param?: string | number | Date;
  message?: string;
}
export interface UIService {
  getValue(el: HTMLInputElement, locale?: Locale, currencyCode?: string): string | number | boolean | null | undefined;
  decodeFromForm(form: HTMLFormElement, locale?: Locale, currencyCode?: string | null): any;

  validateForm(form?: HTMLFormElement, locale?: Locale, focusFirst?: boolean, scroll?: boolean): boolean;
  removeFormError(form: HTMLFormElement): void;
  removeError(el: HTMLInputElement): void;
  showFormError(form?: HTMLFormElement, errors?: ErrorMessage[], focusFirst?: boolean): ErrorMessage[];
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
  type?: Type;
  format?: Format;
  key?: boolean;
  version?: boolean;
  ignored?: boolean;
  typeof?: Attributes;
  scale?: number;
  noformat?: boolean;
}
export interface MetaModel {
  attributes: Attributes;
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
export function error(err: any, gv: StringMap | ((key: string) => string), ae: (msg: string, header?: string, detail?: string, callback?: () => void) => void) {
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
export function getModelName(form?: HTMLFormElement): string {
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
export const scrollToFocus = (e: any, isUseTimeOut?: boolean) => {
  try {
    const element = e.target as HTMLInputElement;
    const form = element.form;
    if (form) {
      const container = form.childNodes[1] as HTMLElement;
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const middle = absoluteElementTop - (window.innerHeight / 2);
      const scrollTop = container.scrollTop;
      const timeOut = isUseTimeOut ? 300 : 0;
      const isChrome = navigator.userAgent.search('Chrome') > 0;
      setTimeout(() => {
        if (isChrome) {
          const scrollPosition = scrollTop === 0 ? (elementRect.top + 64) : (scrollTop + middle);
          container.scrollTo(0, Math.abs(scrollPosition));
        } else {
          container.scrollTo(0, Math.abs(scrollTop + middle));
        }
      }, timeOut);
    }
  } catch (e) {
    console.log(e);
  }
};
export function showLoading(loading?: LoadingService | ((firstTime?: boolean) => void)): void {
  if (loading) {
    if (typeof loading === 'function') {
      loading();
    } else {
      loading.showLoading();
    }
  }
}
export function hideLoading(loading?: LoadingService | (() => void)): void {
  if (loading) {
    if (typeof loading === 'function') {
      loading();
    } else {
      loading.hideLoading();
    }
  }
}

export function handleToggle(target?: HTMLInputElement, on?: boolean): void {
  if (target) {
    if (on) {
      if (!target.classList.contains('on')) {
        target.classList.add('on');
      }
    } else {
      target.classList.remove('on');
    }
  }
}
