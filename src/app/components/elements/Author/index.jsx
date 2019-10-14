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
import UserTitleEditButton from 'app/components/elements/UserTitleEditButton';

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
        follow: bool,
        mute: bool,
        authorRep: number,
        showAffiliation: bool,
        role: string,
        title: string,
        community: string,
        viewer_role: string,
    };
    static defaultProps = {
        follow: true,
        mute: true,
        showAffiliation: false,
        role: '',
        title: '',
        community: '',
        viewer_role: 'guest',
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
            follow,
            mute,
            authorRep,
            showAffiliation,
            role,
            title,
            community,
            permlink,
            viewer_role,
            username,
        } = this.props;

        const isMod =
            username && community && ['mod', 'admin'].includes(viewer_role);

        const userTitle = (
            <span>
                {role && role != 'guest' && <span>[{role}]</span>}
                {(title != '' || isMod) && (
                    <span className="affiliation">
                        {title}
                        {isMod && (
                            <UserTitleEditButton
                                author={author}
                                username={username}
                                community={community}
                                title={title}
                                permlink={permlink}
                            />
                        )}
                    </span>
                )}
                {showAffiliation && AffiliationMap[author] ? (
                    <span className="affiliation">
                        {tt('g.affiliation_' + AffiliationMap[author])}
                    </span>
                ) : null}
            </span>
        );

        if (!(follow || mute) || username === author) {
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
                            className="ptc"
                            ref={link => {
                                this.authorProfileLink = link;
                            }}
                            to={'/@' + author}
                        >
                            {author} <Reputation value={authorRep} />
                            <Icon name="dropdown-arrow" />
                        </Link>
                    </strong>
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
                    />
                </Overlay>
            </span>
        );
    }
}

import { connect } from 'react-redux';

export default connect((state, ownProps) => {
    const { author, follow, mute, authorRep, permlink } = ownProps;
    const username = state.user.getIn(['current', 'username']);
    return {
        author,
        follow,
        mute,
        authorRep,
        username,
        permlink,
    };
})(Author);
