/**
 * Renders the Yotifications settings panel.
 */

import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import tt from 'counterpart';
import { toggleNotificationGroupNames } from 'app/components/elements/notification/type';
import Icon from 'app/components/elements/Icon';
import IOSToggle from 'app/components/elements/IOSToggle';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';

const TRANSPORT_WEBSITE = 'wwwpoll';
const TRANSPORT_SMS = 'sms';
const TRANSPORT_EMAIL = 'email';

const activeTransports = [TRANSPORT_WEBSITE, TRANSPORT_EMAIL, TRANSPORT_SMS];

class YotificatonSettingsPanel extends React.Component {
    onToggleGroup = (transport, groupName, checked) => {
        //eslint-disable-line no-undef
        this.props.toggleGroup(transport, groupName, checked);
    };

    render() {
        const { isFetching, isSaving, groups, transportName } = this.props;

        const toggles = [];
        toggleNotificationGroupNames.forEach(groupName => {
            toggles.push(
                <li key={groupName}>
                    {tt('settings_jsx.notifications.meta_types.' + groupName)}{' '}
                    {isFetching ||
                    isSaving ||
                    undefined ==
                        groups.getIn([
                            transportName,
                            'notification_types',
                            groupName,
                        ]) ? (
                        <LoadingIndicator type="circle" inline />
                    ) : (
                        <IOSToggle
                            className="yotification-toggle"
                            onClick={checked =>
                                this.onToggleGroup(
                                    this.props.transportName,
                                    groupName,
                                    checked
                                )
                            }
                            checked={groups.getIn([
                                transportName,
                                'notification_types',
                                groupName,
                            ])}
                            value={groupName}
                        />
                    )}
                </li>
            );
        });

        return (
            <div className="YotificationSettingsPanel">
                <div className="panel-header">
                    <div className="panel-icon">
                        <Icon
                            name={tt(
                                `settings_jsx.notifications.transports.${
                                    transportName
                                }.icon`
                            )}
                            size="2x"
                        />
                    </div>
                    <div className="panel-title ">
                        <span className="main-title">
                            {tt(
                                `settings_jsx.notifications.transports.${
                                    transportName
                                }.title`
                            )}
                        </span>
                        <span className="sub-title">
                            {tt(
                                `settings_jsx.notifications.transports.${
                                    transportName
                                }.sub_title`
                            )}
                        </span>
                    </div>
                </div>

                <ul>{toggles}</ul>
            </div>
        );
    }
}

class YotificatonSettingsRootPanel extends React.Component {
    componentWillMount = () => {
        //eslint-disable-line no-undef
        this.props.loadGroups();
    };

    render() {
        const { isFetching, isSaving, groups } = this.props;

        const transportSettings = activeTransports.reduce(
            (settings, transportName) => {
                settings.push(
                    <YotificatonSettingsPanel
                        toggleGroup={this.props.toggleGroup}
                        key={transportName}
                        transportName={transportName}
                        groups={groups}
                        isFetching={isFetching}
                        isSaving={isSaving}
                    />
                );
                return settings;
            },
            []
        );

        return (
            <div
                className={classNames(
                    'YotificatonSettingsRootPanel',
                    this.props.className
                )}
                style={{ marginTop: '20px', marginBottom: '20px' }}
            >
                <h4>
                    {tt('settings_jsx.notifications.title')}{' '}
                    {this.props.isSaving ? (
                        <LoadingIndicator
                            type="circle"
                            inline
                            style={{ float: 'right' }}
                        />
                    ) : null}
                </h4>
                {transportSettings}
            </div>
        );
    }
}

export default connect(
    (state, ownProps) => {
        // todo: handle all channels, not just TRANSPORT_WEBSITE
        return {
            ...ownProps,
            isFetching: state.notificationsettings.isFetching,
            isSaving: state.notificationsettings.isSaving,
            groups: state.notificationsettings.groups,
        };
    },
    dispatch => ({
        loadGroups: () => {
            dispatch({
                type: 'notificationsettings/FETCH',
            });
        },
        toggleGroup: (transport, group, checked) => {
            //eslint-disable-line no-unused-vars
            dispatch({
                type: 'notificationsettings/TOGGLE_GROUP',
                transport,
                group,
            });
        },
    })
)(YotificatonSettingsRootPanel);
