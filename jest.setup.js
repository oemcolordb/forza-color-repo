// Polyfill Request and Response for Node.js test environment
import '@testing-library/jest-dom';

if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = input;
      this.method = init.method || 'GET';
      this.headers = {
        get: (key) => (init.headers || {})[key] || null
      };
      this.body = init.body;
    }
    
    async json() {
      return JSON.parse(this.body);
    }
  };
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.ok = this.status >= 200 && this.status < 300;
      this.headers = init.headers || {};
    }
    
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
  };
}
