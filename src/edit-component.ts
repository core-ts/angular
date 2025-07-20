import { ViewContainerRef } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { initElement } from "./angular"
import { buildId, enLocale, error, hideLoading, showLoading } from "./common"
import { Attributes, ErrorMessage, LoadingService, Locale, MetaModel, resources, StringMap, UIService } from "./core"
import { createModel } from "./edit"
import { format, json } from "./formatter"
import { focusFirstError, setReadOnly } from "./formutil"
import { build as build2 } from "./metadata"
import { clone, makeDiff } from "./reflect"

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

export interface EditParameter {
  showMessage: (msg: string, option?: string) => void
  showError: (m: string, callback?: () => void, header?: string) => void
  confirm: (m2: string, yesCallback?: () => void, header?: string, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void
  ui?: UIService
  getLocale?: (profile?: string) => Locale
  loading?: LoadingService
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
export class BaseEditComponent<T, ID> {
  constructor(
    protected service: GenericService<T, ID, number | number | T | ErrorMessage[]>,
    public resource: StringMap,
    protected showMessage: (msg: string, option?: string) => void,
    protected showError: (m: string, callback?: () => void, header?: string) => void,
    protected confirm: (m2: string, yesCallback?: () => void, header?: string, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void,
    protected getLocale?: (profile?: string) => Locale,
    protected ui?: UIService,
    protected loading?: LoadingService,
    // status?: EditStatusConfig,
    patchable?: boolean,
    ignoreDate?: boolean,
    backOnSaveSuccess?: boolean,
  ) {
    // super(resource, getLocaleFunc(param, getLocale), getLoadingFunc(param, loading))
    // this.ui = getUIService(param, uis)
    // this.showError = getErrorFunc(param, showError)
    // this.showMessage = getMsgFunc(param, showMessage)
    // this.confirm = getConfirmFunc(param, confirm)
    this.back = this.back.bind(this)
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
    this.insertSuccessMsg = this.resource.msg_save_success
    this.updateSuccessMsg = this.resource.msg_save_success

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
    // this.confirm = this.confirm.bind(this)
    this.validate = this.validate.bind(this)
    this.doSave = this.doSave.bind(this)
    this.succeed = this.succeed.bind(this)
    this.successMessage = this.successMessage.bind(this)
    this.postSave = this.postSave.bind(this)
    this.handleDuplicateKey = this.handleDuplicateKey.bind(this)
    // this.addable = true;
  }
  protected running?: boolean
  protected form?: HTMLFormElement
  protected includeCurrencySymbol?: boolean

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

  protected name?: string
  // protected status: EditStatusConfig;
  // protected showMessage: (msg: string, option?: string) => void
  // protected showError: (m: string, callback?: () => void, header?: string) => void
  // protected confirm: (m2: string, yesCallback?: () => void, header?: string, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void
  // protected ui?: UIService
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
  back(): void {
    window.history.back()
  }

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
            error(err, this.resource, com.showError)
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
    if (this.form) {
      setReadOnly(form)
    }
    this.showError(this.resource.error_not_found, undefined, this.resource.error)
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
    if (this.running) {
      return
    }
    const com = this
    const obj = com.getModel()
    if (!this.newMode) {
      const diffObj = makeDiff(this.orginalModel, obj, this.keys, this.version)
      const l = Object.keys(diffObj as any).length
      if (l === 0) {
        this.showMessage(this.resource.msg_no_change)
      } else {
        com.validate(obj, () => {
          this.confirm(
            this.resource.msg_confirm_save,
            () => {
              com.doSave(obj, diffObj, isBack)
            },
            this.resource.confirm,
            this.resource.no,
            this.resource.yes,
          )
        })
      }
    } else {
      com.validate(obj, () => {
        this.confirm(
          this.resource.msg_confirm_save,
          () => {
            com.doSave(obj, obj, isBack)
          },
          this.resource.confirm,
          this.resource.no,
          this.resource.yes,
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
        error(err, this.resource, com.showError)
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
      const t = this.resource.error
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
          this.showError(this.resource.error_version)
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
    this.showError(this.resource.error_duplicate_key, undefined, this.resource.error)
  }
}
export class EditComponent<T, ID> extends BaseEditComponent<T, ID> {
  constructor(
    protected viewContainerRef: ViewContainerRef,
    protected route: ActivatedRoute,
    service: GenericService<T, ID, number | T | ErrorMessage[]>,
    resource: StringMap,
    param: EditParameter,
    patchable?: boolean,
    ignoreDate?: boolean,
    backOnSaveSuccess?: boolean,
  ) {
    super(
      service,
      resource,
      param.showMessage,
      param.showError,
      param.confirm,
      param.getLocale,
      param.ui,
      param.loading,
      patchable,
      ignoreDate,
      backOnSaveSuccess,
    )
    this.onInit = this.onInit.bind(this)
  }
  onInit() {
    const fi = this.ui ? this.ui.registerEvents : undefined
    this.form = initElement(this.viewContainerRef, fi)
    const id: ID | null = buildId<ID>(this.route, this.keys)
    this.load(id)
  }
}
