import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';

import { Form, Field } from 'react-final-form';
import tt from 'counterpart';

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

const Online = ({ profile, isChanging, onSubmitGate }) => {
    return (
        <Form onSubmit={onSubmitGate} initialValues={profile}>
            {({ handleSubmit, submitError, form, submitting, pristine, values }) => (
                <form onSubmit={handleSubmit}>
                    <CardContent column>
                        <FormGroup>
                            <Label dark>Оффлайн уведомления</Label>
                            <Field name="a">
                                {({ input }) => (
                                    <FormGroupRow>
                                        <LabelIcon active={input.value}>
                                            <Icon name="bell" width="19" height="20" />
                                        </LabelIcon>
                                        <LabelRow dark>
                                            Включить/выключить пуш уведомления
                                        </LabelRow>
                                        <Switcher {...input} />
                                    </FormGroupRow>
                                )}
                            </Field>
                        </FormGroup>
                    </CardContent>
                    <CardDivider />
                    <CardContent column>
                        <Field name="b">
                            {({ input }) => (
                                <FormGroupRow>
                                    <LabelRow dark>Количество лайков и комментариев за сутки</LabelRow>
                                    <Switcher {...input} />
                                </FormGroupRow>
                            )}
                        </Field>
                        <Field name="c">
                            {({ input }) => (
                                <FormGroupRow>
                                    <LabelRow dark>Количество авторских и кураторских наград за неделю</LabelRow>
                                    <Switcher {...input} />
                                </FormGroupRow>
                            )}
                        </Field>
                        <Field name="c">
                            {({ input }) => (
                                <FormGroupRow>
                                    <LabelRow dark>Количество лайков или награды одного поста</LabelRow>
                                    <Switcher {...input} />
                                </FormGroupRow>
                            )}
                        </Field>
                        <Field name="c">
                            {({ input }) => (
                                <FormGroupRow>
                                    <LabelRow dark>Мощность Голоса за сутки</LabelRow>
                                    <Switcher {...input} />
                                </FormGroupRow>
                            )}
                        </Field>
                        <Field name="c">
                            {({ input }) => (
                                <FormGroupRow>
                                    <LabelRow dark>Уведомление о публикации поста автора, на которого вы подписаны</LabelRow>
                                    <Switcher {...input} />
                                </FormGroupRow>
                            )}
                        </Field>

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
};

export default Online;
