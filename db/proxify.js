async function proxify(method, context, proxy, lifetime /*, options */) {
  const options = [].slice.call(arguments).splice(4);
  const proxyKey = method + JSON.stringify(options);
  let res = [];
  try {
    const cache = await proxy.call('chaindb_get', proxyKey);
    if (cache && cache.length >= 1)
      res = cache[0].slice(2);
  }
  catch (e) {
    console.error('-- /api/v1/proxy/method error -->', method, e.message);
  }
  if (typeof res === 'object' && res.length) {
    res = res[0];
  }
  else {
    if (typeof options[0] !== 'undefined') {
      res = await context[method].apply(context, options);
    }
    else {
      res = await context[method].apply(context);
    }
    await proxy.call('chaindb_set', lifetime, proxyKey, res);
  }
  return res;
}

export default proxify;
