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
    LabelRow as StyledLabelRow,
    Input,
    Select,
    Textarea,
    Error,
} from 'golos-ui/Form';
import Icon from 'golos-ui/Icon';

const LabelIcon = styled(StyledLabelRow)`
    flex-basis: 28px;
    color: #393636;
`;

const LabelRow = styled(StyledLabelRow)``;

const UserName = styled.div`
    color: #363636;
`;

const Account = ({ profile, account, onSubmit }) => {
  profile.username = account.name; // for disabled input, omitting from submit data

  return (
      <Form onSubmit={onSubmit} initialValues={profile}>
          {({ handleSubmit, submitError, form, submitting, pristine, values }) => (
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
                      <Field name="email">
                          {({ input, meta }) => (
                              <FormGroup>
                                  <Label>{tt('settings_jsx.profile_email')}</Label>
                                  <Input
                                      {...input}
                                      autocomplete="email"
                                      type="text"
                                  />
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
                                      <LabelIcon>
                                          <Icon name="facebook" width="13" height="24" />
                                      </LabelIcon>
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
                                      <LabelIcon>
                                          <Icon name="vk" width="28" height="18" />
                                      </LabelIcon>
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
                                      <LabelIcon>
                                          <Icon name="instagram" size="23" />
                                      </LabelIcon>
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
                                      <LabelIcon>
                                          <Icon name="twitter" width="26" height="22" />
                                      </LabelIcon>
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

export default Account;