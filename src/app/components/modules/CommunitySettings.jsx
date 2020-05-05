import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AutocompleteInput from 'app/components/elements/AutocompleteInput';

import Unicode from 'app/utils/Unicode';
import tt from 'counterpart';
import { throws } from 'assert';

const languageOptions = [
    { abbr: 'en', name: 'English' },
    { abbr: 'kr', name: 'Korean' },
    { abbr: 'zh', name: 'Chinese' },
    { abbr: 'ms', name: 'Malay' },
    { abbr: 'pl', name: 'Polish' },
    { abbr: 'pt', name: 'Portuguese' },
    { abbr: 'ru', name: 'Russian' },
    { abbr: 'it', name: 'Italian' },
    { abbr: 'de', name: 'German' },
    { abbr: 'es', name: 'Spanish' },
    { abbr: 'sv', name: 'Swedish' },
];

class CommunitySettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.title,
            about: this.props.about,
            is_nsfw: this.props.is_nsfw,
            lang: this.props.lang,
            description: this.props.description,
            flag_text: this.props.flag_text,
        };
    }

    onInput = event => {
        const el = event.target;
        const field = el.name;
        const value = el.hasOwnProperty('checked') ? el.checked : el.value;
        this.setState({ [field]: value });

        if (field == 'title') {
            let formError = null;
            const rx = new RegExp('^[' + Unicode.L + ']');
            if (value && !rx.test(value))
                formError = 'Must start with a letter.';
            this.setState({ formError });
        }
    };

    onSubmit = e => {
        e.preventDefault();
        // Trim leading and trailing whitespace before submission.
        const payload = {};
        Object.keys(this.state).forEach(k => {
            if (k == 'formError') return;
            if (typeof this.state[k] === 'string')
                payload[k] = this.state[k].trim();
            else payload[k] = this.state[k];
        });
        this.props.onSubmit(payload);
    };

    render() {
        const {
            title,
            about,
            is_nsfw,
            lang,
            description,
            flag_text,
            formError,
        } = this.state;
        const currentLanguage = languageOptions.filter(l => l.abbr === lang)[0]
            .name;
        return (
            <span>
                <div>
                    <h4>{tt('g.community_settings_header')}</h4>
                    <p>{tt('g.community_settings_description')}</p>
                </div>
                <form onSubmit={this.onSubmit}>
                    {formError && <span className="error">{formError}</span>}
                    <label className="input-group">
                        <span className="input-group-label">Title </span>
                        <input
                            className="input-group-field"
                            type="text"
                            maxLength={20}
                            minLength={3}
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
                    <AutocompleteInput
                        label={'Language'}
                        values={languageOptions}
                        initialValue={currentLanguage}
                        onSelect={v => {
                            const selectedLanguage = languageOptions.filter(
                                l => l.name === v
                            )[0];
                            this.setState({
                                lang: selectedLanguage.abbr,
                            });
                        }}
                    />
                    <label style={{ margin: '1em 0 1rem' }}>
                        Description<br />
                        <textarea
                            style={{ whiteSpace: 'normal' }}
                            type="text"
                            maxLength={1000}
                            rows="10"
                            onChange={e => this.onInput(e)}
                            name="description"
                            value={description}
                        />
                    </label>
                    <label style={{ margin: '0 0 0.5rem' }}>
                        Rules (one per line)<br />
                        <textarea
                            style={{ whiteSpace: 'normal' }}
                            type="text"
                            maxLength={1000}
                            rows="7"
                            onChange={e => this.onInput(e)}
                            name="flag_text"
                            value={flag_text}
                        />
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="is_nsfw"
                            checked={is_nsfw}
                            onChange={e => this.onInput(e)}
                        />{' '}
                        NSFW
                    </label>
                    <div className="text-right">
                        <input className="button" type="submit" value="Save" />
                    </div>
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
    lang: PropTypes.string,
    description: PropTypes.string.isRequired,
    flag_text: PropTypes.string.isRequired,
};

export default connect()(CommunitySettings);
