import { DiffModel } from './core';
import { clone, diff } from './reflect';

export function showDiff<T>(form: HTMLFormElement, value: T, origin?: T): void {
  if (!origin) {
    origin = ({} as any);
  }
  const differentKeys = diff(origin, value);
  for (const differentKey of differentKeys) {
    const y = form.querySelector('.' + differentKey);
    if (y) {
      if (y.childNodes.length === 3) {
        y.children[1].classList.add('highlight');
        y.children[2].classList.add('highlight');
      } else {
        y.classList.add('highlight');
      }
    }
  }
}
export function formatDiffModel<T, ID>(obj: DiffModel<T, ID>, formatFields?: (obj3: T) => T): DiffModel<T, ID> {
  if (!obj) {
    return obj;
  }
  const obj2 = clone(obj);
  if (!obj2.origin) {
    obj2.origin = {};
  } else {
    if (typeof obj2.origin === 'string') {
      obj2.origin = JSON.parse(obj2.origin);
    }
    if (formatFields && typeof obj2.origin === 'object' && !Array.isArray(obj2.origin)) {
      obj2.origin = formatFields(obj2.origin);
    }
  }
  if (!obj2.value) {
    obj2.value = {};
  } else {
    if (typeof obj2.value === 'string') {
      obj2.value = JSON.parse(obj2.value);
    }
    if (formatFields && typeof obj2.value === 'object' && !Array.isArray(obj2.value)) {
      obj2.value = formatFields(obj2.value);
    }
  }
  return obj2;
}
