import {DiffStatusConfig, EditStatusConfig, LoadingService, Locale, ResourceService, UIService} from './core';

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
interface ShortSearchParameter {
  auto?: boolean;
}
export function getAutoSearch(p: ResourceService|ShortSearchParameter): boolean {
  const x: any = p;
  if (x.value && x.format && typeof x.value === 'function') {
    return true;
  }
  return x.auto;
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
  showMessage: (msg: string, option?: string) => void;
}
export function getMsgFunc(p: ResourceService|ShowMessageInput, showMsg?: (msg: string, option?: string) => void): (msg: string) => void {
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
  getLocale?: (profile?: string) => Locale;
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
export interface EditStatusParameter {
  status?: EditStatusConfig;
}
export function getEditStatusFunc(p: ResourceService|EditStatusParameter, status?: EditStatusConfig): EditStatusConfig {
  if (status) {
    return status;
  }
  return (p as any).status;
}
export interface DiffStatusParameter {
  status?: DiffStatusConfig;
}
export function getDiffStatusFunc(p: ResourceService|DiffStatusParameter, status?: DiffStatusConfig): DiffStatusConfig {
  if (status) {
    return status;
  }
  return (p as any).status;
}
