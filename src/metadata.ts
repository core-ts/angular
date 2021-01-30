import {Attribute, Format, MetaModel, Model, Type} from './core';

export function build(model: Model): MetaModel {
  if (model && !model.source) {
    model.source = model.name;
  }
  const meta: MetaModel = {model};
  const pks: string[] = new Array<string>();
  const dateFields = new Array<string>();
  const integerFields = new Array<string>();
  const numberFields = new Array<string>();
  const currencyFields = new Array<string>();
  const phoneFields = new Array<string>();
  const faxFields = new Array<string>();
  const objectFields = new Array<MetaModel>();
  const arrayFields = new Array<MetaModel>();
  const keys: string[] = Object.keys(model.attributes);
  for (const key of keys) {
    const attr: Attribute = model.attributes[key];
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
        case Type.String: {
          switch (attr.format) {
            case Format.Phone:
              phoneFields.push(attr.name);
              break;
            case Format.Fax:
              faxFields.push(attr.name);
              break;
            default:
              break;
          }
          break;
        }
        case Type.Number: {
          switch (attr.format) {
            case Format.Currency:
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
        case Type.Integer: {
          integerFields.push(attr.name);
          break;
        }
        case Type.Date: {
          dateFields.push(attr.name);
          break;
        }
        case Type.Object: {
          if (attr.typeof) {
            const x = build(attr.typeof);
            x.attributeName = key;
            objectFields.push(x);
          }
          break;
        }
        case Type.Array: {
          if (attr.typeof) {
            const y = build(attr.typeof);
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
