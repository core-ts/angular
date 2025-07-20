import { StringMap } from "./core"
import { hasDiff } from "./reflect"

export function back<T>(confirm: (msg: string, yesCallback?: () => void) => void, resource: StringMap, o1: T, o2: T, keys?: string[], version?: string) {
  if (!hasDiff(o1, o2, keys, version)) {
    window.history.back()
  } else {
    confirm(resource.msg_confirm_back, () => window.history.back())
  }
}

export function getNumber(event: Event) {
  const ele = event.currentTarget as HTMLInputElement | HTMLSelectElement
  return Number(ele.value)
}

export * from "./reflect"
export * from "./core"
export * from "./edit"
export * from "./search"
export * from "./angular"

export * from "./formutil"
export * from "./common"
export * from "./diff"
export * from "./formatter"
export * from "./edit-component"
export * from "./message"
export * from "./search-component"
