import React from 'react';
import {connect} from 'react-redux';

class YotifiCounter extends React.Component {
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
    (state) => {
        const value = state.notification.unshown.toArray().length
        return {value};
    }
)(YotifiCounter);
