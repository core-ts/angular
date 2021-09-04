import {OnInit, ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {clone, equalAll, makeDiff, setAll, setValue, trim} from 'reflectx';
import {addParametersIntoUrl, append, buildSearchMessage, changePage, changePageSize, formatResults, getDisplayFields, handleSortEvent, initSearchable, mergeSearchModel, more, optimizeSearchModel, reset, showResults} from 'search-utilities';
import {buildFromUrl, buildId, initElement} from './angular';
import {createEditStatus, EditStatusConfig, error, getModelName, LoadingService, Locale, message, Metadata, MetaModel, ResourceService, SearchModel, SearchParameter, SearchResult, SearchService, StringMap, UIService, ViewParameter, ViewService} from './core';
import {createDiffStatus, DiffApprService, DiffParameter, DiffStatusConfig} from './core';
import {formatDiffModel, showDiff} from './diff';
import {build, createModel, EditParameter, GenericService, handleStatus, handleVersion, ResultInfo} from './edit';
import {format, json} from './formatter';
import {focusFirstError, readOnly} from './formutil';
import {getAutoSearch, getConfirmFunc, getDiffStatusFunc, getEditStatusFunc, getErrorFunc, getLoadingFunc, getLocaleFunc, getMsgFunc, getResource, getUIService} from './input';

export const enLocale = {
  'id': 'en-US',
  'countryCode': 'US',
  'dateFormat': 'M/d/yyyy',
  'firstDayOfWeek': 1,
  'decimalSeparator': '.',
  'groupSeparator': ',',
  'decimalDigits': 2,
  'currencyCode': 'USD',
  'currencySymbol': '$',
  'currencyPattern': 0
};
export class RootComponent {
  constructor(protected resourceService: ResourceService, protected getLocale?: (profile?: string) => Locale) {
    if (resourceService) {
      this.resource = resourceService.resource();
    }
    this.currencySymbol = this.currencySymbol.bind(this);
    this.getCurrencyCode = this.getCurrencyCode.bind(this);
    this.back = this.back.bind(this);
  }
  protected includeCurrencySymbol: boolean;
  protected resource: StringMap;
  protected running: boolean;
  protected form?: HTMLFormElement;

  protected back(): void {
    window.history.back();
  }

  protected currencySymbol(): boolean {
    return this.includeCurrencySymbol;
  }

  protected getCurrencyCode(): string {
    return (this.form ? this.form.getAttribute('currency-code') : null);
  }
}
export class BaseViewComponent<T, ID> extends RootComponent {
  constructor(sv: ((id: ID, ctx?: any) => Promise<T>)|ViewService<T, ID>,
      param: ResourceService|ViewParameter,
      showError?: (msg: string, title?: string, detail?: string, callback?: () => void) => void,
      getLocale?: (profile?: string) => Locale,
      loading?: LoadingService, ignoreDate?: boolean) {
    super(getResource(param), getLocaleFunc(param, getLocale));
    this.showError = getErrorFunc(param, showError);
    this.loading = getLoadingFunc(param, loading);
    if (sv) {
      if (typeof sv === 'function') {
        this.loadFn = sv;
      } else {
        this.service = sv;
        if (this.service.metadata) {
          const m = this.service.metadata();
          if (m) {
            this.metadata = m;
            const meta = build(m, ignoreDate);
            this.keys = meta.keys;
          }
        }
      }
    }
    this.getModelName = this.getModelName.bind(this);
    const n = this.getModelName();
    this[n] = {} as any;
    this.load = this.load.bind(this);
    this.showModel = this.showModel.bind(this);
    this.getModel = this.getModel.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
  }
  protected loading?: LoadingService;
  protected showError: (msg: string, title?: string, detail?: string, callback?: () => void) => void;
  protected loadFn: (id: ID, ctx?: any) => Promise<T>;
  protected service: ViewService<T, ID>;
  protected keys: string[];
  protected metadata?: Metadata;

  async load(_id: ID, callback?: (m: T, showF: (model: T) => void) => void) {
    const id: any = _id;
    if (id && id !== '') {
      try {
        this.running = true;
        if (this.loading) {
          this.loading.showLoading();
        }
        const ctx: any = {};
        let obj: T;
        if (this.loadFn) {
          obj = await this.loadFn(id, ctx);
        } else {
          obj = await this.service.load(id, ctx);
        }
        if (obj) {
          if (callback) {
            callback(obj, this.showModel);
          } else {
            this.showModel(obj);
          }
        } else {
          this.handleNotFound(this.form);
        }
      } catch (err) {
        const data = (err &&  err.response) ? err.response : err;
        if (data && data.status === 404) {
          this.handleNotFound(this.form);
        } else {
          error(err, this.resourceService.value, this.showError);
        }
      } finally {
        this.running = false;
        if (this.loading) {
          this.loading.hideLoading();
        }
      }
    }
  }
  protected handleNotFound(form?: HTMLFormElement): void {
    if (form) {
      readOnly(form);
    }
    const msg = message(this.resourceService.value, 'error_not_found', 'error');
    this.showError(msg.message, msg.title);
  }
  protected getModelName(): string {
    if (this.metadata) {
      return this.metadata.name;
    }
    const n = getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    }
  }
  protected showModel(model: T): void {
    const name = this.getModelName();
    this[name] = model;
  }
  getModel(): T {
    const name = this.getModelName();
    const model = this[name];
    return model;
  }
}
export class ViewComponent<T, ID> extends BaseViewComponent<T, ID> implements OnInit {
  constructor(protected viewContainerRef: ViewContainerRef, protected route: ActivatedRoute,
      sv: ((id: ID, ctx?: any) => Promise<T>)|ViewService<T, ID>,
      param: ResourceService|ViewParameter,
      showError?: (msg: string, title?: string, detail?: string, callback?: () => void) => void,
      getLocale?: (profile?: string) => Locale,
      loading?: LoadingService) {
    super(sv, param, showError, getLocale, loading);
    this.ngOnInit = this.ngOnInit.bind(this);
  }
  ngOnInit() {
    this.form = initElement(this.viewContainerRef);
    const id: ID = buildId<ID>(this.route, this.keys);
    this.load(id);
  }
}
interface BaseUIService {
  getValue(el: HTMLInputElement, locale?: Locale, currencyCode?: string): string|number|boolean;
  removeError(el: HTMLInputElement): void;
}
export class BaseComponent extends RootComponent {
  constructor(resourceService: ResourceService,
      getLocale?: (profile?: string) => Locale,
      ui?: BaseUIService,
      protected loading?: LoadingService) {
    super(resourceService, getLocale);
    this.uiS1 = ui;

    this.getModelName = this.getModelName.bind(this);
    this.includes = this.includes.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateStateFlat = this.updateStateFlat.bind(this);
  }
  private uiS1?: BaseUIService;
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
    const n = getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    }
    // return 'state';
  }
  protected includes(checkedList: Array<string|number>, v: string|number): boolean {
    return v && checkedList &&  Array.isArray(checkedList) ? checkedList.includes(v) : false;
  }
  protected updateState(event: Event) {
    let locale: Locale = enLocale;
    if (this.getLocale) {
      locale = this.getLocale();
    }
    this.updateStateFlat(event, locale);
  }
  protected updateStateFlat(e: Event, locale?: Locale) {
    if (!locale) {
      locale = enLocale;
    }
    const ctrl = e.currentTarget as HTMLInputElement;
    let modelName = this.getModelName();
    if (!modelName) {
      modelName = ctrl.form.getAttribute('model-name');
    }
    const type = ctrl.getAttribute('type');
    const isPreventDefault = type && (['checkbox', 'radio'].indexOf(type.toLowerCase()) >= 0 ? false : true);
    if (isPreventDefault) {
      e.preventDefault();
    }
    if (this.uiS1 && ctrl.nodeName === 'SELECT' && ctrl.value && ctrl.classList.contains('invalid')) {
      this.uiS1.removeError(ctrl);
    }
    const ex = this[modelName];
    const dataField = ctrl.getAttribute('data-field');
    const field = (dataField ? dataField : ctrl.name);
    if (type && type.toLowerCase() === 'checkbox') {
      const v = valueOfCheckbox(ctrl);
      setValue(ex, field, v);
    } else {
      let v = ctrl.value;
      if (this.uiS1) {
        v = this.uiS1.getValue(ctrl, locale) as string;
      }
      // tslint:disable-next-line:triple-equals
      if (ctrl.value != v) {
        setValue(ex, field, v);
      }
    }
  }
}
export function valueOfCheckbox(ctrl: HTMLInputElement): string|number|boolean {
  const ctrlOnValue = ctrl.getAttribute('data-on-value');
  const ctrlOffValue = ctrl.getAttribute('data-off-value');
  if (ctrlOnValue && ctrlOffValue) {
    const onValue = ctrlOnValue ? ctrlOnValue : true;
    const offValue = ctrlOffValue ? ctrlOffValue : false;
    return ctrl.checked === true ? onValue : offValue;
  } else {
    return ctrl.checked === true;
  }
}
export class MessageComponent extends BaseComponent {
  constructor(
    resourceService: ResourceService,
    getLocale?: (profile?: string) => Locale,
    ui?: UIService,
    protected loading?: LoadingService) {
    super(resourceService, getLocale, ui, loading);
    this.showMessage = this.showMessage.bind(this);
    this.showError = this.showError.bind(this);
    this.hideMessage = this.hideMessage.bind(this);
  }
  resource: StringMap;
  message = '';
  alertClass = '';

