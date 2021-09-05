import {Attribute, Attributes, MetaModel} from './core';

export function build(attributes: Attributes, ignoreDate?: boolean): MetaModel {
  const meta: MetaModel = {attributes};
  const pks: string[] = new Array<string>();
  const dateFields = new Array<string>();
  const integerFields = new Array<string>();
  const numberFields = new Array<string>();
  const currencyFields = new Array<string>();
  const phoneFields = new Array<string>();
  const faxFields = new Array<string>();
  const objectFields = new Array<MetaModel>();
  const arrayFields = new Array<MetaModel>();
  const keys: string[] = Object.keys(attributes);
  for (const key of keys) {
    const attr: Attribute = attributes[key];
    if (attr) {
      attr.name = key;
      if (attr.version) {
        meta.version = attr.name;
      }
      if (attr.ignored !== true) {
        if (attr.key) {
          pks.push(attr.name);
        }
      }

      switch (attr.type) {
        case 'string': {
          switch (attr.format) {
            case 'phone':
              phoneFields.push(attr.name);
              break;
            case 'fax':
              faxFields.push(attr.name);
              break;
            default:
              break;
          }
          break;
        }
        case 'number': {
          switch (attr.format) {
            case 'currency':
              currencyFields.push(attr.name);
              break;
            /*
            case FormatType.Percentage:
              percentageFields.push(attr.name);
              break;
            */
            default:
              numberFields.push(attr.name);
              break;
          }
          break;
        }
        case 'integer': {
          integerFields.push(attr.name);
          break;
        }
        case 'date': {
          if (ignoreDate) {
            dateFields.push(attr.name);
          }
          break;
        }
        case 'datetime': {
          dateFields.push(attr.name);
          break;
        }
        case 'object': {
          if (attr.typeof) {
            const x = build(attr.typeof, ignoreDate);
            x.attributeName = key;
            objectFields.push(x);
          }
          break;
        }
        case 'array': {
          if (attr.typeof) {
            const y = build(attr.typeof, ignoreDate);
            y.attributeName = key;
            arrayFields.push(y);
          }
          break;
        }
        default:
          break;
      }
    }
  }
  if (pks.length > 0) {
    meta.keys = pks;
  }
  if (dateFields.length > 0) {
    meta.dateFields = dateFields;
  }
  if (integerFields.length > 0) {
    meta.integerFields = integerFields;
  }
  if (numberFields.length > 0) {
    meta.numberFields = numberFields;
  }
  if (currencyFields.length > 0) {
    meta.currencyFields = currencyFields;
  }
  if (phoneFields.length > 0) {
    meta.phoneFields = phoneFields;
  }
  if (faxFields.length > 0) {
    meta.faxFields = faxFields;
  }
  if (objectFields.length > 0) {
    meta.objectFields = objectFields;
  }
  if (arrayFields.length > 0) {
    meta.arrayFields = arrayFields;
  }
  return meta;
}
