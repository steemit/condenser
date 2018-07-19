import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Form, Field } from 'react-final-form';
import tt from 'counterpart';

import { USER_GENDER } from 'app/client_config';

import Icon from 'golos-ui/Icon';
import { DialogFooter, DialogButton } from 'golos-ui/Dialog';
import Card, { CardTitle as StyledCardTitle, CardRow, CardColumn } from 'golos-ui/Card';
import {
    FormGroup,
    FormGroupRow,
    Label,
    LabelRow as StyledLabelRow,
    Input,
    Select,
    Textarea,
} from 'golos-ui/Form';

const CardTitle = styled(StyledCardTitle)`
    padding: 0 40px;

    @media (max-width: 576px) {
        padding: 0 16px;
    }
`;

const CardContent = styled.div`
    padding: 40px;

    @media (max-width: 576px) {
        padding: 37px 16px;
    }
`;

const LabelRow = styled(StyledLabelRow)`
    flex-basis: 28px;
    color: #393636;
`;
LabelRow.displayName = 'LabelRow';

// import R from 'ramda';
// const isGreaterThan = R.curry((len, a) => (a > len))
// const isLengthGreaterThan = len => R.compose(isGreaterThan(len), R.prop('length'))

const composeValidators = (...validators) => value =>
    validators.reduce((error, validator) => error || (value && validator(value)), undefined);

