const expo = {
  proxyImage: function (u){
    let utr = u.trim();
    if (utr.indexOf(' ')>-1) return 'https://cyber.fund/images/labels/brokenUrl.svg'
    const prox = $STM_Config.img_proxy_prefix
    const size = '0x0' // масштабирование: "как есть"
    const url = (prox ? prox + size + '/' : '') + utr;
    return url;
  }
}
export {expo as default}
console.log(expo)

exports.test = {
  run: () => {
    let test_spaces = ' in the woods ';
    let successes = 0, failures = 0;
    function test(description, result){
      if (result) successes += 1;
      else failures += 1;
      console.log (`test${result?'+':'-'}'${description}'`, successes, failures);
    }
    console.log('inside a test runner of an images/urls utility','successes', 'failures')

    console.log(```
      after passing all the tests:
       successes: ${successes},
       failures: ${failures}
    ```)
  }
}
