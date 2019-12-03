import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import tt from 'counterpart';

class UserTitleEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.title ? this.props.title : '',
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

        return (
            <span>
                <div>
                    {/*<h4>{tt('g.community_user_title_edit_header')}</h4>*/}
                    <h4>
                        {tt('g.community_user_title_edit_description', {
                            community: community,
                            username: username,
                        })}
                    </h4>
                </div>
                <hr />
                <div className="input-group">
                    <span className="input-group-label">Title</span>
                    <input
                        className="input-group-field"
                        type="text"
                        maxLength={32}
                        name="title"
                        value={title}
                        onChange={e => this.onInput(e)}
                    />
                </div>

                <div className="text-right">
                    <button
                        className="button"
                        type="submit"
                        onClick={() => this.onSubmit()}
                    >
                        Save
                    </button>
                </div>
            </span>
        );
    }
}

UserTitleEditor.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    title: PropTypes.string,
    username: PropTypes.string.isRequired,
    community: PropTypes.string.isRequired,
};

UserTitleEditor.defaultProps = {
    title: '',
};

export default connect()(UserTitleEditor);
