/* eslint react/prop-types: 0 */
import React from 'react';
import { connect } from 'react-redux';
import UserListRow from 'app/components/cards/UserListRow';
import tt from 'counterpart';
import ReactPaginate from 'react-paginate';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';

const PER_PAGE = 20;
const TOTAL = 100;

class UserList extends React.Component {
    constructor() {
        super();
        this.state = {
            historyIndex: 0,
            currentPage: 0,
        };
    }

    _setHistoryPagePrevious = () => {
        const newIndex = this.state.historyIndex - PER_PAGE;
        this.setState({ historyIndex: Math.max(0, newIndex) });
    };

    _setHistoryPageNext = () => {
        const newIndex = this.state.historyIndex + PER_PAGE;
        this.setState({ historyIndex: Math.max(0, newIndex) });
    };

    getList(currentPage) {
        const { getFollowers, title, accountname } = this.props;
        getFollowers({ title, accountname, currentPage, per_page: PER_PAGE });
    }

    onPageChange(node) {
        const currentPage = node.selected;
        this.setState({
            currentPage,
        });
        this.getList(currentPage);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.title !== this.props.title) {
            this.props.updateFollowersList([]);
            this.getList(0);
            const parent = document.getElementsByClassName('pagination')[0];
            if (!parent) return;
            const lis = parent.getElementsByTagName('li');
            //lis[1].click();
            //lis[this.state.currentPage + 1].classList.remove("pag-active");
            //lis[this.state.currentPage + 1].getElementsByTagName('a')[0].removeAttribute('aria-current');
            //lis[1].classList.add("pag-active");
            //lis[1].getElementsByTagName('a')[0].setAttribute('aria-current','page');
            lis[1].getElementsByTagName('a')[0].click();
            this.setState({
                currentPage: 0,
            });
        }
    }

    componentDidMount() {
        this.getList(0);
    }

    render() {
        const { state: { historyIndex } } = this;
        const users = this.props.users;
        const title = this.props.title;
        const followersList = this.props.followersList;
        const total = Math.ceil(
            this.props.profile.getIn(
                ['stats', title === 'Followers' ? 'followers' : 'following'],
                0
            )
        );
        if (!users) {
            return (
                <div className="UserList">
                    <div className="row">
                        <div className="column small-12">
                            <h3>{title}</h3>
                            Loading...
                        </div>
                    </div>
                </div>
            );
        }

        let idx = 0;
        let user_list = users.map(user => (
            <UserListRow user={user} key={idx++} />
        ));
        user_list = user_list.toArray();

        let currentIndex = -1;
        const usersLength = users.size;
        const limitedIndex = Math.min(historyIndex, usersLength - PER_PAGE);
        user_list = user_list.reverse().filter(() => {
            currentIndex++;
            return (
                currentIndex >= limitedIndex &&
                currentIndex < limitedIndex + PER_PAGE
            );
        });

        const navButtons = (
            <nav>
                <ul
                    className="pager"
                    style={{ display: 'flex', justifyContent: 'flex-end' }}
                >
                    <li>
                        <div
                            className={
                                'button tiny hollow ' +
                                (historyIndex === 0 ? ' disabled' : '')
                            }
                            onClick={this._setHistoryPagePrevious}
                            aria-label={tt('g.previous')}
                            style={{
                                marginRight: 20,
                            }}
                        >
                            <span aria-hidden="true">
                                &larr; {tt('g.previous')}
                            </span>
                        </div>
                    </li>
                    <li>
                        <div
                            className={
                                'button tiny hollow ' +
                                (historyIndex >= usersLength - PER_PAGE
                                    ? ' disabled'
                                    : '')
                            }
                            onClick={
                                historyIndex >= usersLength - PER_PAGE
                                    ? null
                                    : this._setHistoryPageNext
                            }
                            aria-label={tt('g.next')}
                        >
                            <span aria-hidden="true">
                                {tt('g.next')} &rarr;
                            </span>
                        </div>
                    </li>
                </ul>
            </nav>
        );

        return (
            <div className="UserList">
                <div className="row">
                    <div className="column small-12">
                        <h3>{title}</h3>
                        {/*navButtons*/}
                        <table>
                            <tbody>
                                {/*user_list*/}
                                {followersList &&
                                    followersList.map((item, index) => {
                                        const user = item.toJS();
                                        return (
                                            <UserListRow
                                                user={user}
                                                key={index++}
                                                title={title}
                                            />
                                        );
                                    })}
                            </tbody>
                        </table>
                        {/*navButtons*/}
                        {total > 0 && (
                            <ReactPaginate
                                previousLabel={tt('g.previous')}
                                nextLabel={tt('g.next')}
                                breakLabel={'...'}
                                breakClassName={'break-me'}
                                pageCount={Math.ceil(total / PER_PAGE)}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                                onPageChange={this.onPageChange.bind(this)}
                                containerClassName={'pagination'}
                                subContainerClassName={'pages pagination'}
                                activeClassName={'pag-active'}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => ({
        ...ownProps,
        followersList: state.global.get('followersList'),
        //user_preferences: state.app.get('user_preferences').toJS(),
    }),
    dispatch => ({
        getFollowers: payload => {
            return dispatch(fetchDataSagaActions.getFollowers(payload));
        },
        updateFollowersList: list => {
            return dispatch(fetchDataSagaActions.updateFollowersList(list));
        },
    })
)(UserList);
