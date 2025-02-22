import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import * as userActions from 'app/redux/UserReducer';
import AutocompleteInput from 'app/components/elements/AutocompleteInput';
import Unicode from 'app/utils/Unicode';
import tt from 'counterpart';

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
            settings: {
                avatar_url: this.props.settings.avatar_url,
                cover_url: this.props.settings.cover_url,
            },
            progress: {},
            is_nsfw: this.props.is_nsfw,
            lang: this.props.lang,
            description: this.props.description,
            flag_text: this.props.flag_text,
            imageInProgress: '',
        };
    }

    onInput = event => {
        const el = event.target;
        const field = el.name;
        const value = el.hasOwnProperty('checked') ? el.checked : el.value;

        if (field === 'avatar_url' || field === 'cover_url') {
            this.setState(prevState => ({
                settings: {
                    ...prevState.settings,
                    [field]: value,
                },
            }));
        } else {
            this.setState({ [field]: value });
        }

        if (field == 'title') {
            let formError = null;
            const rx = new RegExp('^[' + Unicode.L + ']');
            if (value && !rx.test(value)) formError = tt('g.title_error');
            this.setState({ formError });
        }
    };

    onDrop = (acceptedFiles, rejectedFiles) => {
        if (!acceptedFiles.length) {
            if (rejectedFiles.length) {
                this.setState({
                    progress: { error: tt('settings_jsx.upload_error_image') },
                });
                console.log('onDrop Rejected files: ', rejectedFiles);
            }
            return;
        }
        const file = acceptedFiles[0];
        this.upload(file, file.name);
    };

    onOpenClick = field => {
        this.setState({ imageInProgress: field });
        this.dropzone.open();
    };

    upload = (file, name = '') => {
        const { uploadImage } = this.props;
        this.setState({
            progress: { message: tt('settings_jsx.uploading_image') + '...' },
        });
        uploadImage(file, progress => {
            if (progress.url) {
                this.setState(prevState => ({
                    progress: {},
                    settings: {
                        ...prevState.settings,
                        [prevState.imageInProgress]: progress.url,
                    },
                }));
            } else {
                if (progress.hasOwnProperty('error')) {
                    this.displayErrorMessage(progress.error);
                    this.setState({
                        progress: { error: progress.error },
                    });
                } else {
                    this.setState({ progress });
                }
            }
            setTimeout(() => {
                this.setState({ progress: {} });
            }, 4000); // clear message
        });
    };

    onSubmit = e => {
        e.preventDefault();
        // Trim leading and trailing whitespace before submission.
        const payload = {};
        Object.keys(this.state).forEach(k => {
            if (k == 'formError') return;
            if (k === 'progress' || k === 'imageInProgress') {
                // Skip these keys
            } else if (typeof this.state[k] === 'string') {
                payload[k] = this.state[k].trim();
            } else if (k === 'settings') {
                const settingsCopy = { ...this.state[k] };
                if (settingsCopy.avatar_url.trim() === '') {
                    settingsCopy.avatar_url = '';
                }
                if (settingsCopy.cover_url.trim() === '') {
                    settingsCopy.cover_url = '';
                }
                payload[k] = settingsCopy;
            } else {
                payload[k] = this.state[k];
            }
        });
        this.props.onSubmit(payload);
    };

    render() {
        const {
            title,
            about,
            settings,
            progress,
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
                <form onSubmit={this.onSubmit} className="communitySettings">
                    {formError && <span className="error">{formError}</span>}
                    <label className="input-group">
                        <span className="input-group-label">
                            {tt('g.title')}{' '}
                        </span>
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
                        <span className="input-group-label">
                            {tt('g.about')}{' '}
                        </span>
                        <input
                            className="input-group-field"
                            type="text"
                            maxLength={120}
                            name="about"
                            value={about}
                            onChange={e => this.onInput(e)}
                        />
                    </label>

                    {progress.message && (
                        <div className="info">{progress.message}</div>
                    )}
                    {progress.error && (
                        <div className="error">
                            {tt('reply_editor.image_upload')}
                            {': '}
                            {progress.error}
                        </div>
                    )}
                    <label>
                        {tt('settings_jsx.profile_image_url')}
                        <Dropzone
                            onDrop={this.onDrop}
                            className={'none'}
                            disableClick
                            multiple={false}
                            accept="image/*"
                            ref={node => {
                                this.dropzone = node;
                            }}
                        >
                            <input
                                type="url"
                                name="avatar_url"
                                value={settings.avatar_url || ''}
                                autoComplete="off"
                                onChange={this.onInput}
                            />
                        </Dropzone>
                        <a onClick={() => this.onOpenClick('avatar_url')}>
                            {tt('settings_jsx.upload_image')}
                        </a>
                    </label>
                    <label>
                        {tt('settings_jsx.cover_image_url')}{' '}
                        <small>
                            ({tt('g.optimal')}: 2048 x 512 {tt('g.pixels')})
                        </small>
                        <input
                            type="url"
                            name="cover_url"
                            value={settings.cover_url || ''}
                            autoComplete="off"
                            onChange={this.onInput}
                        />
                        <a onClick={() => this.onOpenClick('cover_url')}>
                            {tt('settings_jsx.upload_image')}
                        </a>
                    </label>
                    <AutocompleteInput
                        label={tt('g.language')}
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
                    <label>
                        {tt('g.description')}
                        <br />
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
                    <label>
                        {tt('g.rules')} ({tt('g.one_per_line')})<br />
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
                        <input
                            className="button"
                            type="submit"
                            value={tt('g.save')}
                        />
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
    settings: PropTypes.shape({
        avatar_url: PropTypes.string,
        cover_url: PropTypes.string,
    }),
    is_nsfw: PropTypes.bool.isRequired,
    lang: PropTypes.string,
    description: PropTypes.string.isRequired,
    flag_text: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    return {};
};

const mapDispatchToProps = dispatch => ({
    uploadImage: (file, progress) =>
        dispatch(userActions.uploadImage({ file, progress })),
});

export default connect(mapStateToProps, mapDispatchToProps)(CommunitySettings);
