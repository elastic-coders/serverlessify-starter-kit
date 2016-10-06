import moment from 'moment';

export default class AuthCache {
  constructor() {
    this.authCache = {};
  }

  setAuthCacheEntry = ({ key, value, ttl }, cb) => {
    this.authCache[key] = {
      value,
      expires: moment().add(ttl, 'seconds'),
    };
    cb();
  };

  getAuthCacheEntry = (key, cb) => {
    const cache = this.authCache[key];
    if (!cache) {
      cb(`[server#auth-cache] Key not found in auth cache: ${key}`);
    } else if (moment().isSameOrAfter(cache.expires)) {
      cb(`[server#auth-cache] Cache value expired for key: ${key}`);
    } else {
      cb(null, cache.value);
    }
  };
}
