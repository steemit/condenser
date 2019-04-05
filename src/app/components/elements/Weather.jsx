import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as appActions from 'app/redux/AppReducer';

class Weather extends Component {
    render() {
        const weatherData = this.props.weatherData;
        if (!weatherData) {
            return;
        }

        if (this.props.weatherLoading) {
            return (
                <div>
                    <p>Loading...</p>
                </div>
            );
        }

        const previous = this.props.previous;
        const next = this.props.next;
        const refresh = this.props.refresh;
        const today = weatherData.properties.periods[0];
        const startTime = new Date(today.startTime).toLocaleString();
        const detailedForecast = today.detailedForecast;
        return (
            <div className="c-sidebar__module">
                <div className="c-sidebar__header">
                    <h3 className="c-sidebar__h3">Weather</h3>
                </div>
                <div className="c-sidebar__content">
                    <div className="weather">
                        <h4>Osage, KS</h4>
                        <p>{startTime}</p>
                        <p>{detailedForecast}</p>
                        <button className="button" onClick={refresh}>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    (state, ownProps) => {
        const weatherData = state.app.get('weatherData').toJS();
        return {
            weatherData,
            ...ownProps,
        };
    },
    dispatch => ({
        refresh: () => {
            console.info('Refresh...');
            dispatch(appActions.refreshWeather());
        },
    })
)(Weather);
