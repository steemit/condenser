import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Form, Field } from 'react-final-form';
import tt from 'counterpart';

import Slider from 'golos-ui/Slider';
import { CardContent } from 'golos-ui/Card';
import { DialogFooter, DialogButton } from 'golos-ui/Dialog';
import {
    FormGroup,
    Label,
    LabelRow as StyledLabelRow,
    Select,
    RadioGroup,
    Checkbox,
    Error,
} from 'golos-ui/Form';

const LabelRow = styled(StyledLabelRow)`
    margin-left: 14px;
`;

const Common = ({ profile, onSubmitGate }) => {
    return (
        <Form onSubmit={onSubmitGate} initialValues={profile}>
            {({ handleSubmit, submitError, form, submitting, pristine, values }) => (
                <form onSubmit={handleSubmit}>
                    <CardContent column>
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
                        <Field name="nsfw">
                            {({ input, meta }) => (
                                <FormGroup>
                                    <Label dark bold>
                                        {tt('settings_jsx.not_safe_for_work_nsfw_content')}
                                    </Label>
                                    <RadioGroup
                                        options={[
                                            { id: 'hide', title: tt('settings_jsx.always_hide') },
                                            { id: 'warn', title: tt('settings_jsx.always_warn') },
                                            { id: 'show', title: tt('settings_jsx.always_show') },
                                        ]}
                                        {...input}
                                        light
                                    />
                                    <Error meta={meta} />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="award">
                            {({ input, meta }) => (
                                <FormGroup>
                                    <Label dark>Награда по умолчанию за пост</Label>
                                    <Slider {...input} showCaptions />
                                    <Error meta={meta} />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="selfVote">
                            {({ input, meta }) => (
                                <FormGroup align="center" column={false}>
                                    <Checkbox {...input} />
                                    <LabelRow>Голосовать по умолчанию за свою публикацию</LabelRow>
                                    <Error meta={meta} />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="rounding">
                            {({ input, meta }) => (
                                <FormGroup>
                                    <Label dark bold>
                                        {tt('settings_jsx.rounding_numbers.info_message')}
                                    </Label>
                                    <RadioGroup
                                        options={[
                                            {
                                                id: '0',
                                                title: tt('settings_jsx.rounding_numbers.integer'),
                                            },
                                            {
                                                id: '1',
                                                title: tt(
                                                    'settings_jsx.rounding_numbers.one_decimal'
                                                ),
                                            },
                                            {
                                                id: '2',
                                                title: tt(
                                                    'settings_jsx.rounding_numbers.two_decimal'
                                                ),
                                            },
                                            {
                                                id: '3',
                                                title: tt(
                                                    'settings_jsx.rounding_numbers.three_decimal'
                                                ),
                                            },
                                        ]}
                                        {...input}
                                        light
                                    />
                                    <Error meta={meta} />
                                </FormGroup>
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

export default Common;
