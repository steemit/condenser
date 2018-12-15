import React, { Component } from 'react';
import PropTypes from 'prop-types';

class DropDown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
        };

        this.showMenu = this.showMenu.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
    }

    showMenu(event) {
        event.preventDefault();

        this.setState({ isOpen: true }, () => {
            document.addEventListener('click', this.closeMenu);
        });
    }

    closeMenu() {
        this.setState({ isOpen: false }, () => {
            document.removeEventListener('click', this.closeMenu);
        });
    }

    render() {
        const { isOpen } = this.state;
        const {
            defaultValue,
            value,
            labelKey,
            valueKey,
            options,
            onChange,
        } = this.props;
        const valueObj =
            value || (valueKey ? { [labelKey]: defaultValue } : defaultValue);

        return (
            <div className={`DropDownWrapper ${isOpen ? 'Open' : 'Close'}`}>
                <button onClick={this.showMenu} type="button">
                    {valueKey ? valueObj[labelKey] : valueObj}
                </button>
                {isOpen ? (
                    <div className="Menu">
                        {options.map((option, index) => (
                            <button
                                type="button"
                                key={index}
                                onClick={() => onChange(option)}
                            >
                                {labelKey ? option[labelKey] : option}
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    }
}

DropDown.defaultProps = {
    labelKey: 'label',
    valueKey: null,
    defaultValue: 'Drop Down Menu',
    value: null,
};

DropDown.propTypes = {
    labelKey: PropTypes.string,
    valueKey: PropTypes.string,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,

    defaultValue: PropTypes.string,
    value: PropTypes.object || PropTypes.string,
};

export default DropDown;
