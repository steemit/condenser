import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Form, Field } from 'react-final-form';
import tt from 'counterpart';

import Card, { CardTitle, CardContent } from 'golos-ui/Card';
import { DialogFooter, DialogButton } from 'golos-ui/Dialog';
import { Switcher, Label } from 'golos-ui/Form';

const Group = styled.div`
    &:not(:first-child) {
        margin-top: 23.5px;
    }
    &:not(:last-child) {
        margin-bottom: 10px;
    }
`;

const GroupTitle = styled.div`
    font-family: ${({ theme }) => theme.fontFamily};
    font-size: 16px;
    line-height: 1;
    color: #333333;
    font-weight: 500;

    &:not(:first-child) {
        padding-top: 15.5px;
    }
    &:not(:last-child) {
        padding-bottom: 13.5px;
    }
`;

const GroupField = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    font-family: ${({ theme }) => theme.fontFamily};
    font-size: 16px;
    line-height: 1;
    color: #7d7d7d;
    font-weight: 400;

    &:not(:first-child) {
        padding-top: 13.5px;
    }
    &:not(:last-child) {
        padding-bottom: 13.5px;
    }
`;

export default class ActivityCardSettings extends PureComponent {
    static propTypes = {
        onSubmit: PropTypes.func,
    };

    static defaultProps = {
        onSubmit: () => {},
    };

    renderSettings() {
        const { onSubmit } = this.props;

        return (
            <Form onSubmit={onSubmit} initialValues={{}}>
                {({ handleSubmit, submitError, form, submitting, pristine, values }) => (
                    <form onSubmit={handleSubmit}>
                        <Label bold>Звук</Label>
                        <Field name="sound">
                            {({ input, meta }) => (
                                <GroupField>
                                    Звук уведомлений<Switcher {...input} />
                                </GroupField>
                            )}
                        </Field>
                        <GroupTitle>Уведомления</GroupTitle>
                        <Field name="online">
                            {({ input, meta }) => (
                                <GroupField>
                                    Онлайн<Switcher {...input} />
                                </GroupField>
                            )}
                        </Field>
                        <Field name="transfer">
                            {({ input, meta }) => (
                                <GroupField>
                                    Трансфер<Switcher {...input} />
                                </GroupField>
                            )}
                        </Field>
                        <pre>{JSON.stringify(values, 0, 2)}</pre>
                    </form>
                )}
            </Form>
        );
    }

    render() {
        return (
            <Card>
                <CardTitle>Настройки нотификаций</CardTitle>
                <CardContent column>{this.renderSettings()}</CardContent>
                <DialogFooter>
                    <DialogButton>{tt('settings_jsx.reset')}</DialogButton>
                    <DialogButton primary>{tt('settings_jsx.update')}</DialogButton>
                </DialogFooter>
            </Card>
        );
    }
}
