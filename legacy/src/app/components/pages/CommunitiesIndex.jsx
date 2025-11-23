import React from 'react';
import { connect } from 'react-redux';
import tt from 'counterpart';
import { Map, List } from 'immutable';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import SubscribeButton from 'app/components/elements/SubscribeButton';
import { Link } from 'react-router';
import PostsIndexLayout from 'app/components/pages/PostsIndexLayout';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import UserNames from 'app/components/elements/UserNames';
import ElasticSearchInput from 'app/components/elements/ElasticSearchInput';
import NativeSelect from 'app/components/elements/NativeSelect';
import Callout from 'app/components/elements/Callout';
import * as appActions from 'app/redux/AppReducer';

export default class CommunitiesIndex extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchQuery: undefined,
            searchOrder: 'rank',
        };
    }

    componentWillMount = () => {
        this.props.setRouteTag();
        this.props.performSearch(
            this.props.username,
            this.state.searchQuery,
            this.state.searchOrder
        );
    };
    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.username !== this.props.username) {
            this.props.performSearch(
                this.props.username,
                this.state.searchQuery,
                this.state.searchOrder
            );
        }
    };

    render() {
        const {
            communities,
            communities_idx,
            username,
            walletUrl,
            performSearch,
        } = this.props;
        const ordered = communities_idx.map(name => communities.get(name));

        const sortOptions = [
            {
                value: 'rank',
                label: tt('g.rank'),
            },
            {
                value: 'subs',
                label: tt('g.subscribers'),
            },
            {
                value: 'new',
                label: tt('g.new'),
            },
        ];

        // if (communities_idx.size === 0) {
        //     return (
        //         <center>
        //             <LoadingIndicator
        //                 style={{ marginBottom: '2rem' }}
        //                 type="circle"
        //             />
        //         </center>
        //     );
        // }

        const role = comm =>
            comm.context &&
            comm.context.role !== 'guest' && (
                <span className="user_role">{comm.context.role}</span>
            );

        const communityAdmins = admins => {
            if (!admins || admins.length === 0) return;

            return (
                <div>
                    {admins.length === 1
                        ? `${tt('g.administrator')}: `
                        : `${tt('g.administrators')}: `}
                    <UserNames names={admins} />
                </div>
            );
        };

        const row = comm => {
            const admins = communityAdmins(comm.admins);
            return (
                <tr key={comm.name}>
                    <th>
                        <Link className="title" to={`/trending/${comm.name}`}>
                            {comm.title}
                        </Link>
                        {role(comm)}
                        <br />
                        {comm.about}
                        <small>
                            {comm.subscribers} {tt('g.subscribers')} &bull;{' '}
                            {comm.num_authors} {tt('g.posters')} &bull;{' '}
                            {comm.num_pending} {tt('g.posts')}
                            {admins}
                        </small>
                    </th>
                    <td>
                        <SubscribeButton community={comm.name} />
                    </td>
                </tr>
            );
        };

        return (
            <PostsIndexLayout
                category={null}
                enableAds={false}
                blogmode={false}
            >
                <div className="CommunitiesIndex c-sidebar__module">
                    {username && (
                        <div style={{ float: 'right' }}>
                            <a href={`${walletUrl}/@${username}/communities`}>
                                {tt('g.create_community')}
                            </a>
                        </div>
                    )}

                    <h4>
                        {/* {<Link to={`/`}>Home</Link>} &gt;{' '} */}
                        {tt('g.community_list_header')}
                    </h4>
                    <div className="articles__header row">
                        <div className="small-8 medium-7 large-8 column">
                            <ElasticSearchInput
                                expanded
                                handleSubmit={q => {
                                    this.setState({
                                        searchQuery: q,
                                    });
                                    performSearch(
                                        username,
                                        q,
                                        this.state.searchOrder
                                    );
                                }}
                                redirect={false}
                            />
                        </div>
                        <div className="small-4 medium-3 large-4 column">
                            <NativeSelect
                                options={sortOptions}
                                currentlySelected={this.state.searchOrder}
                                onChange={opt => {
                                    this.setState({
                                        searchOrder: opt.value,
                                    });
                                    performSearch(
                                        username,
                                        this.state.searchQuery,
                                        opt.value
                                    );
                                }}
                            />
                        </div>
                    </div>
                    <hr />
                    {ordered.size > 0 ? (
                        <table>
                            <tbody>
                                {ordered.map(comm => row(comm.toJS()))}
                            </tbody>
                        </table>
                    ) : (
                        <Callout>{'Nothing was found.'}</Callout>
                    )}
                </div>
            </PostsIndexLayout>
        );
    }
}

module.exports = {
    path: 'communities(/:username)',
    component: connect(
        state => {
            // Get current sort and query from the url.
            return {
                walletUrl: state.app.get('walletUrl'),
                username: state.user.getIn(['current', 'username']),
                communities: state.global.get('community', Map()),
                communities_idx: state.global.get('community_idx', List()),
            };
        },
        dispatch => {
            return {
                performSearch: (observer, query, sort = 'rank') => {
                    dispatch(
                        fetchDataSagaActions.listCommunities({
                            observer,
                            query,
                            sort,
                        })
                    );
                },
                setRouteTag: () =>
                    dispatch(
                        appActions.setRouteTag({ routeTag: 'more_communities' })
                    ),
            };
        }
    )(CommunitiesIndex),
};