  showMessage(msg: string, field?: string): void {
    this.alertClass = 'alert alert-info';
    this.message = msg;
  }
  showError(msg: string, field?: string): void {
    this.alertClass = 'alert alert-danger';
    this.message = msg;
  }
  hideMessage(field?: string): void {
    this.alertClass = '';
    this.message = '';
  }
}

export class BaseEditComponent<T, ID> extends BaseComponent {
  constructor(protected service: GenericService<T, ID, number|ResultInfo<T>>, param: ResourceService|EditParameter,
      showMessage?: (msg: string, option?: string) => void,
      showError?: (m: string, title?: string, detail?: string, callback?: () => void) => void,
      confirm?: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void,
      getLocale?: (profile?: string) => Locale,
      uis?: UIService,
      loading?: LoadingService,
      status?: EditStatusConfig,
      patchable?: boolean, ignoreDate?: boolean, backOnSaveSuccess?: boolean) {
    super(getResource(param), getLocaleFunc(param, getLocale), getUIService(param, uis), getLoadingFunc(param, loading));
    this.ui = getUIService(param, uis);
    this.showError = getErrorFunc(param, showError);
    this.showMessage = getMsgFunc(param, showMessage);
    this.confirm = getConfirmFunc(param, confirm);
    this.status = getEditStatusFunc(param, status);
    if (!this.status) {
      this.status = createEditStatus(this.status);
    }
    if (service.metadata) {
      const metadata = service.metadata();
      if (metadata) {
        const meta = build(metadata, ignoreDate);
        this.keys = meta.keys;
        this.version = meta.version;
        this.metadata = metadata;
        this.metamodel = meta;
      }
    }
    if (!this.keys && service.keys) {
      const k = service.keys();
      if (k) {
        this.keys = k;
      }
    }
    if (!this.keys) {
      this.keys = [];
    }
    if (patchable === false) {
      this.patchable = patchable;
    }
    if (backOnSaveSuccess === false) {
      this.backOnSuccess = backOnSaveSuccess;
    }
    this.insertSuccessMsg = this.resourceService.value('msg_save_success');
    this.updateSuccessMsg = this.resourceService.value('msg_save_success');

    this.getModelName = this.getModelName.bind(this);
    const n = this.getModelName();
    this[n] = {} as any;
    this.load = this.load.bind(this);
    this.resetState = this.resetState.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
    this.createModel = this.createModel.bind(this);
    this.formatModel = this.formatModel.bind(this);
    this.showModel = this.showModel.bind(this);
    this.getModel = this.getModel.bind(this);
    this.getRawModel = this.getRawModel.bind(this);

    this.newOnClick = this.newOnClick.bind(this);
    this.saveOnClick = this.saveOnClick.bind(this);
    this.onSave = this.onSave.bind(this);
    this.confirm = this.confirm.bind(this);
    this.validate = this.validate.bind(this);
    this.save = this.save.bind(this);
    this.succeed = this.succeed.bind(this);
    this.successMessage = this.successMessage.bind(this);
    this.save = this.save.bind(this);
    this.postSave = this.postSave.bind(this);
    this.handleDuplicateKey = this.handleDuplicateKey.bind(this);
    this.addable = true;
  }
  protected status?: EditStatusConfig;
  protected showMessage: (msg: string, option?: string) => void;
  protected showError: (m: string, title?: string, detail?: string, callback?: () => void) => void;
  protected confirm: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
  protected ui?: UIService;
  protected metadata?: Metadata;
  protected metamodel?: MetaModel;
  protected keys: string[];
  protected version?: string;

