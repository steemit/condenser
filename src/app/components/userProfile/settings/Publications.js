import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Form, Field } from 'react-final-form';
import tt from 'counterpart';

import { CardContent } from 'golos-ui/Card';
import { DialogFooter, DialogButton } from 'golos-ui/Dialog';
import {
    FormGroup,
    Label,
    Error,
    RadioGroup,
    Switcher,
} from 'golos-ui/Form';

const Publications = ({ profile, onSubmit }) => {
  return (
      <Form onSubmit={onSubmit} initialValues={profile}>
          {({ handleSubmit, submitError, form, submitting, pristine, values }) => (
              <form onSubmit={handleSubmit}>
                  <CardContent column>
                      <Field name="nsfw">
                          {({ input, meta }) => (
                              <FormGroup>
                                  <Label bold>
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
                                  <Label bold>Награда по умолчанию за пост</Label>
                                  <RadioGroup
                                      options={[
                                          { id: 'full', title: 'Оплата 100%' },
                                          { id: 'half', title: 'Оплата 50%50' },
                                          { id: 'reject', title: 'Отказ от выплат' },
                                      ]}
                                      {...input}
                                      light
                                  />
                                  <Error meta={meta} />
                              </FormGroup>
                          )}
                      </Field>
                      <Field name="selfVote">
                          {({ input, meta }) => (
                              <FormGroup justify="space-between" column={false}>
                                  <Label bold>Голосовать по умолчанию за свою публикацию</Label>
                                  <Switcher {...input} />
                                  <Error meta={meta} />
                              </FormGroup>
                          )}
                      </Field>
                      <Field name="rounding">
                          {({ input, meta }) => (
                              <FormGroup>
                                  <Label bold>
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

export default Publications;