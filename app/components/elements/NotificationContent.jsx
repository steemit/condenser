import React from 'react'
import Icon from 'app/components/elements/Icon';
import { Link } from 'react-router';
import Userpic from 'app/components/elements/Userpic';
//
const transfer = data => {
  console.log('~~~~~~~~~~~~ ', data)
  // todo use i18n const
  const actionStr = `перевел вам`
  // const repr = str => `${str.slice(0, 25)} ...`
  const {
    from: {
      account,
      profile_image
    },
    to,
    amount,
    memo
  } = data;

  return (
    <div className="NotificationContent__container">
      <div className="NotificationContent__container_left">
        <Userpic imageUrl={profile_image} />
      </div>

      <Link to={`/@${to}/transfers`}>
        <div className="NotificationContent__container_center">
          <div className="NotificationContent__container_center_top">
            <div style={{display: 'flex'}}>
              {/*<Link to={'/@' + account}>*/}
                <strong>
                  {account}
                </strong>
              {/*</Link>*/}
              <span style={{color: '#666666'}}>
                &nbsp;
                {actionStr}
              </span>
            </div>
          </div>
          <div className="NotificationContent__container_center_bottom">
            <span style={{
              paddingTop: '2px',
              paddingLeft: '4px',
              // borderLeftStyle: 'solid',
              // borderLeftWidth: '2px',
              // borderLeftColor: '#d3d3d3',
            }}>
              {amount}
            </span>
          </div>
        </div>
      </Link>

      <div className="NotificationContent__container_right">
        <Icon name="cross" />
      </div>
    </div>
)
}
//
const comment = data => {
  console.log('~~~~~~~~~~~~ ', data)
  // console.log(data)
  // todo use i18n const
  const actionStr = `ответил на ваш`
  const repr = str => `${str.slice(0, 25)} ...`
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
      body
    }
  } = data;

  return (
    <div className="NotificationContent__container">
      <div className="NotificationContent__container_left">
        <Userpic imageUrl={profile_image} />
      </div>

      <Link to={comment_url}>
        <div className="NotificationContent__container_center">
          <div className="NotificationContent__container_center_top">
            <div style={{display: 'flex'}}>
              <strong>
                {account}
              </strong>
              <span style={{color: '#666666'}}>
                &nbsp;
                {actionStr}
                <span style={{color: '#666666'}}>
                  {/*todo use i18n const*/}
                  &nbsp;
                  {type === 'post' ? 'пост' : 'комментарий'}
                </span>
              </span>
            </div>
        </div>
          <div className="NotificationContent__container_center_bottom">
          <span style={{
            paddingTop: '2px',
            paddingLeft: '4px',
            // borderLeftStyle: 'solid',
            // borderLeftWidth: '2px',
            // borderLeftColor: '#d3d3d3',
          }}>
            {type === 'post' ? repr(title) : repr(body)}
          </span>
        </div>
        </div>
      </Link>

      <div className="NotificationContent__container_right">
        <Icon name="cross" />
      </div>
    </div>

  )
}
//
const vote = data => {
  console.log('~~~~~~~~~~~~ ', data)
  // console.log(data)
  // todo use i18n const
  const actionStr = `поддержал ваш`
  const repr = str => `${str.slice(0, 25)} ...`
  const {
    voter: {
      account,
      profile_image
    },
    parent: {
      type,
      title,
      body,
      permlink
    }
  } = data;

  return (
    <div className="NotificationContent__container">
      <div className="NotificationContent__container_left">
        <Userpic imageUrl={profile_image} />
      </div>
      <div className="NotificationContent__container_center">
        <div className="NotificationContent__container_center_top">
          <div style={{display: 'flex'}}>
            <Link to={'/@' + account}>
              <strong>
                {account}
              </strong>
            </Link>
            <span>
            &nbsp;
              {actionStr}
              <span>
              {/*todo use i18n const*/}
                &nbsp;
                {type === 'post' ? 'пост' : 'комментарий'}
            </span>
          </span>
          </div>
        </div>
        <div className="NotificationContent__container_center_bottom">
          <span style={{
            paddingTop: '2px',
            paddingLeft: '4px',
            // borderLeftStyle: 'solid',
            // borderLeftWidth: '2px',
            // borderLeftColor: '#d3d3d3',
          }}>
            {type === 'post' ? repr(title) : repr(body)}
          </span>
        </div>
      </div>
      <div className="NotificationContent__container_right">
        <Icon name="cross" />
      </div>
    </div>

  )
}
//
export default function render(what) {
  // console.log(`))))))) `, what)
  const {type, payload} = what;
  return (
    type === 'NOTIFY_COMMENT' ?
      comment(payload) :
      type === 'NOTIFY_TRANSFER' ?
        transfer(payload):
        vote(payload)
  )
}
