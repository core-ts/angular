export interface ElementRef<T = any> {
  nativeElement: T
}
export interface ViewContainerRef {
  element: ElementRef
}
/*
export interface Filter {
  page?: number
  limit?: number
  firstLimit?: number
  fields?: string[]
  sort?: string

  q?: string
  excluding?: any
  refId?: string | number
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
*/

export interface Currency {
  currencyCode: string
  decimalDigits: number
  currencySymbol: string
}
export interface Headers {
  [key: string]: any
}
// tslint:disable-next-line:class-name
export class resources {
  static fields = "fields"
  static page = "page"
  static defaultLimit = 24
  static limit = "limit"
  static limits = [12, 24, 60, 100, 120, 180, 300, 600]
  static _cache: any = {}
  static cache = true
  static ignoreDate?: boolean
  private static _preg = / |\-|\.|\(|\)/g
  static format1 = / |,|\$|€|£|¥|'|٬|،| /g
  static format2 = / |\.|\$|€|£|¥|'|٬|،| /g
  static currency?: (currencyCode: string) => Currency | undefined
  static formatNumber?: (value: number, scale?: number, locale?: Locale) => string
  static formatPhone?: (phone: string) => string
  static formatFax?: (fax: string) => string
  static options?: () => { headers?: Headers }

  static removePhoneFormat?(phone: string): string {
    if (phone) {
      return phone.replace(resources._preg, "")
    }
    return phone
  }
  static removeFaxFormat?(fax: string): string {
    if (fax) {
      return fax.replace(resources._preg, "")
    }
    return fax
  }
}

export type Type =
  | "ObjectId"
  | "date"
  | "datetime"
  | "time"
  | "boolean"
  | "number"
  | "integer"
  | "string"
  | "text"
  | "object"
  | "array"
  | "binary"
  | "primitives"
  | "booleans"
  | "numbers"
  | "integers"
  | "strings"
  | "dates"
  | "datetimes"
  | "times"

export type Format = "currency" | "percentage" | "email" | "url" | "phone" | "fax" | "ipv4" | "ipv6"

export interface StringMap {
  [key: string]: string
}
export interface ResourceService {
  resource(): StringMap
  value(key: string, param?: any): string
}

export interface Locale {
  id?: string
  countryCode: string
  dateFormat: string
  firstDayOfWeek: number
  decimalSeparator: string
  groupSeparator: string
  decimalDigits: number
  currencyCode: string
  currencySymbol: string
  currencyPattern: number
  currencySample?: string
}

export interface ErrorMessage {
  field: string
  code: string
  param?: string | number | Date
  message?: string
}
export interface UIService {
  getValue(el: HTMLInputElement, locale?: Locale, currencyCode?: string): string | number | boolean | null | undefined
  decodeFromForm(form: HTMLFormElement, locale?: Locale, currencyCode?: string | null): any

  validateForm(form?: HTMLFormElement, locale?: Locale, focusFirst?: boolean, scroll?: boolean): boolean
  removeFormError(form: HTMLFormElement): void
  removeError(el: HTMLInputElement): void
  showFormError(form?: HTMLFormElement, errors?: ErrorMessage[], focusFirst?: boolean): ErrorMessage[]
  buildErrorMessage(errors: ErrorMessage[]): string

  registerEvents?(form: HTMLFormElement): void
}

export interface Attributes {
  [key: string]: Attribute
}
export interface Attribute {
  name?: string
  field?: string
  type?: Type
  format?: Format
  key?: boolean
  version?: boolean
  ignored?: boolean
  typeof?: Attributes
  scale?: number
  noformat?: boolean
}
export interface MetaModel {
  attributes: Attributes
  attributeName?: string
  keys?: string[]
  dateFields?: string[]
  integerFields?: string[]
  numberFields?: string[]
  currencyFields?: string[]
  phoneFields?: string[]
  faxFields?: string[]
  objectFields?: MetaModel[]
  arrayFields?: MetaModel[]
  version?: string
}
