import {storage} from './storage';

export function authenticated(): boolean {
  const user = storage.getUser();
  if (user) {
    return true;
  } else {
    return false;
  }
}
