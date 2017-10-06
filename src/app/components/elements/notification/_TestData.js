import * as type from './type'

/**notify object spec - see notifyList below for specific examples
const notifyItemSpec = {
    id: "UID", //needed to track .read
    read: false, //a boolean value
    notificationType: type.VOTE, //receivedSteem, tagged, resteemed, postComment, commentComment
    created: 0, //Hoping for epoch seconds, but can be whatever people are using. Created should be the "most relevant time" for the notification
    author: "the author that performed the action",
    amount: 10000.2, //only valid for receivedSteem
    item: { //item is the item/location where the action (described by notificationType) was performed
        author: "the item author",
        category: "the item category",
        depth: 0,
        permlink: "the item permlink",
        parentSummary: "", //a string to summarize the parent item. Title or Content (max 255 chars)
        //exists only for type.COMMENT_REPLY, type.POST_REPLY,
        summary: "", //a string to summarize the item. Title or Content (max 255 chars)
    },
    rootItem: { //exists only if there is a root for item, property definitions follow .item children
        author: "",
        category: "",
        permlink: "",
        summary: ""
    }
}
*/

//sample data is from @wolfcat's perspective

export const getNotifications = [
    {
        id: "UID", //needed to track .read
        read: true, //a boolean value
        shown: true, //a boolean value
        notificationType: type.POWER_DOWN, //receivedSteem, tagged, resteemed, postComment, commentComment
        created: '2017-09-19T16:19:48',
        author: "roadscape",
        amount: 10000.2
    },
    {
        id: "UID1.1", //needed to track .read
        read: false, //a boolean value
        shown: false, //a boolean value
        notificationType: type.ANNOUNCEMENT_IMPORTANT, //receivedSteem, tagged, resteemed, postComment, commentComment
        created: '2017-09-19T18:59:00',
        author: "steemit",
        item: {
            author: "wolfcat",
            category: "introduceyourself",
            depth: 0,
            permlink: "from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello",
            summary: "From the Hills of Ireland to Planet Steem, A Wolfy Hello!", //a string to summarize the item. Title + Content? (max 255 chars)
        }
    },
    {
        id: "UID1", //needed to track .read
        read: false, //a boolean value
        shown: false, //a boolean value
        notificationType: type.RESTEEM, //receivedSteem, tagged, resteemed, postComment, commentComment
        created: '2017-09-19T18:59:00',
        author: "roadscape",
        item: {
            author: "wolfcat",
            category: "introduceyourself",
            depth: 0,
            permlink: "from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello",
            summary: "From the Hills of Ireland to Planet Steem, A Wolfy Hello!", //a string to summarize the item. Title + Content? (max 255 chars)
        }
    },
    {
        id: "UID2", //needed to track .read
        read: false, //a boolean value
        shown: false,
        notificationType: type.VOTE, //receivedSteem, tagged, resteemed, postComment, commentComment
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
    },
    {
        id: "UID3", //needed to track .read
        read: true, //a boolean value
        shown: true, //a boolean value
        notificationType: type.RECEIVE_STEEM, //receivedSteem, tagged, resteemed, postComment, commentComment
        created: '2017-09-19T16:19:48',
        author: "roadscape",
        amount: 10000.2
    },
    {
        id: "UID4", //needed to track .read
        read: true, //a boolean value
        shown: true, //a boolean value
        notificationType: type.TAG, //receivedSteem, tagged, resteemed, postComment, commentComment
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
    },
    {
        id: "UID5", //needed to track .read
        read: false, //a boolean value
        shown: false, //a boolean value
        notificationType: type.VOTE, //receivedSteem, tagged, resteemed, postComment, commentComment
        created: '2017-09-19T11:59:39',
        author: "roadscape",
        item: {
            author: "wolfcat",
            category: "introduceyourself",
            depth: 0,
            permlink: "from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello",
            summary: "From the Hills of Ireland to Planet Steem, A Wolfy Hello!", //a string to summarize the item. Title + Content? (max 255 chars)
        }
    },
    {
        id: "UID6", //needed to track .read
        read: true, //a boolean value
        shown: true, //a boolean value
        notificationType: type.POST_REPLY, //receivedSteem, tagged, resteemed, postComment, commentComment
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
    },
    {
        id: "UID6.1", //needed to track .read
        read: true, //a boolean value
        shown: true, //a boolean value
        notificationType: type.SECURITY_NEW_MOBILE, //receivedSteem, tagged, resteemed, postComment, commentComment
        created: '2017-09-19T14:24:51',
        author: "security"
    },
    {
        id: "UID7", //needed to track .read
        read: false, //a boolean value
        shown: false, //a boolean value
        notificationType: type.COMMENT_REPLY, //receivedSteem, tagged, resteemed, postComment, commentComment
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

export default getNotifications;
