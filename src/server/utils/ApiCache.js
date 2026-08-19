import NodeCache from 'node-cache';

const defaultTTLs = {
    get_trending_topics: 300,
    get_community: 600,
    get_profile: 300,
    get_ranked_posts: 30,
    get_account_posts: 30,
    get_discussion: 60,
    get_post_header: 300,
    feed_history: 60,
    dynamic_global_properties: 60,
};

export default class ApiCache {
    constructor(ttls = {}) {
        const merged = { ...defaultTTLs, ...ttls };
        this.cache = new NodeCache({
            stdTTL: 300,
            checkperiod: 60,
            useClones: false,
        });
        this.ttls = merged;
        this.inflight = new Map();
    }

    // Methods where observer affects the response (role/permission data).
    // Cache without observer to avoid key explosion under many distinct users.
    static observerAwareMethods = new Set([
        'get_community',
        'get_ranked_posts',
        'get_account_posts',
    ]);

    _key(method, params) {
        const p = params || {};
        if (ApiCache.observerAwareMethods.has(method)) {
            const { observer, ...rest } = p;
            return method + ':' + JSON.stringify(rest);
        }
        return method + ':' + JSON.stringify(p);
    }

    async getOrFetch(method, params, fetchFn) {
        const key = this._key(method, params);

        const cached = this.cache.get(key);
        if (cached !== undefined) {
            return cached;
        }

        if (this.inflight.has(key)) {
            return this.inflight.get(key);
        }

        const promise = fetchFn()
            .then(data => {
                const ttl = this.ttls[method];
                if (ttl && ttl > 0) {
                    this.cache.set(key, data, ttl);
                }
                return data;
            })
            .finally(() => {
                this.inflight.delete(key);
            });

        this.inflight.set(key, promise);
        return promise;
    }

    invalidate(method, params) {
        const key = this._key(method, params);
        this.cache.del(key);
    }

    flushAll() {
        this.cache.flushAll();
        this.inflight.clear();
    }

    getStats() {
        return this.cache.getStats();
    }
}
