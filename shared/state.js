import { api } from 'golos-js';
import { is, clone } from 'ramda';

export async function processBlog(state, { uname, voteLimit }) {
    const blogEntries = await api.getBlogEntriesAsync(uname, 0, 20);

    const account = state.accounts[uname];

    account.blog = [];

    let pinnedPosts = [];

    try {
        const pinned = JSON.parse(account.json_metadata).pinnedPosts;

        if (Array.isArray(pinned) && pinned.every(link => is(String, link))) {
            pinnedPosts = pinned;
        }
    } catch(err) {
        console.error(err);
    }

    const pinnedEntries = pinnedPosts.map(link => {
        const [author, permlink] = link.split('/');

        return {
            author,
            permlink,
        };
    });

    const blog = clone(pinnedEntries);

    outer: for (let entry of blogEntries) {
        for (let { author, permlink } of pinnedEntries) {
            if (entry.author === author && entry.permlink === permlink) {
                continue outer;
            }
        }

        blog.push(entry);
    }

    for (let i = 0; i < blog.length; ++i) {
        const { author, permlink, reblog_on } = blog[i];
        const link = `${author}/${permlink}`;

        state.content[link] = await api.getContentAsync(author, permlink, voteLimit);
        account.blog.push(link);

        if (reblog_on && reblog_on !== '1970-01-01T00:00:00') {
            state.content[link].first_reblogged_on = reblog_on;
        }
    }
}
