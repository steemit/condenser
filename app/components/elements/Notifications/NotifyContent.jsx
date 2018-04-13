import React from 'react'
import Icon from 'app/components/elements/Icon';
import {Link} from 'react-router';
import Userpic from 'app/components/elements/Userpic';
import iconCross from 'app/assets/icons/cross.svg'
//
const actionStyle = {
  // fixme
  paddingTop: '1px',
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
  // todo use i18n const
  const actionStr = `перевел вам`
  //
  const {
    from: {
      account,
      profile_image
    },
    to,
    amount,
    memo
  } = data;
  //
  return (
    <div className="NotificationContent__container">
      <div className="NotificationContent__container_left">
        <Userpic width="37" height="37" imageUrl={profile_image}/>
      </div>
      <Link to={`/@${to}/transfers`}>
        <div className="NotificationContent__container_center">
                <span style={{
                  // background: 'white',
                  color: 'black',
                  fontFamily: 'Roboto',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontStyle: 'normal',
                  fontStretch: 'normal',
                  lineHeight: '1.14',
                  letterSpacing: 'normal',
                  textAlign: 'left',
                  marginLeft: '18px'
                }}>
                    <span style={{
                      // background: 'white',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}>
                      {account}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontWeight: '300',
                      color: '#666666'
                      /*color: '#666666', background: 'white'*/
                    }}>
                      &nbsp;
                      {actionStr}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontWeight: '300',
                      color: '#666666'
                      /*color: '#666666', background: 'white'*/
                    }}>
                      &nbsp;
                      {amount}
                    </span>
                </span>
        </div>
      </Link>
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
  const singleComment = (count === 1);
  //
  const message = count === 1 ?
    (<span>
      <span>
        {account}
      </span>
      <span style={{fontWeight: '300', color: '#666666'}}>
        <span>&nbsp;ответил на ваш</span>
        {
          type === `post` ?
            <span>&nbsp;пост</span> :
            <span>&nbsp;комментарий</span>
        }
      </span>
    </span>) :
    (<span style={{fontWeight: '300'/*color: '#666666', background: 'white'*/}}>
      На ваш
      {
        type === `post` ?
          <span>&nbsp;пост</span> :
          <span>&nbsp;комментарий</span>
      }
      <span>&nbsp;ответили {count} раз.</span>
    </span>)
  //
  return (
    <div className="NotificationContent__container">
      <div className="NotificationContent__container_left">
        <Userpic width="31" height="31" imageUrl={profile_image}/>
      </div>
      <Link to={comment_url}>
        <div className="NotificationContent__container_center">
                <span style={{
                  // background: 'red',
                  color: 'black',
                  fontFamily: 'Roboto',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontStyle: 'normal',
                  fontStretch: 'normal',
                  lineHeight: '1.14',
                  letterSpacing: 'normal',
                  textAlign: 'left',
                  paddingLeft: '12px'
                }}>
                    <span>
                      &nbsp;
                      {message}
                    </span>
                </span>
        </div>
      </Link>
    </div>
  )
  //
  // const left = <div className="NotificationContent__container_left">
  //   {singleComment ?
  //     <Userpic imageUrl={profile_image} /> :
  //     <div style={{opacity: '0.3'}}><Icon name="chatboxes" size={'2x'} /></div>
  //   }
  //   </div>
  // //
  // const top = <span style={{color: '#666666'}}>
  //   {singleComment && <span /*style={{color: '#325C93'}}*/><strong>{account}</strong></span>}
  //   {singleComment && <span style={{fontSize: '0.9rem'}}>&nbsp;ответил</span>}
  //   <span style={singleComment ? {fontSize: '0.9rem'} : {}}>&nbsp;{targetStr}</span>
  //   {!singleComment && <span style={{color: '#325C93', fontSize: '0.9rem'}}>
  //       &nbsp;{type === 'post' ? repr(title) : repr(body)}
  //     </span>}
  // </span>
  // //
  // const bottom = <span style={{paddingTop: '2px', paddingLeft: '4px'}}>
  //     {singleComment && (type === 'post' ? repr(title) : repr(body))}
  //     {!singleComment && <span style={{fontSize: '1rem', color: '#666666'}}>
  //       <span>ответили</span>
  //       <span >
  //         &nbsp;
  //         <span style={{color: '#325C93'}}>
  //           {count}
  //         </span>
  //         &nbsp;
  //         <span>
  //           раз
  //         </span>
  //       </span>
  //     </span>}
  // </span>
  // //
  // return (
  //   <div className="NotificationContent__container">
  //     {left}
  //     <Link to={singleComment ? comment_url : parent_url}>
  //       <div className="NotificationContent__container_center">
  //         <div className="NotificationContent__container_center_top">
  //           <div style={{display: 'flex'}}>
  //             {top}
  //           </div>
  //         </div>
  //         <div className="NotificationContent__container_center_bottom">
  //           {bottom}
  //         </div>
  //       </div>
  //     </Link>
  //     <div className="NotificationContent__container_right">
  //       <Icon name="cross" />
  //     </div>
  //   </div>
  // )
}
//
const vote = data => {
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
  const singleVote = (count === 1);
  const targetStr = `ваш ${type === `post` ? `пост` : `комментарий`}`
  const repr = str => `${str.slice(0, 25)} ...`
  //
  const left = <div className="NotificationContent__container_left">
    {singleVote ?
      <Userpic imageUrl={profile_image}/> :
      <div style={{opacity: '0.3'}}>
        <Icon name="chevron-up-circle" size={'2x'}/>
      </div>
    }
  </div>
  //
  const top = <span style={{color: '#666666'}}>
    {singleVote && <span /*style={{color: '#325C93'}}*/><strong>{account}</strong></span>}
    {singleVote && <span style={{fontSize: '0.9rem'}}>&nbsp;поддержал</span>}
    <span style={singleVote ? {fontSize: '0.9rem'} : {}}>&nbsp;{targetStr}</span>
    {!singleVote && <span style={{color: '#325C93', fontSize: '0.9rem'}}>
        &nbsp;{type === 'post' ? repr(title) : repr(body)}
      </span>}
  </span>
  //
  const bottom = <span style={{paddingTop: '2px', paddingLeft: '4px'}}>
      {singleVote && (type === 'post' ? repr(title) : repr(body))}
    {!singleVote && <span style={{fontSize: '1rem', color: '#666666'}}>
        <span>поддержали</span>
        <span>
          &nbsp;
          <span style={{color: '#325C93'}}>
            {count}
          </span>
          &nbsp;
          <span>
            раз
          </span>
        </span>
      </span>}
  </span>
  //
  return (
    <div className="NotificationContent__container">
      {left}
      <Link to={parent_url}>
        <div className="NotificationContent__container_center">
          <div className="NotificationContent__container_center_top">
            <div style={{display: 'flex'}}>
              {top}
            </div>
          </div>
          <div className="NotificationContent__container_center_bottom">
            {bottom}
          </div>
        </div>
      </Link>
      <div className="NotificationContent__container_right">
        <Icon name="cross"/>
      </div>
    </div>
  )
// return (
  //   <div className="NotificationContent__container">
  //     <div className="NotificationContent__container_left">
  //       <Userpic imageUrl={profile_image} />
  //     </div>
  //     <Link to={url}>
  //       <div className="NotificationContent__container_center">
  //         <div className="NotificationContent__container_center_top">
  //         <div style={{display: 'flex'}}>
  //             <strong>
  //               {account}
  //             </strong>
  //             <span style={{color: '#666666'}}>
  //           &nbsp;
  //             {actionStr}
  //             <span style={{color: '#666666'}}>
  //             {/*todo use i18n const*/}
  //               &nbsp;
  //               {type === 'post' ? 'пост' : 'комментарий'}
  //           </span>
  //         </span>
  //         </div>
  //       </div>
  //         <div className="NotificationContent__container_center_bottom">
  //         <span style={{
  //           paddingTop: '2px',
  //           paddingLeft: '4px',
  //           // borderLeftStyle: 'solid',
  //           // borderLeftWidth: '2px',
  //           // borderLeftColor: '#d3d3d3',
  //         }}>
  //           {type === 'post' ? repr(title) : repr(body)}
  //         </span>
  //       </div>
  //       </div>
  //     </Link>
  //     <div className="NotificationContent__container_right">
  //       <Icon name="cross" />
  //     </div>
  //   </div>
  // )
}
//
function render(what) {
  console.log(`))))))) `, what)
  const {type, payload} = what;
  return (
    type === 'NOTIFY_COMMENT' ?
      comment(payload) :
      type === 'NOTIFY_TRANSFER' ?
        transfer(payload) :
        vote(payload)
  )
}
//
export const payload = {
  key: "chain_" + Date.now(),
  dismissAfter: 300000,
}
//
export default action => ({
  // the following two are merged by react-notification
  // and overload .notification-bar css class
  barStyle: {},
  activeBarStyle: {
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
      background: 'red',
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
  dismissAfter: 300000,
})