const isLengthGreaterThan = (min, err) => value => (value.length > min ? err : undefined);
const isStartWithAt = err => value => (/^\s*@/.test(value) ? err : undefined);
const isNotUrl = err => value => (!/^https?:\/\//.test(value) ? err : undefined);
const composedUrlValidator = value =>
    composeValidators(
        isLengthGreaterThan(100, tt('settings_jsx.website_url_is_too_long')),
        isNotUrl(tt('settings_jsx.invalid_url'))
    )(value);

const required = value => (value ? undefined : 'Required');
const mustBeNumber = value => (isNaN(value) ? 'Must be a number' : undefined);
const minValue = min => value =>
    isNaN(value) || value >= min ? undefined : `Should be greater than ${min}`;

const Error = ({ meta: { touched, error, submitError } }) =>
    touched && (error || submitError) ? <span>{error || submitError}</span> : null;

const validate = values => ({
    name: composeValidators(
        isLengthGreaterThan(20, tt('settings_jsx.name_is_too_long')),
        isStartWithAt(tt('settings_jsx.name_must_not_begin_with'))
    )(values.name),
    about: isLengthGreaterThan(160, tt('settings_jsx.about_is_too_long')),
    location: isLengthGreaterThan(160, tt('settings_jsx.location_is_too_long')),
    website: composedUrlValidator(values.website),
    social: {
        facebook: composedUrlValidator(values.social ? values.social.facebook : false),
        vkontakte: composedUrlValidator(values.social ? values.social.vkontakte : false),
        instagram: composedUrlValidator(values.social ? values.social.instagram : false),
        twitter: composedUrlValidator(values.social ? values.social.twitter : false),
    },
});

export default class SettingsShow extends PureComponent {
    static propTypes = {
        profile: PropTypes.object,
        onSubmit: PropTypes.func,
    };

    renderCommonSettings() {
        return (
            <Fragment>
                <FormGroup>
                    <Label>{tt('settings_jsx.choose_language')}</Label>
                    <Select>
                        <option>Русский</option>
                    </Select>
                </FormGroup>
                <FormGroup>
                    <Label>{tt('settings_jsx.choose_currency')}</Label>
                    <Select>
                        <option>USD</option>
                    </Select>
                </FormGroup>
                <FormGroup>
                    <Label>{tt('settings_jsx.rounding_numbers.info_message')}</Label>
                    <Select>
                        <option>Два знака после запятой</option>
                    </Select>
                </FormGroup>
                <FormGroup>
                    <Label>{tt('settings_jsx.choose_theme')}</Label>
                    <Select>
                        <option>Стандартная</option>
                    </Select>
                </FormGroup>
                <FormGroup>
                    <Label>{tt('settings_jsx.not_safe_for_work_nsfw_content')}</Label>
                    <Select>
                        <option>Всегда предупреждать</option>
                    </Select>
                </FormGroup>
            </Fragment>
        );
    }

    renderPrivateSettings() {
        const { profile, onSubmit } = this.props;

        return (
            <Form onSubmit={onSubmit} initialValues={profile} validate={validate}>
                {({ handleSubmit, submitError, form, submitting, pristine, values }) => (
                    <form onSubmit={handleSubmit}>
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
                                    <Error meta={meta} />
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
                                    <Error meta={meta} />
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
                                    <Error meta={meta} />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="location">
                            {({ input, meta }) => (
                                <FormGroup>
                                    <Label>{tt('settings_jsx.profile_location')}</Label>
                                    <Input
                                        {...input}
                                        type="text"
                                        placeholder="Укажите свой город"
                                    />
                                    <Error meta={meta} />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="website">
                            {({ input, meta }) => (
                                <FormGroup>
                                    <Label>{tt('settings_jsx.profile_website')}</Label>
                                    <Input {...input} type="text" placeholder="Ссылка на сайт" />
                                    <Error meta={meta} />
                                </FormGroup>
                            )}
                        </Field>
                        <FormGroup>
                            <Label>Социальные сети</Label>
                            <Field name="social.facebook">
                                {({ input, meta }) => (
                                    <FormGroupRow>
                                        <LabelRow>
                                            <Icon name="facebook" width="13" height="24" />
                                        </LabelRow>
                                        <Input
                                            {...input}
                                            type="text"
                                            placeholder="Ссылка на Facebook"
                                        />
                                        <Error meta={meta} />
                                    </FormGroupRow>
                                )}
                            </Field>
                            <Field name="social.vkontakte">
                                {({ input, meta }) => (
                                    <FormGroupRow>
                                        <LabelRow>
                                            <Icon name="vk" width="28" height="18" />
                                        </LabelRow>
                                        <Input
                                            {...input}
                                            type="text"
                                            placeholder="Ссылка на Вконтакте"
                                        />
                                        <Error meta={meta} />
                                    </FormGroupRow>
                                )}
                            </Field>
                            <Field name="social.instagram">
                                {({ input, meta }) => (
                                    <FormGroupRow>
                                        <LabelRow>
                                            <Icon name="instagram" size="23" />
                                        </LabelRow>
                                        <Input
                                            {...input}
                                            type="text"
                                            placeholder="Ссылка на Instagran"
                                        />
                                        <Error meta={meta} />
                                    </FormGroupRow>
                                )}
                            </Field>
                            <Field name="social.twitter">
                                {({ input, meta }) => (
                                    <FormGroupRow>
                                        <LabelRow>
                                            <Icon name="twitter" width="26" height="22" />
                                        </LabelRow>
                                        <Input
                                            {...input}
                                            type="text"
                                            placeholder="Ссылка на Twitter"
                                        />
                                        <Error meta={meta} />
                                    </FormGroupRow>
                                )}
                            </Field>
                        </FormGroup>

                        {submitError && <div>{submitError}</div>}

                        <div className="buttons">
                            <button type="submit" disabled={submitting}>
                                Submit
                            </button>
                            <button
                                type="button"
                                onClick={form.reset}
                                disabled={submitting || pristine}
                            >
                                Reset
                            </button>
                        </div>
                        <pre>{JSON.stringify(values, 0, 2)}</pre>
                    </form>
                )}
            </Form>
        );
    }

    render() {
        return (
            <Card transparent style={{ flexBasis: '739px' }}>
                <CardRow>
                    <CardColumn>
                        <CardTitle>Общие настройки</CardTitle>
                        <CardContent>{this.renderCommonSettings()}</CardContent>
                    </CardColumn>
                    <CardColumn>
                        <CardTitle>Личная информация</CardTitle>
                        <CardContent>{this.renderPrivateSettings()}</CardContent>
                    </CardColumn>
                </CardRow>
                <DialogFooter>
                    <DialogButton>{tt('settings_jsx.reset')}</DialogButton>
                    <DialogButton primary>{tt('settings_jsx.update')}</DialogButton>
                </DialogFooter>
            </Card>
        );
    }
}
