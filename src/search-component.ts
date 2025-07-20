import { ViewContainerRef } from "@angular/core"
import { buildFromUrl, initElement } from "./angular"
import { enLocale, error, hideLoading, showLoading } from "./common"
import { LoadingService, Locale, StringMap, UIService } from "./core"
import { clone, equalAll, setAll } from "./reflect"
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

export interface SearchParameter {
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
export function formatResults<T>(results: T[], pageIndex?: number, pageSize?: number, initPageSize?: number, sequenceNo?: string): void {
  if (results && results.length > 0) {
    let hasSequencePro = false
    if (sequenceNo && sequenceNo.length > 0) {
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
export class BaseSearchComponent<T, S extends Filter> {
  constructor(
    sv: ((s: S, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<T>>) | SearchService<T, S>,
    public resource: StringMap,
    protected showMessage: (msg: string, option?: string) => void,
    public showError: (m: string, callback?: () => void, header?: string) => void,
    protected getLocale?: (profile?: string) => Locale,
    protected ui?: UIService,
    protected loading?: LoadingService,
  ) {
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

    this.deleteHeader = this.resource.msg_delete_header
    this.deleteConfirm = this.resource.msg_delete_confirm
    this.deleteFailed = this.resource.msg_delete_failed
    this.pageChanged = this.pageChanged.bind(this)
  }
  protected running?: boolean
  protected form?: HTMLFormElement

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
  load(s: S, autoSearch?: boolean): void {
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
    let obj = this.filter
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
          error(err, this.resource, com.showError)
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
    error(response, this.resource, this.showError)
  }
  showResults(s: S, sr: SearchResult<T>): void {
    const com = this
    const results = sr.list
    if (results != null && results.length > 0) {
      formatResults(results, this.page, this.limit, this.initPageSize, this.sequenceNo)
    }
    const appendMode = com.appendMode
    com.page = s.page && s.page >= 1 ? s.page : 1
    if (appendMode) {
      let limit = s.limit
      if ((!s.page || s.page <= 1) && s.firstLimit && s.firstLimit > 0) {
        limit = s.firstLimit
      }
      com.nextPageToken = sr.next
      handleAppend(com, sr.list, limit, sr.next)
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
        this.showMessage(buildMessage(this.resource, s.page, s.limit, sr.list, sr.total))
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
    resource: StringMap,
    param: SearchParameter,
  ) {
    super(sv, resource, param.showMessage, param.showError, param.getLocale, param.ui, param.loading)
    this.autoSearch = param.auto
    this.onInit = this.onInit.bind(this)
  }
  protected autoSearch?: boolean = true
  onInit() {
    const fi = this.ui ? this.ui.registerEvents : undefined
    this.form = initElement(this.viewContainerRef, fi)
    const s = this.mergeFilter(buildFromUrl<S>())
    this.load(s, this.autoSearch)
  }
}
