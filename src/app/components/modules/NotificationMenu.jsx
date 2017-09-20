import React from 'react';
import { Link } from 'react-router'
import Icon from 'app/components/elements/Icon';
import tt from 'counterpart';
import NotificationCommentReply from 'app/components/modules/notification_menu/CommentReply';
import NotificationPostReply from 'app/components/modules/notification_menu/PostReply';
import NotificationTag from 'app/components/modules/notification_menu/Tag';
import NotificationResteem from 'app/components/modules/notification_menu/Resteem';
import NotificationReceiveSteem from 'app/components/modules/notification_menu/ReceiveSteem';
import NotificationVote from 'app/components/modules/notification_menu/Vote';

//notify event types
const N_COMMENT_REPLY = 'commentReply';
const N_POST_REPLY = 'postReply';
const N_RECEIVE_STEEM = 'receiveSteem';
const N_RESTEEM = 'resteem';
const N_TAG = 'tag';
const N_VOTE = 'vote';

//notify object spec - see notifyList below for spec
const notifyItemSpec = {
    id: "UID", //needed to track .read
    read: false, //a boolean value
    notificationType: N_VOTE, //receivedSteem, tagged, resteemed, postComment, commentComment
    created: 0, //Hoping for epoch seconds, but can be whatever people are using. Created should be the "most relevant time" for the notification
    author: "the author that performed the action",
    amount: 10000.2, //only valid for receivedSteem
    item: { //item is the item/location where the action (described by notificationType) was performed
        author: "the item author",
        category: "the item category",
        depth: 0,
        permlink: "the item permlink",
        parentSummary: "",  //a string to summarize the parent item. Title or Content (max 255 chars)
                            //exists only for N_COMMENT_REPLY, N_POST_REPLY,
        summary: "", //a string to summarize the item. Title or Content (max 255 chars)
    },
    rootItem: { //exists only if there is a root for item
        author: "",
        category: "",
        permlink: "",
        summary: ""
    }
}

//sample data is from @wolfcat's perspective
const notifyList = [
    {
        id: "UID", //needed to track .read
        read: false, //a boolean value
        notificationType: N_RESTEEM, //receivedSteem, tagged, resteemed, postComment, commentComment
        created: '2017-09-19T18:59:00',
        author: "roadscape",
        item: {
            author: "wolfcat",
            category: "introduceyourself",
            depth: 0,
            permlink: "from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello",
            summary: "From the Hills of Ireland to Planet Steem, A Wolfy Hello!", //a string to summarize the item. Title + Content? (max 255 chars)
        }
    },{
        id: "UID2", //needed to track .read
        read: false, //a boolean value
        notificationType: N_VOTE, //receivedSteem, tagged, resteemed, postComment, commentComment
        notificationTime: 3, //Hoping for epoch seconds, but can be whatever people are using
        author: "beanz",
        created: '2017-09-19T18:59:00',
        item: {
            author: "wolfcat",
            category: "introduceyourself",
            depth: 0,
            permlink: "from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello",
            summary: "From the Hills of Ireland to Planet Steem, A Wolfy Hello!", //a string to summarize the item. Title + Content? (max 255 chars)
        }
    },{
        id: "UID3", //needed to track .read
        read: true, //a boolean value
        notificationType: N_RECEIVE_STEEM, //receivedSteem, tagged, resteemed, postComment, commentComment
        created: '2017-09-19T16:19:48',
        author: "roadscape",
        amount: 10000.2
    },{
        id: "UID4", //needed to track .read
        read: true, //a boolean value
        notificationType: N_TAG, //receivedSteem, tagged, resteemed, postComment, commentComment
        created: '2017-09-19T07:48:03',
        author: "lovejoy",
        item: {
            author: "lovejoy", //#@lovejoy/
            category: "introduceyourself",
            depth: 2,
            permlink: "re-steemcleaners-re-steemcleaners-re-wolfcat-from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello-20170919t120245144z",
            summary: "@wolfcat is a new user who normally doesn't spend a lot of time online, plus we are "
        },
        rootItem: {
            author: "wolfcat",
            category: "introduceyourself",
            permlink: "from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello",
            summary: "From the Hills of Ireland to Planet Steem, A Wolfy Hello!"
        }
    },{
        id: "UID5", //needed to track .read
        read: false, //a boolean value
        notificationType: N_VOTE, //receivedSteem, tagged, resteemed, postComment, commentComment
        created: '2017-09-19T11:59:39',
        author: "roadscape",
        item: {
            author: "wolfcat",
            category: "introduceyourself",
            depth: 0,
            permlink: "from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello",
            summary: "From the Hills of Ireland to Planet Steem, A Wolfy Hello!", //a string to summarize the item. Title + Content? (max 255 chars)
        }
    },{
        id: "UID6", //needed to track .read
        read: true, //a boolean value
        notificationType: N_POST_REPLY, //receivedSteem, tagged, resteemed, postComment, commentComment
        created: '2017-09-19T14:24:51',
        author: "lovejoy",
        item: {
            author: "lovejoy", //#@lovejoy/
            category: "introduceyourself",
            depth: 2,
            permlink: "re-steemcleaners-re-steemcleaners-re-wolfcat-from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello-20170919t120245144z",
            summary: "@wolfcat is a new user who normally doesn't spend a lot of time online, plus we are ",
            parentSummary: "You may want to retract your votes.The account has ignored our many requests to confirm the identity. It seems to be another case of fake identity. Thanks."
        },
        rootItem: {
            author: "wolfcat",
            category: "introduceyourself",
            permlink: "from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello",
            summary: "From the Hills of Ireland to Planet Steem, A Wolfy Hello!"
        }
    },{
        id: "UID7", //needed to track .read
        read: false, //a boolean value
        notificationType: N_COMMENT_REPLY, //receivedSteem, tagged, resteemed, postComment, commentComment
        created: '2017-09-18T17:21:18',
        author: "dbzfan4awhile",
        item: {
            author: "dbzfan4awhile", //#@lovejoy/
            category: "introduceyourself",
            depth: 3,
            permlink: "re-wolfcat-re-dbzfan4awhile-re-wolfcat-from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello-20170918t172118886z",
            summary: "Awesome!",
            parentSummary: "Yes! Ill look for you there :)"
        },
        rootItem: {
            author: "wolfcat",
            category: "introduceyourself",
            permlink: "from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello",
            summary: "From the Hills of Ireland to Planet Steem, A Wolfy Hello!"
        }
    }

]

