import React, { PropTypes } from "react";
import { formatDecimal } from 'app/utils/ParsersAndFormatters';

export default class AmountSelector extends React.Component {

    static propTypes = {
        label: PropTypes.string.isRequired,
        labelPosition : PropTypes.oneOf(['top', 'left']),
        amount: PropTypes.any,
        asset: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        tabIndex: PropTypes.number
    };

    static defaultProps = {
        labelPosition: 'top',
        disabled: false
    };

    _onChange(event) {
        let amount = event.target.value;
        this.props.onChange({amount: amount, asset: this.props.asset});
    }

    render() {
        //FIXME
        // const value = formatDecimal(this.props.amount)[0] //.join('');
        const value = this.props.amount
        const inputGroup = (
            <div className="input-group">
                <input
                    className="input-group-field"
                    disabled={this.props.disabled}
                    type="text"
                    value={value || ""}
                    placeholder={this.props.placeholder}
                    onChange={this._onChange.bind(this)}
                    tabIndex={this.props.tabIndex}
                />
                <span className="input-group-label uppercase">{this.props.asset}</span>
            </div>
        );

        const labelTop = (
            <div>
                <div className="row">
                    <div className="column small-12">
                        <label>{this.props.label}</label>
                    </div>
                </div>
                <div className="row">
                    <div className="column small-12">
                        {inputGroup}
                    </div>
                </div>
            </div>
        );

        const labelLeft = (
            <div className="row">
                <div className="column small-3 large-2">
                    <label>{this.props.label}</label>
                </div>
                <div className="column small-9 large-8">
                    {inputGroup}
                </div>
            </div>
        );

        return (
            <div className="row">
                <div className="column small-12">
                    {this.props.labelPosition === 'top' ? labelTop : labelLeft}
                </div>
            </div>
        );
    }
}