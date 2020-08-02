import {storage} from '../storage';

interface Headers {
  [key: string]: any;
}

class HttpOptionsService {
  getHttpOptions(): { headers?: Headers } {
    const token = storage.getToken();
    if (token === null) {
      return {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      };
    } else {
      return {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': 'Bearer ' + token
        }
      };
    }
  }
}

export const httpOptionsService = new HttpOptionsService();
