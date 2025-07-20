"use strict"
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b
          }) ||
        function (d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]
        }
      return extendStatics(d, b)
    }
    return function (d, b) {
      extendStatics(d, b)
      function __() {
        this.constructor = d
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
    }
  })()
Object.defineProperty(exports, "__esModule", { value: true })
var angular_1 = require("./angular")
var common_1 = require("./common")
var reflect_1 = require("./reflect")
var search_1 = require("./search")
function more(com) {
  com.append = true
  if (!com.page) {
    com.page = 1
  } else {
    com.page = com.page + 1
  }
}
exports.more = more
function optimizeFilter(obj, searchable, fields) {
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
exports.optimizeFilter = optimizeFilter
function append(list, results) {
  if (list && results) {
    for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
      var obj = results_1[_i]
      list.push(obj)
    }
  }
  if (!list) {
    return []
  }
  return list
}
exports.append = append
function handleAppend(com, list, limit, nextPageToken) {
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
exports.handleAppend = handleAppend
function formatResults(results, pageIndex, pageSize, initPageSize, sequenceNo) {
  if (results && results.length > 0) {
    var hasSequencePro = false
    if (sequenceNo && sequenceNo.length > 0) {
      for (var _i = 0, results_2 = results; _i < results_2.length; _i++) {
        var obj = results_2[_i]
        if (obj[sequenceNo]) {
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
          for (var i = 0; i < results.length; i++) {
            results[i][sequenceNo] = i - pageSize + pageSize * pageIndex + 1
          }
        } else {
          for (var i = 0; i < results.length; i++) {
            results[i][sequenceNo] = i - pageSize + pageSize * pageIndex + 1 - (pageSize - initPageSize)
          }
        }
      } else {
        for (var i = 0; i < results.length; i++) {
          results[i][sequenceNo] = i + 1
        }
      }
    }
  }
}
exports.formatResults = formatResults
function reset(com) {
  search_1.removeSortStatus(com.sortTarget)
  com.sortTarget = undefined
  com.sortField = undefined
  com.append = false
  com.page = 1
}
exports.reset = reset
function changePageSize(com, size) {
  com.initLimit = size
  com.limit = size
  com.page = 1
}
exports.changePageSize = changePageSize
function changePage(com, pageIndex, pageSize) {
  com.page = pageIndex
  com.limit = pageSize
  com.append = false
}
exports.changePage = changePage
var BaseSearchComponent = (function () {
  function BaseSearchComponent(sv, resource, showMessage, showError, getLocale, ui, loading) {
    var _this = this
    this.resource = resource
    this.showMessage = showMessage
    this.showError = showError
    this.getLocale = getLocale
    this.ui = ui
    this.loading = loading
    this.initPageSize = 20
    this.limit = 20
    this.page = 1
    this.totalItems = 0
    this.sequenceNo = "sequenceNo"
    this.loadPage = 1
    this.pageMaxSize = 7
    this.limits = [10, 20, 40, 60, 100, 200, 400, 1000]
    this.clearQ = function () {
      _this.filter.q = ""
    }
    this.filter = {}
    if (sv) {
      if (typeof sv === "function") {
        this.searchFn = sv
      } else {
        this.searchFn = sv.search
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
  BaseSearchComponent.prototype.changeView = function (v, event) {
    this.view = v
  }
  BaseSearchComponent.prototype.toggleFilter = function (event) {
    var x = !this.hideFilter
    search_1.handleToggle(event.target, !x)
    this.hideFilter = x
  }
  BaseSearchComponent.prototype.mergeFilter = function (obj, arrs, b) {
    var s = search_1.mergeFilter(obj, b, this.limits, arrs)
    return s
  }
  BaseSearchComponent.prototype.load = function (s, autoSearch) {
    this.loadTime = new Date()
    var obj2 = search_1.initFilter(s, this)
    this.loadPage = this.page
    this.setFilter(obj2)
    var com = this
    if (autoSearch) {
      setTimeout(function () {
        com.doSearch(true)
      }, 0)
    }
  }
  BaseSearchComponent.prototype.getModelName = function () {
    return "filter"
  }
  BaseSearchComponent.prototype.setSearchForm = function (form) {
    this.form = form
  }
  BaseSearchComponent.prototype.getSearchForm = function () {
    return this.form
  }
  BaseSearchComponent.prototype.setFilter = function (obj) {
    this.filter = obj
  }
  BaseSearchComponent.prototype.getFilter = function () {
    var obj = this.filter
    var obj3 = optimizeFilter(obj, this, this.getFields())
    return obj3
  }
  BaseSearchComponent.prototype.getOriginalFilter = function () {
    return this.filter
  }
  BaseSearchComponent.prototype.getFields = function () {
    if (this.fields) {
      return this.fields
    }
    if (!this.initFields) {
      if (this.getSearchForm()) {
        this.fields = search_1.getFields(this.getSearchForm())
      }
      this.initFields = true
    }
    return this.fields
  }
  BaseSearchComponent.prototype.onPageSizeChanged = function (event) {
    var ctrl = event.currentTarget
    this.pageSizeChanged(Number(ctrl.value), event)
  }
  BaseSearchComponent.prototype.pageSizeChanged = function (size, event) {
    changePageSize(this, size)
    this.tmpPage = 1
    this.doSearch()
  }
  BaseSearchComponent.prototype.search = function (event) {
    if (event && !this.getSearchForm()) {
      var f = event.currentTarget.form
      if (f) {
        this.setSearchForm(f)
      }
    }
    this.resetAndSearch()
  }
  BaseSearchComponent.prototype.resetAndSearch = function () {
    if (this.running) {
      this.triggerSearch = true
      return
    }
    reset(this)
    this.tmpPage = 1
    this.doSearch()
  }
  BaseSearchComponent.prototype.doSearch = function (isFirstLoad) {
    var _this = this
    var listForm = this.getSearchForm()
    if (listForm && this.ui) {
      this.ui.removeFormError(listForm)
    }
    var s = this.getFilter()
    var com = this
    this.validateSearch(s, function () {
      if (com.running) {
        return
      }
      com.running = true
      common_1.showLoading(_this.loading)
      if (!_this.ignoreUrlParam) {
        search_1.addParametersIntoUrl(s, isFirstLoad)
      }
      com.callSearch(s)
    })
  }
  BaseSearchComponent.prototype.callSearch = function (ft) {
    var _this = this
    var s = reflect_1.clone(ft)
    var page = this.page
    if (!page || page < 1) {
      page = 1
    }
    var limit = page <= 1 && ft.firstLimit && ft.firstLimit > 0 ? ft.firstLimit : ft.limit
    var next = this.nextPageToken && this.nextPageToken.length > 0 ? this.nextPageToken : page
    var fields = ft.fields
    delete ft["page"]
    delete ft["fields"]
    delete ft["limit"]
    delete ft["firstLimit"]
    var com = this
    if (this.searchFn) {
      this.searchFn(ft, limit, next, fields)
        .then(function (sr) {
          com.showResults(s, sr)
          com.running = false
          common_1.hideLoading(com.loading)
        })
        .catch(function (err) {
          common_1.error(err, _this.resource, com.showError)
          com.running = false
          common_1.hideLoading(com.loading)
        })
    }
  }
  BaseSearchComponent.prototype.validateSearch = function (ft, callback) {
    var valid = true
    var listForm = this.getSearchForm()
    if (listForm) {
      var locale = common_1.enLocale
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
  BaseSearchComponent.prototype.searchError = function (response) {
    if (this.tmpPage) {
      this.page = this.tmpPage
    }
    common_1.error(response, this.resource, this.showError)
  }
  BaseSearchComponent.prototype.showResults = function (s, sr) {
    var com = this
    var results = sr.list
    if (results != null && results.length > 0) {
      formatResults(results, this.page, this.limit, this.initPageSize, this.sequenceNo)
    }
    var appendMode = com.appendMode
    com.page = s.page && s.page >= 1 ? s.page : 1
    if (appendMode) {
      var limit = s.limit
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
      search_1.showPaging(com, sr.list, s.limit, sr.total)
      com.setList(results)
      com.tmpPage = s.page
      if (s.limit) {
        this.showMessage(search_1.buildMessage(this.resource, s.page, s.limit, sr.list, sr.total))
      }
    }
    this.running = false
    common_1.hideLoading(com.loading)
    if (this.triggerSearch) {
      this.triggerSearch = false
      this.resetAndSearch()
    }
  }
  BaseSearchComponent.prototype.setList = function (list) {
    this.list = list
  }
  BaseSearchComponent.prototype.getList = function () {
    return this.list
  }
  BaseSearchComponent.prototype.chkAllOnClick = function (event, selected) {
    var target = event.currentTarget
    var isChecked = target.checked
    var list = this.getList()
    reflect_1.setAll(list, selected, isChecked)
    this.handleItemOnChecked(list)
  }
  BaseSearchComponent.prototype.itemOnClick = function (event, selected) {
    var list = this.getList()
    if (this.chkAll != null) {
      this.chkAll.checked = reflect_1.equalAll(list, selected, true)
    }
    this.handleItemOnChecked(list)
  }
  BaseSearchComponent.prototype.handleItemOnChecked = function (list) {}
  BaseSearchComponent.prototype.sort = function (event) {
    search_1.handleSortEvent(event, this)
    if (!this.appendMode) {
      this.doSearch()
    } else {
      this.resetAndSearch()
    }
  }
  BaseSearchComponent.prototype.showMore = function (event) {
    this.tmpPage = this.page
    more(this)
    this.doSearch()
  }
  BaseSearchComponent.prototype.pageChanged = function (event) {
    if (this.loadTime) {
      var now = new Date()
      var d = Math.abs(this.loadTime.getTime() - now.getTime())
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
  return BaseSearchComponent
})()
exports.BaseSearchComponent = BaseSearchComponent
var SearchComponent = (function (_super) {
  __extends(SearchComponent, _super)
  function SearchComponent(viewContainerRef, sv, resource, param) {
    var _this = _super.call(this, sv, resource, param.showMessage, param.showError, param.getLocale, param.ui, param.loading) || this
    _this.viewContainerRef = viewContainerRef
    _this.autoSearch = true
    _this.autoSearch = param.auto
    _this.onInit = _this.onInit.bind(_this)
    return _this
  }
  SearchComponent.prototype.onInit = function () {
    var fi = this.ui ? this.ui.registerEvents : undefined
    this.form = angular_1.initElement(this.viewContainerRef, fi)
    var s = this.mergeFilter(angular_1.buildFromUrl())
    this.load(s, this.autoSearch)
  }
  return SearchComponent
})(BaseSearchComponent)
exports.SearchComponent = SearchComponent
