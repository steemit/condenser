import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Userpic from 'app/components/elements/Userpic';
import Follow from 'app/components/elements/Follow';
import Reputation from 'app/components/elements/Reputation';
import { api } from '@steemit/steem-js';

class AuthorDropdown extends Component {
    static propTypes = {};
    static defaultProps = {};

    constructor(props) {
        super(props);

        this.state = {
            authorAccount: {},
        };
    }

    componentDidMount() {
        api.getAccountsAsync([this.props.author]).then(chainAccount => {
            const authorAccount = chainAccount[0];
            authorAccount.json_metadata = JSON.parse(
                authorAccount.json_metadata
            );
            this.setState({ authorAccount });
        });
    }

    render() {
        const authorName = Object.prototype.hasOwnProperty.call(
            this.state.authorAccount,
            'json_metadata'
        )
            ? this.state.authorAccount.json_metadata.profile.name
            : '';
        const authorAbout = Object.prototype.hasOwnProperty.call(
            this.state.authorAccount,
            'json_metadata'
        )
            ? this.state.authorAccount.json_metadata.profile.about
            : '';
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

export default AuthorDropdown;
