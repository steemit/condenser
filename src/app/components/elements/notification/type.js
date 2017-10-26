//notify even types
/*
export const FOLLOW_AUTHOR_POST = 'followAuthorPost';
export const FOLLOW_COMMENT_REPLY = 'followPostPost'; //when the user is following a post/comment, and it is replied to.

export const RECEIVE_STEEM = 'receiveSteem';
export const RESTEEM = 'resteem';
export const POWER_DOWN = 'powerDown';
export const SECURITY_PWD_CHANGE = 'securityPasswordChanged';
export const SECURITY_WITHDRAWAL = 'securityWithrawal'
export const SECURITY_NEW_MOBILE = 'securityNewMobileDevice';
export const SECURITY_POWER_DOWN = 'securityPowerDown';
export const TAG = 'tag';
*/

//known supported by yo
export const ACCOUNT_UPDATE = 'account_update';
export const COMMENT_REPLY = 'comment_reply';
export const FEED = 'feed';
export const FOLLOW = 'follow';
export const MENTION = 'mention';
export const POST_REPLY = 'post_reply';
export const POWER_DOWN = 'power_down';
export const SEND_STEEM = 'send';
export const RECEIVE_STEEM = 'receive';
export const RESTEEM = 'resteem';
export const REWARD = 'reward';
export const VOTE = 'vote';

//support expected
export const ANNOUNCEMENT = 'announcement';
export const ANNOUNCEMENT_IMPORTANT = 'announcement_important';
export const SECURITY_PWD_CHANGE = 'security_password_changed';
export const SECURITY_WITHDRAWAL = 'security_withdrawal';
export const SECURITY_NEW_MOBILE = 'security_new_mobile_device';

export const filters = {
    security: [ACCOUNT_UPDATE, POWER_DOWN, SECURITY_NEW_MOBILE, SECURITY_WITHDRAWAL, SECURITY_PWD_CHANGE],
    posts: [COMMENT_REPLY, POST_REPLY, VOTE, RESTEEM],
    wallet: [RECEIVE_STEEM, REWARD, SEND_STEEM],
    mentions: [MENTION],
    followers: [FOLLOW],
    newPosts: [FEED]
};

//this drives the Notification Settings UI
export const toggleNotificationGroups = {
    security: [ACCOUNT_UPDATE, POWER_DOWN, SECURITY_NEW_MOBILE, SECURITY_WITHDRAWAL, SECURITY_PWD_CHANGE],
    wallet: [RECEIVE_STEEM, REWARD, SEND_STEEM],
    postReplies: [POST_REPLY],
    commentReplies: [COMMENT_REPLY],
    mentions: [MENTION],
    resteems: [RESTEEM],
    newPosts: [FEED]
};

export const toggleNotificationGroupNames = Object.entries(toggleNotificationGroups).reduce( (list, entry) => {
    list.push(entry[0]);
    return list;
}, []);

//all Notification types that we expect to be false, or may need to initialize false.
export const settingsInitFalse = [POST_REPLY, COMMENT_REPLY]; // todo: what to default? it was vote before but that's not even in the groups!

export default [
    ANNOUNCEMENT,
    ANNOUNCEMENT_IMPORTANT,
    ACCOUNT_UPDATE,
    COMMENT_REPLY,
    FEED,
    FOLLOW,
    MENTION,
    POST_REPLY,
    POWER_DOWN,
    SEND_STEEM,
    RECEIVE_STEEM,
    RESTEEM,
    REWARD,
    VOTE
];


/** 0
 from: https://github.com/steemit/yo/blob/mock_api/docs/API
 Not sure if those are right. The mapping from them to the mocks is v-fuzzy.

 total
 power_down
 power_up
 resteem
 feed
 reward
 send
 mention
 follow
 vote
 comment_reply
 post_reply
 account_update
 message
 receive
 */
/** 1
 from: https://github.com/steemit/steempunks/wiki/Yo-rate-limiting-&-priorities
 Comment 0 is supposed to be filtered by these -
 feed - low
 reward - normal
 send - priority (we want users to know if they've sent money out)
 mention - normal
 follow - low
 vote - low
 comment_reply - normal
 post_reply - normal
 account_update - priority
 receive - normal
 */

/** 2
 MAPPING TO UI FROM @pon

 Security
 – account_update
 – power_down

 My posts
 - vote
 – comment_reply
 – post_reply

 Wallet
 – receive
 – send
 – reward

 Mentions
 – mention

 Followers
 – follow

 New posts
 - feed
 */
