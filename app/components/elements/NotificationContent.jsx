import React from 'react'
import Icon from 'app/components/elements/Icon';
import { Link } from 'react-router';
import Userpic from 'app/components/elements/Userpic';


const comment = data => {
  // console.log(data)
  // todo use i18n const
  const actionStr = `ответил на ваш`
  const repr = str => `${str.slice(0, 25)} ...`
  const {
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


export default function render(what) {
  console.log(`))))))) `, what)
  const {type, payload} = what;
  return type === 'NOTIFY_COMMENT' ?
    comment(payload)
    : null
}
