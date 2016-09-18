import React from 'react';
import {connect} from 'react-redux';

class Ico extends React.Component {

    state = {
        address: "",
        tooltip: "HAЖМИ МЕНЯ ПОЗЯЗЯ",
        buttonIsDisabled: false
    }

    componentWillMount() {
      // make http request
    }

    changeAddress = () => {
        fetch('/test_meow').then(function(rr) {
            return rr.json();
        }).then(data =>{
            console.log(data);
            this.setState({
                tooltip: data.hello || 'ooooouch!'
            })
        })

    }

    render() {
        const {current_user} = this.props
        // current_user is always null on page load, it loads dynamically few moments later
        const username = current_user ? current_user.get('username') : null

        return (
            <div className="row">
                <div className="column">
                    <h1>ИМЯ АККАУНТА {username ? username : 'ЕЩЕ ЗАГРУЖАЕТСЯ ИЛИ НЕ ЗАЛОГИНЕН'}</h1>
                    <h2>ЭТО ICO СТРАНИЦА</h2>
                    <button
                        onClick={this.changeAddress}
                        style={{color: 'white'}}
                        className="button info"
                        disabled={this.state.buttonIsDisabled}
                    >
                        {this.state.tooltip}
                    </button>
                    <input type="text" placeholder="ЗДЕСЬ ДОЛЖЕН ОТРАЖАТЬСЯ КАКОЙ-ТО ТЕКСТ" value={this.state.address} />
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'ico.html',
    component: connect(
        state => {
            return {current_user: state.user.get('current')};
        }
    )(Ico)
};
