import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as FeatherIcons from 'react-feather';

import defaultUser from 'assets/images/user1.png';
import './SearchItem.scss';

class SearchRelatedItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // loading: true,
        };
    }

    render() {
        const { data } = this.props;
        const { title, type, description, user, votes, date, reviews } = data;
        const voteCount = (votes.up || 0) - (votes.down || 0);

        return (
            <div className="SearchItemWrapper Related">
                <div>
                    <div className="Title">
                        <span className={`Type ${type}`}>{type}</span> {title}
                    </div>
                    <div className="Description">{description}</div>
                    <div className="Votes">
                        <div
                            className={`Up ${
                                votes.you === 'up' ? 'Voted' : ''
                            }`}
                        >
                            <FeatherIcons.ThumbsUp />
                        </div>
                        <div
                            className={`VoteCount Voted ${
                                voteCount > 0 ? 'Up' : 'Down'
                            } ${voteCount === 0 ? 'Normal' : ''}`}
                        >
                            {voteCount}
                        </div>
                        <div
                            className={`Down ${
                                votes.you === 'down' ? 'Voted' : ''
                            }`}
                        >
                            <FeatherIcons.ThumbsDown />
                        </div>
                    </div>
                </div>
                <div className="Info">
                    <div className="User">
                        <img src={defaultUser} alt={user.name} />
                        <div>
                            <div className="UserName">{user.name}</div>
                            <div className="UserTitle">{user.title}</div>
                        </div>
                    </div>
                    <div className="Extra">
                        <div className="Date">{date}</div>
                        <div className="Reviews">{reviews} Reviews</div>
                    </div>
                </div>
            </div>
        );
    }
}

SearchRelatedItem.propTypes = {
    data: PropTypes.object.isRequired,
};

export default SearchRelatedItem;
