import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number } from '@storybook/addon-knobs';
import SvgImage from './SvgImage';
import { Grid } from './Icon.story';

const svgs = ['404', 'facebook', 'reddit', 'steemit'];

const options = {
    range: true,
    min: 10,
    max: 200,
    step: 1,
};

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .add('SvgImage', () => (
        <Grid>
            {svgs.map(svg => (
                <div key={svg}>
                    <SvgImage
                        name={svg}
                        width={String(number('width', 100, options)) + 'px'}
                        height={String(number('height', 100, options)) + 'px'}
                    />
                    <p> {svg} </p>
                </div>
            ))}
        </Grid>
    ));
