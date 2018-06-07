import React from 'react';
import PropTypes from 'prop-types'
import {connect} from 'react-redux';

class NotifiCounter extends React.Component {
    static propTypes = {
        value: PropTypes.number
    };

    render() {
        const value = this.props.value;
        if (!value) return null;
        return <div className="NotifiCounter">{value}</div>;
    }
}

export default connect(
    (state, props) => {
        const counters = state.app.get('notificounters');
        const fields = props.fields.replace(/\s/g,'').split(',');
        const value = counters ? fields.reduce((res, field) => res + counters.get(field), 0) : null;
        return {value};
    }
)(NotifiCounter);
