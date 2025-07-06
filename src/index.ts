import { ActivatedRoute, Router } from "@angular/router"

export interface DataMap<V> {
  [key: string]: V
}
export function isAuthorized<T, V>(ur: T, router?: Router, to?: string, url?: string, m?: Map<string, V>, home?: string) {
  if (!ur) {
    if (to && to.length > 0 && router) {
      router.navigate([to])
    }
    return false
  } else {
    if (!m) {
      return true
    } else {
      if (!url) {
        return true
      }
      const p = m.get(url)
      if (p) {
        return true
      } else {
        if (router && home && home.length > 0) {
          router.navigate([home])
        }
        return false
      }
    }
  }
}

export function getUrlParam(route: ActivatedRoute): any {
  if (!route) {
    return null
  }
  const param: any = route.params
  const obj = param._value
  return obj
}

export function navigate(router: Router, stateTo: any, params?: any): void {
  const commands: any = []
  commands.push(stateTo)
  if (params) {
    if (typeof params === "object") {
      for (const param of params) {
        commands.push(param)
      }
    }
    router.navigate(commands)
  } else {
    router.navigate([stateTo])
  }
}

export function getNumber(event: Event) {
  const ele = event.currentTarget as HTMLInputElement | HTMLSelectElement
  return Number(ele.value)
}
export * from "./angular"
export * from "./core"
export * from "./edit"
export * from "./formutil"

export * from "./components"
export * from "./diff"
export * from "./formatter"
export * from "./reflect"
export * from "./search"

export const scrollToFocus = (e: any, isUseTimeOut?: boolean) => {
  try {
    const element = e.target as HTMLInputElement
    const form = element.form
    if (form) {
      const container = form.childNodes[1] as HTMLElement
      const elementRect = element.getBoundingClientRect()
      const absoluteElementTop = elementRect.top + window.pageYOffset
      const middle = absoluteElementTop - window.innerHeight / 2
      const scrollTop = container.scrollTop
      const timeOut = isUseTimeOut ? 300 : 0
      const isChrome = navigator.userAgent.search("Chrome") > 0
      setTimeout(() => {
        if (isChrome) {
          const scrollPosition = scrollTop === 0 ? elementRect.top + 64 : scrollTop + middle
          container.scrollTo(0, Math.abs(scrollPosition))
        } else {
          container.scrollTo(0, Math.abs(scrollTop + middle))
        }
      }, timeOut)
    }
  } catch (e) {
    console.log(e)
  }
}
