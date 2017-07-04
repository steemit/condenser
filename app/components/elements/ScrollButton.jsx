import React from 'react';
import Icon from 'app/components/elements/Icon'
import tt from 'counterpart';

export default class ScrollButton extends React.Component {
    constructor() {
        super();

        this.state = {
            intervalId: 0
        };
    }

    scrollStep() {
        const scrollStepInPx = 50;
        if (window.pageYOffset === 0) {
            clearInterval(this.state.intervalId);
            this.setState({ intervalId: 0 });
        }
        window.scroll(0, window.pageYOffset - scrollStepInPx);
    }

    scrollToTop() {
        const delayInMs = 5;
        let intervalId = setInterval(this.scrollStep.bind(this), delayInMs);
        this.setState({ intervalId: intervalId });
    }

    render () {
        return (
            <button
                title={tt('g.back_to_top')}
                className='ScrollButton'
                onClick={ () => { this.scrollToTop(); }}
            >
                <Icon name="arrow" className="arrow-up" size="3x"/>
            </button>
        );
    }
}
