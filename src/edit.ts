import {Metadata, MetaModel, resources} from './core';
import {build as build2} from './metadata';

interface ErrorMessage {
  field: string;
  code: string;
  param?: string | number | Date;
  message?: string;
}
export type Status = 0 | 1 | 2 | 4 | 8;
export interface ResultInfo<T> {
  status: Status;
  errors?: ErrorMessage[];
  value?: T;
  message?: string;
}

export function build(model: Metadata): MetaModel {
  if (resources.cache) {
    let meta: MetaModel = resources._cache[model.name];
    if (!meta) {
      meta = build2(model);
      resources._cache[model.name] = meta;
    }
    return meta;
  } else {
    return build2(model);
  }
}

export function createModel<T>(model?: Metadata): T {
  const obj: any = {};
  if (!model) {
    return obj;
  }
  const attrs = Object.keys(model.attributes);
  for (const k of attrs) {
    const attr = model.attributes[k];
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
  return obj;
}

export function buildMessageFromStatusCode(status: Status, gv: (k: string) => string): string {
  if (status === 0) {
    return gv('error_duplicate_key');
  } else if (status === 2) { // Below message for update only, not for add
    return gv('error_version');
  } else if (status === 8) {
    return gv('error_data_corrupt');
  } else {
    return '';
  }
}

export function handleVersion<T>(obj: T, version: string): void {
  if (obj && version && version.length > 0) {
    const v = obj[version];
    if (v && typeof v === 'number') {
      obj[version] = v + 1;
    } else {
      obj[version] = 1;
    }
  }
}
