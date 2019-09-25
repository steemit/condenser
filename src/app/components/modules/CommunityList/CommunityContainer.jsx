import React from 'react';
import PropTypes from 'prop-types';
import Community from './Community';

class CommunityContainer extends React.Component {
    constructor(props) {
        console.log('CommunityContainer.jsx::constructor()', props);
        super(props);
        this.state = {};
    }

    // async componentWillMount() {
    //     await console.log('CommunityContainer.jsx::componentWillMount()');
    // }

    render() {
        const { community } = this.props;
        console.log('CommunityContainer.jsx::render()', this.props);

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
    community: PropTypes.shape({}).isRequired, // TODO: Add Shape
};

export default CommunityContainer;
