async function proxify(method, context, proxy, lifetime /*, options */) {
  const options = [].slice.call(arguments).splice(4);
  const proxyKey = method + JSON.stringify(options);
  let res = [];

  if (process.env.NODE_ENV === 'development') {
    return await context[method].apply(context, options);
  }

  try {
    const cache = await proxy.call('chaindb_get', proxyKey);
    if (cache && cache.length >= 1)
      res = cache[0].slice(2);
  }
  catch (e) {
    console.error('-- /api/v1/proxy/method error -->', proxyKey, e.message);
  }
  if (typeof res === 'object' && res.length) {
    res = res[0];
  }
  else {
    await proxy.call('chaindb_update_in_progress', proxyKey);
    if (typeof options[0] !== 'undefined') {
      res = await context[method].apply(context, options);
    }
    else {
      res = await context[method].apply(context);
    }
    try {
      await proxy.call('chaindb_set', lifetime, proxyKey, res);
    }
    catch (e) {
      console.error('-- /api/v1/proxy/method error -->', proxyKey, e.message);
    }
  }
  return res;
}

export default proxify;
