import yoMockData from '../../app/utils/YoMockData';

const generated = jest.genMockFromModule('@steemit/steem-js');

module.exports = {
    ...generated,
    api: {
        ...generated.api,
        callAsync: async (resource, options) => {
            switch (resource) {
                case 'yo.get_notifications':
                    if (options.username === 'bad') {
                        return yoMockData.get_bad_notifications;
                    }
                    return yoMockData.get_notifications;
                default:
                    throw new Error('unimplemented mock');
            }
        },
    },
};
