import {Attributes, EditStatusConfig, getString, LoadingService, Locale, MetaModel, resources, ResourceService, StringMap, UIService, ViewService} from './core';
import {build as build2} from './metadata';

interface ErrorMessage {
  field: string;
  code: string;
  param?: string | number | Date;
  message?: string;
}
// export type Status = 0 | 1 | 2 | 4 | 8;
export interface ResultInfo<T> {
  status: string|number;
  errors?: ErrorMessage[];
  value?: T;
  message?: string;
}
export interface EditParameter {
  resource: ResourceService;
  showMessage: (msg: string, option?: string) => void;
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
  confirm: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
  ui?: UIService;
  getLocale?: (profile?: string) => Locale;
  loading?: LoadingService;
  status?: EditStatusConfig;
}
export interface GenericService<T, ID, R> extends ViewService<T, ID> {
  patch?(obj: T, ctx?: any): Promise<R>;
  insert(obj: T, ctx?: any): Promise<R>;
  update(obj: T, ctx?: any): Promise<R>;
  delete?(id: ID, ctx?: any): Promise<number>;
}

export function build(attributes: Attributes, ignoreDate?: boolean, name?: string): MetaModel {
  if (resources.cache && name && name.length > 0) {
    let meta: MetaModel = resources._cache[name];
    if (!meta) {
      meta = build2(attributes, ignoreDate);
      resources._cache[name] = meta;
    }
    return meta;
  } else {
    return build2(attributes, ignoreDate);
  }
}

export function createModel<T>(attributes?: Attributes): T {
  const obj: any = {};
  if (!attributes) {
    return obj;
  }
  const attrs = Object.keys(attributes);
  for (const k of attrs) {
    const attr = attributes[k];
    if (attr.name) {
      switch (attr.type) {
        case 'string':
        case 'text':
          obj[attr.name] = '';
          break;
        case 'integer':
        case 'number':
          obj[attr.name] = 0;
          break;
        case 'array':
          obj[attr.name] = [];
          break;
        case 'boolean':
          obj[attr.name] = false;
          break;
        case 'date':
          obj[attr.name] = new Date();
          break;
        case 'object':
          if (attr.typeof) {
            const object = createModel(attr.typeof);
            obj[attr.name] = object;
            break;
          } else {
            obj[attr.name] = {};
            break;
          }
        case 'ObjectId':
          obj[attr.name] = null;
          break;
        default:
          obj[attr.name] = '';
          break;
      }
    }
  }
  return obj;
}

export function handleStatus(x: number|string, st: EditStatusConfig, gv: StringMap|((k: string, p?: any) => string), se: (m: string, title?: string, detail?: string, callback?: () => void) => void): void {
  const title = getString('error', gv);
  if (x === st.version_error) {
    se(getString('error_version', gv), title);
  } else if (x === st.data_corrupt) {
    se(getString('error_data_corrupt', gv), title);
  } else {
    se(getString('error_internal', gv), title);
  }
}
export function handleVersion<T>(obj: T, version?: string): void {
  if (obj && version && version.length > 0) {
    const v = (obj as any)[version];
    if (v && typeof v === 'number') {
      (obj as any)[version] = v + 1;
    } else {
      (obj as any)[version] = 1;
    }
  }
}
