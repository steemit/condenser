import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Expertise.scss';

class Expertise extends Component {
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
            <div className="ExpertiseWrapper">
                <div className="Title">{`Expertise (${this.getParams(
                    'id'
                )})`}</div>
            </div>
        );
    }
}

Expertise.propTypes = {
    match: PropTypes.object.isRequired,
};

export default Expertise;
