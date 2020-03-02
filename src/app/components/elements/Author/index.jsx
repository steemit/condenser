/* eslint react/prop-types: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import Icon from 'app/components/elements/Icon';
import { Link } from 'react-router';
import AuthorDropdown from '../AuthorDropdown';
import Reputation from 'app/components/elements/Reputation';
import AffiliationMap from 'app/utils/AffiliationMap';
import tt from 'counterpart';
import Overlay from 'react-overlays/lib/Overlay';
import { findDOMNode } from 'react-dom';
import UserTitle from 'app/components/elements/UserTitle';
import { Role } from 'app/utils/Community';
import { List } from 'immutable';

const { string, bool, number } = PropTypes;

const closers = [];

const fnCloseAll = () => {
    let close;
    while ((close = closers.shift())) {
        close();
    }
};

class Author extends React.Component {
    static propTypes = {
        author: string.isRequired,
        hideEditor: bool,
        follow: bool,
        mute: bool,
        authorRep: number,
        showAffiliation: bool,
        role: string,
        title: string,
        community: string,
    };
    static defaultProps = {
        follow: true,
        mute: true,
        showAffiliation: false,
        role: '',
        title: '',
        community: '',
    };

    constructor(...args) {
        super(...args);
        this.state = { show: false };
        this.toggle = this.toggle.bind(this);
        this.close = this.close.bind(this);
    }

    componentDidMount() {
        if (!this.authorProfileLink) {
            return;
        }
        const node = ReactDOM.findDOMNode(this.authorProfileLink);
        if (node.addEventListener) {
            node.addEventListener('click', this.toggle, false);
        } else {
            node.attachEvent('click', this.toggle, false);
        }
    }

    componentWillUnmount() {
        if (!this.authorProfileLink) {
            return;
        }
        const node = ReactDOM.findDOMNode(this.authorProfileLink);
        if (node.removeEventListener) {
            node.removeEventListener('click', this.toggle);
        } else {
            node.detachEvent('click', this.toggle);
        }
    }

    toggle = e => {
        if (!(e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            e.stopPropagation();
            const show = !this.state.show;
            fnCloseAll();
            if (show) {
                this.setState({ show });
                closers.push(this.close);
            }
        }
    };

    close = () => {
        this.setState({
            show: false,
        });
    };

    shouldComponentUpdate = shouldComponentUpdate(this, 'Author');
    render() {
        const {
            author,
            authorRep,
            username,
            follow,
            mute,
            showAffiliation,
            blacklists,

            community,
            permlink,
            role,
            title,
        } = this.props;

        const warn = blacklists && (
            <span className="account_warn" title={blacklists.join(', ')}>
                ({blacklists.length})
            </span>
        );

        const userTitle = (
            <span>
                {community && (
                    <UserTitle
                        username={username}
                        community={community}
                        author={author}
                        permlink={permlink}
                        role={role}
                        title={title}
                        hideEdit={this.props.hideEditor}
                    />
                )}
                {showAffiliation && AffiliationMap[author] ? (
                    <span className="affiliation">
                        {tt('g.affiliation_' + AffiliationMap[author])}
                    </span>
                ) : null}
            </span>
        );

        if (!(follow || mute)) {
            return (
                <span
                    className="author"
                    itemProp="author"
                    itemScope
                    itemType="http://schema.org/Person"
                >
                    <strong>
                        <Link to={'/@' + author}>{author}</Link>
                    </strong>{' '}
                    <Reputation value={authorRep} />
                    {warn}
                    {userTitle}
                </span>
            );
        }

        return (
            <span className="Author">
                <span
                    itemProp="author"
                    itemScope
                    itemType="http://schema.org/Person"
                >
                    <strong>
                        <Link
                            ref={link => {
                                this.authorProfileLink = link;
                            }}
                            to={'/@' + author}
                        >
                            {author} <Reputation value={authorRep} />
                            <Icon name="dropdown-arrow" />
                        </Link>
                    </strong>
                    {warn}
                    {userTitle}
                </span>
                <Overlay
                    show={this.state.show}
                    onHide={this.close}
                    placement="bottom"
                    container={this}
                    target={() => findDOMNode(this.target)}
                    rootClose
                >
                    <AuthorDropdown
                        author={author}
                        follow={follow}
                        mute={mute}
                        authorRep={authorRep}
                        username={username}
                        blacklists={blacklists}
                    />
                </Overlay>
            </span>
        );
    }
}

import { connect } from 'react-redux';

export default connect((state, props) => {
    const { post } = props;
    const blacklists = post.get('blacklists', List()).toJS();
    return {
        follow: typeof props.follow === 'undefined' ? true : props.follow,
        mute: typeof props.mute === 'undefined' ? props.follow : props.mute,
        username: state.user.getIn(['current', 'username']),
        authorRep: post.get('author_reputation'),
        author: post.get('author'),
        community: post.get('community'), // UserTitle
        permlink: post.get('permlink'), // UserTitle
        role: post.get('author_role'), // UserTitle
        title: post.get('author_title'), // UserTitle
        blacklists: blacklists.length > 0 ? blacklists : null,
    };
})(Author);
