const expo = {
  ifObjectToJSON: (item) => {
    if (typeof item==='object') {
      try {
        return JSON.stringify(item);
      } catch(e) {return item;}
    }
    return item;
  },

  ifStringParseJSON: (item) => {
    if (typeof item==='string') {
      try {
        return JSON.parse(item);
      } catch (e) {
        return item;
      }
    }
    return item;
  }
}

export {expo as default}
exports.test = {
  run() {
    console.log("just runned a test! yay!")
    console.log("now expo");
    console.log(expo);
  }
}
