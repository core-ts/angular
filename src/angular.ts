import { HttpClient, HttpParams } from "@angular/common/http"
import { ViewContainerRef } from "@angular/core"
import { lastValueFrom } from "rxjs"
import { Headers, StringMap } from "./core"
import { hasDiff } from "./reflect"

export function back<T>(confirm: (msg: string, yesCallback?: () => void) => void, resource: StringMap, o1: T, o2: T, keys?: string[], version?: string) {
  if (!hasDiff(o1, o2, keys, version)) {
    window.history.back()
  } else {
    confirm(resource.msg_confirm_back, () => window.history.back())
  }
}

export function initElement(viewContainerRef?: ViewContainerRef | any, initMat?: (f: HTMLFormElement) => void): HTMLFormElement | undefined {
  if (!viewContainerRef) {
    return undefined
  }
  let nativeElement = viewContainerRef
  if (viewContainerRef.element && viewContainerRef.element.nativeElement) {
    nativeElement = viewContainerRef.element.nativeElement
  }
  if (nativeElement.querySelector) {
    const form = nativeElement.querySelector("form")
    if (form) {
      initForm(form, initMat)
    }
    return form
  }
  return undefined
}
export function initForm(form: HTMLFormElement, initMat?: (f: HTMLFormElement) => void): HTMLFormElement {
  if (form) {
    setTimeout(() => {
      if (initMat) {
        initMat(form)
      }
      focusFirstElement(form)
    }, 100)
  }
  return form
}
export function focusFirstElement(form: HTMLFormElement): void {
  let i = 0
  const len = form.length
  for (i = 0; i < len; i++) {
    const ctrl = form[i] as HTMLInputElement
    if (!(ctrl.readOnly || ctrl.disabled)) {
      let nodeName = ctrl.nodeName
      const type = ctrl.getAttribute("type")
      if (type) {
        const t = type.toUpperCase()
        if (t === "BUTTON" || t === "SUBMIT") {
          ctrl.focus()
        }
        if (nodeName === "INPUT") {
          nodeName = t
        }
      }
      if (nodeName !== "BUTTON" && nodeName !== "RESET" && nodeName !== "SUBMIT" && nodeName !== "CHECKBOX" && nodeName !== "RADIO") {
        ctrl.focus()
        return
      }
    }
  }
}

export function buildFromUrl<S>(): S {
  return buildParameters<S>(window.location.search)
}
export function buildParameters<T>(url: string): T {
  let urlSearch = url
  const i = urlSearch.indexOf("?")
  if (i >= 0) {
    urlSearch = url.substring(i + 1)
  }
  const obj: any = {}
  const httpParams = new HttpParams({ fromString: urlSearch })
  for (const key of httpParams.keys()) {
    obj[key] = httpParams.get(key)
  }
  return obj
}

export class HttpRequest {
  constructor(protected http: HttpClient, protected getHttpOptions?: () => Promise<{ headers?: Headers }>) {
    this.getOptions = this.getOptions.bind(this)
    this.get = this.get.bind(this)
    this.delete = this.delete.bind(this)
    this.post = this.post.bind(this)
    this.put = this.put.bind(this)
    this.patch = this.patch.bind(this)
  }
  protected getOptions(): Promise<{ headers?: Headers }> {
    if (this.getHttpOptions) {
      return this.getHttpOptions()
    } else {
      const httpOptions = {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
      }
      return Promise.resolve(httpOptions)
    }
  }
  get<T>(url: string, opts?: { headers?: Headers }): Promise<T> {
    if (opts) {
      return lastValueFrom(this.http.get<T>(url, opts))
    } else {
      return this.getOptions().then((x) => lastValueFrom(this.http.get<T>(url, x)))
    }
  }
  delete<T>(url: string, opts?: { headers?: Headers }): Promise<T> {
    if (opts) {
      return lastValueFrom(this.http.delete<T>(url, opts))
    } else {
      return this.getOptions().then((x) => lastValueFrom(this.http.delete<T>(url, x)))
    }
  }
  post<T>(url: string, obj: any, opts?: { headers?: Headers }): Promise<T> {
    if (opts) {
      return lastValueFrom(this.http.post<T>(url, obj, opts))
    } else {
      return this.getOptions().then((x) => lastValueFrom(this.http.post<T>(url, obj, x)))
    }
  }
  put<T>(url: string, obj: any, opts?: { headers?: Headers }): Promise<T> {
    if (opts) {
      return lastValueFrom(this.http.put<T>(url, obj, opts))
    } else {
      return this.getOptions().then((x) => lastValueFrom(this.http.put<T>(url, obj, x)))
    }
  }
  patch<T>(url: string, obj: any, opts?: { headers?: Headers }): Promise<T> {
    if (opts) {
      return lastValueFrom(this.http.patch<T>(url, obj, opts))
    } else {
      return this.getOptions().then((x) => lastValueFrom(this.http.patch<T>(url, obj, x)))
    }
  }
}
