import { StringMap } from "./core"

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
