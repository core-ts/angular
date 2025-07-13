import { LoadingService, Locale, ResourceService, UIService } from "./core"

interface ResourceInput {
  resource: ResourceService
}
export function getResource(p: ResourceService | ResourceInput): ResourceService {
  const x: any = p
  if (x.value && x.format && typeof x.value === "function") {
    return x
  } else {
    return x.resource
  }
}
interface ShortSearchParameter {
  auto?: boolean
}
export function getAutoSearch(p: ResourceService | ShortSearchParameter): boolean {
  const x: any = p
  if (x.value && x.format && typeof x.value === "function") {
    return true
  }
  return x.auto
}
interface UIInput {
  ui?: UIService
}
export function getUIService(p: ResourceService | UIInput, ui0?: UIService): UIService {
  if (ui0) {
    return ui0
  }
  return (p as any).ui
}

interface LoadingInput {
  loading?: LoadingService
}
export function getLoadingFunc(p: ResourceService | LoadingInput, ui0?: LoadingService): LoadingService {
  if (ui0) {
    return ui0
  }
  return (p as any).loading
}
interface ShowMessageInput {
  showMessage: (msg: string, option?: string) => void
}
export function getMsgFunc(p: ResourceService | ShowMessageInput, showMsg?: (msg: string, option?: string) => void): (msg: string) => void {
  if (showMsg) {
    return showMsg
  }
  return (p as any).showMessage
}
interface ConfirmInput {
  confirm: (m2: string, yesCallback?: () => void, header?: string, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void
}
export function getConfirmFunc(
  p: ResourceService | ConfirmInput,
  cf?: (m2: string, yesCallback?: () => void, header?: string, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void,
): (m2: string, yesCallback?: () => void, header?: string, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void {
  if (cf) {
    return cf
  }
  return (p as any).confirm
}
interface GetLocaleInput {
  getLocale?: (profile?: string) => Locale
}
export function getLocaleFunc(p: ResourceService | GetLocaleInput, getLoc?: () => Locale): () => Locale {
  if (getLoc) {
    return getLoc
  }
  return (p as any).getLocale
}
interface ShowErrorInput {
  showError: (m: string, callback?: () => void, header?: string) => void
}
export function getErrorFunc(
  p: ResourceService | ShowErrorInput,
  showErr?: (m: string, callback?: () => void, header?: string) => void,
): (m: string, callback?: () => void, header?: string) => void {
  if (showErr) {
    return showErr
  }
  return (p as any).showError
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
