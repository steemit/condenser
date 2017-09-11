import React from 'react';
import Icon from 'app/components/elements/Icon'
import tt from 'counterpart';
import ScrollToTop from 'react-scroll-up'

export default class ScrollButton extends React.Component {

    render () {
        return (
            <ScrollToTop showUnder={160}>
                <span className='ScrollButton' title={tt('g.back_to_top')}>
                    <Icon name="arrow" className="arrow-up" size="3x"/>
                </span>
            </ScrollToTop>
        );
    }
}
