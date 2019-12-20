import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from 'app/redux/RootReducer';
import { renderToString } from 'react-dom/server';
import jsonfeedToRSS from 'jsonfeed-to-rss';
import moment from 'moment';
import _ from 'lodash';
import MarkdownViewer from 'app/components/cards/MarkdownViewer';

export default function postList2Rss(baseFeed, postList) {
    const feed = { ...baseFeed };
    const userPermlinks = Object.keys(postList);

    for (let ui = 0; ui < userPermlinks.length; ui += 1) {
        const userPermlink = userPermlinks[ui];
        const post = postList[userPermlink];

        try {
            post.json_metadata = JSON.parse(post.json_metadata);
        } catch (e) {
            post.json_metadata = {};
        }

        const image = _.get(post.json_metadata, 'image', null);

        const store = createStore(rootReducer);
        const bodyHtml = (
            <Provider store={store}>
                <MarkdownViewer
                    text={post.body}
                    large
                    highQualityPost
                    noImage={false}
                    hideImages={false}
                />
            </Provider>
        );

        const item = {
            title: post.title,
            date_published: moment.utc(post.created).toISOString(),
            content_text: post.body.replace(/(<([^>]+)>)/gi, ''),
            content_html: renderToString(bodyHtml),
            url: `https://steemit.com/@${userPermlink}`,
            id: `https://steemit.com/${post.category}/@${userPermlink}`,
            image: image ? image[0] : null,
            author: {
                name: post.author,
                url: `https://steemit.com/@${post.author}`,
            },
        };

        feed.items.push(item);
    }

    return jsonfeedToRSS(feed, { idIsPermalink: true });
}
