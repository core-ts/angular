import { LoadingService, StringMap } from "./core"

export function messageByHttpStatus(status: number, resource: StringMap): string {
  const k = "error_" + status
  let msg = resource[k]
  if (!msg || msg.length === 0) {
    msg = resource.error_500
  }
  return msg
}
export function error(err: any, resource: StringMap, ae: (msg: string, callback?: () => void, header?: string) => void) {
  const title = resource.error
  let msg = resource.error_internal
  if (!err) {
    ae(msg, undefined, title)
    return
  }
  const data = err && err.response ? err.response : err
  if (data) {
    const status = data.status
    if (status && !isNaN(status)) {
      msg = messageByHttpStatus(status, resource)
    }
    ae(msg, undefined, title)
  } else {
    ae(msg, undefined, title)
  }
}

export function showLoading(loading?: LoadingService | ((firstTime?: boolean) => void)): void {
  if (loading) {
    if (typeof loading === "function") {
      loading()
    } else {
      loading.showLoading()
    }
  }
}
export function hideLoading(loading?: LoadingService | (() => void)): void {
  if (loading) {
    if (typeof loading === "function") {
      loading()
    } else {
      loading.hideLoading()
    }
  }
}

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

export interface ActivatedRoute {
  /** An observable of the matrix parameters scoped to this route. */
  params: any
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
