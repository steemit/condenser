import React, { PropTypes } from "react";
import tt from 'counterpart';

class Tab extends React.Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        changeTab: PropTypes.func,
        isActive: PropTypes.bool.isRequired,
        index: PropTypes.number.isRequired
    };

    static defaultProps = {
        isActive: false,
        index: 0
    };

    render() {
        let {isActive, index, changeTab, title} = this.props;
        return (
            <li className={isActive ? "is-active": ''} onClick={changeTab.bind(this, index)}>
                <a>{title.indexOf(".") > 0 ? tt(`${title}`) : title}</a>
            </li>
        );
    }
}

class Tabs extends React.Component {

    static propTypes = {
        defaultActiveTab: PropTypes.number
    };

    static defaultProps = {
        active: 0,
        defaultActiveTab: 0
    };

    constructor() {
        super();
        this.state = {
           activeTab: 0
        };
    }

    changeTab(value) {
        this.setState({activeTab: value});
    }

    render() {
        let {children, contentClass, tabsClass, style} = this.props;

        let activeContent = null;

        let tabIndex = [];
        let tabs = React.Children.map(children, (child, index) => {
            if (!child) {
                return null;
            }
            let isActive = index === this.state.activeTab;
            if (isActive) {
                activeContent = child.props.children;
            }

            return React.cloneElement(child, {isActive: isActive, changeTab: this.changeTab.bind(this), index: index} );
        }).filter(a => {
            if (a) {
                tabIndex.push(a.props.index);
            }
            return a !== null;
        });

        if (!activeContent) {
            activeContent = tabs[0].props.children;
        }

        return (
            <div className={this.props.className}>
                <div className="tab-selector">
                    <ul style={style} className="button-group">
                        {tabs}
                    </ul>
                </div>
                <div className={contentClass} >
                    {activeContent}
                </div>

            </div>
        );
    }
}

export {Tabs, Tab};
