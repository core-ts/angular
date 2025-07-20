import { ViewContainerRef } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { initElement } from "./angular"
import { buildId, error, hideLoading, showLoading } from "./common"
import { LoadingService, StringMap } from "./core"
import { clone, diff } from "./reflect"

export function showDiff<T>(form: HTMLFormElement, value: T, origin?: T): void {
  if (!origin) {
    origin = {} as any
  }
  const differentKeys = diff(origin, value)
  for (const differentKey of differentKeys) {
    const y = form.querySelector("." + differentKey)
    if (y) {
      if (y.childNodes.length === 3) {
        y.children[1].classList.add("highlight")
        y.children[2].classList.add("highlight")
      } else {
        y.classList.add("highlight")
      }
    }
  }
}

export interface DiffModel<T, ID> {
  id?: ID
  origin?: T
  value: T
}
export function formatDiffModel<T, ID>(obj: DiffModel<T, ID>, formatFields?: (obj3: T) => T): DiffModel<T, ID> {
  if (!obj) {
    return obj
  }
  const obj2 = clone(obj)
  if (!obj2.origin) {
    obj2.origin = {}
  } else {
    if (typeof obj2.origin === "string") {
      obj2.origin = JSON.parse(obj2.origin)
    }
    if (formatFields && typeof obj2.origin === "object" && !Array.isArray(obj2.origin)) {
      obj2.origin = formatFields(obj2.origin)
    }
  }
  if (!obj2.value) {
    obj2.value = {}
  } else {
    if (typeof obj2.value === "string") {
      obj2.value = JSON.parse(obj2.value)
    }
    if (formatFields && typeof obj2.value === "object" && !Array.isArray(obj2.value)) {
      obj2.value = formatFields(obj2.value)
    }
  }
  return obj2
}
export interface DiffParameter {
  showMessage: (msg: string, option?: string) => void
  showError: (m: string, callback?: () => void, header?: string) => void
  loading?: LoadingService
}
export interface DiffService<T, ID> {
  keys(): string[]
  diff(id: ID, ctx?: any): Promise<DiffModel<T, ID>>
}
export interface ApprService<ID> {
  approve(id: ID, ctx?: any): Promise<number | string>
  reject(id: ID, ctx?: any): Promise<number | string>
}
export interface DiffApprService<T, ID> extends DiffService<T, ID>, ApprService<ID> {}
export class DiffApprComponent<T, ID> {
  constructor(
    protected viewContainerRef: ViewContainerRef,
    protected route: ActivatedRoute,
    protected service: DiffApprService<T, ID>,
    public resource: StringMap,
    protected showMessage: (msg: string, option?: string) => void,
    protected showError: (m: string, callback?: () => void, header?: string) => void,
    protected loading?: LoadingService,
  ) {
    this.back = this.back.bind(this)
    const x: any = {}
    this.origin = x
    this.value = x
    this.approve = this.approve.bind(this)
    this.reject = this.reject.bind(this)
    this.handleError = this.handleError.bind(this)
    this.end = this.end.bind(this)
    this.formatFields = this.formatFields.bind(this)
    this.load = this.load.bind(this)
    this.handleNotFound = this.handleNotFound.bind(this)
  }
  protected running?: boolean
  protected form?: HTMLFormElement
  protected id?: ID
  origin?: T
  value: T
  disabled?: boolean

  back(): void {
    window.history.back()
  }

  onInit() {
    this.form = initElement(this.viewContainerRef)
    const id: ID | null = buildId<ID>(this.route, this.service.keys())
    if (id) {
      this.load(id)
    }
  }
  load(_id: ID) {
    const x: any = _id
    if (x && x !== "") {
      this.id = _id
      this.running = true
      showLoading(this.loading)
      const com = this
      this.service
        .diff(_id)
        .then((dobj) => {
          if (!dobj) {
            com.handleNotFound(com.form)
          } else {
            const formatdDiff = formatDiffModel(dobj, com.formatFields)
            com.value = formatdDiff.value
            com.origin = formatdDiff.origin
            if (com.form) {
              showDiff(com.form, formatdDiff.value, formatdDiff.origin)
            }
          }
          com.running = false
          hideLoading(com.loading)
        })
        .catch((err) => {
          const data = err && err.response ? err.response : err
          if (data && data.status === 404) {
            com.handleNotFound(com.form)
          } else {
            error(err, this.resource, com.showError)
          }
          com.running = false
          hideLoading(com.loading)
        })
    }
  }
  protected handleNotFound(form?: HTMLFormElement) {
    this.disabled = true
    this.showError(this.resource.error_not_found)
  }

  formatFields(value: T): T {
    return value
  }
  approve(event: Event) {
    event.preventDefault()
    if (this.running) {
      return
    }
    const com = this
    if (this.id) {
      this.running = true
      showLoading(this.loading)
      this.service
        .approve(this.id)
        .then((status) => {
          if (typeof status === "number" && status > 0) {
            com.showMessage(this.resource.msg_approve_success)
          } else if (status === 0) {
            com.handleNotFound(com.form)
          } else {
            com.showMessage(this.resource.msg_approve_version_error)
          }
          com.end()
        })
        .catch((err) => {
          com.handleError(err)
          com.end()
        })
    }
  }
  reject(event: Event) {
    event.preventDefault()
    if (this.running) {
      return
    }
    const com = this
    if (this.id) {
      this.running = true
      showLoading(this.loading)
      this.service
        .reject(this.id)
        .then((status) => {
          if (typeof status === "number" && status > 0) {
            com.showMessage(this.resource.msg_reject_success)
          } else if (status === 0) {
            com.handleNotFound(com.form)
          } else {
            com.showMessage(this.resource.msg_approve_version_error)
          }
          com.end()
        })
        .catch((err) => {
          com.handleError(err)
          com.end()
        })
    }
  }
  protected handleError(err: any): void {
    const data = err && err.response ? err.response : err
    if (data && (data.status === 404 || data.status === 409)) {
      if (data.status === 404) {
        this.handleNotFound()
      } else {
        this.showMessage(this.resource.msg_approve_version_error)
      }
    } else {
      error(err, this.resource, this.showError)
    }
  }
  protected end() {
    this.disabled = true
    this.running = false
    hideLoading(this.loading)
  }
}
