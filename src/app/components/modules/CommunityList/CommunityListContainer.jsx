import React from 'react';
import PropTypes from 'prop-types';

import CommunityList from './CommunityList';

class CommunityListContainer extends React.Component {
    constructor(props) {
        console.log('CommunityListContainer.jsx::constructor()', props);
        super(props);
    }

    render() {
        return <CommunityList {...this.props} />;
    }
}

CommunityList.propTypes = {
    communities: PropTypes.array.isRequired, // TODO: Specify shape.
    loading: PropTypes.bool.isRequired,
};

export default CommunityListContainer;
