import React, { Component } from 'react'
import Userpic from 'app/components/elements/Userpic'
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import LocalizedCurrency from 'app/components/elements/LocalizedCurrency';
import Icon from 'app/components/elements/Icon';
import { parsePayoutAmount } from 'app/utils/ParsersAndFormatters';
import extractContent from 'app/utils/ExtractContent';
import { objAccessor } from 'app/utils/Accessors';

export default class WelcomeCardPost extends Component {
  render() {
    const { post } = this.props

    const p = extractContent(objAccessor, post)

    const max_payout = parsePayoutAmount(post.max_accepted_payout)
    const pending_payout = parsePayoutAmount(post.pending_payout_value)
    const total_author_payout = parsePayoutAmount(post.total_payout_value)
    const total_curator_payout = parsePayoutAmount(post.curator_payout_value)

    let payout = pending_payout + total_author_payout + total_curator_payout
    if (payout < 0.0) payout = 0.0
    if (payout > max_payout) payout = max_payout

    return (
      <div className="WelcomeCardPost">
        <a className="WelcomeCardPost__main" href={p.link}>
          {p.image_link && <img src={p.image_link} alt="" title={p.title} />}
          <div className="WelcomeCardPost__content">
            <div className="title">{p.title}</div>
            <div className="text">{p.desc}</div>
          </div>
        </a>
        <div className="WelcomeCardPost__footer">
          <a href={`/@${p.author}`} title={p.author} className="WelcomeCardPost__footer-profile">
            <Userpic account={p.author} />
            <div className="WelcomeCardPost__footer-info">
              <div className="name">{p.author}</div>
              <div className="time">
                <TimeAgoWrapper date={p.created} />
              </div>
            </div>
          </a>
          <div className="WelcomeCardPost__footer-actions">
            <div className="votes">
              <Icon name="new/like" />
              {post.net_votes}
            </div>
            <div className="payout">
              <LocalizedCurrency amount={payout} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
