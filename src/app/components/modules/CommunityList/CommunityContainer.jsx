import React from 'react';
import PropTypes from 'prop-types';
import Community from './Community';

class CommunityContainer extends React.Component {
    render() {
        const { community } = this.props;

        return (
            <Community
                name={community.name}
                title={community.title}
                description={community.about}
            />
        );
    }
}

CommunityContainer.propTypes = {
    community: PropTypes.object.isRequired, // TODO: Add Shape
};

export default CommunityContainer;
