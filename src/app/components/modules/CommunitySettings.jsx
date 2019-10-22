import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import tt from 'counterpart';
import { throws } from 'assert';

class CommunitySettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.title,
            about: this.props.about,
            is_nsfw: this.props.is_nsfw,
            description: this.props.description,
            flag_text: this.props.flag_text,
        };
    }

    onInput = event => {
        const el = event.target;
        const field = el.name;
        const value = el.hasOwnProperty('checked') ? el.checked : el.value;
        this.setState({ [field]: value });
    };

    onSubmit = e => {
        e.preventDefault();
        // Trim leading and trailing whitespace before submission.
        const payload = {};
        Object.keys(this.state).forEach(k => {
            if (typeof this.state[k] === 'string')
                payload[k] = this.state[k].trim();
            else payload[k] = this.state[k];
        });
        console.log('payload', payload);
        this.props.onSubmit(payload);
    };

    render() {
        const { title, about, is_nsfw, description, flag_text } = this.state;
        const submitButtonLabel = 'Save';
        return (
            <span>
                <div>
                    <h4>{tt('g.community_settings_header')}</h4>
                    <p>{tt('g.community_settings_description')}</p>
                </div>
                <hr />
                <form onSubmit={this.onSubmit}>
                    <label className="input-group">
                        <span className="input-group-label">Title </span>
                        <input
                            className="input-group-field"
                            type="text"
                            maxLength={32}
                            minLength={4}
                            name="title"
                            value={title}
                            onChange={e => this.onInput(e)}
                            required
                        />
                    </label>
                    <label className="input-group">
                        <span className="input-group-label">About </span>
                        <input
                            className="input-group-field"
                            type="text"
                            maxLength={120}
                            name="about"
                            value={about}
                            onChange={e => this.onInput(e)}
                        />
                    </label>
                    <label className="input-group">
                        <span className="input-group-label">NSFW? </span>
                        <input
                            className="input-group-field"
                            type="checkbox"
                            name="is_nsfw"
                            checked={is_nsfw}
                            onChange={e => this.onInput(e)}
                        />
                    </label>
                    <label className="input-group">
                        <span className="input-group-label">Description </span>
                        <textarea
                            className="input-group-field"
                            style={{ whiteSpace: 'normal' }}
                            type="text"
                            maxLength={1000}
                            rows="10"
                            onChange={e => this.onInput(e)}
                            name="description"
                            value={description}
                        />
                    </label>
                    <label className="input-group">
                        <span className="input-group-label">Flag Text </span>
                        <textarea
                            className="input-group-field"
                            style={{ whiteSpace: 'normal' }}
                            type="text"
                            maxLength={1000}
                            rows="10"
                            onChange={e => this.onInput(e)}
                            name="flag_text"
                            value={flag_text}
                        />
                    </label>
                    <input
                        className="button slim hollow secondary"
                        type="submit"
                        title={submitButtonLabel}
                        value={submitButtonLabel}
                    />
                </form>
            </span>
        );
    }
}

CommunitySettings.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    about: PropTypes.string.isRequired,
    is_nsfw: PropTypes.bool.isRequired,
    description: PropTypes.string.isRequired,
    flag_text: PropTypes.string.isRequired,
};

export default connect()(CommunitySettings);
