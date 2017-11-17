/* eslint react/prop-types: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import Icon from 'app/components/elements/Icon';
import { Link } from 'react-router';
import {authorNameAndRep} from 'app/utils/ComponentFormatters';
import AuthorDropdown from './AuthorDropdown';
import Reputation from 'app/components/elements/Reputation';
import normalizeProfile from 'app/utils/NormalizeProfile';
import Overlay from 'react-overlays/lib/Overlay';
import { findDOMNode } from 'react-dom';

const {string, bool, number} = React.PropTypes;

const closers = [];

const fnCloseAll = () => {
    var close;
    while(close = closers.shift()) {
        close();
    }
}

class Author extends React.Component {
    static propTypes = {
        author: string.isRequired,
        follow: bool,
        mute: bool,
        authorRepLog10: number,
    };
    static defaultProps = {
        follow: true,
        mute: true
    };

    constructor(...args) {
        super(...args);
        this.state = { show: false };
        this.toggle = this.toggle.bind(this);
        this.close = this.close.bind(this);
    }

    componentDidMount() {
        if(!this.authorProfileLink) {
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
        if(!this.authorProfileLink) {
            return;
        }
        const node = ReactDOM.findDOMNode(this.authorProfileLink);
        if (node.removeEventListener) {
            node.removeEventListener('click', this.toggle);
        } else {
            node.detachEvent('click', this.toggle);
        }
    }

    toggle = (e) => {
        if(!(e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            e.stopPropagation();
            const show = !this.state.show;
            fnCloseAll();
            if(show) {
                this.setState({show})
                closers.push(this.close)
            }
        }
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
            return (
                <span className="author" itemProp="author" itemScope itemType="http://schema.org/Person">
                    <strong><Link to={'/@' + author}>{author}</Link></strong> <Reputation value={authorRepLog10} />
                </span>
            );
        }

        return (
            <span className="Author">
                <span itemProp="author" itemScope itemType="http://schema.org/Person">
                    <strong><Link className="ptc" ref={(link) => {this.authorProfileLink = link}} to={'/@' + author}>{author} <Reputation value={authorRepLog10} /><Icon name="dropdown-arrow" /></Link></strong>                    
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
        );
    }
}

import {connect} from 'react-redux'

export default connect(
    (state, ownProps) => {
        const {author, follow, mute, authorRepLog10} = ownProps;
        const username = state.getIn(['user', 'current', 'username']);
        const account = state.getIn(['global', 'accounts', author]);
        return {
            author, follow, mute, authorRepLog10,
            username,
            account,
        }
    },
)(Author)
