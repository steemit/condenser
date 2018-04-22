import React from 'react'
import {Link} from 'react-router';
import Userpic from 'app/components/elements/Userpic';
import iconCross from 'app/assets/icons/cross.svg'
import commentMulti from 'app/assets/icons/notification/comment_multi.svg'
import upVoteMulti from 'app/assets/icons/notification/up_vote_multi.svg'
import downVoteMulti from 'app/assets/icons/notification/down_vote_multi.svg'
//
const actionStyle = {
  // fixme
  paddingTop: '2px',
  // paddingLeft: '11px',
  // paddingRight: '0px',
  display: 'flex',
  height: '100%',
  alignItems: 'center',
}
//
const cross = () => <span className="NotificationContent__action" dangerouslySetInnerHTML={{__html: iconCross}} />
//
const transfer = data => {
  // console.log('~~~~~~~~~~~~ ', data)
  const {
    from: {
      account,
      profile_image
    },
    to,
    amount,
    memo
  } = data;
  // todo use i18n const
  const message = ` перевел вам ${amount}.`
  //
  return (
    <div className="NotificationContent__container">
      <div className="NotificationContent__container_left">
        <Userpic width="37" height="37" imageUrl={profile_image} />
      </div>
      <div className="NotificationContent__container_center">
        <Link to={`/@${to}/transfers`}>
          <span className="NotificationContent__action_source">
            {account}
            <span style={{color: '#919191', fontWeight: '450'}}>
              {message}
            </span>
          </span>
        </Link>
      </div>
    </div>
  )
}
//
const comment = data => {
  // console.log('~~~~~~~~~~~~ ', data)
  // console.log(data)
  // todo use i18n const
  const {
    comment_url,
    author: {
      account,
      profile_image
    },
    parent: {
      type,
      permlink,
      title,
      body,
      // todo refactor url const names
      url: parent_url
    },
    count
  } = data;
  //
  const oncePerBlock = (count === 1);
  //
  const message = oncePerBlock ?
    <span>
      {` ответил на ваш`}
      &nbsp;
      <Link to={parent_url}>
        {type === 'post' ? `пост` : `комментарий`}
      </Link>
    </span> :
    <span>
      {`На ваш`}
      &nbsp;
      <Link to={parent_url}>
        {type === 'post' ? `пост` : `комментарий`}
      </Link>
      {` ответили ${count} раз.`}
    </span>
  //
  return (
    <div className="NotificationContent__container">
      <div className="NotificationContent__container_left">
        {
          oncePerBlock ? <Userpic width="37" height="37" imageUrl={profile_image} /> :
            <span className="NotificationContent__icon" dangerouslySetInnerHTML={{__html: commentMulti}} />
        }
      </div>
      <div className="NotificationContent__container_center">
          <span className="NotificationContent__action_source">
            {oncePerBlock && account}
            <span style={{color: '#919191', fontWeight: '450'}}>
              {message}
            </span>
          </span>
      </div>
    </div>
  )
}
//
const upvote = data => {
  // console.log('++++++++++++++++ ', data)
  // console.log(data)
  // todo use i18n const
  const {
    voter: {
      account,
      profile_image
    },
    parent: {
      type,
      permlink,
      title,
      body,
      // todo refactor url const names
      url: parent_url
    },
    count
  } = data;
  //
  const oncePerBlock = (count === 1);
  //
  const message = oncePerBlock ?
    <span>
      {` поддержал ваш`}
      &nbsp;
      <Link to={parent_url}>
        {type === 'post' ? `пост` : `комментарий`}
      </Link>
    </span> :
    <span>
      {`За ваш`}
      &nbsp;
      <Link to={parent_url}>
        {type === 'post' ? `пост` : `комментарий`}
      </Link>
      {` проголосовали ${count} раз.`}
    </span>
  //
  return (
    <div className="NotificationContent__container">
      <div className="NotificationContent__container_left">
        {
          oncePerBlock ? <Userpic width="37" height="37" imageUrl={profile_image} /> :
            <span className="NotificationContent__icon" dangerouslySetInnerHTML={{__html: upVoteMulti}} />
        }
      </div>
      <div className="NotificationContent__container_center">
          <span className="NotificationContent__action_source">
            {oncePerBlock && account}
            <span style={{color: '#919191', fontWeight: '450'}}>
              {message}
            </span>
          </span>
      </div>
    </div>
  )
}
//
const downvote = data => {
  // console.log('~~~~~~~~~~~~ ', data)
  // console.log(data)
  // todo use i18n const
  const {
    voter: {
      account,
      profile_image
    },
    parent: {
      type,
      permlink,
      title,
      body,
      // todo refactor url const names
      url: parent_url
    },
    count
  } = data;
  //
  const oncePerBlock = (count === 1);
  //
  const message = oncePerBlock ?
    <span>
      {` поставил флаг на ваш`}
      &nbsp;
      <Link to={parent_url}>
        {type === 'post' ? `пост` : `комментарий`}
      </Link>
    </span> :
    <span>
      {`Ваш`}
      &nbsp;
      <Link to={parent_url}>
        {type === 'post' ? `пост` : `комментарий`}
      </Link>
      {` получил ${count} флага.`}
    </span>
  //
  return (
    <div className="NotificationContent__container">
      <div className="NotificationContent__container_left">
        {
          oncePerBlock ? <Userpic width="37" height="37" imageUrl={profile_image} /> :
            <span className="NotificationContent__icon" dangerouslySetInnerHTML={{__html: downVoteMulti}} />
        }
      </div>
      <div className="NotificationContent__container_center">
          <span className="NotificationContent__action_source">
            {oncePerBlock && account}
            <span style={{color: '#919191', fontWeight: '450'}}>
              {message}
            </span>
          </span>
      </div>
    </div>
  )
}
//
function render(what) {
  // console.log(`))))))) `, what)
  const {type, payload} = what;
  return (
    type === 'NOTIFY_COMMENT' ? comment(payload) :
      type === 'NOTIFY_TRANSFER' ? transfer(payload) :
        type === 'NOTIFY_VOTE_UP' ? upvote(payload) :
          downvote(payload)
  )
}
//
export default action => ({
  // the following two are merged by react-notification
  // and overload .notification-bar css class
  barStyle: {},
  activeBarStyle: {
    // left: 'auto',
    // right: '1rem',
    // transition: '',
    // transitionProperty: 'right',
    // transitionDuration: '.5s',
    // transitionTimingFunction: 'cubic-bezier(0.89, 0.01, 0.5, 1.1)',
    background: '#FFFFFF',
    borderRadius: '6px',
    paddingTop: '11px',
    paddingBottom: '11px',
    paddingLeft: '21px',
    paddingRight: '14px'
  },
  // title can be inline-styled
  title: render(action),
  titleStyle: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    // override react-notification
    marginRight: '0px'
  },
  message: '',
  action:
    <span style={actionStyle}>
      {cross()}
    </span>,
  actionStyle: {
    // background: 'red',
    padding: '0px',
    marginLeft: '18px',
    color: 'blue',
    font: '.75rem normal Roboto, sans-serif',
    lineHeight: '1rem',
    letterSpacing: '.125ex',
    textTransform: 'uppercase',
    borderRadius: '0px',
    cursor: 'pointer'
  },
  key: "chain_" + Date.now(),
  dismissAfter: 10000,
})
