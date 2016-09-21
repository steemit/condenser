/* eslint react/prop-types: 0 */
import React from 'react';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import {LinkWithDropdown} from 'react-foundation-components/lib/global/dropdown'
import Follow from 'app/components/elements/Follow';
import Icon from 'app/components/elements/Icon';
import { Link } from 'react-router';
import {authorNameAndRep} from 'app/utils/ComponentFormatters';
import Reputation from 'app/components/elements/Reputation';

const {string, bool, number} = React.PropTypes

class Author extends React.Component {
    static propTypes = {
        author: string.isRequired,
        follow: bool,
        mute: bool,
        authorRepLog10: number,
    }
    static defaultProps = {
        follow: true,
        mute: true,
    }
    shouldComponentUpdate = shouldComponentUpdate(this, 'Author')
    render() {
        const {author, follow, mute, authorRepLog10} = this.props // html
        const {username} = this.props // redux

        const author_link = <span className="author" itemProp="author" itemScope itemType="http://schema.org/Person">
            <Link to={'/@' + author}><strong>{author}</strong></Link><Reputation value={authorRepLog10} />
        </span>

        if(!username || !(follow || mute))
            return author_link

        const dropdown = <div className="Author__dropdown">
            <Link to={'/@' + author}>Profile</Link> &nbsp;
            <Follow className="float-right" follower={username} following={author} what="blog"
                    showFollow={follow} showMute={mute} />
        </div>

        return (
            <span className="Author">
                <LinkWithDropdown
                    closeOnClickOutside
                    dropdownPosition="bottom"
                    dropdownAlignment="center"
                    dropdownContent={dropdown}
                >
                    <span className="FoundationDropdownMenu__label">
                        <span itemProp="author" itemScope itemType="http://schema.org/Person">
                            <strong>{author}</strong>
                        </span>
                        <Icon name="dropdown-arrow" />
                    </span>
                </LinkWithDropdown>
                <Reputation value={authorRepLog10} />
            </span>
        )
    }
}

import {connect} from 'react-redux'
export default connect(
    (state, ownProps) => {
        const current = state.user.get('current')
        const username = current && current.get('username')
        return {
            ...ownProps,
            username,
        }
    },
    // dispatch => ({
    //     vote: (abc) => {
    //         dispatch(transaction.actions.broadcastOperation({
    //             abc
    //         }))
    //     },
    // })
)(Author)
