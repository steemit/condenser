import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import tt from 'counterpart';

class UserTitle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.title,
        };
    }

    onInput = event => {
        const newState = {};
        let newValue = event.target.value || '';
        if (event.target.hasOwnProperty('checked'))
            newValue = event.target.checked;
        newState[event.target.name] = newValue;
        this.setState(newState);
    };

    onSubmit = () => {
        this.props.onSubmit(this.state.title.trim());
    };

    render() {
        const { title } = this.state;
        const { username, community } = this.props;
        const submitButtonLabel = 'Save';

        return (
            <span>
                <div>
                    <h4>{tt('g.community_user_title_edit_header')}</h4>
                    <p>
                        {tt('g.community_user_title_edit_description', {
                            community: community,
                            username: username,
                        })}
                    </p>
                </div>
                <hr />
                <div className="input-group">
                    <span className="input-group-label">
                        Title &nbsp;<small>
                            [<a title="this will be visible on all posts and comments by this user within this community">
                                ?
                            </a>]
                        </small>
                    </span>{' '}
                    <input
                        className="input-group-field"
                        type="text"
                        maxLength={32}
                        name="title"
                        value={title}
                        onChange={e => this.onInput(e)}
                    />
                </div>

                <div className="input-group">
                    <button
                        className="button slim hollow secondary"
                        type="submit"
                        title={submitButtonLabel}
                        onClick={() => this.onSubmit()}
                    >
                        {' '}
                        {submitButtonLabel}{' '}
                    </button>{' '}
                </div>
            </span>
        );
    }
}

UserTitle.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    community: PropTypes.string.isRequired,
};

export default connect()(UserTitle);
