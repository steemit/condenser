import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';

import { Form, Field } from 'react-final-form';
import tt from 'counterpart';

import SplashLoader from 'golos-ui/SplashLoader';
import { CardContent, CardDivider } from 'golos-ui/Card';
import { DialogFooter, DialogButton } from 'golos-ui/Dialog';
import {
    FormGroup,
    FormGroupRow as StyledFormGroupRow,
    Label as StyledLabel,
    LabelRow as StyledLabelRow,
    Switcher,
    Error,
} from 'golos-ui/Form';
import Icon from 'golos-ui/Icon';

const Label = styled(StyledLabel)`
    margin-bottom: 20px;
`;

const FormGroupRow = styled(StyledFormGroupRow)`
    height: 20px;
`;

const LabelRow = styled(StyledLabelRow)`
    flex: 1;
    justify-content: flex-start;
`;

const LabelIcon = styled(StyledLabelRow)`
    flex-basis: 19px;
    color: #d7d7d7;
    margin-right: 20px;

    ${is('active')`
        color: #2879FF;
    `};
`;

export default class Online extends PureComponent {
    static propTypes = {
        options: PropTypes.object,
        isChanging: PropTypes.bool,
        onSubmitGate: PropTypes.func,
    };

    state = {
        switchAll: false,
        data: {
            notify: this.props.options.get('notify').toJS(),
        },
    };

    onSwitchAll = value => {
        const { show } = this.state.data.notify;

        const newShow = {};
        for (let key in show) {
            newShow[key] = value;
        }

        this.setState({
            switchAll: value,
            data: {
                notify: {
                    show: newShow,
                },
            },
        });
    };

    resetSwitchAll = value => {
        if (!value) {
            this.setState({ switchAll: false });
        }
    };

    renderSwitchers = () => {
        const switchers = [
            {
                name: 'notify.show.vote',
                label: tt('settings_jsx.notifications.vote'),
                icon: { name: 'like', width: '19', height: '20' },
            },
            {
                name: 'notify.show.flag',
                label: tt('settings_jsx.notifications.flag'),
                icon: { name: 'dislike', size: '18' },
            },
            {
                name: 'notify.show.transfer',
                label: tt('settings_jsx.notifications.transfer'),
                icon: { name: 'coins', width: '20', height: '16' },
            },
            {
                name: 'notify.show.reply',
                label: tt('settings_jsx.notifications.reply'),
                icon: { name: 'comment-reply', width: '19', height: '18' },
            },
            {
                name: 'notify.show.subscribe',
                label: tt('settings_jsx.notifications.subscribe'),
                icon: { name: 'round-check', size: '18' },
            },
            {
                name: 'notify.show.unsubscribe',
                label: tt('settings_jsx.notifications.unsubscribe'),
                icon: { name: 'round-cross', size: '18' },
            },
            {
                name: 'notify.show.mention',
                label: tt('settings_jsx.notifications.mention'),
                icon: { name: 'at', size: '17' },
            },
            {
                name: 'notify.show.repost',
                label: tt('settings_jsx.notifications.repost'),
                icon: { name: 'repost-right', width: '19', height: '15' },
            },
            {
                name: 'notify.show.award',
                label: tt('settings_jsx.notifications.award'),
                icon: { name: 'a', width: '14', height: '15' },
            },
            {
                name: 'notify.show.curatorAward',
                label: tt('settings_jsx.notifications.curatorAward'),
                icon: { name: 'k', width: '13', height: '15' },
            },
            {
                name: 'notify.show.message',
                label: tt('settings_jsx.notifications.message'),
                icon: { name: 'comment', width: '19', height: '15' },
            },
        ];

        return switchers.map(({ name, label, icon }, key) => (
            <Field name={name} key={key}>
                {({ input }) => (
                    <FormGroupRow>
                        <LabelIcon active={input.value}>
                            <Icon {...icon} />
                        </LabelIcon>
                        <LabelRow dark>{label}</LabelRow>
                        <Switcher
                            {...input}
                            onChange={value => {
                                input.onChange(value);
                                this.resetSwitchAll(value);
                            }}
                        />
                    </FormGroupRow>
                )}
            </Field>
        ));
    };

    render() {
        const { isChanging, onSubmitGate } = this.props;
        const { data, switchAll } = this.state;

        return (
            <Form onSubmit={onSubmitGate} initialValues={data}>
                {({ handleSubmit, submitError, form, submitting, pristine, values }) => (
                    <form onSubmit={handleSubmit}>
                        {isChanging && <SplashLoader />}

                        <CardContent column>
                            <FormGroup>
                                <Label dark>{tt('settings_jsx.notifications.allOnlineLabel')}</Label>
                                <FormGroupRow>
                                    <LabelIcon active={switchAll}>
                                        <Icon name="bell" width="19" height="20" />
                                    </LabelIcon>
                                    <LabelRow dark>
                                        {tt('settings_jsx.notifications.allOnline')}
                                    </LabelRow>
                                    <Switcher
                                        value={switchAll}
                                        onChange={value => this.onSwitchAll(value)}
                                    />
                                </FormGroupRow>
                            </FormGroup>
                        </CardContent>
                        <CardDivider />
                        <CardContent column>
                            {this.renderSwitchers()}
                            {/* <pre>{JSON.stringify(values, 0, 2)}</pre> */}

                            {submitError && <div>{submitError}</div>}
                        </CardContent>
                        <DialogFooter>
                            <DialogButton onClick={form.reset} disabled={submitting || pristine}>
                                {tt('settings_jsx.reset')}
                            </DialogButton>
                            <DialogButton type="submit" primary disabled={submitting}>
                                {tt('settings_jsx.update')}
                            </DialogButton>
                        </DialogFooter>
                    </form>
                )}
            </Form>
        );
    }
}
