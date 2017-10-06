import * as type from './type'

const icon = {}
//notify even types
icon[type.ANNOUNCEMENT] = require('assets/icons/notifications/mention.svg')
icon[type.ANNOUNCEMENT_IMPORTANT] = require('assets/icons/notifications/mention.svg')
icon[type.COMMENT_REPLY] = require('assets/icons/notifications/comment.svg')
icon[type.FOLLOW_AUTHOR_POST] = require('assets/icons/notifications/new-post.svg')
icon[type.FOLLOW_POST_POST] = require('assets/icons/notifications/new-post.svg')
icon[type.POST_REPLY] = require('assets/icons/notifications/comment.svg')
icon[type.RECEIVE_STEEM] = require('assets/icons/notifications/currency.svg')
icon[type.RESTEEM] = require('assets/icons/notifications/resteem.svg')
icon[type.POWER_DOWN] = require('assets/icons/notifications/currency.svg')
//icon[type.SECURITY_PWD_CHANGE] = require('assets/icons/notifications/?')
//icon[type.SECURITY_WITHDRAWAL] = require('assets/icons/notifications/?')
//icon[type.SECURITY_NEW_MOBILE] = require('assets/icons/notifications/?')
//icon[type.SECURITY_POWER_DOWN] = require('assets/icons/notifications/?')
icon[type.TAG] = require('assets/icons/notifications/mention.svg')
icon.visibilityOn = require('assets/icons/visibility_on.svg')
icon.visibilityOff = require('assets/icons/visibility_off.svg')
//icon[type.VOTE] = require('assets/icons/notifications/vote')

export default icon
