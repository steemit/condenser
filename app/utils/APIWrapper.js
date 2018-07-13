import { api } from 'golos-js'
import { PUBLIC_API } from 'app/client_config'

export function getDynamicGlobalProperties() {
    return api.getDynamicGlobalPropertiesAsync()
}

export function getCurrentMedianHistoryPrice() {
    return api.getCurrentMedianHistoryPriceAsync()
}

export function getTrendingTags(afterTag, limit) {
    return api.getTrendingTagsAsync(afterTag, limit)
}

export function getTagsUsedByAuthor(author) {
    return api.getTagsUsedByAuthorAsync(author)
}

export function getAccounts(names) {
    return api.getAccountsAsync(names)
}

export function getAccountHistory(account, from, limit) {
    return api.getAccountHistoryAsync(account, from, limit)
}

export function getRepliesByLastUpdate(startAuthor, startPermlink, limit, voteLimit) {
    return api.getRepliesByLastUpdateAsync(startAuthor, startPermlink, limit, voteLimit)
}

export function getDiscussionsByComments(query) {
    return api.getDiscussionsByCommentsAsync(query)
}

export function getBlogAuthors(blogAccount) {
    return api.getBlogAuthorsAsync(blogAccount)
}

export function getBlogEntries(account, entryId, limit) {
    return api.getBlogEntriesAsync(account, entryId, limit)
}

export function getFeedEntries(account, entryId, limit) {
    return api.getFeedEntriesAsync(account, entryId, limit)
}

export function getAccountReputations(lowerBoundName, limit) {
    return {}
}

export function getWitnessesByVote(from, limit) {
    return api.getWitnessesByVoteAsync(from, limit)
}

export function getContent(author, permlink, voteLimit) {
    return api.getContentAsync(author, permlink, voteLimit)
}

export function getContentReplies(author, permlink, voteLimit) {
    return api.getContentRepliesAsync(author, permlink, voteLimit)
}

export function getAllContentReplies(author, permlink, voteLimit) {
    return api.getAllContentRepliesAsync(author, permlink, voteLimit)
}

export function gedDiscussionsBy(type, args) {
    return api[PUBLIC_API[type]](args)
}

export function getActiveVotesAsync(account, permlink) {
    return api.getActiveVotesAsync(account, permlink)
}

export function getHardforkVersion() {
    return api.getHardforkVersionAsync()
}
