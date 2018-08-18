import { Set } from 'immutable';
import sanitize from 'sanitize-html';
import sanitizeConfig, { allowedTags } from '../../utils/SanitizeConfig';
import transaction from '../../redux/Transaction';
import { detransliterate } from '../../utils/ParsersAndFormatters';
import { DEBT_TICKER } from '../../client_config';
import { getTags } from '../../../shared/HtmlReady';

export const replyAction = (dispatch, remarkable) => ({
    category,
    title,
    body,
    author,
    permlink,
    parent_author,
    parent_permlink,
    isHtml,
    isStory,
    isFeedback,
    type,
    originalPost,
    autoVote = false,
    payoutType = '50%',
    state,
    jsonMetadata,
    successCallback,
    errorCallback,
    startLoadingIndicator,
}) => {
    const username = state.user.getIn(['current', 'username']);

    if (isFeedback) {
        category = 'обратная-связь';
    }

    if (category) {
        category = category
            .split(' ')
            .map(
                item =>
                    /^[а-яё]/.test(item)
                        ? 'ru--' + detransliterate(item, true)
                        : item
            )
            .join(' ')
            .trim();
    }

    const isEdit = type === 'edit';
    const isNew = /^submit_/.test(type);

    // Wire up the current and parent props for either an Edit or a Submit (new post)
    //'submit_story', 'submit_comment', 'edit'
    const linkProps = isNew
        ? {
              // submit new
              parent_author: author,
              parent_permlink: permlink,
              author: username,
              // permlink,  assigned in transaction saga
          }
        : // edit existing
          isEdit
            ? { author, permlink, parent_author, parent_permlink }
            : null;

    if (!linkProps) {
        throw new Error('Unknown type: ' + type);
    }

    if (isHtml && !/^<html>[\s\S]*<\/html>$/.test(body)) {
        errorCallback('HTML posts must begin with <html> and end with </html>');
        return;
    }

    const rtags = getTags(isHtml ? body : remarkable.render(body));

    for (let tag of allowedTags) {
        rtags.htmltags.delete(tag);
    }

    if (isHtml) {
        rtags.htmltags.delete('html');
    }

    if (rtags.htmltags.size) {
        errorCallback(
            'Please remove the following HTML elements from your post: ' +
                Array(...rtags.htmltags)
                    .map(tag => `<${tag}>`)
                    .join(', ')
        );
        return;
    }

    const formCategories = Set(
        category
            ? category
                  .trim()
                  .replace(/#/g, '')
                  .split(/\s+/)
            : []
    );

    const rootCategory =
        originalPost && originalPost.category
            ? originalPost.category
            : formCategories.first();

    let allCategories = Set([...formCategories.toJS(), ...rtags.hashtags]);

    if (/^[-a-z\d]+$/.test(rootCategory)) {
        allCategories = allCategories.add(rootCategory);
    }

    if (allCategories.has('stihi-io')) {
        allCategories = allCategories.delete('stihi-io');
    }

    // merge
    const meta = isEdit ? jsonMetadata : {};
    if (allCategories.size) {
        meta.tags = allCategories.toJS();
    } else {
        delete meta.tags;
    }

    if (rtags.usertags.size) {
        meta.users = rtags.usertags;
    } else {
        delete meta.users;
    }

    if (rtags.images.size) {
        meta.image = rtags.images;
    } else {
        delete meta.image;
    }

    if (rtags.links.size) {
        meta.links = rtags.links;
    } else {
        delete meta.links;
    }

    meta.app = 'golos.io/0.1';

    if (isStory) {
        meta.format = isHtml ? 'html' : 'markdown';
    }

    // if(Object.keys(json_metadata.steem).length === 0) json_metadata = {}// keep json_metadata minimal
    const sanitizeErrors = [];
    sanitize(body, sanitizeConfig({ sanitizeErrors }));

    if (sanitizeErrors.length) {
        errorCallback(sanitizeErrors.join('.  '));
        return;
    }

    if (meta.tags.length > 5) {
        const includingCategory = isEdit
            ? ` (including the category '${rootCategory}')`
            : '';

        errorCallback(
            `You have ${
                meta.tags.length
            } tags total${includingCategory}.  Please use only 5 in your post and category line.`
        );
        return;
    }

    startLoadingIndicator();

    const originalBody = isEdit ? originalPost.body : null;
    const config = { originalBody, autoVote };

    config.comment_options = {};

    // Avoid changing payout option during edits #735
    if (!isEdit) {
        switch (payoutType) {
            case '0%': // decline payout
                config.comment_options = {
                    max_accepted_payout: '0.000 ' + DEBT_TICKER,
                };
                break;
            case '100%': // 100% steem power payout
                config.comment_options = {
                    percent_steem_dollars: 0, // 10000 === 100% (of 50%)
                };
                break;
            default: // 50% steem power, 50% sd+steem
        }
    } else {
        delete config.comment_options;
    }

    const operation = {
        ...linkProps,
        category: rootCategory,
        title,
        body,
        json_metadata: meta,
        __config: config,
    };

    dispatch(
        transaction.actions.broadcastOperation({
            type: 'comment',
            operation,
            errorCallback,
            successCallback,
        })
    );
};
