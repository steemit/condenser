export default async function proxify(metrics, context, method, ...args) {
    if (metrics) {
        return await metrics.track(context, method, args)
    } else { 
        return await context[method].apply(context, args)
    }
}
