const expo = {
    ifObjectToJSON: item => {
        if (typeof item === 'object') {
            try {
                return JSON.stringify(item);
            } catch (e) {
                return item;
            }
        }
        return item;
    },

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
        console.log('test eq1', expo.ifObjectToJSON(ob) == st);
        console.log('test eq2', expo.ifStringParseJSON(st).a == ob.a);
    },
};
