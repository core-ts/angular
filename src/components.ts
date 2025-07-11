import { buildFromUrl, initElement } from "./angular"
import { Attributes, ErrorMessage, Locale, MetaModel, resources, ResourceService, StringMap, UIService, ViewContainerRef } from "./core"
import { DiffModel, formatDiffModel, showDiff } from "./diff"
import { createModel } from "./edit"
import { error, message } from "./error"
import { format, json } from "./formatter"
import { focusFirstError, setReadOnly } from "./formutil"
import { getAutoSearch, getConfirmFunc, getErrorFunc, getLoadingFunc, getLocaleFunc, getMsgFunc, getResource, getUIService, hideLoading, LoadingService, showLoading } from "./input"
import { build as build2 } from "./metadata"
import { clone, equalAll, makeDiff, setAll, setValue } from "./reflect"
import {
  addParametersIntoUrl,
  buildMessage,
  Filter,
  getFields,
  handleSortEvent,
  handleToggle,
  initFilter,
  mergeFilter,
  Pagination,
  removeSortStatus,
  Searchable,
  SearchResult,
  SearchService,
  showPaging,
} from "./search"

export const enLocale = {
  id: "en-US",
  countryCode: "US",
  dateFormat: "M/d/yyyy",
  firstDayOfWeek: 1,
  decimalSeparator: ".",
  groupSeparator: ",",
  decimalDigits: 2,
  currencyCode: "USD",
  currencySymbol: "$",
  currencyPattern: 0,
}
export class RootComponent {
  constructor(protected resourceService: ResourceService, protected getLocale?: (profile?: string) => Locale) {
    if (resourceService) {
      this.resource = resourceService.resource()
    } else {
      this.resource = {} as any
    }
    this.currencySymbol = this.currencySymbol.bind(this)
    this.getCurrencyCode = this.getCurrencyCode.bind(this)
    this.back = this.back.bind(this)
  }
  resource: StringMap
  protected includeCurrencySymbol?: boolean
  protected running?: boolean
  protected form?: HTMLFormElement

  back(): void {
    window.history.back()
  }

  currencySymbol(): boolean | undefined {
    return this.includeCurrencySymbol
  }

  getCurrencyCode(): string | undefined {
    if (this.form) {
      const x = this.form.getAttribute("currency-code")
      if (x) {
        return x
      }
    }
    return undefined
  }
}

export interface ViewParameter {
  resource: ResourceService
  showError: (m: string, callback?: () => void, header?: string) => void
  getLocale?: (profile?: string) => Locale
  loading?: LoadingService
}
export interface ViewService<T, ID> {
  metadata?(): Attributes | undefined
  keys?(): string[]
  load(id: ID, ctx?: any): Promise<T | null>
}

export function getModelName(form?: HTMLFormElement): string {
  if (form) {
    const a = form.getAttribute("model-name")
    if (a && a.length > 0) {
      return a
    }
    const b = form.name
    if (b) {
      if (b.endsWith("Form")) {
        return b.substring(0, b.length - 4)
      }
      return b
    }
  }
  return ""
}
export function build(attributes: Attributes, ignoreDate?: boolean, name?: string): MetaModel {
  if (resources.cache && name && name.length > 0) {
    let meta: MetaModel = resources._cache[name]
    if (!meta) {
      meta = build2(attributes, ignoreDate)
      resources._cache[name] = meta
    }
    return meta
  } else {
    return build2(attributes, ignoreDate)
  }
}

export interface ActivatedRoute {
  /** An observable of the matrix parameters scoped to this route. */
  params: any
}
export class BaseViewComponent<T, ID> extends RootComponent {
  constructor(
    sv: ((id: ID, ctx?: any) => Promise<T>) | ViewService<T, ID>,
    param: ResourceService | ViewParameter,
    showError?: (m: string, callback?: () => void, header?: string) => void,
    getLocale?: (profile?: string) => Locale,
    loading?: LoadingService,
    ignoreDate?: boolean,
  ) {
    super(getResource(param), getLocaleFunc(param, getLocale))
    this.showError = getErrorFunc(param, showError)
    this.loading = getLoadingFunc(param, loading)
    if (sv) {
      if (typeof sv === "function") {
        this.loadData = sv
      } else {
        this.loadData = sv.load
        if (sv.metadata) {
          const m = sv.metadata()
          if (m) {
            // this.metadata = m;
            const meta = build(m, ignoreDate)
            this.keys = meta.keys
          }
        }
      }
    }
    this.getModelName = this.getModelName.bind(this)
    const n = this.getModelName()
    ;(this as any)[n] = {} as any
    this.load = this.load.bind(this)
    this.showModel = this.showModel.bind(this)
    this.getModel = this.getModel.bind(this)
    this.handleNotFound = this.handleNotFound.bind(this)
  }
  protected name?: string
  protected loading?: LoadingService
  protected showError: (m: string, callback?: () => void, header?: string) => void
  protected loadData?: (id: ID, ctx?: any) => Promise<T | null | undefined>
  // protected service?: ViewService<T, ID>;
  protected keys?: string[]
  // protected metadata?: Attributes;

