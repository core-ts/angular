export function setReadOnly(form?: HTMLFormElement | null, ...args: string[]): void {
  if (!form) {
    return
  }
  const len = form.length
  for (let i = 0; i < len; i++) {
    const ctrl = form[i] as HTMLInputElement
    const name = ctrl.getAttribute("name")
    let skip = false
    if (name != null && name.length > 0 && name !== "btnBack") {
      if (arguments.length > 1) {
        for (let j = 1; j < arguments.length; j++) {
          if (arguments[j] === name) {
            skip = true
            // continue; has bugs => why?
          }
        }
      }
      if (skip === false) {
        let nodeName = ctrl.nodeName
        const type = ctrl.getAttribute("type")
        if (nodeName === "INPUT" && type !== null) {
          nodeName = type.toUpperCase()
        }
        if (nodeName !== "BUTTON" && nodeName !== "RESET" && nodeName !== "SUBMIT" && nodeName !== "SELECT") {
          switch (type) {
            case "checkbox":
              ctrl.disabled = true
              break
            case "radio":
              ctrl.disabled = true
              break
            default:
              ctrl.readOnly = true
          }
        } else {
          ctrl.disabled = true
        }
      }
    }
  }
}
export function focusFirstError(form?: HTMLFormElement | null, className?: string): void {
  if (!form) {
    return
  }
  const len = form.length
  if (className && className.length > 0) {
    for (let i = 0; i < len; i++) {
      const ctrl = form[i] as HTMLInputElement
      const parent = ctrl.parentElement
      if (ctrl.classList.contains(className) || (parent && parent.classList.contains(className))) {
        ctrl.focus()
        ctrl.scrollIntoView()
        return
      }
    }
  } else {
    for (let i = 0; i < len; i++) {
      const ctrl = form[i] as HTMLInputElement
      const parent = ctrl.parentElement
      if (ctrl.classList.contains("invalid") || ctrl.classList.contains(".ng-invalid") || (parent && parent.classList.contains("invalid"))) {
        ctrl.focus()
        ctrl.scrollIntoView()
        return
      }
    }
  }
}
