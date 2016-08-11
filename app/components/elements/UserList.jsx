/* eslint react/prop-types: 0 */
import React from 'react';
import UserListRow from 'app/components/cards/UserListRow';

class UserList extends React.Component {

    constructor() {
        super()
        this.state = {historyIndex: 0}
    }

    _setHistoryPagePrevious = () => {
        const newIndex = this.state.historyIndex + (-10);
        this.setState({historyIndex: Math.max(0, newIndex)});
    }

    _setHistoryPageNext = () => {
        const newIndex = this.state.historyIndex + (10);
        this.setState({historyIndex: Math.max(0, newIndex)});
    }

    render() {
        const {state: {historyIndex}} = this
        const account = this.props.account
        const users = this.props.users.get('result')
        const title = this.props.title

        let user_list = users.map((item, index) => {
            if(item.get(0) === "blog") {
                return <UserListRow account={account} user={index} key={index} />
            }
            return null;
        }).filter(el => !!el).toArray();

        let currentIndex = -1;
        const usersLength = users.size;
        const limitedIndex = Math.min(historyIndex, usersLength - 50);
        user_list = user_list.reverse().filter(() => {
            currentIndex++;
            return currentIndex >= limitedIndex && currentIndex < limitedIndex + 50;
        });

        const navButtons = (
             <nav>
               <ul className="pager">
                 <li>
                     <div className={"button tiny hollow float-left " + (historyIndex === 0 ? " disabled" : "")} onClick={this._setHistoryPagePrevious} aria-label="Previous">
                         <span aria-hidden="true">&larr; Previous</span>
                     </div>
                 </li>
                 <li>
                     <div className={"button tiny hollow float-right " + (historyIndex >= (usersLength - 10) ? " disabled" : "")} onClick={historyIndex >= (usersLength - 10) ? null : this._setHistoryPageNext} aria-label="Next">
                         <span aria-hidden="true">Next &rarr;</span>
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
