import React from 'react';

class Ico extends React.Component {

    state = {
        address: "",
        tooltip: "HAЖМИ МЕНЯ ПОЗЯЗЯ",
        buttonIsDisabled: false
    }

    changeAddress = () => {
        this.setState({
            tooltip: 'ПОДОЖДИ ЕПТ',
            buttonIsDisabled: true
        })
        setTimeout(() => {
            this.setState({ address: "ОПА"})
        }, 2500);
    }

    render() {
        return (
            <div className="row">
                <div className="column">
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
    component: Ico
};
