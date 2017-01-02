const expo = {
  proxyImage(u){
    let utr = u.trim();
    if (utr.indexOf(' ')>-1) return 'https://cyber.fund/images/labels/brokenUrl.svg'
    const prox = $STM_Config.img_proxy_prefix
    const size = '0x0' // масштабирование: "как есть"
    const url = (prox ? prox + size + '/' : '') + utr;
    return url;
  }
}

export {expo as default}