  newMode: boolean;
  setBack: boolean;
  patchable = true;
  backOnSuccess = true;
  protected orginalModel: T;

  addable?: boolean;
  readOnly?: boolean;
  deletable?: boolean;

  insertSuccessMsg: string;
  updateSuccessMsg: string;
  async load(_id: ID, callback?: (m: T, showM: (m2: T) => void) => void) {
    const id: any = _id;
    if (id && id !== '') {
      const com = this;
      try {
        const obj = await this.service.load(id);
        if (!obj) {
          com.handleNotFound(com.form);
        } else {
          this.newMode = false;
          this.orginalModel = clone(obj);
          this.formatModel(obj);
          if (callback) {
            callback(obj, this.showModel);
          } else {
            this.showModel(obj);
          }
        }
      } catch (err) {
        const data = (err &&  err.response) ? err.response : err;
        if (data && data.status === 404) {
          com.handleNotFound(com.form);
        } else {
          error(err, this.resourceService.value, this.showError);
        }
      } finally {
        com.running = false;
        if (this.loading) {
          this.loading.hideLoading();
        }
      }
    } else {
      this.newMode = true;
      this.orginalModel = null;
      const obj = this.createModel();
      if (callback) {
        callback(obj, this.showModel);
      } else {
        this.showModel(obj);
      }
    }
  }
  protected resetState(newMod: boolean, model: T, originalModel: T) {
    this.newMode = newMod;
    this.orginalModel = originalModel;
    this.formatModel(model);
    this.showModel(model);
  }
  protected handleNotFound(form?: HTMLFormElement): void {
    const msg = message(this.resourceService.value, 'error_not_found', 'error');
    if (this.form) {
      readOnly(form);
    }
    this.showError(msg.message, msg.title);
  }
  protected formatModel(obj: T): void {
    if (this.metamodel) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      format(obj, this.metamodel, locale, this.getCurrencyCode(), this.currencySymbol());
    }
  }
  protected getModelName(): string {
    if (this.metadata) {
      return this.metadata.name;
    }
    const n = getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    }
  }
  protected showModel(model: T): void {
    const n = this.getModelName();
    this[n] = model;
  }
  getRawModel(): T {
    const name = this.getModelName();
    const model = this[name];
    return model;
  }
  getModel(): T {
    const name = this.getModelName();
    const model = this[name];
    const obj = clone(model);
    if (this.metamodel) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      json(obj, this.metamodel, locale, this.getCurrencyCode());
    }
    return obj;
  }
  protected createModel(): T {
    const metadata = this.service.metadata();
    if (metadata) {
      const obj = createModel<T>(metadata);
      return obj;
    } else {
      const obj: any = {};
      return obj;
    }
  }

  newOnClick(event?: Event): void {
    if (!this.form && event && event.currentTarget) {
      const ctrl = event.currentTarget as HTMLInputElement;
      if (ctrl.form) {
        this.form = ctrl.form;
      }
    }
    this.resetState(true, this.createModel(), null);
    const u = this.ui;
    const f = this.form;
    if (u && f) {
      setTimeout(() => {
        u.removeFormError(f);
      }, 100);
    }
  }
  saveOnClick(event?: Event, isBack?: boolean): void {
    if (!this.form && event && event.currentTarget) {
      this.form = (event.currentTarget as HTMLInputElement).form;
    }
    if (isBack) {
      this.onSave(isBack);
    } else {
      this.onSave(this.backOnSuccess);
    }
  }

  onSave(isBack?: boolean) {
    const r = this.resourceService;
    if (this.newMode && this.addable !== true) {
      const msg = message(r.value, 'error_permission_add', 'error_permission');
      this.showError(msg.message, msg.title);
      return;
    } else if (!this.newMode && this.readOnly) {
      const msg = message(r.value, 'error_permission_edit', 'error_permission');
      this.showError(msg.message, msg.title);
      return;
    } else {
      if (this.running) {
        return;
      }
      const com = this;
      const obj = com.getModel();
      if (!this.newMode) {
        const diffObj = makeDiff(this.orginalModel, obj, this.keys, this.version);
        const l = Object.keys(diffObj).length;
        if (l === 0) {
          this.showMessage(r.value('msg_no_change'));
        } else {
          com.validate(obj, () => {
            const msg = message(r.value, 'msg_confirm_save', 'confirm', 'yes', 'no');
            this.confirm(msg.message, msg.title, () => {
              com.save(obj, diffObj, isBack);
            }, msg.no, msg.yes);
          });
        }
      } else {
        com.validate(obj, () => {
          const msg = message(r.value, 'msg_confirm_save', 'confirm', 'yes', 'no');
          this.confirm(msg.message, msg.title, () => {
            com.save(obj, obj, isBack);
          }, msg.no, msg.yes);
        });
      }
    }
  }
  validate(obj: T, callback: (u?: T) => void): void {
    if (this.ui) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      const valid = this.ui.validateForm(this.form, locale);
      if (valid) {
        callback(obj);
      }
    } else {
      callback(obj);
    }
  }
  async save(obj: T, body?: T, isBack?: boolean) {
    this.running = true;
    if (this.loading) {
      this.loading.showLoading();
    }
    const isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
    const com = this;
    try {
      const ctx: any = {};
      if (!this.newMode) {
        if (this.patchable === true && this.service.patch && body && Object.keys(body).length > 0) {
          const result = await this.service.patch(body, ctx);
          com.postSave(result, isBackO);
        } else {
          const result = await this.service.update(obj, ctx);
          com.postSave(result, isBackO);
        }
      } else {
        trim(obj);
        const result = await this.service.insert(obj, ctx);
        com.postSave(result, isBackO);
      }
    } catch (err) {
      error(err, this.resourceService.value, this.showError);
    }
  }
  protected succeed(msg: string, backOnSave: boolean, result?: ResultInfo<T>): void {
    if (result) {
      const model = result.value;
      this.newMode = false;
      if (model && this.setBack) {
        if (!this.backOnSuccess) {
          this.resetState(false, model, clone(model));
        }
      } else {
        handleVersion(this.getRawModel(), this.version);
      }
    } else {
      handleVersion(this.getRawModel(), this.version);
    }
    this.successMessage(msg);
    if (backOnSave) {
      this.back();
    }
  }
  protected successMessage(msg: string) {
    this.showMessage(msg);
  }
  protected fail(result: ResultInfo<T>): void {
    const errors = result.errors;
    const f = this.form;
    const u = this.ui;
    if (u) {
      const unmappedErrors = u.showFormError(f, errors);
      if (!result.message) {
        if (errors && errors.length === 1) {
          result.message = errors[0].message;
        } else {
          result.message = u.buildErrorMessage(unmappedErrors);
        }
      }
      focusFirstError(f);
    } else if (errors && errors.length === 1) {
      result.message = errors[0].message;
    }
    const t = this.resourceService.value('error');
    this.showError(result.message, t);
  }
  protected postSave(res: number|ResultInfo<T>, backOnSave: boolean): void {
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
    const st = this.status;
    const newMod = this.newMode;
    const successMsg = (newMod ? this.insertSuccessMsg : this.updateSuccessMsg);
    const x: any = res;
    if (!isNaN(x)) {
      if (x === st.Success) {
        this.succeed(successMsg, backOnSave);
      } else {
        if (newMod && x === st.DuplicateKey) {
          this.handleDuplicateKey();
        } else if (!newMod && x === st.NotFound) {
          this.handleNotFound();
        } else {
          handleStatus(x as number, st, this.resourceService.value, this.showError);
        }
      }
    } else {
      const result: ResultInfo<T> = x;
      if (result.status === st.Success) {
        this.succeed(successMsg, backOnSave, result);
      } else if (result.errors && result.errors.length > 0) {
        this.fail(result);
      } else if (newMod && result.status === st.DuplicateKey) {
        this.handleDuplicateKey(result);
      } else if (!newMod && x === st.NotFound) {
        this.handleNotFound();
      } else {
        handleStatus(result.status, st, this.resourceService.value, this.showError);
      }
    }
  }
  protected handleDuplicateKey(result?: ResultInfo<T>): void {
    const msg = message(this.resourceService.value, 'error_duplicate_key', 'error');
    this.showError(msg.message, msg.title);
  }
}
export class EditComponent<T, ID> extends BaseEditComponent<T, ID> implements OnInit {
  constructor(protected viewContainerRef: ViewContainerRef, protected route: ActivatedRoute, service: GenericService<T, ID, number|ResultInfo<T>>, param: ResourceService|EditParameter,
    showMessage?: (msg: string, option?: string) => void,
    showError?: (m: string, title?: string, detail?: string, callback?: () => void) => void,
    confirm?: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void,
    getLocale?: (profile?: string) => Locale,
    uis?: UIService,
    loading?: LoadingService, status?: EditStatusConfig, patchable?: boolean, ignoreDate?: boolean, backOnSaveSuccess?: boolean) {
    super(service, param, showMessage, showError, confirm, getLocale, uis, loading, status, patchable, ignoreDate, backOnSaveSuccess);
    this.ngOnInit = this.ngOnInit.bind(this);
  }
  ngOnInit() {
    const fi = (this.ui ? this.ui.registerEvents : null);
    this.form = initElement(this.viewContainerRef, fi);
    const id: ID = buildId<ID>(this.route, this.keys);
    this.load(id);
  }
}
export class BaseSearchComponent<T, S extends SearchModel> extends BaseComponent {
  constructor(sv: ((s: S, limit?: number, offset?: number|string, fields?: string[]) => Promise<SearchResult<T>>) | SearchService<T, S>,
      param: ResourceService|SearchParameter,
      showMessage?: (msg: string, option?: string) => void,
      showError?: (m: string, header?: string, detail?: string, callback?: () => void) => void,
      getLocale?: (profile?: string) => Locale,
      uis?: UIService,
      loading?: LoadingService) {
    super(getResource(param), getLocaleFunc(param, getLocale), getUIService(param, uis), getLoadingFunc(param, loading));
    this.model = {} as any;

    if (sv) {
      if (typeof sv === 'function') {
        this.searchFn = sv;
      } else {
        this.service = sv;
        if (this.service.keys) {
          this.keys = this.service.keys();
        }
      }
    }
    this.ui = getUIService(param, uis);
    this.showError = getErrorFunc(param, showError);
    this.showMessage = getMsgFunc(param, showMessage);

    this.toggleFilter = this.toggleFilter.bind(this);
    this.mergeSearchModel = this.mergeSearchModel.bind(this);
    this.load = this.load.bind(this);
    this.getSearchForm = this.getSearchForm.bind(this);
    this.setSearchForm = this.setSearchForm.bind(this);

    this.setSearchModel = this.setSearchModel.bind(this);
    this.getOriginalSearchModel = this.getOriginalSearchModel.bind(this);
    this.getSearchModel = this.getSearchModel.bind(this);
    this.getDisplayFields = this.getDisplayFields.bind(this);

    this.pageSizeChanged = this.pageSizeChanged.bind(this);
    this.searchOnClick = this.searchOnClick.bind(this);

    this.resetAndSearch = this.resetAndSearch.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.search = this.search.bind(this);
    this.validateSearch = this.validateSearch.bind(this);
    this.showResults = this.showResults.bind(this);
    this.setList = this.setList.bind(this);
    this.getList = this.getList.bind(this);
    this.sort = this.sort.bind(this);
    this.showMore = this.showMore.bind(this);
    this.pageChanged = this.pageChanged.bind(this);
    const rs = this.resourceService;
    this.deleteHeader = rs.value('msg_delete_header');
    this.deleteConfirm = rs.value('msg_delete_confirm');
    this.deleteFailed = rs.value('msg_delete_failed');
    this.pageChanged = this.pageChanged.bind(this);
  }
  protected showMessage: (msg: string, option?: string) => void;
  protected showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  protected ui?: UIService;
  protected searchFn: (s: S, limit?: number, offset?: number|string, fields?: string[]) => Promise<SearchResult<T>>;
  protected service: SearchService<T, S>;
  // Pagination
  nextPageToken?: string;
  initPageSize = 20;
  pageSize = 20;
  pageIndex = 1;
  itemTotal: number;
  pageTotal: number;
  showPaging: boolean;
  append: boolean;
  appendMode: boolean;
  appendable: boolean;
  // Sortable
  sortField: string;
  sortType: string;
  sortTarget: HTMLElement; // HTML element

