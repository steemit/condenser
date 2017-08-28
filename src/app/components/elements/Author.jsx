/* eslint react/prop-types: 0 */
import React from 'react';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import Icon from 'app/components/elements/Icon';
import { Link } from 'react-router';
import {authorNameAndRep} from 'app/utils/ComponentFormatters';
import AuthorDropdown from './AuthorDropdown';
import Reputation from 'app/components/elements/Reputation';
import tt from 'counterpart';
import normalizeProfile from 'app/utils/NormalizeProfile';
import Overlay from 'react-overlays/lib/Overlay';
import { findDOMNode } from 'react-dom';

const {string, bool, number} = React.PropTypes;

class Author extends React.Component {
    static propTypes = {
        author: string.isRequired,
        follow: bool,
        mute: bool,
        popupEnabled: bool,
        authorRepLog10: number,
    };
    static defaultProps = {
        follow: true,
        mute: true,
        popupEnabled: false
    };

    constructor(...args){
        super(...args);
        this.state = { show: false };
    }

    toggle = () => {
        const toggleShow = !this.state.show;
        this.setState({
            show: toggleShow
        });
    }

    close = () => {
        this.setState({
            show: false
        });
    }

    shouldComponentUpdate = shouldComponentUpdate(this, 'Author');
    render() {
        const {author, follow, mute, authorRepLog10} = this.props; // html
        const {username} = this.props; // redux
        const {name, about} = this.props.account ? normalizeProfile(this.props.account.toJS()) : {};

        if (!(follow || mute) || username === author) {
            return (<span className="author" itemProp="author" itemScope itemType="http://schema.org/Person">
                <Link to={'/@' + author}><strong>{author}</strong></Link> <Reputation value={authorRepLog10} />
            </span>)
        }

        return (
            <span className="Author">
                <span>
                    <span
                        itemProp="author"
                        itemScope
                        itemType="http://schema.org/Person"
                    >
                        <Link to={'/@' + author}><strong>{author}</strong></Link>
                    </span>
                    <span onClick={this.toggle}
                          ref={(c) => { this.target = c; }}>
                        <Icon name="dropdown-arrow" />
                        <Reputation value={authorRepLog10} />
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
                        authorRepLog10={authorRepLog10}
                        name={name}
                        about={about}
                        username={username}
                    />
                </Overlay>
                </span>
            </span>
        )
    }
}

import {connect} from 'react-redux'
export default connect(
    (state, ownProps) => {
        const {author, follow, mute, authorRepLog10} = ownProps;
        const username = state.user.getIn(['current', 'username']);
        const account = state.global.getIn(['accounts', author]);
        return {
            author, follow, mute, authorRepLog10,
            username,
            account,
        }
    },
)(Author)
