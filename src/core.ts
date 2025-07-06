export interface ElementRef<T = any> {
  nativeElement: T
}
export interface ViewContainerRef {
  element: ElementRef
}

export interface Currency {
  currencyCode: string
  decimalDigits: number
  currencySymbol: string
}
export interface Headers {
  [key: string]: any
}
export interface LoadingService {
  showLoading(firstTime?: boolean): void
  hideLoading(): void
}
export const pageSizes = [12, 24, 60, 100, 120, 180, 300, 600]
export const sizes = pageSizes
// tslint:disable-next-line:class-name
export class resources {
  private static phone = / |-|\.|\(|\)/g
  static _cache: any = {}
  static cache = true
  static fields = "fields"
  static page = "page"
  static limit = "limit"
  static defaultLimit = 24
  static limits = pageSizes
  static ignoreDate?: boolean
  static format1 = / |,|\$|€|£|¥|'|٬|،| /g
  static format2 = / |\.|\$|€|£|¥|'|٬|،| /g
  static currency?: (currencyCode: string) => Currency | undefined
  static formatNumber?: (value: number, scale?: number, locale?: Locale) => string
  static formatPhone?: (phone: string) => string
  static formatFax?: (fax: string) => string
  static options?: () => { headers?: Headers }

  static removePhoneFormat?(phone: string): string {
    if (phone) {
      return phone.replace(resources.phone, "")
    }
    return phone
  }
  static removeFaxFormat?(fax: string): string {
    if (fax) {
      return fax.replace(resources.phone, "")
    }
    return fax
  }
}

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
