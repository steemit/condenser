import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getPayout } from 'src/app/helpers/currency';

class PostPayout extends PureComponent {
    render() {
        const { data } = this.props;

        return getPayout(data);
    }
}

export default connect(state => ({
    rates: state.data.rates,
}))(PostPayout);
