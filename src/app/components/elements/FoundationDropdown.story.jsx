import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import FoundationDropdown from './FoundationDropdown';
import { Center } from '../../../../.storybook/decorators';

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .addDecorator(Center)
    .add('FoundationDropdown', () => (
        <div>
            <h3> Use the Knob to toggle the Foundation Dropdown </h3>
            <FoundationDropdown
                show={boolean('Is Open?', false)}
                onHide={() =>
                    alert(
                        'You clicked someplace that triggered the onHide prop.'
                    )
                }
            >
                <div className="Voting__adjust_weight">
                    <h3> Cool Stuff </h3>
                    <p> Has a handler to detect outside clicks...</p>
                </div>
            </FoundationDropdown>
        </div>
    ));
