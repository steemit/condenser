import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { withRouter, Link } from 'react-router';
import * as FeatherIcons from 'react-feather';
import { Link } from 'react-router';

import defaultUser from 'assets/images/static/user1.png';

class SearchItem extends Component {
  state = { type: null };

  componentDidMount() {
    // this.checkType();
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.checkType();
    }
  }

  checkType = () => {
    const { location } = this.props;
    if (location.pathname === '/posts') {
      let type = null;
      if (location.search && location.search.length > 0) {
        type = location.search.substring(
          location.search.indexOf('=') + 1,
          location.search.length
        );
      }
      switch (type) {
        case 'questions':
          type = 'Q';
          break;
        case 'hypotheses':
          type = 'H';
          break;
        case 'observations':
          type = 'Ob';
          break;
        default:
          break;
      }

      this.setState({ type });
    }
  };

  render() {
    const { data } = this.props;
    const { id, title, type, user, votes, date, reviews } = data;
    const voteCount = (votes.up || 0) - (votes.down || 0);

    const filteredType = this.state.type || type; //This is temporary and should be deleted.

    return (
      <div className="SearchItemWrapper">
        <Link className="Title" to={`/knowledgr/@${user.nick}/${id}`}>
          <span className={`Type ${filteredType}`}>{filteredType}</span> {title}
        </Link>
        <div className="Info">
          <div className="User">
            <img src={defaultUser} alt={user.name} />
            <div>
              <div className="UserName">{user.name}</div>
              <div className="UserTitle">{user.title}</div>
            </div>
          </div>
          <div className="Actions">
            <FeatherIcons.MessageCircle />
            <FeatherIcons.Share2 />
            <FeatherIcons.CornerDownRight />
            <FeatherIcons.Star />
          </div>
          <div className="Extra">
            <div className="Date">{date}</div>
            <div className="Reviews">{reviews} Reviews</div>
          </div>
        </div>
        <div className="Votes">
          <div className={`Up ${votes.you === 'up' ? 'Voted' : ''}`}>
            <FeatherIcons.ThumbsUp />
          </div>
          <div
            className={`VoteCount Voted ${voteCount > 0 ? 'Up' : 'Down'} ${
              voteCount === 0 ? 'Normal' : ''
            }`}
          >
            {voteCount}
          </div>
          <div className={`Down ${votes.you === 'down' ? 'Voted' : ''}`}>
            <FeatherIcons.ThumbsDown />
          </div>
        </div>
      </div>
    );
  }
}

SearchItem.propTypes = {
  data: PropTypes.object.isRequired,
};

export default SearchItem;
