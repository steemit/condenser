import { api } from 'golos-js';

export async function processBlog(state, { uname, voteLimit }) {
    const blogEntries = await api.getBlogEntriesAsync(uname, 0, 20);

    const account = state.accounts[uname];

    if (!account.pinnedPosts) {
        account.pinnedPosts = [];

        try {
            const pinnedPosts = JSON.parse(account.json_metadata).pinnedPosts;

            if (pinnedPosts) {
                account.pinnedPosts = pinnedPosts;
            }
        } catch (err) {}
    }

    account.blog = [];

    const pinnedEntries = account.pinnedPosts.map(link => {
        const [author, permlink] = link.split('/');

        return {
            author,
            permlink,
        };
    });

    const blog = Array.from(pinnedEntries);

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
