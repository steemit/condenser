import React from 'react';
import PropTypes from 'prop-types';

import CommunityContainer from './CommunityContainer';

export default function CommunityList(props) {
    const { communities, loading } = props;
    const communityCount = communities.length;
    console.log('CommunityList.jsx::constructor()', props);

    if (!loading && communityCount == 0) {
        return (
            <center>
                <h5>
                    Sorry, I can't show you any communities right now.<br />
                    <small>
                        It's probably because there are not any matching your
                        criteria.
                    </small>
                </h5>
            </center>
        );
    } else if (loading && communities.length == 0) {
        return (
            <center>
                <h5>
                    Loading<br />
                    <small>It's worth the wait. ;)</small>
                </h5>
            </center>
        );
    }

    return (
        <div className="CommunitiesList">
            <div className="communities__header">
                <div className="communities__names">Community Name</div>
                <div className="communities__description">Description</div>
                <div className="communities__subscription">Subscribe</div>
            </div>
            {communities.map(community => (
                <CommunityContainer
                    key={community.get('name')}
                    community={community.toJS()}
                />
            ))}
        </div>
    );
}

CommunityList.propTypes = {
    communities: PropTypes.array.isRequired, //TODO: Specify Shape
    loading: PropTypes.bool.isRequired,
};
