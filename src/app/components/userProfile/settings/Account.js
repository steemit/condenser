import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Form, Field } from 'react-final-form';
import tt from 'counterpart';

import { USER_GENDER } from 'app/client_config';

import { CardContent } from 'golos-ui/Card';
import { DialogFooter, DialogButton } from 'golos-ui/Dialog';
import {
    FormGroup,
    FormGroupRow,
    Label,
    LabelRow,
    Input,
    Select,
    Textarea,
    FormError,
} from 'golos-ui/Form';
import Icon from 'golos-ui/Icon';

const LabelIcon = styled(LabelRow)`
    flex-basis: 28px;
    color: #393636;
`;

const UserName = styled.div`
    color: #363636;
`;

const composeValidators = (...validators) => value =>
    validators.reduce((error, validator) => error || (value && validator(value)), undefined);

const isLengthGreaterThan = (min, err) => value => ((value && value.length > min) ? err : undefined);
const isStartWithAt = err => value => (/^\s*@/.test(value) ? err : undefined);
const isNotUrl = err => value => (!/^https?:\/\//.test(value) ? err : undefined);
const composedUrlValidator = value =>
    composeValidators(
        isLengthGreaterThan(100, tt('settings_jsx.website_url_is_too_long')),
        isNotUrl(tt('settings_jsx.invalid_url'))
    )(value);
const usernameValidation = (username, err) =>
    username && /^[a-zA-Z0-9\-\.]+$/.test(username) ? err : undefined;

const validate = values => ({
    name: composeValidators(
        isLengthGreaterThan(20, tt('settings_jsx.name_is_too_long')),
        isStartWithAt(tt('settings_jsx.name_must_not_begin_with'))
    )(values.name),
    about: isLengthGreaterThan(160, tt('settings_jsx.about_is_too_long'))(values.about),
    location: isLengthGreaterThan(160, tt('settings_jsx.location_is_too_long'))(values.location),
    website: composedUrlValidator(values.website),
    social: {
        facebook: usernameValidation(values.social ? values.social.facebook : false),
        vkontakte: usernameValidation(values.social ? values.social.vkontakte : false),
        instagram: usernameValidation(values.social ? values.social.instagram : false),
        twitter: usernameValidation(values.social ? values.social.twitter : false),
    },
});

const Account = ({ profile, account, onSubmitBlockchain }) => {
    profile.username = account.get('name'); // for disabled input, omitting from submit data

    return (
        <Form onSubmit={onSubmitBlockchain} initialValues={profile} validate={validate}>
            {({ handleSubmit, submitError, form, submitting, pristine, invalid, values }) => (
                <form onSubmit={handleSubmit}>
                    <CardContent column>
                        <Field name="username">
                            {({ input }) => (
                                <FormGroupRow justify="space-between">
                                    <LabelRow>{tt('settings_jsx.profile_username')}</LabelRow>
                                    <UserName>@{input.value}</UserName>
                                </FormGroupRow>
                            )}
                        </Field>
                        <Field name="name">
                            {({ input, meta }) => (
                                <FormGroup>
                                    <Label>{tt('settings_jsx.profile_name')}</Label>
                                    <Input
                                        {...input}
                                        autocomplete="name"
                                        type="text"
                                        placeholder="Имя Фамилия"
                                    />
                                    <FormError meta={meta} />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="gender">
                            {({ input, meta }) => (
                                <FormGroup>
                                    <Label>{tt('settings_jsx.profile_gender.title')}</Label>
                                    <Select {...input} placeholder="Выберите ваш пол">
                                        {USER_GENDER.map(i => {
                                            return (
                                                <option key={i} value={i}>
                                                    {tt('settings_jsx.profile_gender.genders.' + i)}
                                                </option>
                                            );
                                        })}
                                    </Select>
                                    <FormError meta={meta} />
                                </FormGroup>
                            )}
                        </Field>
                        {/* <Field name="email">
                          {({ input, meta }) => (
                              <FormGroup>
                                  <Label>{tt('settings_jsx.profile_email')}</Label>
                                  <Input
                                      {...input}
                                      autocomplete="email"
                                      type="text"
                                  />
                                  <FormError meta={meta} />
                              </FormGroup>
                          )}
                      </Field> */}
                        <Field name="location">
                            {({ input, meta }) => (
                                <FormGroup>
                                    <Label>{tt('settings_jsx.profile_location')}</Label>
                                    <Input
                                        {...input}
                                        type="text"
                                        placeholder="Укажите свой город"
                                    />
                                    <FormError meta={meta} />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="about">
                            {({ input, meta }) => (
                                <FormGroup>
                                    <Label>{tt('settings_jsx.profile_about')}</Label>
                                    <Textarea
                                        {...input}
                                        placeholder={
                                            'Чему училися\nГде и кем работаю\nМои проекты\nИнтересы\nСемья\nЖизненное кредо'
                                        }
                                        rows={6}
                                    />
                                    <FormError meta={meta} />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="website">
                            {({ input, meta }) => (
                                <FormGroup>
                                    <Label>{tt('settings_jsx.profile_website')}</Label>
                                    <Input {...input} type="text" placeholder="Ссылка на сайт" />
                                    <FormError meta={meta} />
                                </FormGroup>
                            )}
                        </Field>
                        <FormGroup>
                            <Label>Социальные сети</Label>
                            <Field name="social.facebook">
                                {({ input, meta }) => (
                                    <FormGroupRow>
                                        <LabelIcon>
                                            <Icon name="facebook" width="13" height="24" />
                                        </LabelIcon>
                                        <Input
                                            {...input}
                                            type="text"
                                            placeholder="Ссылка на Facebook"
                                        />
                                        <FormError meta={meta} />
                                    </FormGroupRow>
                                )}
                            </Field>
                            <Field name="social.vkontakte">
                                {({ input, meta }) => (
                                    <FormGroupRow>
                                        <LabelIcon>
                                            <Icon name="vk" width="28" height="18" />
                                        </LabelIcon>
                                        <Input
                                            {...input}
                                            type="text"
                                            placeholder="Ссылка на Вконтакте"
                                        />
                                        <FormError meta={meta} />
                                    </FormGroupRow>
                                )}
                            </Field>
                            <Field name="social.instagram">
                                {({ input, meta }) => (
                                    <FormGroupRow>
                                        <LabelIcon>
                                            <Icon name="instagram" size="23" />
                                        </LabelIcon>
                                        <Input
                                            {...input}
                                            type="text"
                                            placeholder="Ссылка на Instagran"
                                        />
                                        <FormError meta={meta} />
                                    </FormGroupRow>
                                )}
                            </Field>
                            <Field name="social.twitter">
                                {({ input, meta }) => (
                                    <FormGroupRow>
                                        <LabelIcon>
                                            <Icon name="twitter" width="26" height="22" />
                                        </LabelIcon>
                                        <Input
                                            {...input}
                                            type="text"
                                            placeholder="Ссылка на Twitter"
                                        />
                                        <FormError meta={meta} />
                                    </FormGroupRow>
                                )}
                            </Field>
                        </FormGroup>
                        {/* <pre>{JSON.stringify(values, 0, 2)}</pre> */}

                        {submitError && <div>{submitError}</div>}
                    </CardContent>
                    <DialogFooter>
                        <DialogButton onClick={form.reset} disabled={submitting || pristine}>
                            {tt('settings_jsx.reset')}
                        </DialogButton>
                        <DialogButton
                            type="submit"
                            primary
                            disabled={submitting || pristine || invalid}
                        >
                            {tt('settings_jsx.update')}
                        </DialogButton>
                    </DialogFooter>
                </form>
            )}
        </Form>
    );
};

export default Account;
