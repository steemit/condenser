import { PUBLIC_API } from 'app/client_config'

export default async function getState(api, url, options, offchain = {}) {
    if (!url || typeof url !== 'string' || !url.length || url === '/') url = 'trending'
    if (url[0] === '/') url = url.substr(1)
    
    const parts = url.split('/')
    const tag = typeof parts[1] !== 'undefined' ? parts[1] : ''

    const state = {}
    state.current_route = `/${url}`
    state.props = await api.getDynamicGlobalProperties()
    state.categories = {}
    state.tags = {}
    state.content = {}
    state.accounts = {}
    state.witnesses = {}
    state.discussion_idx = {}
    state.feed_price = await api.getCurrentMedianHistoryPrice()
    state.select_tags = []
    
    let accounts = new Set()

    // by default trending tags limit=50, but if we in '/tags/' path then limit = 250
    const trending_tags = await api.getTrendingTags('', parts[0] == 'tags' ? '250' : '50')

    if (parts[0][0] === '@') {
        const uname = parts[0].substr(1)
        const [ account ] = await api.getAccounts([uname])
        state.accounts[uname] = account
        
        if (account) {
            state.accounts[uname].tags_usage = await api.getTagsUsedByAuthor(uname)
            state.accounts[uname].guest_bloggers = await api.getBlogAuthors(uname)

            switch (parts[1]) {
                case 'transfers':
                    const history = await api.getAccountHistory(uname, -1, 1000)
                    account.transfer_history = []
                    account.other_history = []
                    
                    history.forEach(operation => {
                        switch (operation[1].op[0]) {
                            case 'transfer_to_vesting':
                            case 'withdraw_vesting':
                            case 'interest':
                            case 'transfer':
                            case 'liquidity_reward':
                            case 'author_reward':
                            case 'curation_reward':
                            case 'transfer_to_savings':
                            case 'transfer_from_savings':
                            case 'cancel_transfer_from_savings':
                            case 'escrow_transfer':
                            case 'escrow_approve':
                            case 'escrow_dispute':
                            case 'escrow_release':
                                state.accounts[uname].transfer_history.push(operation)
                            break

                            default:
                                state.accounts[uname].other_history.push(operation)
                        }
                    })
                break

                case 'recent-replies':
                    const replies = await api.getRepliesByLastUpdate(uname, '', 50)
                    state.accounts[uname].recent_replies = []

                    replies.forEach(reply => {
                        const link = `${reply.author}/${reply.permlink}`
                        state.content[link] = reply
                        state.accounts[uname].recent_replies.push(link)
                    })
                break

                case 'posts':
                case 'comments':
                    const comments = await api.getDiscussionsByComments({ start_author: uname, limit: 20 })
                    state.accounts[uname].comments = []

                    comments.forEach(comment => {
                        const link = `${comment.author}/${comment.permlink}`
                        state.content[link] = comment
                        state.accounts[uname].comments.push(link)
                    })
                break

                case 'feed':
                    const feedEntries = await api.getFeedEntries(uname, 0, 20)
                    state.accounts[uname].feed = []

                    for (let key in feedEntries) {
                        const { author, permlink } = feedEntries[key]
                        const link = `${author}/${permlink}`
                        state.accounts[uname].feed.push(link)
                        state.content[link] = await api.getContent(author, permlink)
                        
                        if (feedEntries[key].reblog_by.length > 0) {
                            state.content[link].first_reblogged_by = feedEntries[key].reblog_by[0]
                            state.content[link].reblogged_by = feedEntries[key].reblog_by
                            state.content[link].first_reblogged_on = feedEntries[key].reblog_on
                        }
                    }
                break

                case 'blog':
                default:
                    const blogEntries = await api.getBlogEntries(uname, 0, 20)
                    state.accounts[uname].blog = []

                    for (let key in blogEntries) {
                        const { author, permlink } = blogEntries[key]
                        const link = `${author}/${permlink}`

                        state.content[link] = await api.getContent(author, permlink)
                        state.accounts[uname].blog.push(link)
                    
                        if (blogEntries[key].reblog_on !== '1970-01-01T00:00:00') {
                            state.content[link].first_reblogged_on = blogEntries[key].reblog_on
                        }
                    }
                break
            }
        }

    } else if (parts.length === 3 && parts[1].length > 0 && parts[1][0] == '@') {
        const account = parts[1].substr(1)
        const category = parts[0]
        const permlink = parts[2]

        const curl = `${account}/${permlink}`
        state.content[curl] = await api.getContent(account, permlink)
        accounts.add(account)

        const replies = await api.getAllContentReplies(account, permlink)

       for (let key in replies) {
            let reply = replies[key]
            const link = `${reply.author}/${reply.permlink}`

            state.content[link] = reply
            accounts.add(reply.author)
            if (reply.parent_permlink === permlink) {
                state.content[curl].replies.push(link)
            }
        }
        
    } else if (parts[0] === 'witnesses' || parts[0] === '~witnesses') {
        const witnesses = await api.getWitnessesByVote('', 100)
        witnesses.forEach( witness => {
            state.witnesses[witness.owner] = witness
        })
  
    } else if ([
        'trending',
        'promoted',
        'responses',
        'hot',
        'votes',
        'cashout',
        'payout',
        'payout_comments',
        'active',
        'created',
        'recent'
    ].includes(parts[0])) {
        let args = { limit: 20, truncate_body: 1024 }

        if (typeof tag === 'string' && tag.length) {
            args.select_tags = [tag]
        } else {
            if (typeof offchain.select_tags === "object" && offchain.select_tags.length) {
                args.select_tags = state.select_tags = offchain.select_tags;
            } else {
                args.filter_tags = state.filter_tags = options.IGNORE_TAGS
            }
        }
        const discussions = await api.gedDiscussionsBy(PUBLIC_API[parts[0]][1], args)
          
        const discussion_idxes = {}
        discussion_idxes[ PUBLIC_API[parts[0]][1] ] = []

        discussions.forEach(discussion => {
            const link = `${discussion.author}/${discussion.permlink}`
            discussion_idxes[ PUBLIC_API[ parts[0] ][1] ].push(link)
            state.content[link] = discussion
        })
        
        const discussions_key = typeof tag === 'string' && tag.length 
            ? tag 
            : state.select_tags.sort().join('/')

        state.discussion_idx[discussions_key] = discussion_idxes

    } else if (parts[0] == 'tags') {
        const tags = {}
        trending_tags.forEach (tag => tags[tag.name] = tag)
        state.tags = tags
    }

    state.tag_idx = { 'trending': trending_tags.map(t => t.name) }

    if (accounts.size > 0) {
        const acc = await api.getAccounts(Array.from(accounts))
        acc.forEach(account =>  state.accounts[ account.name ] = account)
    }

    return Promise.resolve(state)
}
