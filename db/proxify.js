const discussions = [
    'getDiscussionsByCreatedAsync',
    'getDiscussionsByHotAsync',
    'getDiscussionsByTrendingAsync',
]

const proxifyMethods = [
    'getTrendingTagsAsync',
    'getCurrentMedianHistoryPriceAsync',
    'getDynamicGlobalPropertiesAsync'
].concat(discussions)

export default async function proxify(ctx, context, method, ...args) {
    const { chainproxy, metrics } = ctx

    if (proxifyMethods.includes(method)) {
        try {
            if (discussions.includes(method)) {
                const [ query ] = args
                if ('select_tags' in query) {
                    throw new Error('select_tags not supported')
                }
            }
            const [[ key, data ]] = await chainproxy.call('get_data', method)
            if (data) {
                return Promise.resolve(data)
            } else {
                throw new Error('no data')
            }
        } catch (e) {
            metrics.cache(method, 'MISS')
            console.log(new Date(), 'MISS', method, args)
            return await defaultCall(ctx, context, method, args)
        }
    } else {
        return await defaultCall(ctx, context, method, args)
    }
}

async function defaultCall(ctx, context, method, args) {
    const { metrics } = ctx
    if (metrics) {
        return await metrics.track(context, method, args)
    } else { 
        return await context[method].apply(context, args)
    }
}
