import React from 'react';
import { browserHistory } from 'react-router';
import Icon from 'app/components/elements/Icon';
import { findParent } from 'app/utils/DomUtils';

export default class Dropdown extends React.Component {
    static propTypes = {
        selected: React.PropTypes.string,
        children: React.PropTypes.object,
        className: React.PropTypes.string,
        title: React.PropTypes.string,
        href: React.PropTypes.string,
        el: React.PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            shown: false,
            selected: props.selected,
        };
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.hide);
    }

    toggle = e => {
        const { shown } = this.state;
        if (shown) this.hide(e);
        else this.show(e);
    };

    show = e => {
        e.preventDefault();
        this.setState({ shown: true });
        document.addEventListener('click', this.hide);
    };

    hide = e => {
        // Do not hide the dropdown if there was a click within it.
        const inside_dropdown = !!findParent(e.target, 'dropdown__content');
        if (inside_dropdown) return;

        e.preventDefault();
        this.setState({ shown: false });
        document.removeEventListener('click', this.hide);
    };

    navigate = e => {
        const a =
            e.target.nodeName.toLowerCase() === 'a'
                ? e.target
                : e.target.parentNode;
        this.setState({ show: false });
        if (a.host !== window.location.host) return;
        e.preventDefault();
        browserHistory.push(a.pathname + a.search);
    };

    getSelectedLabel = (items, selected) => {
        const selectedEntry = items.find(i => i.value === selected);
        const selectedLabel =
            selectedEntry && selectedEntry.label
                ? selectedEntry.label
                : selected;
        return selectedLabel;
    };

    render() {
        const {
            children,
            className,
            title,
            href,
            position,
        } = this.props;

        let entry = (
            <a key="entry" href={href || '#'} onClick={this.toggle}>
                {title}
            </a>
        );

        const menu = (
            <div className={'dropdown__content'}>   
              {children}
            </div>
        );
        const cls =
            'dropdown' +
            (this.state.shown ? ' show' : '') +
            (className ? ` ${className}` : '') +
            (position ? ` ${position}` : '');
        return React.createElement('div', { className: cls }, [entry, menu]);
    }
}
