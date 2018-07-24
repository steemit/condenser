import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Form, Field } from 'react-final-form';
import tt from 'counterpart';

import { USER_GENDER } from 'app/client_config';

import { CardContent } from 'golos-ui/Card';
import { DialogFooter, DialogButton } from 'golos-ui/Dialog';
import {
    FormGroup,
    Label,
    Select,
} from 'golos-ui/Form';

const Common = () => {
  return (
      <Fragment>
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
              <FormGroup>
                  <Label>{tt('settings_jsx.rounding_numbers.info_message')}</Label>
                  <Select>
                      <option>Два знака после запятой</option>
                  </Select>
              </FormGroup>
              <FormGroup>
                  <Label>{tt('settings_jsx.not_safe_for_work_nsfw_content')}</Label>
                  <Select>
                      <option>Всегда предупреждать</option>
                  </Select>
              </FormGroup>
          </CardContent>
          <DialogFooter>
              <DialogButton>{tt('settings_jsx.reset')}</DialogButton>
              <DialogButton primary>{tt('settings_jsx.update')}</DialogButton>
          </DialogFooter>
      </Fragment>
  );
};

export default Common;