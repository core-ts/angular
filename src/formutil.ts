export function readOnly(form?: HTMLFormElement|null): void {
  if (!form) {
    return;
  }
  const len = form.length;
  for (let i = 0; i < len; i++) {
    const ctrl = form[i] as HTMLInputElement;
    const name = ctrl.getAttribute('name');
    if (name != null && name.length > 0 && name !== 'btnBack') {
      let nodeName = ctrl.nodeName;
      const type = ctrl.getAttribute('type');
      if (nodeName === 'INPUT' && type !== null) {
        nodeName = type.toUpperCase();
      }
      if (nodeName !== 'BUTTON'
        && nodeName !== 'RESET'
        && nodeName !== 'SUBMIT'
        && nodeName !== 'SELECT') {
        switch (type) {
          case 'checkbox':
            ctrl.disabled = true;
            break;
          case 'radio':
            ctrl.disabled = true;
            break;
          default:
            ctrl.readOnly = true;
        }
      } else {
        ctrl.disabled = true;
      }
    }
  }
}
export function focusFirstElement(form: HTMLFormElement): void {
  let i = 0;
  const len = form.length;
  for (i = 0; i < len; i++) {
    const ctrl = form[i] as HTMLInputElement;
    if (!(ctrl.readOnly || ctrl.disabled)) {
      let nodeName = ctrl.nodeName;
      const type = ctrl.getAttribute('type');
      if (type) {
        const t = type.toUpperCase();
        if (t === 'BUTTON' || t === 'SUBMIT') {
          ctrl.focus();
        }
        if (nodeName === 'INPUT') {
          nodeName = t;
        }
      }
      if (nodeName !== 'BUTTON'
        && nodeName !== 'RESET'
        && nodeName !== 'SUBMIT'
        && nodeName !== 'CHECKBOX'
        && nodeName !== 'RADIO') {
        ctrl.focus();
        try {
          ctrl.setSelectionRange(0, ctrl.value.length);
        } catch (err) {
        }
        return;
      }
    }
  }
}
export function focusFirstError(form?: HTMLFormElement|null, className?: string): void {
  if (!form) {
    return;
  }
  const len = form.length;
  if (className && className.length > 0) {
    for (let i = 0; i < len; i++) {
      const ctrl = form[i] as HTMLInputElement;
      const parent = ctrl.parentElement;
      if (ctrl.classList.contains(className)
        || (parent && parent.classList.contains(className))) {
        ctrl.focus();
        ctrl.scrollIntoView();
        return;
      }
    }
  } else {
    for (let i = 0; i < len; i++) {
      const ctrl = form[i] as HTMLInputElement;
      const parent = ctrl.parentElement;
      if (ctrl.classList.contains('invalid')
        || ctrl.classList.contains('.ng-invalid')
        || (parent && parent.classList.contains('invalid'))) {
        ctrl.focus();
        ctrl.scrollIntoView();
        return;
      }
    }
  }
}
