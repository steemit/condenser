import React, { PropTypes } from "react";
import { formatDecimal } from 'app/utils/ParsersAndFormatters';

export default class FormattedPrice extends React.Component {

    static propTypes = {
        base_asset: PropTypes.any.isRequired,
        quote_asset: PropTypes.any.isRequired,
        base_amount: PropTypes.any,
        quote_amount: PropTypes.any,
        decimals: PropTypes.number
    };

    constructor(props) {
        super(props);
    }

    render() {
        const { base_asset, quote_asset, base_amount, quote_amount } = this.props;

        return (
            <span>{base_amount}</span>
        );
    }
}