  keys: string[];
  format?: (obj: T, locale: Locale) => T;
  displayFields: string[];
  initDisplayFields: boolean;
  sequenceNo = 'sequenceNo';
  triggerSearch: boolean;
  tmpPageIndex: number;
  loadTime: Date;
  loadPage = 1;

  protected model: S;
  private list: T[];
  excluding: string[]|number[];
  hideFilter: boolean;
  ignoreUrlParam: boolean;

  pageMaxSize = 7;
  pageSizes: number[] = [10, 20, 40, 60, 100, 200, 400, 1000];

  chkAll?: HTMLInputElement;
  viewable = true;
  addable = true;
  editable = true;
  approvable?: boolean;
  deletable?: boolean;

  deleteHeader: string;
  deleteConfirm: string;
  deleteFailed: string;

  toggleFilter(event: any): void {
    this.hideFilter = !this.hideFilter;
  }
  mergeSearchModel(obj: S, b?: S, arrs?: string[]|any): S {
    return mergeSearchModel(obj, b, this.pageSizes, arrs);
  }
  load(s: S, autoSearch: boolean): void {
    this.loadTime = new Date();
    const obj2 = initSearchable(s, this);
    this.loadPage = this.pageIndex;
    this.setSearchModel(obj2);
    const com = this;
    if (autoSearch) {
      setTimeout(() => {
        com.doSearch(true);
      }, 0);
    }
  }
  protected getModelName(): string {
    return 'model';
  }
  protected setSearchForm(form: HTMLFormElement): void {
    this.form = form;
  }

