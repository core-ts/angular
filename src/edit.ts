import { Attributes, ErrorMessage, StringMap } from "./core"

export function createModel<T>(attributes?: Attributes): T {
  const obj: any = {}
  if (!attributes) {
    return obj
  }
  const attrs = Object.keys(attributes)
  for (const k of attrs) {
    const attr = attributes[k]
    if (attr.name) {
      switch (attr.type) {
        case "string":
        case "text":
          obj[attr.name] = ""
          break
        case "integer":
        case "number":
          obj[attr.name] = 0
          break
        case "array":
          obj[attr.name] = []
          break
        case "boolean":
          obj[attr.name] = false
          break
        case "date":
          obj[attr.name] = new Date()
          break
        case "object":
          if (attr.typeof) {
            const object = createModel(attr.typeof)
            obj[attr.name] = object
            break
          } else {
            obj[attr.name] = {}
            break
          }
        case "ObjectId":
          obj[attr.name] = null
          break
        default:
          obj[attr.name] = ""
          break
      }
    }
  }
  return obj
}

export function isSuccessful<T>(x: number | T | ErrorMessage[]): boolean {
  if (Array.isArray(x)) {
    return false
  } else if (typeof x === "object") {
    return true
  } else if (typeof x === "number" && x > 0) {
    return true
  }
  return false
}

type Result<T> = number | T | ErrorMessage[]
export function afterSaved<T>(
  res: Result<T>,
  form: HTMLFormElement | undefined,
  resource: StringMap,
  showFormError: (form?: HTMLFormElement, errors?: ErrorMessage[]) => ErrorMessage[],
  alertSuccess: (msg: string, callback?: () => void) => void,
  alertError: (msg: string) => void,
) {
  if (Array.isArray(res)) {
    showFormError(form, res)
  } else if (isSuccessful(res)) {
    alertSuccess(resource.msg_save_success, () => window.history.back())
  } else if (res === 0) {
    alertError(resource.error_not_found)
  } else {
    alertError(resource.error_conflict)
  }
}
