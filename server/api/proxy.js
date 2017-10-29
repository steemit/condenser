import koa_router from 'koa-router';
import koa_body from 'koa-body';
import Tarantool from 'db/tarantool';
import { api } from 'golos-js';
import proxify from 'db/proxify';

function proxyRoutes(app) {
  const router = koa_router({prefix: '/api/v1/proxy'});
  app.use(router.routes());
  const koaBody = koa_body();
  const chainproxy = Tarantool.instance('chainproxy');

  router.post('/', koaBody, function* () {
    const params = this.request.body;
    const method = params.method ? params.method : null;
    let args;
    if (typeof api[method] === "function" && /^get/.test(method)) {
      if (/^getDiscussionsBy/.test(method)) {
        args = {
          limit: 20,
          truncate_body: 1024,
          filter_tags: ['test', 'bm-open', 'bm-ceh23', 'bm-tasks', 'bm-taskceh1']
        };
      }
      this.body = yield proxify(method, api, chainproxy, 15, args);
    }
    else {
      this.body = {status: "404", data: 'Method not found'};
    }
  });
}

module.exports = {
  proxyRoutes
};
