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
        return {
            value: state.app.getIn(['notificounters', props.name]),
        };
    }
)(NotifiCounter);
