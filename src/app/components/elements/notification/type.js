//notify even types
export const ANNOUNCEMENT = 'announcement';
export const ANNOUNCEMENT_IMPORTANT = 'announcementImportant';
export const COMMENT_REPLY = 'commentReply';
export const FOLLOW_AUTHOR_POST = 'followAuthorPost';
export const FOLLOW_COMMENT_REPLY = 'followPostPost'; //when the user is following a post/comment, and it is replied to.
export const POST_REPLY = 'postReply';
export const RECEIVE_STEEM = 'receiveSteem';
export const RESTEEM = 'resteem';
export const POWER_DOWN = 'powerDown';
export const SECURITY_PWD_CHANGE = 'securityPasswordChanged';
export const SECURITY_WITHDRAWAL = 'securityWithrawal'
export const SECURITY_NEW_MOBILE = 'securityNewMobileDevice';
export const SECURITY_POWER_DOWN = 'securityPowerDown';
export const TAG = 'tag';
export const VOTE = 'vote';

export default [
    ANNOUNCEMENT,
    ANNOUNCEMENT_IMPORTANT,
    COMMENT_REPLY,
    FOLLOW_AUTHOR_POST,
    FOLLOW_COMMENT_REPLY,
    POST_REPLY,
    RECEIVE_STEEM,
    RESTEEM,
    POWER_DOWN,
    SECURITY_PWD_CHANGE,
    SECURITY_WITHDRAWAL,
    SECURITY_NEW_MOBILE,
    SECURITY_POWER_DOWN,
    TAG,
    VOTE,
];


/**
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