  load(_id: ID, callback?: (m: T, showF: (model: T) => void) => void) {
    const id: any = _id
    if (id && id !== "") {
      this.running = true
      showLoading(this.loading)
      const com = this
      if (this.loadData) {
        this.loadData(id)
          .then((obj) => {
            if (obj) {
              if (callback) {
                callback(obj, com.showModel)
              } else {
                com.showModel(obj)
              }
            } else {
              com.handleNotFound(com.form)
            }
            com.running = false
            hideLoading(com.loading)
          })
          .catch((err) => {
            const data = err && err.response ? err.response : err
            if (data && data.status === 404) {
              com.handleNotFound(com.form)
            } else {
              error(err, com.resourceService.value, com.showError)
            }
            com.running = false
            hideLoading(com.loading)
          })
      }
    }
  }
  protected handleNotFound(form?: HTMLFormElement): void {
    if (form) {
      setReadOnly(form)
    }
    const msg = message(this.resourceService.value, "error_not_found", "error")
    this.showError(msg.message)
  }
  protected getModelName(): string {
    if (this.name && this.name.length > 0) {
      return this.name
    }
    const n = getModelName(this.form)
    if (n && n.length > 0) {
      return n
    } else {
      return "model"
    }
  }
  protected showModel(model: T): void {
    const name = this.getModelName()
    ;(this as any)[name] = model
  }
  getModel(): T {
    const name = this.getModelName()
    const model = (this as any)[name]
    return model
  }
}

export function getId<ID>(route: ActivatedRoute, keys?: string[], id?: ID): ID | null {
  if (id) {
    return id
  } else {
    return buildId(route, keys)
  }
}
export function buildId<ID>(route: ActivatedRoute, keys?: string[]): ID | null {
  if (!route) {
    return null
  }
  const param: any = route.params
  const obj = param._value
  if (!keys || keys.length === 0) {
    return obj["id"]
  }
  if (!(keys && keys.length > 0)) {
    return null
  }
  if (keys.length === 1) {
    const x = obj[keys[0]]
    if (x && x !== "") {
      return x
    }
    return obj["id"]
  }
  const id: any = {}
  for (const key of keys) {
    const v = obj[key]
    if (!v) {
      return null
    }
    id[key] = v
  }
  return id
}
export class ViewComponent<T, ID> extends BaseViewComponent<T, ID> {
  constructor(
    protected viewContainerRef: ViewContainerRef,
    protected route: ActivatedRoute,
    sv: ((id: ID, ctx?: any) => Promise<T>) | ViewService<T, ID>,
    param: ResourceService | ViewParameter,
    showError?: (m: string, callback?: () => void, header?: string) => void,
    getLocale?: (profile?: string) => Locale,
    loading?: LoadingService,
  ) {
    super(sv, param, showError, getLocale, loading)
    this.onInit = this.onInit.bind(this)
  }
  onInit() {
    this.form = initElement(this.viewContainerRef)
    const id: ID | null = buildId<ID>(this.route, this.keys)
    if (id) {
      this.load(id)
    }
  }
}
interface BaseUIService {
  getValue(el: HTMLInputElement, locale?: Locale, currencyCode?: string): string | number | boolean | null | undefined
  removeError(el: HTMLInputElement): void
}
export class BaseComponent extends RootComponent {
  constructor(resourceService: ResourceService, getLocale?: (profile?: string) => Locale, ui?: BaseUIService, protected loading?: LoadingService) {
    super(resourceService, getLocale)
    this.uiS1 = ui

    this.getModelName = this.getModelName.bind(this)
    this.includes = this.includes.bind(this)
    this.updateState = this.updateState.bind(this)
    this.updateStateFlat = this.updateStateFlat.bind(this)
  }
  private uiS1?: BaseUIService
  /*
  protected init() {
    try {
      this.loadData();
    } catch (err) {
      this.handleError(err);
    }
  }

  refresh() {
    try {
      this.loadData();
    } catch (err) {
      this.handleError(err);
    }
  }
  */
  protected getModelName(): string {
    const n = getModelName(this.form)
    if (!n || n.length === 0) {
      return "model"
    } else {
      return n
    }
    // return 'state';
  }
  includes(checkedList: Array<string> | string, v: string): boolean {
    return v && checkedList && Array.isArray(checkedList) ? checkedList.includes(v) : false
  }
  updateState(event: Event) {
    let locale: Locale = enLocale
    if (this.getLocale) {
      locale = this.getLocale()
    }
    this.updateStateFlat(event, locale)
  }
  updateStateFlat(e: Event, locale?: Locale) {
    if (!locale) {
      locale = enLocale
    }
    const ctrl = e.currentTarget as HTMLInputElement
    let modelName: string | null = this.getModelName()
    if (!modelName && ctrl.form) {
      modelName = ctrl.form.getAttribute("model-name")
    }
    const type = ctrl.getAttribute("type")
    const isPreventDefault = type && (["checkbox", "radio"].indexOf(type.toLowerCase()) >= 0 ? false : true)
    if (isPreventDefault) {
      e.preventDefault()
    }
    if (this.uiS1 && ctrl.nodeName === "SELECT" && ctrl.value && ctrl.classList.contains("invalid")) {
      this.uiS1.removeError(ctrl)
    }
    if (modelName) {
      const ex = (this as any)[modelName]
      const dataField = ctrl.getAttribute("data-field")
      const field = dataField ? dataField : ctrl.name
      if (type && type.toLowerCase() === "checkbox") {
        const v = valueOfCheckbox(ctrl)
        setValue(ex, field, v)
      } else {
        let v = ctrl.value
        if (this.uiS1) {
          v = this.uiS1.getValue(ctrl, locale) as string
        }
        // tslint:disable-next-line:triple-equals
        if (ctrl.value != v) {
          setValue(ex, field, v)
        }
      }
    }
  }
}
export function valueOfCheckbox(ctrl: HTMLInputElement): string | number | boolean {
  const ctrlOnValue = ctrl.getAttribute("data-on-value")
  const ctrlOffValue = ctrl.getAttribute("data-off-value")
  if (ctrlOnValue && ctrlOffValue) {
    const onValue = ctrlOnValue ? ctrlOnValue : true
    const offValue = ctrlOffValue ? ctrlOffValue : false
    return ctrl.checked === true ? onValue : offValue
  } else {
    return ctrl.checked === true
  }
}
export class MessageComponent extends BaseComponent {
  constructor(resourceService: ResourceService, getLocale?: (profile?: string) => Locale, loading?: LoadingService, ui?: UIService) {
    super(resourceService, getLocale, ui, loading)
    this.showMessage = this.showMessage.bind(this)
    this.showError = this.showError.bind(this)
    this.hideMessage = this.hideMessage.bind(this)
  }
  message = ""
  alertClass = ""

