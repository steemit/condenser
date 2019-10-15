import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Userpic from 'app/components/elements/Userpic';
import Follow from 'app/components/elements/Follow';
import Reputation from 'app/components/elements/Reputation';
import { actions as UserProfilesSagaActions } from 'app/redux/UserProfilesSaga';
import { connect } from 'react-redux';

class AuthorDropdown extends Component {
    static propTypes = {};
    static defaultProps = {};

    componentWillMount() {
        const { profile, fetchProfile, author, username } = this.props;
        if (!profile) fetchProfile(author, username);
    }

    render() {
        const { author, simple, profile } = this.props;

        if (simple) {
            return (
                <span
                    className="author"
                    itemProp="author"
                    itemScope
                    itemType="http://schema.org/Person"
                >
                    <Link to={'/@' + author}>
                        <strong>{author}</strong>
                    </Link>{' '}
                    <Reputation value={this.props.authorRep} />
                </span>
            );
        }

        const { name, about } = profile
            ? profile.getIn(['metadata', 'profile']).toJS()
            : {};

        return (
            <div className="Author__container">
                <div className="Author__dropdown">
                    <Link to={'/@' + author}>
                        <Userpic account={author} />
                    </Link>
                    <Link to={'/@' + author} className="Author__name">
                        {name}
                    </Link>
                    <Link to={'/@' + author} className="Author__username">
                        @{author}
                    </Link>
                    <div>
                        <Follow
                            className="float-right"
                            follower={this.props.username}
                            following={author}
                            what="blog"
                            showFollow={this.props.follow}
                            showMute={this.props.mute}
                        />
                    </div>
                    <div className="Author__bio">{about}</div>
                </div>
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const { author, authorRep, username, follow, mute } = props;
        const simple = !(follow || mute) || username === author;

        return {
            author,
            authorRep,
            username,
            follow,
            mute,
            simple,
            profile: state.userProfiles.getIn(['profiles', author]),
        };
    },
    dispatch => ({
        fetchProfile: (account, observer = null) => {
            dispatch(
                UserProfilesSagaActions.fetchProfile({ account, observer })
            );
        },
    })
)(AuthorDropdown);
