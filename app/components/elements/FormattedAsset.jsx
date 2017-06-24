import React, { PropTypes } from 'react';
import { formatDecimal } from 'app/utils/ParsersAndFormatters';
import utils from 'app/utils/Assets/utils';

export default class FormattedAsset extends React.Component {
    static propTypes = {
        amount: PropTypes.any.isRequired,
        asset: PropTypes.any.isRequired
    };

    static defaultProps = {
        amount: 0,
    };

    constructor(props) {
        super(props);
    }

    render() {
        let {amount, asset} = this.props;
        if( asset && asset.toJS ) asset = asset.toJS();

        const precision = utils.get_asset_precision(asset.precision);

        return (
            <span>{formatDecimal(this.props.exact_amount ? amount : amount / precision)}</span>
        );
    }
}

