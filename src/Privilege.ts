export interface Privilege {
  id: string;
  name: string;
  resource?: string;
  path: string;
  icon?: string;
  sequence?: number;
  children?: Privilege[];
}

export function toMap(map: Map<string, Privilege>, forms: Privilege[]) {
  if (!map || !forms) {
    return;
  }
  for (const form of forms) {
    map.set(form.path, form);
  }
  for (const form of forms) {
    if (form.children && Array.isArray(form.children)) {
      toMap(map, form.children);
    }
  }
}

export function sortPrivileges(forms: Privilege[]): Privilege[] {
  forms.sort(sortBySequence);
  for (const form of forms) {
    if (form.children && Array.isArray(form.children)) {
      form.children = sortPrivileges(form.children);
    }
  }
  return forms;
}

export function sortBySequence(a: any, b: any): number {
  if (!a.sequence) {
    a.sequence = 99;
  }
  if (!b.sequence) {
    b.sequence = 99;
  }
  return (a.sequence - b.sequence);
}
