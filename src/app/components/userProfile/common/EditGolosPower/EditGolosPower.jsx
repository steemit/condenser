import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';
import Icon from 'src/app/components/golos-ui/Icon';
import Slider from 'src/app/components/golos-ui/Slider';
import ComplexInput from 'src/app/components/golos-ui/ComplexInput';
import { parseAmount2 } from 'src/app/helpers/currency';

const Root = styled.div`
    background: #fff;
`;

const Field = styled.div`
    margin: 8px 0;
`;

const Footer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Button = styled.button.attrs({ type: 'button' })`
    display: inline-flex;
    align-items: center;
    flex-basis: 140px;
    padding: 4px 0;
    margin: 0 16px;
    font-size: 13px;
    color: #aaa;
    transition: color 0.15s;
    cursor: pointer;
    outline: none;

    ${is('right')`
        justify-content: flex-end;
    `};

    &:hover {
        color: #333;
    }

    &[disabled] {
        color: #aaa;
        cursor: not-allowed;
    }
`;

const DelegationEditButtonIcon = Icon.extend`
    margin-${props => (props.right ? 'left' : 'right')}: 10px;
`;

const DelegationEditSplitter = styled.div`
    width: 1px;
    height: 16px;
    background: #bbb;
`;

export default class EditGolosPower extends PureComponent {
    static propTypes = {
        value: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        onSave: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    state = {
        inputValue: (this.props.value / 1000).toFixed(3),
    };

    render() {
        const { max } = this.props;
        const { inputValue } = this.state;

        const { value, error } = parseAmount2(inputValue, max, false, 1000);

        const isError = Boolean(error);

        return (
            <Root>
                <Field>
                    <ComplexInput
                        placeholder={`Доступно ${max.toFixed(3)}`}
                        spellCheck="false"
                        autoFocus
                        error={isError ? 1 : 0}
                        value={inputValue}
                        activeId="power"
                        buttons={[{ id: 'power', title: 'СГ' }]}
                        onChange={this._onValueChange}
                    />
                </Field>
                <Field>
                    <Slider
                        value={value || 0}
                        min={10}
                        max={max}
                        hideHandleValue
                        onChange={this._onDelegationSliderChange}
                    />
                </Field>
                <Footer>
                    <Button
                        disabled={isError}
                        right={1}
                        onClick={isError ? null : this._onSaveClick}
                    >
                        Сохранить
                        <DelegationEditButtonIcon name="check" right={1} size={16} />
                    </Button>
                    <DelegationEditSplitter />
                    <Button onClick={this.props.onCancel}>
                        <DelegationEditButtonIcon name="cross" size={13} />
                        Отмена
                    </Button>
                </Footer>
            </Root>
        );
    }

    _onDelegationSliderChange = value => {
        this.setState({
            inputValue: (value / 1000).toFixed(3),
        });
    };

    _onValueChange = e => {
        this.setState({
            inputValue: e.target.value.replace(/[^\d .]+/g, '').replace(/,/g, '.'),
        });
    };

    _onSaveClick = () => {
        const { max } = this.props;
        const { inputValue } = this.state;

        const { value, error } = parseAmount2(inputValue, max, false, 1000);

        if (!error) {
            this.props.onSave(value);
        }
    };
}
