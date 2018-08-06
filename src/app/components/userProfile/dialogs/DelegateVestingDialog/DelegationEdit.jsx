import React, { PureComponent } from 'react';
import styled from 'styled-components';
import Icon from 'src/app/components/golos-ui/Icon';
import Slider from 'src/app/components/golos-ui/Slider';
import ComplexInput from 'src/app/components/golos-ui/ComplexInput';
import { parseAmount2 } from 'src/app/helpers/currency';

const Root = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    overflow: hidden;
    animation: fade-in 0.3s;
    z-index: 1;
`;

const Overlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
`;

const EditBlock = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 13px 30px;
    background: #fff;
`;

const Field = styled.div`
    margin: 8px 0;
`;

const Footer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 0;
`;

const Button = styled.button.attrs({ type: 'button' })`
    display: inline-flex;
    align-items: center;
    margin: 0 16px;
    font-size: 13px;
    color: #aaa;
    transition: color 0.15s;
    cursor: pointer;

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
    height: 14px;
    background: #bbb;
`;

export default class DelegationEdit extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            inputValue: (props.value / 1000).toFixed(3),
        };
    }

    render() {
        const { max } = this.props;
        const { inputValue } = this.state;

        const { value, error } = parseAmount2(inputValue, max, false, 1000);

        const isError = Boolean(error);

        return (
            <Root>
                <Overlay onClick={this._onDelegationOverlayClick} />
                <EditBlock>
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
                            max={max}
                            hideHandleValue
                            onChange={this._onDelegationSliderChange}
                        />
                    </Field>
                    <Footer>
                        <Button
                            disabled={isError}
                        >
                            Сохранить
                            <DelegationEditButtonIcon name="check" right={1} size={16} />
                        </Button>
                        <DelegationEditSplitter />
                        <Button onClick={this._onDelegationEditCancel}>
                            <DelegationEditButtonIcon name="cross" size={13} />
                            Отмена
                        </Button>
                    </Footer>
                </EditBlock>
            </Root>
        );
    }

    _onDelegationSliderChange = value => {
        this.setState({
            inputValue: (value / 1000).toFixed(3),
        });
    };

    _onDelegationOverlayClick = () => {
        this._onDelegationEditCancel();
    };

    _onDelegationEditCancel = () => {
        this.setState({
            editAccountName: null,
        });
    };

    _onValueChange = e => {
        this.setState({
            inputValue: e.target.value.replace(/[^\d .]+/g, '').replace(/,/g, '.'),
        });
    };
}
