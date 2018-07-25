import React from 'react';
import { storiesOf } from '@storybook/react';
import styled from "styled-components"

import Icon from './Icon';

const files = require.context('!svg-sprite-loader!./assets', false, /.*\.svg$/);
files.keys().forEach(files);

const names = files.keys().map(file => file.match(/\/(.*)\.svg$/)[1]);


const Wrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 80%;
`

const Item = styled.div`
    display: flex;
    flex-direction: column;
    flex-basis: 100px;
    align-items: center;
    margin: 10px;
`

storiesOf('Golos UI/Icon', module).add('default', () => (
    <Wrapper>
        {names.map(name => (
            <Item>
                <Icon name={name} />
                <div>{name}</div>
            </Item>
        ))}
    </Wrapper>
));
