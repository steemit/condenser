import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Userpic from 'app/components/elements/Userpic';
import Follow from 'app/components/elements/Follow';
import Reputation from 'app/components/elements/Reputation';
import { actions as UserProfilesSagaActions } from 'app/redux/UserProfilesSaga';
import { connect } from 'react-redux';
import normalizeProfile from 'app/utils/NormalizeProfile';

class AuthorDropdown extends Component {
    static propTypes = {};
    static defaultProps = {};

    constructor(props) {
        super(props);

        if (
            !Object.prototype.hasOwnProperty.call(
                this.props.userProfiles,
                this.props.author
            )
        ) {
            props.fetchUserProfile(this.props.author);
        }
    }

    render() {
        if (this.props.simple) {
            return (
                <span
                    className="author"
                    itemProp="author"
                    itemScope
                    itemType="http://schema.org/Person"
                >
                    <Link to={'/@' + this.props.author}>
                        <strong>{this.props.author}</strong>
                    </Link>{' '}
                    <Reputation value={this.props.authorRepLog10} />
                </span>
            );
        }

        const obj = this.props.userProfiles[this.props.author];
        const { name, about } = obj ? normalizeProfile(obj) : {};

        return (
            <div className="Author__container">
                <div className="Author__dropdown">
                    <Link to={'/@' + this.props.author}>
                        <Userpic account={this.props.author} />
                    </Link>
                    <Link
                        to={'/@' + this.props.author}
                        className="Author__name"
                    >
                        {name}
                    </Link>
                    <Link
                        to={'/@' + this.props.author}
                        className="Author__username"
                    >
                        @{this.props.author}
                    </Link>
                    <div>
                        <Follow
                            className="float-right"
                            follower={this.props.username}
                            following={this.props.author}
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
        const simple =
            !(props.follow || props.mute) || props.username === props.author;

        return {
            ...props,
            simple,
            userProfiles: state.userProfiles.get('profiles'),
        };
    },
    dispatch => ({
        fetchUserProfile: author => {
            dispatch(UserProfilesSagaActions.fetchProfile(author));
        },
    })
)(AuthorDropdown);
