import { createSelector } from 'reselect';

export const getPinnedPosts = createSelector(
    (state, accountName) => state.global.getIn(['accounts', accountName, 'json_metadata']),
    json_metadata => {
        if (json_metadata) {
            try {
                const meta = JSON.parse(json_metadata);

                if (meta.pinnedPosts && Array.isArray(meta.pinnedPosts)) {
                    return meta.pinnedPosts;
                }
            } catch (err) {
                console.error(err);
            }
        }

        return [];
    }
);
