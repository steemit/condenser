import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { PrivateKey, PublicKey, key_utils } from 'golos-js/lib/auth/ecc';
import { Form, Field } from 'react-final-form';
import tt from 'counterpart';

import { CardContent } from 'golos-ui/Card';
import { DialogFooter, DialogButton } from 'golos-ui/Dialog';
import {
    FormGroup,
    Label,
    LabelRow as StyledLabelRow,
    Input,
    Checkbox,
    FormError,
} from 'golos-ui/Form';

const LabelRow = styled(StyledLabelRow)`
    margin-left: 20px;
`;

const RulesBlock = styled.div`
    margin-bottom: 28px;
`;

const Ol = styled.ol`
    list-style: none;
    counter-reset: li;
    margin: 0 0 0 15px;
`;

const Li = styled.li`
    counter-increment: li;
    font-family: ${({ theme }) => theme.fontFamily};
    font-size: 15px;

    &::before {
        content: counter(li);
        display: inline-block;
        font-family: ${({ theme }) => theme.fontFamily};
        font-weight: 900;
        font-size: 14px;

        color: #2879ff;
        width: 1em;

        margin-left: -1.5em;
        margin-right: 10px;

        text-align: right;
        direction: rtl;
    }
`;

const Hint = styled.div`
    color: #959595;
    font-family: ${({ theme }) => theme.fontFamily};
    font-size: 14px;
    line-height: 20px;
    margin-top: 15px;
`;

const validate = values => ({
    password: !values.password
        ? tt('g.required')
        : PublicKey.fromString(values.password)
            ? tt('g.you_need_private_password_or_key_not_a_public_key')
            : null,
    confirmPassword: !values.confirmPassword
        ? tt('g.required')
        : values.confirmPassword.trim() !== values.newWif
            ? tt('g.passwords_do_not_match')
            : null,
    confirmCheck: !values.confirmCheck ? tt('g.required') : null,
    confirmSaved: !values.confirmSaved ? tt('g.required') : null,
});

@connect(
    null,
    // mapDispatchToProps
    dispatch => ({
        changePassword: (
            accountName,
            authType,
            priorAuthKey,
            password,
            twofa = false,
            success,
            error
        ) => {
            const ph = role => PrivateKey.fromSeed(`${accountName}${role}${newWif}`).toWif();
            const auths = authType
                ? [{ authType, oldAuth: priorAuthKey, newAuth: newWif }]
                : [
                      { authType: 'owner', oldAuth: password, newAuth: ph('owner', newWif) },
                      { authType: 'active', oldAuth: password, newAuth: ph('active', newWif) },
                      { authType: 'posting', oldAuth: password, newAuth: ph('posting', newWif) },
                      { authType: 'memo', oldAuth: password, newAuth: ph('memo', newWif) },
                  ];
            dispatch(
                transaction.actions.updateAuthorities({
                    twofa,
                    // signingKey provides the password if it was not provided in auths
                    signingKey: authType ? password : null,
                    accountName,
                    auths,
                    onSuccess: success,
                    onError: error,
                    // notifySuccess: 'Change password success'
                })
            );
        },
        notify: message => {
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: {
                    key: 'chpwd_' + Date.now(),
                    message,
                    dismissAfter: 5000,
                },
            });
        },
    })
)
export default class New extends PureComponent {
    static propTypes = {
        account: PropTypes.object.isRequired,
        options: PropTypes.object,
        isChanging: PropTypes.bool,
        onSubmitBlockchain: PropTypes.func,
    };

    render() {
        const { account, isChanging, onSubmitBlockchain } = this.props;
        const data = {
            username: account.get('name'), // for disabled input, omitting from submit data
            newWif: 'P' + key_utils.get_random_key().toWif(),
        };

        return (
            <Form onSubmit={onSubmitBlockchain} initialValues={data} validate={validate}>
                {({
                    handleSubmit,
                    submitError,
                    form,
                    submitting,
                    pristine,
                    validating,
                    values,
                }) => (
                    <form onSubmit={handleSubmit}>
                        <CardContent column>
                            <RulesBlock
                                style={{
                                    border: '1px solid #2879FF',
                                    borderRadius: '6px',
                                    padding: '18px',
                                }}
                            >
                                <Ol>
                                    {[
                                        'one',
                                        'second',
                                        'third',
                                        'fourth',
                                        'fifth',
                                        'sixth',
                                        'seventh',
                                    ].map(value => (
                                        <Li
                                            key={value}
                                            dangerouslySetInnerHTML={{
                                                __html: tt(`g.the_rules_of_APP_NAME.${value}`),
                                            }}
                                        />
                                    ))}
                                </Ol>
                            </RulesBlock>

                            <Field name="username">
                                {({ input, meta }) => (
                                    <FormGroup>
                                        <Label dark>{tt('g.account_name')}</Label>
                                        <Input {...input} type="text" autoComplete="off" disabled />
                                        <FormError meta={meta} />
                                    </FormGroup>
                                )}
                            </Field>

                            <Field name="password">
                                {({ input, meta }) => (
                                    <FormGroup>
                                        <Label dark>{tt('g.current_password')}</Label>
                                        <Input
                                            {...input}
                                            type="password"
                                            autoComplete="off"
                                            disabled={submitting}
                                        />
                                        <FormError meta={meta} />
                                    </FormGroup>
                                )}
                            </Field>

                            <Field name="newWif">
                                {({ input, meta }) => (
                                    <FormGroup>
                                        <Label dark>{tt('g.generated_password')}</Label>
                                        <Input
                                            {...input}
                                            type="text"
                                            autoComplete="off"
                                            disabled={submitting}
                                        />
                                        <FormError meta={meta} />
                                        <Hint>{tt('g.backup_password_by_storing_it')}</Hint>
                                    </FormGroup>
                                )}
                            </Field>

                            <Field name="confirmPassword">
                                {({ input, meta }) => (
                                    <FormGroup>
                                        <Label dark>{tt('g.re_enter_generate_password')}</Label>
                                        <Input
                                            {...input}
                                            type="text"
                                            autoComplete="off"
                                            disabled={submitting}
                                        />
                                        <FormError meta={meta} />
                                    </FormGroup>
                                )}
                            </Field>

                            <Field name="confirmCheck">
                                {({ input, meta }) => (
                                    <FormGroup align="center" column={false}>
                                        <Checkbox {...input} />
                                        <LabelRow>
                                            {tt(
                                                'g.understand_that_APP_NAME_cannot_recover_password',
                                                { APP_NAME: 'GOLOS.io' }
                                            )}
                                        </LabelRow>
                                        <FormError meta={meta} />
                                    </FormGroup>
                                )}
                            </Field>

                            <Field name="confirmSave">
                                {({ input, meta }) => (
                                    <FormGroup align="center" column={false}>
                                        <Checkbox {...input} />
                                        <LabelRow>{tt('g.i_saved_password')}</LabelRow>
                                        <FormError meta={meta} />
                                    </FormGroup>
                                )}
                            </Field>

                            {submitError && <div>{submitError}</div>}
                        </CardContent>
                        <DialogFooter>
                            <DialogButton
                                onClick={form.reset}
                                disabled={submitting || pristine}
                            >
                                {tt('settings_jsx.reset')}
                            </DialogButton>
                            <DialogButton
                                type="submit"
                                primary
                                disabled={submitting || pristine || !validating}
                            >
                                {tt('settings_jsx.update')}
                            </DialogButton>
                        </DialogFooter>
                    </form>
                )}
            </Form>
        );
    }
}