export default class NotificationMenu extends React.Component {
    static propTypes = {
        account_link: React.PropTypes.string.isRequired,
        items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        title: React.PropTypes.string,
        className: React.PropTypes.string,
        hideValue: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.element
        ]),
    };

    closeMenu = (e) => {
        // If this was not a left click, or if CTRL or CMD were held, do not close the menu.
        if(e.button !== 0 || e.ctrlKey || e.metaKey) return;

        // Simulate clicking of document body which will close any open menus
        document.body.click();
    }

    render() {
        const {account_link, className} = this.props
        const notifications = [];
        notifyList.forEach( (n) => {
            switch (n.notificationType) {
                case N_POST_REPLY :
                    notifications.push(<li className="item" key={n.id}><NotificationPostReply {...n} /></li>)
                    break;
                case N_COMMENT_REPLY :
                    notifications.push(<li className="item" key={n.id}><NotificationCommentReply {...n} /></li>)
                    break;
                case N_TAG :
                    notifications.push(<li className="item" key={n.id}><NotificationTag {...n} /></li>)
                    break;
                case N_RESTEEM :
                    notifications.push(<li className="item" key={n.id}><NotificationResteem {...n} /></li>)
                    break;
                case N_RECEIVE_STEEM :
                    notifications.push(<li className="item" key={n.id}><NotificationReceiveSteem account_link={account_link} {...n} /></li>)
                    break;

                case N_VOTE :
                    notifications.push(<li className="item" key={n.id}><NotificationVote {...n} /></li>)
                    break;
                default :
                    console.log("no option for this notification", n)
            }
        })
        return <ul className={'NotificationMenu menu vertical' + (className ? ' ' + className : '')}>
            <li className="title">{tt('g.notifications')} <a href={account_link}><Icon name="cog" /></a></li>
            {notifications}
            <li className="footer">
                <a href={'#'} className="view-all">View All</a>
                <span className="controls-right"><button>Mark All as Read</button> | <button>Clear All</button></span>
            </li>
        </ul>;
    }
}
