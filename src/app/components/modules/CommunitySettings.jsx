import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import tt from 'counterpart';

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
        const newState = {};
        let newValue = event.target.value || '';
        if (event.target.hasOwnProperty('checked'))
            newValue = event.target.checked;
        newState[event.target.name] = newValue;
        this.setState(newState);
    };

    onSubmit = () => {
        // Trim leading and trailing whitespace before submission.
        const settings = {};
        Object.keys(this.state).filter(k => {
            if (typeof this.state[k] === 'string') {
                return (settings[k] = this.state[k].trim());
            }
            return (settings[k] = this.state[k]);
        });
        // If there is no value for flag text, don't send it.
        if (settings.flag_text == '') delete settings.flag_text;

        this.props.onSubmit(settings);
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
                <div className="input-group">
                    <span className="input-group-label">
                        Title &nbsp;<small>
                            [<a title="the display name of this community (32 chars)">
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
                    <span className="input-group-label">
                        About &nbsp;<small>
                            [<a title="short blurb about this community (120 chars)">
                                ?
                            </a>]
                        </small>
                    </span>{' '}
                    <input
                        className="input-group-field"
                        type="text"
                        maxLength={120}
                        name="about"
                        value={about}
                        onChange={e => this.onInput(e)}
                    />
                </div>
                <div className="input-group">
                    <span className="input-group-label">
                        NSFW? &nbsp;<small>
                            [<a title="true if this community is 18+">?</a>]
                        </small>
                    </span>{' '}
                    <input
                        className="input-group-field"
                        type="checkbox"
                        name="is_nsfw"
                        checked={is_nsfw}
                        onChange={e => this.onInput(e)}
                    />
                </div>
                <div className="input-group">
                    <span className="input-group-label">
                        Description &nbsp;<small>
                            [<a title="describes purpose of community, etc. (5000 chars)">
                                ?
                            </a>]
                        </small>
                    </span>{' '}
                    <textarea
                        className="input-group-field"
                        type="text"
                        maxLength={2000}
                        onChange={e => this.onInput(e)}
                        name="description"
                        value={description}
                    />
                </div>
                <div className="input-group">
                    <span className="input-group-label">
                        Flag Text &nbsp;<small>
                            [<a title="custom text for reporting content (2000 chars)">
                                ?
                            </a>]
                        </small>
                    </span>{' '}
                    <textarea
                        className="input-group-field"
                        type="text"
                        maxLength={2000}
                        onChange={e => this.onInput(e)}
                        name="flag_text"
                        value={flag_text}
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

CommunitySettings.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    about: PropTypes.string.isRequired,
    is_nsfw: PropTypes.bool.isRequired,
    description: PropTypes.string.isRequired,
    flag_text: PropTypes.string.isRequired,
};

CommunitySettings.defaultProps = {
    isMuted: false,
};

export default connect()(CommunitySettings);
