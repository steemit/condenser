import React from 'react';
import classNames from 'classnames';
import Switchery from 'switchery';
import PropTypes from 'prop-types';


/**
 * This is a 100% rip of https://github.com/mohithg/react-switchery
 * Which was quite broken @ the time.
 *
 * React switch input component. Note we are using
 * switchery jquery plugin.
 */
class Switch extends React.Component {

    /**
     * We initialize the Switchery object
     * once the component is mounted
     */
    componentDidMount() {
        const input = this.elCheckbox;

        /* eslint-disable no-undef, no-new */
        new Switchery(input, this.props.options);
        /* eslint-enable no-new, no-undef */
        input.onchange = this.onChange;
    }

    /**
     * When the user makes a change
     * If an external onChange
     * function is provided, we call that.
     */
    onClick = () => { //eslint-disable-line no-undef
        if (this.props.onChange) {
            this.props.onChange(this.elCheckbox.checked);
        }
        if(this.elCheckbox.checked) {
            this.elWrapper.className = this.elWrapper.className.split(' ').join(' ') + ' isChecked';
        } else {
            this.elWrapper.className = this.elWrapper.className.replace('isChecked', '');
        }
    }

    /**
     * renders the component
     */
    render() {
        return (
            <div
                onClick={this.onClick}
                className={classNames([
                    this.props.className,
                    {
                        required: this.props.required,
                    },
                ])}
                ref={elWrapper => this.elWrapper = elWrapper}
            >
                {(this.props.label)? <label>{this.props.label}</label> : null }
                <input
                    ref={elCheckbox => this.elCheckbox = elCheckbox}
                    type="checkbox"
                    defaultChecked={this.props.checked}
                />
            </div>
        );
    }
}

/**
 * Validating propTypes
 */
Switch.propTypes = {
    label: PropTypes.string,
    className: PropTypes.string,
    required: PropTypes.bool,
    checked: PropTypes.bool,
    options: PropTypes.object,
    onChange: PropTypes.func,
};

/**
 * Default Props
 */
Switch.defaultProps = {
    value: true,
    required: false,
};

/**
 * Exports the switchery component
 */
export default Switch;