  protected getSearchForm(): HTMLFormElement {
    return this.form;
  }

  setSearchModel(obj: S): void {
    this.model = obj;
  }

  getSearchModel(): S {
    let locale: Locale;
    if (this.getLocale) {
      locale = this.getLocale();
    }
    if (!locale) {
      locale = enLocale;
    }
    let obj = this.model;
    if (this.ui) {
      const obj2 = this.ui.decodeFromForm(this.getSearchForm(), locale, this.getCurrencyCode());
      obj = obj2 ? obj2 : {};
    }
    const obj3 = optimizeSearchModel(obj, this, this.getDisplayFields());
    if (this.excluding) {
      obj3.excluding = this.excluding;
    }
    /*
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
    return obj3;
  }
  getOriginalSearchModel(): S {
    return this.model;
  }

  protected getDisplayFields(): string[] {
    if (this.displayFields) {
      return this.displayFields;
    }
    if (!this.initDisplayFields) {
      if (this.getSearchForm()) {
        this.displayFields = getDisplayFields(this.getSearchForm());
      }
      this.initDisplayFields = true;
    }
    return this.displayFields;
  }
  onPageSizeChanged(event: Event): void {
    const ctrl = event.currentTarget as HTMLInputElement;
    this.pageSizeChanged(Number(ctrl.value), event);
  }
  pageSizeChanged(size: number, event?: Event): void {
    changePageSize(this, size);
    this.tmpPageIndex = 1;
    this.doSearch();
  }
  clearKeyworkOnClick = () => {
    this.model.q = '';
  }
  searchOnClick(event: Event): void {
    if (event && !this.getSearchForm()) {
      this.setSearchForm((event.currentTarget as HTMLInputElement).form);
    }
    this.resetAndSearch();
  }
  resetAndSearch() {
    if (this.running) {
      this.triggerSearch = true;
      return;
    }
    reset(this);
    this.tmpPageIndex = 1;
    this.doSearch();
  }
  doSearch(isFirstLoad?: boolean) {
    const listForm = this.getSearchForm();
    if (listForm && this.ui) {
      this.ui.removeFormError(listForm);
    }
    const s: S = this.getSearchModel();
    const com = this;
    this.validateSearch(s, () => {
      if (com.running) {
        return;
      }
      com.running = true;
      if (this.loading) {
        this.loading.showLoading();
      }
      if (!this.ignoreUrlParam) {
        addParametersIntoUrl(s, isFirstLoad);
      }
      com.search(s);
    });
  }
  async search(se: S) {
    const s = clone(se);
    let page = this.pageIndex;
    if (!page || page < 1) {
      page = 1;
    }
    let offset: number;
    if (se.firstLimit && se.firstLimit > 0) {
      offset = se.limit * (page - 2) + se.firstLimit;
    } else {
      offset = se.limit * (page - 1);
    }
    const limit = (page <= 1 && se.firstLimit && se.firstLimit > 0 ? se.firstLimit : se.limit);
    const next = (this.nextPageToken && this.nextPageToken.length > 0 ? this.nextPageToken : offset);
    const fields = se.fields;
    delete se['page'];
    delete se['fields'];
    delete se['limit'];
    delete se['firstLimit'];
    try {
      if (this.searchFn) {
        const sr = await this.searchFn(se, limit, next, fields);
        this.showResults(s, sr);
      } else {
        const result = await this.service.search(se, limit, next, fields);
        this.showResults(s, result);
      }
    } catch (err) {
      error(err, this.resourceService.value, this.showError);
    } finally {
      this.running = false;
      if (this.loading) {
        this.loading.hideLoading();
      }
    }
  }
  validateSearch(se: S, callback: () => void): void {
    let valid = true;
    const listForm = this.getSearchForm();
    if (listForm) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      if (this.ui && this.ui.validateForm) {
        valid = this.ui.validateForm(listForm, locale);
      }
    }
    if (valid === true) {
      callback();
    }
  }
  searchError(response: any): void {
    this.pageIndex = this.tmpPageIndex;
    error(response, this.resourceService.value, this.showError);
  }
  showResults(s: S, sr: SearchResult<T>): void {
    const com = this;
    const results = sr.list;
    if (results != null && results.length > 0) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      formatResults(results, this.pageIndex, this.pageSize, this.initPageSize, this.sequenceNo, this.format, locale);
    }
    const appendMode = com.appendMode;
    showResults(com, s, sr.list, sr.total, sr.last);
    if (!appendMode) {
      com.setList(results);
      com.tmpPageIndex = s.page;
      this.showMessage(buildSearchMessage(this.resourceService, s.page, s.limit, sr.list, sr.total));
    } else {
      if (this.append && s.page > 1) {
        append(this.getList(), results);
      } else {
        this.setList(results);
      }
    }
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
    if (this.triggerSearch) {
      this.triggerSearch = false;
      this.resetAndSearch();
    }
  }

  setList(list: T[]): void {
    this.list = list;
  }
  getList(): T[] {
    return this.list;
  }

  chkAllOnClick(event: Event, selected: string): void {
    const target = event.currentTarget as HTMLInputElement;
    const isChecked = target.checked;
    const list = this.getList();
    setAll(list, selected, isChecked);
    this.handleItemOnChecked(list);
  }
  itemOnClick(event: Event, selected: string): void {
    const list = this.getList();
    if (this.chkAll != null) {
      this.chkAll.checked = equalAll(list, selected, true);
    }
    this.handleItemOnChecked(list);
  }
  handleItemOnChecked(list: any[]) {
  }

  sort(event: Event): void {
    handleSortEvent(event, this);
    if (!this.appendMode) {
      this.doSearch();
    } else {
      this.resetAndSearch();
    }
  }

  showMore(event?: Event): void {
    this.tmpPageIndex = this.pageIndex;
    more(this);
    this.doSearch();
  }

  pageChanged(event?: any): void {
    if (this.loadTime) {
      const now = new Date();
      const d = Math.abs(this.loadTime.getTime() - now.getTime());
      if (d < 610) {
        if (event) {
          if (event.page && event.itemsPerPage && event.page !== this.loadPage) {
            changePage(this, this.loadPage, event.itemsPerPage);
          }
        }
        return;
      }
    }
    changePage(this, event.page, event.itemsPerPage);
    this.doSearch();
  }
}
export class SearchComponent<T, S extends SearchModel> extends BaseSearchComponent<T, S> implements OnInit {
  constructor(protected viewContainerRef: ViewContainerRef,
      sv: ((s: S, ctx?: any) => Promise<SearchResult<T>>) | SearchService<T, S>,
      param: ResourceService|SearchParameter,
      showMessage?: (msg: string, option?: string) => void,
      showError?: (m: string, header?: string, detail?: string, callback?: () => void) => void,
      getLocale?: (profile?: string) => Locale,
      uis?: UIService,
      loading?: LoadingService,
      autoSearch?: boolean) {
    super(sv, param, showMessage, showError, getLocale, uis, loading);
    this.autoSearch = getAutoSearch(param);
    this.ngOnInit = this.ngOnInit.bind(this);
  }
  protected autoSearch = true;
  ngOnInit() {
    const fi = (this.ui ? this.ui.registerEvents : null);
    this.form = initElement(this.viewContainerRef, fi);
    const s = this.mergeSearchModel(buildFromUrl<S>());
    this.load(s, this.autoSearch);
  }
}

export class BaseDiffApprComponent<T, ID> {
  constructor(protected service: DiffApprService<T, ID>,
      param: ResourceService|DiffParameter,
      showMessage?: (msg: string, option?: string) => void,
      showError?: (m: string, title?: string, detail?: string, callback?: () => void) => void,
      loading?: LoadingService, status?: DiffStatusConfig) {
    this.resourceService = getResource(param);
    this.resource = this.resourceService.resource();
    this.loading = getLoadingFunc(param, loading);
    this.showError = getErrorFunc(param, showError);
    this.showMessage = getMsgFunc(param, showMessage);
    this.status = getDiffStatusFunc(param, status);
    if (!this.status) {
      this.status = createDiffStatus(this.status);
    }
    this.back = this.back.bind(this);
    const x: any = {};
    this.origin = x;
    this.value = x;
    this.approve = this.approve.bind(this);
    this.reject = this.reject.bind(this);
    this.handleError = this.handleError.bind(this);
    this.end = this.end.bind(this);
    this.formatFields = this.formatFields.bind(this);
    this.load = this.load.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
  }
  protected status?: DiffStatusConfig;
  protected showMessage: (msg: string, option?: string) => void;
  protected showError: (m: string, title?: string, detail?: string, callback?: () => void) => void;
  protected resourceService: ResourceService;
  protected loading?: LoadingService;
  resource: StringMap;
  protected running: boolean;
  protected form: HTMLFormElement;
  protected id: ID;
  origin: T;
  value: T;
  disabled: boolean;

  protected back(): void {
    window.history.back();
  }

  async load(_id: ID) {
    const x: any = _id;
    if (x && x !== '') {
      this.id = _id;
      try {
        this.running = true;
        if (this.loading) {
          this.loading.showLoading();
        }
        const ctx: any = {};
        const dobj = await this.service.diff(_id, ctx);
        if (!dobj) {
          this.handleNotFound(this.form);
        } else {
          const formatdDiff = formatDiffModel(dobj, this.formatFields);
          this.value = formatdDiff.value;
          this.origin = formatdDiff.origin;
          showDiff(this.form, formatdDiff.value, formatdDiff.origin);
        }
      } catch (err) {
        const data = (err &&  err.response) ? err.response : err;
        if (data && data.status === 404) {
          this.handleNotFound(this.form);
        } else {
          error(err, this.resourceService.resource(), this.showError);
        }
      } finally {
        this.running = false;
        if (this.loading) {
          this.loading.hideLoading();
        }
      }
    }
  }
  protected handleNotFound(form?: HTMLFormElement) {
    this.disabled = true;
    const r = this.resourceService.resource();
    this.showError(r['error_not_found'], r.value['error']);
  }

  formatFields(value: T): T {
    return value;
  }
  async approve(event: Event) {
    event.preventDefault();
    if (this.running) {
      return;
    }
    try {
      this.running = true;
      if (this.loading) {
        this.loading.showLoading();
      }
      const ctx: any = {};
      const status = await this.service.approve(this.id, ctx);
      const st = this.status;
      const r = this.resourceService.resource();
      if (status === st.Success) {
        this.showMessage(r['msg_approve_success']);
      } else if (status === st.VersionError) {
        this.showMessage(r['msg_approve_version_error']);
      } else if (status === st.NotFound) {
        this.handleNotFound(this.form);
      } else {
        this.showError(r['error_internal'], r['error']);
      }
    } catch (err) {
      this.handleError(err);
    } finally {
      this.end();
    }
  }
  async reject(event: Event) {
    event.preventDefault();
    if (this.running) {
      return;
    }
    try {
      this.running = true;
      if (this.loading) {
        this.loading.showLoading();
      }
      const ctx: any = {};
      const status = await this.service.reject(this.id, ctx);
      const st = this.status;
      const r = this.resourceService.resource();
      if (status === st.Success) {
        this.showMessage(r['msg_reject_success']);
      } else if (status === st.VersionError) {
        this.showMessage(r['msg_approve_version_error']);
      } else if (status === st.NotFound) {
        this.handleNotFound(this.form);
      } else {
        this.showError(r['error_internal'], r['error']);
      }
    } catch (err) {
      this.handleError(err);
    } finally {
      this.end();
    }
  }
  protected handleError(err: any): void {
    const r = this.resourceService.resource();
    const data = (err &&  err.response) ? err.response : err;
    if (data && (data.status === 404 || data.status === 409)) {
      if (data.status === 404) {
        this.handleNotFound();
      } else {
        this.showMessage(r['msg_approve_version_error']);
      }
    } else {
      error(err, r, this.showError);
    }
  }
  protected end() {
    this.disabled = true;
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
  }
}
export class DiffApprComponent<T, ID> extends BaseDiffApprComponent<T, ID> implements OnInit {
  constructor(protected viewContainerRef: ViewContainerRef, protected route: ActivatedRoute,
    service: DiffApprService<T, ID>,
    param: ResourceService|DiffParameter,
    showMessage?: (msg: string, option?: string) => void,
    showError?: (m: string, title?: string, detail?: string, callback?: () => void) => void,
    loading?: LoadingService, protected status?: DiffStatusConfig) {
    super(service, param, showMessage, showError, loading, status);
    this.ngOnInit = this.ngOnInit.bind(this);
  }
  ngOnInit() {
    this.form = initElement(this.viewContainerRef);
    const id: ID = buildId<ID>(this.route, this.service.keys());
    this.load(id);
  }
}
