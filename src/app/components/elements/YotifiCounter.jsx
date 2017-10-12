import React from 'react';
import {connect} from 'react-redux';

class YotifiCounter extends React.Component {

    render() {
        const value = this.props.value;
        if (!value) return null;
        return <div className="NotifiCounter">{value}</div>;
    }
}

YotifiCounter.propTypes = {
    value: React.PropTypes.number
}


YotifiCounter.defaultProps = {
    value: 0
}

export default connect(
    (state) => {
        const value = state.notification.unshown.toArray().length
        return {value};
    }
)(YotifiCounter);
