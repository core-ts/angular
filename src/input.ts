import {LoadingService, Locale, ResourceService, UIService} from './core';

interface ResourceInput {
  resource: ResourceService;
}
export function getResource(p: ResourceService|ResourceInput): ResourceService {
  const x: any = p;
  if (x.value && x.format && typeof x.value === 'function') {
    return x;
  } else {
    return x.resource;
  }
}
interface UIInput {
  ui?: UIService;
}
export function getUIService(p: ResourceService|UIInput, ui0?: UIService): UIService {
  if (ui0) {
    return ui0;
  }
  return (p as any).ui;
}
interface LoadingInput {
  loading?: LoadingService;
}
export function getLoadingFunc(p: ResourceService|LoadingInput, ui0?: LoadingService): LoadingService {
  if (ui0) {
    return ui0;
  }
  return (p as any).loading;
}
interface ShowMessageInput {
  showMessage: (msg: string) => void;
}
export function getMsgFunc(p: ResourceService|ShowMessageInput, showMsg?: (msg: string) => void): (msg: string) => void {
  if (showMsg) {
    return showMsg;
  }
  return (p as any).showMessage;
}
interface ConfirmInput {
  confirm: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
}
export function getConfirmFunc(p: ResourceService|ConfirmInput, cf?: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void): (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void {
  if (cf) {
    return cf;
  }
  return (p as any).confirm;
}
interface GetLocaleInput {
  getLocale?: () => Locale;
}
export function getLocaleFunc(p: ResourceService|GetLocaleInput, getLoc?: () => Locale): () => Locale {
  if (getLoc) {
    return getLoc;
  }
  return (p as any).getLocale;
}
interface ShowErrorInput {
  showError: (m: string, header?: string, detail?: string, callback?: () => void) => void;
}
export function getErrorFunc(p: ResourceService|ShowErrorInput, showErr?: (m: string, header?: string, detail?: string, callback?: () => void) => void): (m: string, header?: string, detail?: string, callback?: () => void) => void {
  if (showErr) {
    return showErr;
  }
  return (p as any).showError;
}
