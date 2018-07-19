import { 
    globalProps,
    trendingTagsRaw,
    feedPrice,
    discussionsBy,
    wtns,
    accountBlogEntries,
    accountGuestBloggers,
    accountReputation,
    accountFeedEntries,
    discussionsByComments,
    repliesByLastUpdate,
    accountHistory,
    contentReplies
} from 'app/utils/test_fixtures/chain_data'

export function getDynamicGlobalProperties() {
    return Promise.resolve(globalProps)
}

export function getCurrentMedianHistoryPrice() {
    return Promise.resolve(feedPrice)
}

export function getTrendingTags(afterTag, limit) {
    return Promise.resolve(trendingTagsRaw)
}

export function getTagsUsedByAuthor(author) {
    return Promise.resolve([])
}

export function getAccounts(names) {
    return Promise.resolve([{ name: 'rey', reputation: '801751331759' }])
}

export function getAccountHistory(account, from, limit) {
    return Promise.resolve(accountHistory)
}

export function getRepliesByLastUpdate(startAuthor, startPermlink, limit) {
    return Promise.resolve(repliesByLastUpdate)
}

export function getDiscussionsByComments(query) {
    return Promise.resolve(discussionsByComments)
}

export function getBlogAuthors(blogAccount) {
    return Promise.resolve(accountGuestBloggers[0])
}

export function getBlogEntries(account, entryId, limit) {
    return Promise.resolve(accountBlogEntries)
}

export function getFeedEntries(account, entryId, limit) {
    return Promise.resolve(accountFeedEntries)
}

export function getAccountReputations(lowerBoundName, limit) {
    return Promise.resolve(accountReputation)
}

export function getWitnessesByVote(from, limit) {
    return Promise.resolve(wtns)
}

export function getContent(author, permlink) {
    if (permlink === 'new-hope') {
        return Promise.resolve({
            id: 1,
            author: 'lyke',
            permlink: 'new-hope',
            category: 'rebel',
            replies: []
        })
    } else if (permlink === 'the-force-awakens') {
        return Promise.resolve({
                id: 2,
                author: 'rey',
                permlink: 'the-force-awakens',
                category: 'rebel',
                replies: []
            })
    } else if (permlink === 'one-way-or-another') {
        return Promise.resolve({
                id: 3,
                author: 'kylo-ren',
                permlink: 'one-way-or-another',
                category: 'first-order',
                replies: []
            })
    }
}

export function getAllContentReplies(author, permlink) {
    return Promise.resolve(contentReplies)
}

export function gedDiscussionsBy(type, args) {
    return Promise.resolve(discussionsBy)
}
