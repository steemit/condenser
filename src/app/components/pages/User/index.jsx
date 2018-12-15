import React, { Component } from 'react';
import PropTypes from 'prop-types';

class User extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // loading: true,
        };
    }

    componentDidMount() {
        // console.log(this.getParams('id'));
    }

    getParams(key) {
        const { match: { params } } = this.props;
        return params[key];
    }

    render() {
        return (
            <div className="UserWrapper">
                <div className="Title">{`User (${this.getParams('id')})`}</div>
            </div>
        );
    }
}

User.propTypes = {
    match: PropTypes.object.isRequired,
};

export default User;
