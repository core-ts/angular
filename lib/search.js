"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var core_1 = require("./core")
var reflect_1 = require("./reflect")
function getOffset(limit, page, firstLimit) {
  var p = page && page > 0 ? page : 1
  if (firstLimit && firstLimit > 0) {
    var offset = limit * (p - 2) + firstLimit
    return offset < 0 ? 0 : offset
  } else {
    var offset = limit * (p - 1)
    return offset < 0 ? 0 : offset
  }
}
exports.getOffset = getOffset
function mergeFilter(obj, b, limits, arrs) {
  var a = b
  if (!b) {
    a = {}
  }
  var slimit = obj["limit"]
  if (!isNaN(slimit)) {
    var limit = parseInt(slimit, 10)
    if (limits && limits.length > 0) {
      if (limits.indexOf(limit) >= 0) {
        a.limit = limit
      }
    } else {
      a.limit = limit
    }
  }
  delete obj["limit"]
  var keys = Object.keys(obj)
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i]
    var p = a[key]
    var v = obj[key]
    if (v && v !== "") {
      a[key] = isArray(key, p, arrs) ? v.split(",") : v
    }
  }
  return a
}
exports.mergeFilter = mergeFilter
function isArray(key, p, arrs) {
  if (p) {
    if (Array.isArray(p)) {
      return true
    }
  }
  if (arrs) {
    if (Array.isArray(arrs)) {
      if (arrs.indexOf(key) >= 0) {
        return true
      }
    } else {
      var v = arrs[key]
      if (v && Array.isArray(v)) {
        return true
      }
    }
  }
  return false
}
exports.isArray = isArray
function initFilter(m, com) {
  if (!isNaN(m.page)) {
    var page = parseInt(m.page, 10)
    m.page = page
    if (page >= 1) {
      com.page = page
    }
  }
  if (!isNaN(m.limit)) {
    var pageSize = parseInt(m.limit, 10)
    m.limit = pageSize
    if (pageSize > 0) {
      com.limit = pageSize
    }
  }
  if (!m.limit && com.limit) {
    m.limit = com.limit
  }
  if (!isNaN(m.firstLimit)) {
    var initPageSize = parseInt(m.firstLimit, 10)
    if (initPageSize > 0) {
      m.firstLimit = initPageSize
      com.initLimit = initPageSize
    } else {
      com.initLimit = com.limit
    }
  } else {
    com.initLimit = com.limit
  }
  var st = m.sort
  if (st && st.length > 0) {
    var ch = st.charAt(0)
    if (ch === "+" || ch === "-") {
      com.sortField = st.substring(1)
      com.sortType = ch
    } else {
      com.sortField = st
      com.sortType = ""
    }
  }
  return m
}
exports.initFilter = initFilter
function showPaging(com, list, pageSize, total) {
  com.total = total
  var pageTotal = getPageTotal(pageSize, total)
  com.pages = pageTotal
  com.showPaging = !total || com.pages <= 1 || (list && list.length >= total) ? false : true
  if (total && total >= 0) {
    com.totalItems = total
  }
}
exports.showPaging = showPaging
function getFields(form, arr) {
  if (arr && arr.length > 0) {
    return arr
  }
  if (!form) {
    return undefined
  }
  var nodes = form.nextSibling
  if (!nodes.querySelector) {
    if (!form.nextSibling) {
      return []
    } else {
      nodes = form.nextSibling.nextSibling
    }
  }
  if (!nodes.querySelector) {
    return undefined
  }
  var table = nodes.querySelector("table")
  var fields = []
  if (table) {
    var thead = table.querySelector("thead")
    if (thead) {
      var ths = thead.querySelectorAll("th")
      if (ths) {
        var l = ths.length
        for (var i = 0; i < l; i++) {
          var th = ths[i]
          var field = th.getAttribute("data-field")
          if (field) {
            fields.push(field)
          }
        }
      }
    }
  }
  return fields.length > 0 ? fields : undefined
}
exports.getFields = getFields
function getPageTotal(pageSize, total) {
  if (!pageSize || pageSize <= 0) {
    return 1
  } else {
    if (!total) {
      total = 0
    }
    if (total % pageSize === 0) {
      return Math.floor(total / pageSize)
    }
    return Math.floor(total / pageSize + 1)
  }
}
exports.getPageTotal = getPageTotal
function formatText() {
  var args = []
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i]
  }
  var formatted = args[0]
  if (!formatted || formatted === "") {
    return ""
  }
  if (args.length > 1 && Array.isArray(args[1])) {
    var params = args[1]
    for (var i = 0; i < params.length; i++) {
      var regexp = new RegExp("\\{" + i + "\\}", "gi")
      formatted = formatted.replace(regexp, params[i])
    }
  } else {
    for (var i = 1; i < args.length; i++) {
      var regexp = new RegExp("\\{" + (i - 1) + "\\}", "gi")
      formatted = formatted.replace(regexp, args[i])
    }
  }
  return formatted
}
exports.formatText = formatText
function buildMessage(resource, pageIndex, pageSize, results, total) {
  if (!results || results.length === 0) {
    return resource.msg_no_data_found
  } else {
    if (!pageIndex) {
      pageIndex = 1
    }
    var fromIndex = (pageIndex - 1) * pageSize + 1
    var toIndex = fromIndex + results.length - 1
    var pageTotal = getPageTotal(pageSize, total)
    if (pageTotal > 1) {
      var msg2 = formatText(resource.msg_search_result_page_sequence, fromIndex, toIndex, total, pageIndex, pageTotal)
      return msg2
    } else {
      var msg3 = formatText(resource.msg_search_result_sequence, fromIndex, toIndex)
      return msg3
    }
  }
}
exports.buildMessage = buildMessage
function removeFormatUrl(url) {
  var startParams = url.indexOf("?")
  return startParams !== -1 ? url.substring(0, startParams) : url
}
function getPrefix(url) {
  return url.indexOf("?") >= 0 ? "&" : "?"
}
function addParametersIntoUrl(ft, isFirstLoad, page, fields, limit) {
  if (!isFirstLoad) {
    if (!fields || fields.length === 0) {
      fields = core_1.resources.fields
    }
    if (!limit || limit.length === 0) {
      limit = core_1.resources.limit
    }
    if (page) {
      ft[core_1.resources.page] = page
    }
    var pageIndex = ft[core_1.resources.page]
    if (pageIndex && !isNaN(pageIndex) && pageIndex <= 1) {
      delete ft[core_1.resources.page]
    }
    var keys = Object.keys(ft)
    var currentUrl = window.location.host + window.location.pathname
    var url = removeFormatUrl(currentUrl)
    for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
      var key = keys_2[_i]
      var objValue = ft[key]
      if (objValue) {
        if (key !== fields) {
          if (typeof objValue === "string" || typeof objValue === "number") {
            if (key === limit) {
              if (objValue !== core_1.resources.defaultLimit) {
                url += getPrefix(url) + (key + "=" + objValue)
              }
            } else {
              if (typeof objValue === "string") {
                url += getPrefix(url) + (key + "=" + encodeURIComponent(objValue))
              } else {
                url += getPrefix(url) + (key + "=" + objValue)
              }
            }
          } else if (typeof objValue === "object") {
            if (objValue instanceof Date) {
              url += getPrefix(url) + (key + "=" + objValue.toISOString())
            } else {
              if (Array.isArray(objValue)) {
                if (objValue.length > 0) {
                  var strs = []
                  for (var _a = 0, objValue_1 = objValue; _a < objValue_1.length; _a++) {
                    var subValue = objValue_1[_a]
                    if (typeof subValue === "string") {
                      strs.push(encodeURIComponent(subValue))
                    } else if (typeof subValue === "number") {
                      strs.push(subValue.toString())
                    }
                  }
                  url += getPrefix(url) + (key + "=" + strs.join(","))
                }
              } else {
                var keysLvl2 = Object.keys(objValue)
                for (var _b = 0, keysLvl2_1 = keysLvl2; _b < keysLvl2_1.length; _b++) {
                  var key2 = keysLvl2_1[_b]
                  var objValueLvl2 = objValue[key2]
                  if (objValueLvl2 instanceof Date) {
                    url += getPrefix(url) + (key + "." + key2 + "=" + objValueLvl2.toISOString())
                  } else {
                    if (typeof objValueLvl2 === "string") {
                      url += getPrefix(url) + (key + "." + key2 + "=" + encodeURIComponent(objValueLvl2))
                    } else {
                      url += getPrefix(url) + (key + "." + key2 + "=" + objValueLvl2)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    var p = "http://"
    var loc = window.location.href
    if (loc.length >= 8) {
      var ss = loc.substring(0, 8)
      if (ss === "https://") {
        p = "https://"
      }
    }
    window.history.replaceState({ path: currentUrl }, "", p + url)
  }
}
exports.addParametersIntoUrl = addParametersIntoUrl
function buildSort(sort) {
  var sortObj = {}
  if (sort && sort.length > 0) {
    var ch = sort.charAt(0)
    if (ch === "+" || ch === "-") {
      sortObj.field = sort.substring(1)
      sortObj.type = ch
    } else {
      sortObj.field = sort
      sortObj.type = ""
    }
  }
  return sortObj
}
exports.buildSort = buildSort
function buildSortFilter(obj, sortable) {
  var filter = reflect_1.clone(obj)
  if (sortable.sortField && sortable.sortField.length > 0) {
    filter.sort = sortable.sortType === "-" ? "-" + sortable.sortField : sortable.sortField
  } else {
    delete filter.sort
  }
  delete filter.fields
  return filter
}
exports.buildSortFilter = buildSortFilter
function handleToggle(target, on) {
  var off = !on
  if (target) {
    if (on) {
      if (!target.classList.contains("on")) {
        target.classList.add("on")
      }
    } else {
      target.classList.remove("on")
    }
  }
  return off
}
exports.handleToggle = handleToggle
function handleSortEvent(event, com) {
  if (event && event.target) {
    var target = event.target
    if (target.nodeName === "I") {
      target = target.parentElement
    }
    var s = handleSort(target, com.sortTarget, com.sortField, com.sortType)
    com.sortField = s.field
    com.sortType = s.type
    com.sortTarget = target
  }
}
exports.handleSortEvent = handleSortEvent
function handleSort(target, previousTarget, sortField, sortType) {
  var type = target.getAttribute("sort-type")
  var field = toggleSortStyle(target)
  var s = sort(sortField, sortType, field, type == null ? undefined : type)
  if (sortField !== field) {
    removeSortStatus(previousTarget)
  }
  return s
}
exports.handleSort = handleSort
function sort(preField, preSortType, field, sortType) {
  if (!preField || preField === "") {
    var s = {
      field: field,
      type: "+",
    }
    return s
  } else if (preField !== field) {
    var s = {
      field: field,
      type: !sortType ? "+" : sortType,
    }
    return s
  } else if (preField === field) {
    var type = preSortType === "+" ? "-" : "+"
    var s = { field: field, type: type }
    return s
  } else {
    return { field: field, type: sortType }
  }
}
exports.sort = sort
function removeSortStatus(target) {
  if (target && target.children.length > 0) {
    target.removeChild(target.children[0])
  }
}
exports.removeSortStatus = removeSortStatus
function toggleSortStyle(target) {
  var field = target.getAttribute("data-field")
  if (!field) {
    var p = target.parentNode
    if (p) {
      field = p.getAttribute("data-field")
    }
  }
  if (!field || field.length === 0) {
    return ""
  }
  if (target.nodeName === "I") {
    target = target.parentNode
  }
  var i
  if (target.children.length === 0) {
    target.innerHTML = target.innerHTML + '<i class="sort-up"></i>'
  } else {
    i = target.children[0]
    if (i.classList.contains("sort-up")) {
      i.classList.remove("sort-up")
      i.classList.add("sort-down")
    } else if (i.classList.contains("sort-down")) {
      i.classList.remove("sort-down")
      i.classList.add("sort-up")
    }
  }
  return field
}
exports.toggleSortStyle = toggleSortStyle
