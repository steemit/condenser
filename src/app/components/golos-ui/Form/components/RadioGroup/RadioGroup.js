import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';

import Icon from 'golos-ui/Icon';
// import HintIcon from 'app/components/elements/common/HintIcon/HintIcon';

const Wrapper = styled.div``;

const Item = styled.div`
    display: flex;
    align-items: center;
`;

const Label = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    margin: 9px 0;
    flex-grow: 1;
    text-transform: none;
    user-select: none;
    cursor: pointer;

    ${is('disabled')`
        cursor: default;
    `};
`;

const LabelText = styled.span`
    line-height: 1px;
    margin-left: 15px;
    font-size: 14px;

    ${is('light')`
        color: #959595;
    `}

    ${is('disabled')`
        color: #9c9c9c;
    `};
`;

const Input = styled.input`
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    opacity: 0;
    cursor: pointer;
    overflow: hidden;
`;

const IconWrapper = styled.i`
    display: inline-block;
    width: 20px;
    height: 20px;
    color: #d8d8d9;

    ${is('value')`
        color: #0078C4;
    `};

    ${is('disabled')`
        color: #d0d0d0;
    `};
`;

// const Hint = styled.div`
//     flex-shrink: 0;
// `;

export default class RadioGroup extends PureComponent {
    static propTypes = {
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        options: PropTypes.array.isRequired,
        disabled: PropTypes.bool,
        name: PropTypes.string,
        onChange: PropTypes.func.isRequired,

        light: PropTypes.bool,
    };

    render() {
        const { value, options, disabled, name, onChange, light } = this.props;

        return (
            <Wrapper>
                {options.map(item => (
                    <Item key={item.id}>
                        <Label onClick={!disabled ? () => onChange(item.id) : null}>
                            <Input
                                type="radio"
                                name={name}
                                disabled={disabled}
                                checked={item.id === value}
                                onChange={noop}
                            />
                            <IconWrapper value={item.id === value} disabled={disabled}>
                                {item.id === value ? (
                                    <Icon name="radio-on" size="20" />
                                ) : (
                                    <Icon name="radio-off" size="20" />
                                )}
                            </IconWrapper>
                            <LabelText light={light}>{item.title}</LabelText>
                        </Label>
                        {/* {item.hint && (
                            <Hint>
                                <HintIcon hint={item.hint} />
                            </Hint>
                        )} */}
                    </Item>
                ))}
            </Wrapper>
        );
    }
}

function noop() {}
