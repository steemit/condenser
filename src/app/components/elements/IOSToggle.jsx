import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

let htmlIdIncrement = 0;

/**
 * React switch input component.
 * HTML & css based on switchery.
 */
class IOSToggle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
        };
        this.htmlId = 'iosToggle_' + htmlIdIncrement;
        htmlIdIncrement++; //eslint-disable-line
    }

    /**
     * When the user makes a change
     * If an external onChange
     * function is provided, we call that.
     */
    onClick = () => {
        //eslint-disable-line no-undef
        this.props.onClick(!this.props.checked, this.state.value);
    };

    /**
     * renders the component
     */
    render() {
        /* need to implement aria-pressed attribute for accessibility on the root element! This: aria-pressed={this.props.checked? 'true' : 'false'} */
        return (
            <div
                id={this.htmlId}
                role={'button'}
                tabIndex={0}
                onClick={this.onClick}
                className={classNames([
                    'iostoggle',
                    this.props.className,
                    {
                        isChecked: this.props.checked,
                    },
                ])}
                ref={elWrapper => (this.elWrapper = elWrapper)}
            >
                <span className="switchery">
                    <small style={{}} />
                </span>
            </div>
        );
    }
}

/**
 * Validating propTypes
 */
IOSToggle.propTypes = {
    className: PropTypes.string,
    checked: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
};

/**
 * Default Props
 */
IOSToggle.defaultProps = {
    className: '',
};

/**
 * Exports the switchery component
 */
export default IOSToggle;
