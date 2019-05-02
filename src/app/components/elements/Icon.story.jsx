import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import Icon from './Icon';
import { icons } from './Icon';

const styles = {
    textAlign: 'center',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: 'minmax(80px, auto)',
};

export const Grid = ({ children }) => <div style={styles}>{children}</div>;

const options = ['1x', '1_5x', '2x', '3x', '4x', '5x', '10x'];

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .add('Icon', () => (
        <Grid>
            {icons.map(icon => (
                <div key={'icon_' + icon}>
                    <Icon name={icon} size={select('size', options, '2x')} />
                    <p> {icon} </p>
                </div>
            ))}
        </Grid>
    ));
