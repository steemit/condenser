import React from 'react';
import PropTypes from 'prop-types';

import Community from './Community';

export default function CommunityList(props) {
    const { communities, communities_idx } = props;
    const communityCount = communities.length;
    // TODO: assumption of 0==loading is ok until filters are added
    const loading = props.loading || communityCount == 0;

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
            {communities_idx
                .map(name => communities.get(name))
                .map(community => (
                    <Community
                        key={community.get('name')}
                        {...community.toJS()}
                    />
                ))}
        </div>
    );
}

CommunityList.propTypes = {
    communities: PropTypes.object.isRequired,
    communities_idx: PropTypes.object.isRequired,
    loading: PropTypes.bool,
};
