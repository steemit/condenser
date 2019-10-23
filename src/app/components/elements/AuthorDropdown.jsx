import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Userpic from 'app/components/elements/Userpic';
import Follow from 'app/components/elements/Follow';
import Reputation from 'app/components/elements/Reputation';
import { actions as UserProfilesSagaActions } from 'app/redux/UserProfilesSaga';
import { connect } from 'react-redux';
import { numberWithCommas } from 'app/utils/StateFunctions';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import DateJoinWrapper from 'app/components/elements/DateJoinWrapper';

class AuthorDropdown extends Component {
    static propTypes = {};
    static defaultProps = {};

    componentWillMount() {
        const { profile, fetchProfile, author, username } = this.props;
        if (!profile) fetchProfile(author, username);
    }

    render() {
        const { author, simple, profile, blacklists } = this.props;

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

        const { following, followers, sp, rank } = profile
            ? profile.getIn(['stats']).toJS()
            : {};

        const { created, active } = profile ? profile.toJS() : {};

        let spv;
        let unit;
        if (sp > 10000) {
            spv = numberWithCommas((sp / 1000.0).toFixed(0));
            unit = (
                <small style={{ fontWeight: 'bold', color: '#444' }}>K</small>
            );
        } else {
            spv = numberWithCommas(sp);
        }

        return (
            <div className="Author__container">
                <div className="Author__dropdown">
                    <Link to={'/@' + author}>
                        <Userpic account={author} />
                    </Link>
                    {name && (
                        <Link to={'/@' + author} className="Author__name">
                            {name}
                        </Link>
                    )}
                    <Link to={'/@' + author} className="Author__username">
                        @{author}
                    </Link>
                    <div>
                        <Follow
                            //className="float-right"
                            follower={this.props.username}
                            following={author}
                            what="blog"
                            showFollow={this.props.follow}
                            showMute={this.props.mute}
                        />
                    </div>
                    <div className="clearfix" />
                    {profile && (
                        <div
                            className="row"
                            style={{
                                textAlign: 'center',
                                lineHeight: '1em',
                                clear: 'both',
                                marginTop: '12px',
                            }}
                        >
                            <div className="columns small-4">
                                {numberWithCommas(followers)}
                                <br />
                                <small>Followers</small>
                            </div>
                            <div className="columns small-4">
                                {numberWithCommas(following)}
                                <br />
                                <small>Following</small>
                            </div>
                            <div className="columns small-4">
                                {spv}
                                {unit} SP<br />
                                <small>
                                    {rank > 0
                                        ? `#${numberWithCommas(rank)}`
                                        : ''}
                                </small>
                            </div>
                        </div>
                    )}
                    {<div className="Author__bio">{about}</div>}
                    {profile && (
                        <div style={{ fontSize: '0.8em', textAlign: 'center' }}>
                            <DateJoinWrapper date={created} /> &bull; last seen{' '}
                            <TimeAgoWrapper date={active} />
                        </div>
                    )}
                    {blacklists && (
                        <div>
                            <br />
                            <strong>Blacklists</strong>
                            {blacklists.map(item => (
                                <div key={item}>❗️ {item}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const { author, authorRep, username, follow, mute } = props;
        const simple = !(follow || mute);

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
