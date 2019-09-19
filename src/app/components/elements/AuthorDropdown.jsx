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
        let authorName;
        let authorAbout;

        const authorAccount = this.props.userProfiles[this.props.author];
        if (authorAccount) {
            authorName = Object.prototype.hasOwnProperty.call(
                authorAccount,
                'json_metadata'
            )
                ? authorAccount.json_metadata.profile.name
                : '';

            authorAbout = Object.prototype.hasOwnProperty.call(
                authorAccount,
                'json_metadata'
            )
                ? authorAccount.json_metadata.profile.about
                : '';
        }

        const author_link = (
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
        if (
            !(this.props.follow || this.props.mute) ||
            this.props.username === this.props.author
        ) {
            return author_link;
        } else {
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
                            {authorName}
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
                        <div className="Author__bio">{authorAbout}</div>
                    </div>
                </div>
            );
        }
    }
}

export default connect(
    (state, props) => {
        return {
            ...props,
            userProfiles: state.userProfiles.get('profiles'),
        };
    },
    dispatch => ({
        fetchUserProfile: author => {
            dispatch(UserProfilesSagaActions.fetchProfile(author));
        },
    })
)(AuthorDropdown);
