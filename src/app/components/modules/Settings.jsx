import React from 'react';
import { connect } from 'react-redux';
import tt from 'counterpart';
import * as userActions from 'app/redux/UserReducer';
import * as appActions from 'app/redux/AppReducer';
import UserList from 'app/components/elements/UserList';

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMessage: '',
            successMessage: '',
        };
        this.onNsfwPrefChange = this.onNsfwPrefChange.bind(this);
    }

    onNsfwPrefChange(e) {
        this.props.setUserPreferences({
            ...this.props.user_preferences,
            nsfwPref: e.currentTarget.value,
        });
    }

    handleDefaultBlogPayoutChange = event => {
        this.props.setUserPreferences({
            ...this.props.user_preferences,
            defaultBlogPayout: event.target.value,
        });
    };

    handleDefaultCommentPayoutChange = event => {
        this.props.setUserPreferences({
            ...this.props.user_preferences,
            defaultCommentPayout: event.target.value,
        });
    };

    handleLanguageChange = event => {
        const locale = event.target.value;
        const userPreferences = { ...this.props.user_preferences, locale };
        this.props.setUserPreferences(userPreferences);
    };

    render() {
        const { state, props } = this;

        const {
            walletUrl,
            follow,
            account,
            isOwnAccount,
            user_preferences,
        } = this.props;
        const following =
            follow && follow.getIn(['getFollowingAsync', account.name]);
        const ignores =
            isOwnAccount && following && following.get('ignore_result');

        return (
            <div className="Settings">
                {isOwnAccount && (
                    <div className="row">
                        <div className="small-12 columns">
                            <p>
                                To update your public profile, visit{' '}
                                <a
                                    href={
                                        walletUrl +
                                        '/@' +
                                        account.name +
                                        '/settings'
                                    }
                                >
                                    Steemitwallet.com
                                </a>.
                            </p>
                        </div>
                        <hr />
                        <br />
                        <div className="small-12 medium-4 large-4 columns">
                            <h4>{tt('settings_jsx.preferences')}</h4>

                            <label>
                                {tt('g.choose_language')}
                                <select
                                    defaultValue={user_preferences.locale}
                                    onChange={this.handleLanguageChange}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish Español</option>
                                    <option value="ru">Russian русский</option>
                                    <option value="fr">French français</option>
                                    <option value="it">Italian italiano</option>
                                    <option value="ko">Korean 한국어</option>
                                    <option value="ja">Japanese 日本語</option>
                                    <option value="pl">Polish</option>
                                    <option value="zh">Chinese 简体中文</option>
                                </select>
                            </label>
                            <br />

                            <label>
                                {tt(
                                    'settings_jsx.not_safe_for_work_nsfw_content'
                                )}
                            </label>
                            <select
                                value={user_preferences.nsfwPref}
                                onChange={this.onNsfwPrefChange}
                            >
                                <option value="hide">
                                    {tt('settings_jsx.always_hide')}
                                </option>
                                <option value="warn">
                                    {tt('settings_jsx.always_warn')}
                                </option>
                                <option value="show">
                                    {tt('settings_jsx.always_show')}
                                </option>
                            </select>
                            <br />

                            <label>
                                {tt('settings_jsx.choose_default_blog_payout')}
                                <select
                                    defaultValue={
                                        user_preferences.defaultBlogPayout ||
                                        '50%'
                                    }
                                    onChange={
                                        this.handleDefaultBlogPayoutChange
                                    }
                                >
                                    <option value="0%">
                                        {tt('reply_editor.decline_payout')}
                                    </option>
                                    <option value="50%">
                                        {tt('reply_editor.default_50_50')}
                                    </option>
                                    <option value="100%">
                                        {tt('reply_editor.power_up_100')}
                                    </option>
                                </select>
                            </label>
                            <br />

                            <label>
                                {tt(
                                    'settings_jsx.choose_default_comment_payout'
                                )}
                                <select
                                    defaultValue={
                                        user_preferences.defaultCommentPayout ||
                                        '50%'
                                    }
                                    onChange={
                                        this.handleDefaultCommentPayoutChange
                                    }
                                >
                                    <option value="0%">
                                        {tt('reply_editor.decline_payout')}
                                    </option>
                                    <option value="50%">
                                        {tt('reply_editor.default_50_50')}
                                    </option>
                                    <option value="100%">
                                        {tt('reply_editor.power_up_100')}
                                    </option>
                                </select>
                            </label>
                            <br />
                        </div>
                    </div>
                )}
                {ignores &&
                    ignores.size > 0 && (
                        <div className="row">
                            <div className="small-12 medium-6 large-6 columns">
                                <br />
                                <br />
                                <UserList
                                    title={tt('settings_jsx.muted_users')}
                                    users={ignores}
                                />
                            </div>
                        </div>
                    )}
            </div>
        );
    }
}

export default connect(
    (state, ownProps) => {
        const { accountname } = ownProps.routeParams;
        return {
            accountname,
            account: state.global.getIn(['accounts', accountname]).toJS(),
            isOwnAccount:
                state.user.getIn(['current', 'username'], '') == accountname,
            follow: state.global.get('follow'),
            user_preferences: state.app.get('user_preferences').toJS(),
            walletUrl: state.app.get('walletUrl'),
            ...ownProps,
        };
    },
    dispatch => ({
        changeLanguage: language => {
            dispatch(userActions.changeLanguage(language));
        },
        setUserPreferences: payload => {
            dispatch(appActions.setUserPreferences(payload));
        },
    })
)(Settings);
