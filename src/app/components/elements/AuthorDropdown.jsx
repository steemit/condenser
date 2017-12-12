import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Userpic from 'app/components/elements/Userpic';
import Follow from 'app/components/elements/Follow';
import Reputation from 'app/components/elements/Reputation';

const AuthorDropdown = props => {
    const author_link = (
        <span
            className="author"
            itemProp="author"
            itemScope
            itemType="http://schema.org/Person"
        >
            <Link to={'/@' + props.author}>
                <strong>{props.author}</strong>
            </Link>{' '}
            <Reputation value={props.authorRepLog10} />
        </span>
    );
    if (!(props.follow || props.mute) || props.username === props.author) {
        return author_link;
    } else {
        return (
            <div className="Author__container">
                <div className="Author__dropdown">
                    <Link to={'/@' + props.author}>
                        <Userpic account={props.author} />
                    </Link>
                    <Link to={'/@' + props.author} className="Author__name">
                        {props.name}
                    </Link>
                    <Link to={'/@' + props.author} className="Author__username">
                        @{props.author}
                    </Link>
                    <div>
                        <Follow
                            className="float-right"
                            follower={props.username}
                            following={props.author}
                            what="blog"
                            showFollow={props.follow}
                            showMute={props.mute}
                        />
                    </div>
                    <div className="Author__bio">{props.about}</div>
                </div>
            </div>
        );
    }
};

export default AuthorDropdown;

AuthorDropdown.propTypes = {};
AuthorDropdown.defaultProps = {};
