import React from 'react';
import tt from 'counterpart';
import ScrollToTop from 'react-scroll-up';
import Icon from 'app/components/elements/Icon';

export default class ScrollButton extends React.Component {
    render() {
        return (
            <ScrollToTop showUnder={160} style={{ zIndex: 2 }}>
                <span className="ScrollButton" title={tt('g.back_to_top')}>
                    <Icon name="arrow" className="arrow-up" size="3x" />
                </span>
            </ScrollToTop>
        );
    }
}
