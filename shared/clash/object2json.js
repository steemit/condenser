const expo = {
    ifStringParseJSON: item => {
        if (typeof item === 'string') {
            try {
                return JSON.parse(item);
            } catch (e) {
                return item;
            }
        }
        return item;
    },
};
export { expo as default };

exports.test = {
    run: () => {
        let ob = { a: 2 },
            st = '{"a":2}';
        console.log('test eq2', expo.ifStringParseJSON(st).a == ob.a);
    },
};
