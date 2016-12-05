/* eslint react/prop-types: 0 */
import React from 'react';
import UserListRow from 'app/components/cards/UserListRow';
import { translate } from 'app/Translator';

const PER_PAGE = 50;

class UserList extends React.Component {

    constructor() {
        super()
        this.state = {historyIndex: 0}
    }

    _setHistoryPagePrevious = () => {
        const newIndex = this.state.historyIndex - PER_PAGE;
        this.setState({historyIndex: Math.max(0, newIndex)});
    }

    _setHistoryPageNext = () => {
        const newIndex = this.state.historyIndex + PER_PAGE;
        this.setState({historyIndex: Math.max(0, newIndex)});
    }

    render() {
        const {state: {historyIndex}} = this
        const account = this.props.account
        const users = this.props.users
        const title = this.props.title

        let idx = 0
        let user_list = users.map(user =>
            <UserListRow account={account} user={user} key={idx++} />
        )
        user_list = user_list.toArray();

        let currentIndex = -1;
        const usersLength = users.size;
        const limitedIndex = Math.min(historyIndex, usersLength - PER_PAGE);
        user_list = user_list.reverse().filter(() => {
            currentIndex++;
            return currentIndex >= limitedIndex && currentIndex < limitedIndex + PER_PAGE;
        });

        const navButtons = (
             <nav>
               <ul className="pager">
                 <li>
                     <div className={"button tiny hollow float-left " + (historyIndex === 0 ? " disabled" : "")} onClick={this._setHistoryPagePrevious} aria-label={translate('previous')}>
                         <span aria-hidden="true">&larr; {translate('previous')}</span>
                     </div>
                 </li>
                 <li>
                     <div className={"button tiny hollow float-right " + (historyIndex >= (usersLength - PER_PAGE) ? " disabled" : "")} onClick={historyIndex >= (usersLength - PER_PAGE) ? null : this._setHistoryPageNext} aria-label={translate('next')}>
                         <span aria-hidden="true">{translate('next')} &rarr;</span>
                     </div>
                 </li>
               </ul>
             </nav>
        );

        return (<div className="UserList">
            <div className="row">
                <div className="column small-12">
                    <h3>{title}</h3>
                    {navButtons}
                    <table>
                        <tbody>
                            {user_list}
                        </tbody>
                    </table>
                    {navButtons}
                </div>
            </div>
        </div>);
    }
}

export default UserList