  showMessage(msg: string, field?: string): void {
    this.alertClass = "alert alert-info"
    this.message = msg
  }
  showError(msg: string, field?: string): void {
    this.alertClass = "alert alert-danger"
    this.message = msg
  }
  hideMessage(field?: string): void {
    this.alertClass = ""
    this.message = ""
  }
}

export interface EditParameter {
  resource: ResourceService
  showMessage: (msg: string, option?: string) => void
  showError: (m: string, callback?: () => void, header?: string) => void
  confirm: (m2: string, yesCallback?: () => void, header?: string, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void
  ui?: UIService
  getLocale?: (profile?: string) => Locale
  loading?: LoadingService
  // status?: EditStatusConfig;
}
export interface GenericService<T, ID, R> {
  metadata?(): Attributes | undefined
  keys?(): string[]
  load(id: ID, ctx?: any): Promise<T | null>
  patch?(obj: Partial<T>, ctx?: any): Promise<R>
  create(obj: T, ctx?: any): Promise<R>
  update(obj: T, ctx?: any): Promise<R>
  delete?(id: ID, ctx?: any): Promise<number>
}
export function handleVersion<T>(obj: T, version?: string): void {
  if (obj && version && version.length > 0) {
    const v = (obj as any)[version]
    if (v && typeof v === "number") {
      ;(obj as any)[version] = v + 1
    } else {
      ;(obj as any)[version] = 1
    }
  }
}
export class BaseEditComponent<T, ID> extends BaseComponent {
  constructor(
    protected service: GenericService<T, ID, number | number | T | ErrorMessage[]>,
    param: ResourceService | EditParameter,
    showMessage?: (msg: string, option?: string) => void,
    showError?: (m: string, callback?: () => void, header?: string) => void,
    confirm?: (m2: string, yesCallback?: () => void, header?: string, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void,
    getLocale?: (profile?: string) => Locale,
    uis?: UIService,
    loading?: LoadingService,
    // status?: EditStatusConfig,
    patchable?: boolean,
    ignoreDate?: boolean,
    backOnSaveSuccess?: boolean,
  ) {
    super(getResource(param), getLocaleFunc(param, getLocale), getUIService(param, uis), getLoadingFunc(param, loading))
    this.ui = getUIService(param, uis)
    this.showError = getErrorFunc(param, showError)
    this.showMessage = getMsgFunc(param, showMessage)
    this.confirm = getConfirmFunc(param, confirm)
    /*
    this.status = getEditStatusFunc(param, status);
    if (!this.status) {
      this.status = createEditStatus(this.status);
    }
    */
    if (service.metadata) {
      const metadata = service.metadata()
      if (metadata) {
        const meta = build(metadata, ignoreDate)
        this.keys = meta.keys
        this.version = meta.version
        this.metadata = metadata
        this.metamodel = meta
      }
    }
    if (!this.keys && service.keys) {
      const k = service.keys()
      if (k) {
        this.keys = k
      }
    }
    if (!this.keys) {
      this.keys = []
    }
    if (patchable === false) {
      this.patchable = patchable
    }
    if (backOnSaveSuccess === false) {
      this.backOnSuccess = backOnSaveSuccess
    }
    this.insertSuccessMsg = this.resourceService.value("msg_save_success")
    this.updateSuccessMsg = this.resourceService.value("msg_save_success")

    this.getModelName = this.getModelName.bind(this)
    const n = this.getModelName()
    ;(this as any)[n] = {} as any
    this.load = this.load.bind(this)
    this.resetState = this.resetState.bind(this)
    this.handleNotFound = this.handleNotFound.bind(this)
    this.createModel = this.createModel.bind(this)
    this.formatModel = this.formatModel.bind(this)
    this.showModel = this.showModel.bind(this)
    this.getModel = this.getModel.bind(this)
    this.getRawModel = this.getRawModel.bind(this)

    this.create = this.create.bind(this)
    this.save = this.save.bind(this)
    this.onSave = this.onSave.bind(this)
    this.confirm = this.confirm.bind(this)
    this.validate = this.validate.bind(this)
    this.doSave = this.doSave.bind(this)
    this.succeed = this.succeed.bind(this)
    this.successMessage = this.successMessage.bind(this)
    this.postSave = this.postSave.bind(this)
    this.handleDuplicateKey = this.handleDuplicateKey.bind(this)
    // this.addable = true;
  }
  protected name?: string
  // protected status: EditStatusConfig;
  protected showMessage: (msg: string, option?: string) => void
  protected showError: (m: string, callback?: () => void, header?: string) => void
  protected confirm: (m2: string, yesCallback?: () => void, header?: string, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void
  protected ui?: UIService
  protected metadata?: Attributes
  protected metamodel?: MetaModel
  protected keys?: string[]
  protected version?: string

  newMode?: boolean
  setBack?: boolean
  patchable = true
  backOnSuccess = true
  protected orginalModel?: T

  // addable?: boolean;
  // readOnly?: boolean;
  // deletable?: boolean;

  insertSuccessMsg: string
  updateSuccessMsg: string
  load(_id: ID | null | undefined, callback?: (m: T, showM: (m2: T) => void) => void) {
    const id: any = _id
    if (id && id !== "") {
      const com = this
      this.service
        .load(id)
        .then((obj) => {
          if (!obj) {
            com.handleNotFound(com.form)
          } else {
            com.newMode = false
            com.orginalModel = clone(obj)

            com.formatModel(obj)
            if (callback) {
              callback(obj, com.showModel)
            } else {
              com.showModel(obj)
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
            error(err, com.resourceService.value, com.showError)
          }
          com.running = false
          hideLoading(com.loading)
        })
    } else {
      this.newMode = true
      this.orginalModel = undefined
      const obj = this.createModel()
      if (callback) {
        callback(obj, this.showModel)
      } else {
        this.showModel(obj)
      }
    }
  }
  protected resetState(newMod: boolean, model: T, originalModel: T | undefined) {
    this.newMode = newMod
    this.orginalModel = originalModel
    this.formatModel(model)
    this.showModel(model)
  }
  protected handleNotFound(form?: HTMLFormElement): void {
    const msg = message(this.resourceService.value, "error_not_found", "error")
    if (this.form) {
      setReadOnly(form)
    }
    this.showError(msg.message)
  }
  protected formatModel(obj: T): void {
    if (this.metamodel) {
      let locale: Locale = enLocale
      if (this.getLocale) {
        locale = this.getLocale()
      }
      format(obj, this.metamodel, locale, this.getCurrencyCode(), this.currencySymbol())
    }
  }
  protected getModelName(): string {
    if (this.name && this.name.length > 0) {
      return this.name
    }
    const n = getModelName(this.form)
    if (!n || n.length === 0) {
      return "model"
    } else {
      return n
    }
  }
  protected showModel(model: T): void {
    const n = this.getModelName()
    ;(this as any)[n] = model
  }
  getRawModel(): T {
    const name = this.getModelName()
    const model = (this as any)[name]
    return model
  }
  getModel(): T {
    const name = this.getModelName()
    const model = (this as any)[name]
    const obj = clone(model)
    if (this.metamodel) {
      let locale: Locale = enLocale
      if (this.getLocale) {
        locale = this.getLocale()
      }
      json(obj, this.metamodel, locale, this.getCurrencyCode())
    }
    return obj
  }
  protected createModel(): T {
    if (this.service.metadata) {
      const metadata = this.service.metadata()
      if (metadata) {
        const obj = createModel<T>(metadata)
        return obj
      }
    }
    const obj2: any = {}
    return obj2
  }

  create(event?: Event): void {
    if (!this.form && event && event.currentTarget) {
      const ctrl = event.currentTarget as HTMLInputElement
      if (ctrl.form) {
        this.form = ctrl.form
      }
    }
    this.resetState(true, this.createModel(), undefined)
    const u = this.ui
    const f = this.form
    if (u && f) {
      setTimeout(() => {
        u.removeFormError(f)
      }, 100)
    }
  }
  save(event?: Event, isBack?: boolean): void {
    if (!this.form && event && event.currentTarget) {
      this.form = (event.currentTarget as HTMLInputElement).form as any
    }
    if (isBack) {
      this.onSave(isBack)
    } else {
      this.onSave(this.backOnSuccess)
    }
  }

  onSave(isBack?: boolean) {
    const r = this.resourceService
    if (this.running) {
      return
    }
    const com = this
    const obj = com.getModel()
    if (!this.newMode) {
      const diffObj = makeDiff(this.orginalModel, obj, this.keys, this.version)
      const l = Object.keys(diffObj as any).length
      if (l === 0) {
        this.showMessage(r.value("msg_no_change"))
      } else {
        com.validate(obj, () => {
          const msg = message(r.value, "msg_confirm_save", "confirm", "yes", "no")
          this.confirm(
            msg.message,
            () => {
              com.doSave(obj, diffObj, isBack)
            },
            msg.title,
            msg.no,
            msg.yes,
          )
        })
      }
    } else {
      com.validate(obj, () => {
        const msg = message(r.value, "msg_confirm_save", "confirm", "yes", "no")
        this.confirm(
          msg.message,
          () => {
            com.doSave(obj, obj, isBack)
          },
          msg.title,
          msg.no,
          msg.yes,
        )
      })
    }
  }
  validate(obj: T, callback: (u?: T) => void): void {
    if (this.ui) {
      let locale: Locale = enLocale
      if (this.getLocale) {
        locale = this.getLocale()
      }
      const valid = this.ui.validateForm(this.form, locale)
      if (valid) {
        callback(obj)
      }
    } else {
      callback(obj)
    }
  }
  doSave(obj: T, body?: Partial<T>, isBack?: boolean) {
    this.running = true
    showLoading(this.loading)
    const isBackO = isBack == null || isBack === undefined ? this.backOnSuccess : isBack
    const com = this
    let m: T | Partial<T> = obj
    let fn = this.newMode ? this.service.create : this.service.update
    if (!this.newMode) {
      if (this.patchable === true && this.service.patch && body && Object.keys(body).length > 0) {
        m = body
        fn = this.service.patch
      }
    }
    fn(m as any)
      .then((result) => {
        com.postSave(result, obj, isBackO)
        com.running = false
        hideLoading(com.loading)
      })
      .then((err) => {
        error(err, com.resourceService.value, com.showError)
        com.running = false
        hideLoading(com.loading)
      })
  }
  protected succeed(msg: string, origin: T, isBack?: boolean, model?: T): void {
    if (model) {
      this.newMode = false
      if (model && this.setBack) {
        this.resetState(false, model, clone(model))
      } else {
        handleVersion(origin, this.version)
      }
    } else {
      handleVersion(origin, this.version)
    }
    const isBackO = isBack == null || isBack === undefined ? this.backOnSuccess : isBack
    this.showMessage(msg)
    if (isBackO) {
      this.back()
    }
  }
  protected successMessage(msg: string) {
    this.showMessage(msg)
  }
  protected fail(result: ErrorMessage[]): void {
    const f = this.form
    const u = this.ui
    if (u && f) {
      const unmappedErrors = u.showFormError(f, result)
      focusFirstError(f)
      if (unmappedErrors && unmappedErrors.length > 0) {
        if (u && u.buildErrorMessage) {
          const msg = u.buildErrorMessage(unmappedErrors)
          this.showError(msg)
        } else {
          this.showError(unmappedErrors[0].field + " " + unmappedErrors[0].code + " " + unmappedErrors[0].message)
        }
      }
    } else {
      const t = this.resourceService.value("error")
      if (result.length > 0) {
        this.showError(result[0].field + " " + result[0].code + " " + result[0].message)
      } else {
        this.showError(t)
      }
    }
  }
  protected postSave(res: number | string | T | ErrorMessage[], origin: T, isPatch: boolean, backOnSave?: boolean): void {
    this.running = false
    hideLoading(this.loading)
    // const st = this.status;
    const newMod = this.newMode
    const successMsg = newMod ? this.insertSuccessMsg : this.updateSuccessMsg
    const x: any = res
    const r = this.resourceService
    if (Array.isArray(x)) {
      this.fail(x)
    } else if (!isNaN(x)) {
      if (x > 0) {
        this.succeed(successMsg, origin, backOnSave)
      } else {
        if (newMod && x <= 0) {
          this.handleDuplicateKey()
        } else if (!newMod && x === 0) {
          this.handleNotFound()
        } else {
          this.showError(r.value("error_version"))
        }
      }
    } else {
      const result: T = x
      if (isPatch) {
        const keys = Object.keys(result as any)
        const a: any = origin
        for (const k of keys) {
          a[k] = (result as any)[k]
        }
        this.succeed(successMsg, a, backOnSave)
      } else {
        this.succeed(successMsg, origin, backOnSave, result)
      }
    }
  }
  protected handleDuplicateKey(result?: T): void {
    const msg = message(this.resourceService.value, "error_duplicate_key", "error")
    this.showError(msg.message)
  }
}
export class EditComponent<T, ID> extends BaseEditComponent<T, ID> {
  constructor(
    protected viewContainerRef: ViewContainerRef,
    protected route: ActivatedRoute,
    service: GenericService<T, ID, number | T | ErrorMessage[]>,
    param: ResourceService | EditParameter,
    showMessage?: (msg: string, option?: string) => void,
    showError?: (m: string, callback?: () => void, header?: string) => void,
    confirm?: (m2: string, yesCallback?: () => void, header?: string, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void,
    getLocale?: (profile?: string) => Locale,
    uis?: UIService,
    loading?: LoadingService,
    patchable?: boolean,
    ignoreDate?: boolean,
    backOnSaveSuccess?: boolean,
  ) {
    super(service, param, showMessage, showError, confirm, getLocale, uis, loading, patchable, ignoreDate, backOnSaveSuccess)
    this.onInit = this.onInit.bind(this)
  }
  onInit() {
    const fi = this.ui ? this.ui.registerEvents : undefined
    this.form = initElement(this.viewContainerRef, fi)
    const id: ID | null = buildId<ID>(this.route, this.keys)
    this.load(id)
  }
}

export interface SearchParameter {
  resource: ResourceService
  showMessage: (msg: string, option?: string) => void
  showError: (m: string, callback?: () => void, h?: string) => void
  ui?: UIService
  getLocale?: (profile?: string) => Locale
  loading?: LoadingService
  auto?: boolean
}
export function more(com: Pagination): void {
  com.append = true
  if (!com.page) {
    com.page = 1
  } else {
    com.page = com.page + 1
  }
}
export function optimizeFilter<S extends Filter>(obj: S, searchable: Searchable, fields?: string[]): S {
  obj.fields = fields
  if (searchable.page && searchable.page > 1) {
    obj.page = searchable.page
  } else {
    delete obj.page
  }
  obj.limit = searchable.limit
  if (searchable.appendMode && searchable.initLimit !== searchable.limit) {
    obj.firstLimit = searchable.initLimit
  } else {
    delete obj.firstLimit
  }
  if (searchable.sortField && searchable.sortField.length > 0) {
    obj.sort = searchable.sortType === "-" ? "-" + searchable.sortField : searchable.sortField
  } else {
    delete obj.sort
  }
  return obj
}
export function append<T>(list?: T[], results?: T[]): T[] {
  if (list && results) {
    for (const obj of results) {
      list.push(obj)
    }
  }
  if (!list) {
    return []
  }
  return list
}
export function handleAppend<T>(com: Pagination, list: T[], limit?: number, nextPageToken?: string): void {
  if (!limit || limit === 0) {
    com.appendable = false
  } else {
    if (!nextPageToken || nextPageToken.length === 0 || list.length < limit) {
      com.appendable = false
    } else {
      com.appendable = true
    }
  }
  if (!list || list.length === 0) {
    com.appendable = false
  }
}
export function formatResults<T>(
  results: T[],
  pageIndex?: number,
  pageSize?: number,
  initPageSize?: number,
  sequenceNo?: string,
  ft?: (oj: T, lc?: Locale) => T,
  lc?: Locale,
): void {
  if (results && results.length > 0) {
    let hasSequencePro = false
    if (ft) {
      if (sequenceNo && sequenceNo.length > 0) {
        for (const obj of results) {
          if ((obj as any)[sequenceNo]) {
            hasSequencePro = true
          }
          ft(obj, lc)
        }
      } else {
        for (const obj of results) {
          ft(obj, lc)
        }
      }
    } else if (sequenceNo && sequenceNo.length > 0) {
      for (const obj of results) {
        if ((obj as any)[sequenceNo]) {
          hasSequencePro = true
        }
      }
    }
    if (sequenceNo && sequenceNo.length > 0 && !hasSequencePro) {
      if (!pageIndex) {
        pageIndex = 1
      }
      if (pageSize) {
        if (!initPageSize) {
          initPageSize = pageSize
        }
        if (pageIndex <= 1) {
          for (let i = 0; i < results.length; i++) {
            ;(results[i] as any)[sequenceNo] = i - pageSize + pageSize * pageIndex + 1
          }
        } else {
          for (let i = 0; i < results.length; i++) {
            ;(results[i] as any)[sequenceNo] = i - pageSize + pageSize * pageIndex + 1 - (pageSize - initPageSize)
          }
        }
      } else {
        for (let i = 0; i < results.length; i++) {
          ;(results[i] as any)[sequenceNo] = i + 1
        }
      }
    }
  }
}
export function reset(com: Searchable): void {
  removeSortStatus(com.sortTarget)
  com.sortTarget = undefined
  com.sortField = undefined
  com.append = false
  com.page = 1
}
export function changePageSize(com: Pagination, size: number): void {
  com.initLimit = size
  com.limit = size
  com.page = 1
}
export function changePage(com: Pagination, pageIndex: number, pageSize: number): void {
  com.page = pageIndex
  com.limit = pageSize
  com.append = false
}
export class BaseSearchComponent<T, S extends Filter> extends BaseComponent {
  constructor(
    sv: ((s: S, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<T>>) | SearchService<T, S>,
    param: ResourceService | SearchParameter,
    showMessage?: (msg: string, option?: string) => void,
    showError?: (m: string, callback?: () => void, header?: string) => void,
    getLocale?: (profile?: string) => Locale,
    uis?: UIService,
    loading?: LoadingService,
  ) {
    super(getResource(param), getLocaleFunc(param, getLocale), getUIService(param, uis), getLoadingFunc(param, loading))
    this.filter = {} as any

    if (sv) {
      if (typeof sv === "function") {
        this.searchFn = sv
      } else {
        this.searchFn = sv.search
        // this.service = sv;
        if (sv.keys) {
          this.keys = sv.keys()
        }
      }
    }
    this.ui = getUIService(param, uis)
    this.showError = getErrorFunc(param, showError)
    this.showMessage = getMsgFunc(param, showMessage)

    this.toggleFilter = this.toggleFilter.bind(this)
    this.mergeFilter = this.mergeFilter.bind(this)
    this.load = this.load.bind(this)
    this.getSearchForm = this.getSearchForm.bind(this)
    this.setSearchForm = this.setSearchForm.bind(this)

    this.setFilter = this.setFilter.bind(this)
    this.getOriginalFilter = this.getOriginalFilter.bind(this)
    this.getFilter = this.getFilter.bind(this)
    this.getFields = this.getFields.bind(this)

    this.pageSizeChanged = this.pageSizeChanged.bind(this)
    this.search = this.search.bind(this)

    this.resetAndSearch = this.resetAndSearch.bind(this)
    this.doSearch = this.doSearch.bind(this)
    this.callSearch = this.callSearch.bind(this)
    this.validateSearch = this.validateSearch.bind(this)
    this.showResults = this.showResults.bind(this)
    this.setList = this.setList.bind(this)
    this.getList = this.getList.bind(this)
    this.sort = this.sort.bind(this)
    this.showMore = this.showMore.bind(this)
    this.pageChanged = this.pageChanged.bind(this)
    const rs = this.resourceService
    this.deleteHeader = rs.value("msg_delete_header")
    this.deleteConfirm = rs.value("msg_delete_confirm")
    this.deleteFailed = rs.value("msg_delete_failed")
    this.pageChanged = this.pageChanged.bind(this)
  }
  protected showMessage: (msg: string, option?: string) => void
  protected showError: (m: string, callback?: () => void, header?: string) => void
  protected ui?: UIService
  protected searchFn?: (s: S, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<T>>
  // protected service: SearchService<T, S>;
  // Pagination
  view?: string
  nextPageToken?: string
  initPageSize = 20
  limit = 20
  page = 1
  totalItems: number = 0
  // pageTotal?: number;
  showPaging?: boolean
  append?: boolean
  appendMode?: boolean
  appendable?: boolean
  // Sortable
  sortField?: string
  sortType?: string
  sortTarget?: HTMLElement // HTML element

  keys?: string[]
  format?: (obj: T, locale?: Locale) => T
  fields?: string[]
  initFields?: boolean
  sequenceNo = "sequenceNo"
  triggerSearch?: boolean
  tmpPage?: number
  loadTime?: Date
  loadPage = 1

  filter: S
  list?: T[]
  excluding?: string[] | number[]
  hideFilter?: boolean
  ignoreUrlParam?: boolean

  pageMaxSize = 7
  limits: number[] = [10, 20, 40, 60, 100, 200, 400, 1000]

  chkAll?: HTMLInputElement
  // viewable = true;
  // addable = true;
  // editable = true;
  // approvable?: boolean;
  // deletable?: boolean;

  deleteHeader: string
  deleteConfirm: string
  deleteFailed: string

  changeView(v: string, event?: any): void {
    this.view = v
  }
  toggleFilter(event: any): void {
    const x = !this.hideFilter
    handleToggle(event.target as HTMLInputElement, !x)
    this.hideFilter = x
  }
  mergeFilter(obj: S, arrs?: string[] | any, b?: S): S {
    const s = mergeFilter(obj, b, this.limits, arrs)
    return s
  }
  load(s: S, autoSearch: boolean): void {
    this.loadTime = new Date()
    const obj2 = initFilter(s, this)
    this.loadPage = this.page
    this.setFilter(obj2)
    const com = this
    if (autoSearch) {
      setTimeout(() => {
        com.doSearch(true)
      }, 0)
    }
  }
  getModelName(): string {
    return "filter"
  }
  setSearchForm(form: HTMLFormElement): void {
    this.form = form
  }

  getSearchForm(): HTMLFormElement | undefined {
    return this.form
  }

  setFilter(obj: S): void {
    this.filter = obj
  }

  getFilter(): S {
    let locale: Locale | undefined
    if (this.getLocale) {
      locale = this.getLocale()
    }
    if (!locale) {
      locale = enLocale
    }
    let obj = this.filter
    const sf = this.getSearchForm()
    if (this.ui && sf) {
      const obj2 = this.ui.decodeFromForm(sf, locale, this.getCurrencyCode())
      obj = obj2 ? obj2 : {}
    }
    const obj3 = optimizeFilter(obj, this, this.getFields())
    /*
    if (this.excluding) {
      obj3.excluding = this.excluding
    }
    if (this.keys && this.keys.length === 1) {
      const l = this.getList();
      if (l && l.length > 0) {
        const refId = l[l.length - 1][this.keys[0]];
        if (refId) {
          obj3.refId = '' + refId;
        }
      }
    }
    */
    return obj3
  }
  getOriginalFilter(): S {
    return this.filter
  }

  getFields(): string[] | undefined {
    if (this.fields) {
      return this.fields
    }
    if (!this.initFields) {
      if (this.getSearchForm()) {
        this.fields = getFields(this.getSearchForm())
      }
      this.initFields = true
    }
    return this.fields
  }
  onPageSizeChanged(event: Event): void {
    const ctrl = event.currentTarget as HTMLInputElement
    this.pageSizeChanged(Number(ctrl.value), event)
  }
  pageSizeChanged(size: number, event?: Event): void {
    changePageSize(this, size)
    this.tmpPage = 1
    this.doSearch()
  }
  clearQ = () => {
    this.filter.q = ""
  }
  search(event: Event): void {
    if (event && !this.getSearchForm()) {
      const f = (event.currentTarget as HTMLInputElement).form
      if (f) {
        this.setSearchForm(f)
      }
    }
    this.resetAndSearch()
  }
  resetAndSearch() {
    if (this.running) {
      this.triggerSearch = true
      return
    }
    reset(this)
    this.tmpPage = 1
    this.doSearch()
  }
  doSearch(isFirstLoad?: boolean) {
    const listForm = this.getSearchForm()
    if (listForm && this.ui) {
      this.ui.removeFormError(listForm)
    }
    const s: S = this.getFilter()
    const com = this
    this.validateSearch(s, () => {
      if (com.running) {
        return
      }
      com.running = true
      showLoading(this.loading)
      if (!this.ignoreUrlParam) {
        addParametersIntoUrl(s, isFirstLoad)
      }
      com.callSearch(s)
    })
  }
  callSearch(ft: S) {
    const s = clone(ft)
    let page = this.page
    if (!page || page < 1) {
      page = 1
    }
    // let offset: number | undefined;
    /*
    if (ft.limit) {
      if (ft.firstLimit && ft.firstLimit > 0) {
        offset = ft.limit * (page - 2) + ft.firstLimit;
      } else {
        offset = ft.limit * (page - 1);
      }
    }
      */
    const limit = page <= 1 && ft.firstLimit && ft.firstLimit > 0 ? ft.firstLimit : ft.limit
    const next = this.nextPageToken && this.nextPageToken.length > 0 ? this.nextPageToken : page
    const fields = ft.fields
    delete ft["page"]
    delete ft["fields"]
    delete ft["limit"]
    delete ft["firstLimit"]
    const com = this
    if (this.searchFn) {
      this.searchFn(ft, limit, next, fields)
        .then((sr) => {
          com.showResults(s, sr)
          com.running = false
          hideLoading(com.loading)
        })
        .catch((err) => {
          error(err, com.resourceService.value, com.showError)
          com.running = false
          hideLoading(com.loading)
        })
    }
  }
  validateSearch(ft: S, callback: () => void): void {
    let valid = true
    const listForm = this.getSearchForm()
    if (listForm) {
      let locale: Locale = enLocale
      if (this.getLocale) {
        locale = this.getLocale()
      }
      if (this.ui && this.ui.validateForm) {
        valid = this.ui.validateForm(listForm, locale)
      }
    }
    if (valid === true) {
      callback()
    }
  }
  searchError(response: any): void {
    if (this.tmpPage) {
      this.page = this.tmpPage
    }
    error(response, this.resourceService.value, this.showError)
  }
  showResults(s: S, sr: SearchResult<T>): void {
    const com = this
    const results = sr.list
    if (results != null && results.length > 0) {
      let locale: Locale = enLocale
      if (this.getLocale) {
        locale = this.getLocale()
      }
      formatResults(results, this.page, this.limit, this.initPageSize, this.sequenceNo, this.format, locale)
    }
    const appendMode = com.appendMode
    com.page = s.page && s.page >= 1 ? s.page : 1
    if (appendMode) {
      let limit = s.limit
      if ((!s.page || s.page <= 1) && s.firstLimit && s.firstLimit > 0) {
        limit = s.firstLimit
      }
      com.nextPageToken = sr.nextPageToken
      handleAppend(com, sr.list, limit, sr.nextPageToken)
      if (this.append && s.page && s.page > 1) {
        append(this.getList(), results)
      } else {
        this.setList(results)
      }
    } else {
      showPaging(com, sr.list, s.limit, sr.total)
      com.setList(results)
      com.tmpPage = s.page
      if (s.limit) {
        this.showMessage(buildMessage(this.resourceService.resource(), s.page, s.limit, sr.list, sr.total))
      }
    }
    this.running = false
    hideLoading(com.loading)
    if (this.triggerSearch) {
      this.triggerSearch = false
      this.resetAndSearch()
    }
  }

  setList(list: T[]): void {
    this.list = list
  }
  getList(): T[] | undefined {
    return this.list
  }

  chkAllOnClick(event: Event, selected: string): void {
    const target = event.currentTarget as HTMLInputElement
    const isChecked = target.checked
    const list = this.getList()
    setAll(list, selected, isChecked)
    this.handleItemOnChecked(list)
  }
  itemOnClick(event: Event, selected: string): void {
    const list = this.getList()
    if (this.chkAll != null) {
      this.chkAll.checked = equalAll(list, selected, true)
    }
    this.handleItemOnChecked(list)
  }
  handleItemOnChecked(list?: any[]) {}

  sort(event: Event): void {
    handleSortEvent(event, this)
    if (!this.appendMode) {
      this.doSearch()
    } else {
      this.resetAndSearch()
    }
  }

  showMore(event?: Event): void {
    this.tmpPage = this.page
    more(this)
    this.doSearch()
  }

  pageChanged(event?: any): void {
    if (this.loadTime) {
      const now = new Date()
      const d = Math.abs(this.loadTime.getTime() - now.getTime())
      if (d < 610) {
        if (event) {
          if (event.page && event.itemsPerPage && event.page !== this.loadPage) {
            changePage(this, this.loadPage, event.itemsPerPage)
          }
        }
        return
      }
    }
    changePage(this, event.page, event.itemsPerPage)
    this.doSearch()
  }
}
export class SearchComponent<T, S extends Filter> extends BaseSearchComponent<T, S> {
  constructor(
    protected viewContainerRef: ViewContainerRef,
    sv: ((s: S, ctx?: any) => Promise<SearchResult<T>>) | SearchService<T, S>,
    param: ResourceService | SearchParameter,
    showMessage?: (msg: string, option?: string) => void,
    showError?: (m: string, callback?: () => void, header?: string) => void,
    getLocale?: (profile?: string) => Locale,
    uis?: UIService,
    loading?: LoadingService,
  ) {
    super(sv, param, showMessage, showError, getLocale, uis, loading)
    this.autoSearch = getAutoSearch(param)
    this.onInit = this.onInit.bind(this)
  }
  protected autoSearch = true
  onInit() {
    const fi = this.ui ? this.ui.registerEvents : undefined
    this.form = initElement(this.viewContainerRef, fi)
    const s = this.mergeFilter(buildFromUrl<S>())
    this.load(s, this.autoSearch)
  }
}

export interface DiffParameter {
  resource: ResourceService
  showMessage: (msg: string, option?: string) => void
  showError: (m: string, callback?: () => void, header?: string) => void
  loading?: LoadingService
  // status?: DiffStatusConfig;
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
export class BaseDiffApprComponent<T, ID> {
  constructor(
    protected service: DiffApprService<T, ID>,
    param: ResourceService | DiffParameter,
    showMessage?: (msg: string, option?: string) => void,
    showError?: (m: string, callback?: () => void, header?: string) => void,
    loading?: LoadingService,
  ) {
    this.resourceService = getResource(param)
    this.resource = this.resourceService.resource()
    this.loading = getLoadingFunc(param, loading)
    this.showError = getErrorFunc(param, showError)
    this.showMessage = getMsgFunc(param, showMessage)
    /*
    this.status = getDiffStatusFunc(param, status);
    if (!this.status) {
      this.status = createDiffStatus(this.status);
    }
    */
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
  // protected status: DiffStatusConfig;
  protected showMessage: (msg: string, option?: string) => void
  protected showError: (m: string, callback?: () => void, header?: string) => void
  protected resourceService: ResourceService
  protected loading?: LoadingService
  resource: StringMap
  protected running?: boolean
  protected form?: HTMLFormElement
  protected id?: ID
  origin?: T
  value: T
  disabled?: boolean

  back(): void {
    window.history.back()
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
            error(err, com.resourceService.resource(), com.showError)
          }
          com.running = false
          hideLoading(com.loading)
        })
    }
  }
  protected handleNotFound(form?: HTMLFormElement) {
    this.disabled = true
    const r = this.resourceService.resource()
    this.showError(r["error_not_found"])
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
    // const st = this.status;
    const r = this.resourceService.resource()
    if (this.id) {
      this.running = true
      showLoading(this.loading)
      this.service
        .approve(this.id)
        .then((status) => {
          if (typeof status === "number" && status > 0) {
            com.showMessage(r["msg_approve_success"])
          } else if (status === 0) {
            com.handleNotFound(com.form)
          } else {
            com.showMessage(r["msg_approve_version_error"])
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
    // const st = this.status;
    const r = this.resourceService.resource()
    if (this.id) {
      this.running = true
      showLoading(this.loading)
      this.service
        .reject(this.id)
        .then((status) => {
          if (typeof status === "number" && status > 0) {
            com.showMessage(r["msg_reject_success"])
          } else if (status === 0) {
            com.handleNotFound(com.form)
          } else {
            com.showMessage(r["msg_approve_version_error"])
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
    const r = this.resourceService.resource()
    const data = err && err.response ? err.response : err
    if (data && (data.status === 404 || data.status === 409)) {
      if (data.status === 404) {
        this.handleNotFound()
      } else {
        this.showMessage(r["msg_approve_version_error"])
      }
    } else {
      error(err, r, this.showError)
    }
  }
  protected end() {
    this.disabled = true
    this.running = false
    hideLoading(this.loading)
  }
}
export class DiffApprComponent<T, ID> extends BaseDiffApprComponent<T, ID> {
  constructor(
    protected viewContainerRef: ViewContainerRef,
    protected route: ActivatedRoute,
    service: DiffApprService<T, ID>,
    param: ResourceService | DiffParameter,
    showMessage?: (msg: string, option?: string) => void,
    showError?: (m: string, callback?: () => void, header?: string) => void,
    loading?: LoadingService,
  ) {
    super(service, param, showMessage, showError, loading)
    this.onInit = this.onInit.bind(this)
  }
  onInit() {
    this.form = initElement(this.viewContainerRef)
    const id: ID | null = buildId<ID>(this.route, this.service.keys())
    if (id) {
      this.load(id)
    }
  }
}
