import { StringMap } from "./core"

export interface Message {
  message: string
  title: string
  yes?: string
  no?: string
}
export function getString(key: string, gv: StringMap | ((key: string) => string)): string {
  if (typeof gv === "function") {
    return gv(key)
  } else {
    return gv[key]
  }
}
export function message(gv: StringMap | ((key: string) => string), msg: string, title?: string, yes?: string, no?: string): Message {
  const m2 = msg && msg.length > 0 ? getString(msg, gv) : ""
  const m: Message = { message: m2, title: "" }
  if (title && title.length > 0) {
    m.title = getString(title, gv)
  }
  if (yes && yes.length > 0) {
    m.yes = getString(yes, gv)
  }
  if (no && no.length > 0) {
    m.no = getString(no, gv)
  }
  return m
}
export function messageByHttpStatus(status: number, gv: StringMap | ((key: string) => string)): string {
  const k = "error_" + status
  let msg = getString(k, gv)
  if (!msg || msg.length === 0) {
    msg = getString("error_500", gv)
  }
  return msg
}
export function error(err: any, gv: StringMap | ((key: string) => string), ae: (msg: string, callback?: () => void, header?: string) => void) {
  const title = getString("error", gv)
  let msg = getString("error_internal", gv)
  if (!err) {
    ae(msg, undefined, title)
    return
  }
  const data = err && err.response ? err.response : err
  if (data) {
    const status = data.status
    if (status && !isNaN(status)) {
      msg = messageByHttpStatus(status, gv)
    }
    ae(msg, undefined, title)
  } else {
    ae(msg, undefined, title)
  }
}
