import React from 'react';
import {connect} from 'react-redux';

class NotifiCounter extends React.Component {
    static propTypes = {
        value: React.PropTypes.number
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
        const value = fields.reduce((res, field) => res + counters.get(field), 0);
        return {value};
    }
)(NotifiCounter);
