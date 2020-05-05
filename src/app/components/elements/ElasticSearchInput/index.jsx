import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import tt from 'counterpart';

class ElasticSearchInput extends React.Component {
    static propTypes = {
        redirect: PropTypes.bool.isRequired,
        handleSubmit: PropTypes.func,
        expanded: PropTypes.bool,
        initValue: PropTypes.string,
    };
    static defaultProps = {
        handleSubmit: null,
        expanded: true,
        initValue: '',
    };

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.initValue ? this.props.initValue : '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.onSearchSubmit = this.onSearchSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    onSearchSubmit = e => {
        e.preventDefault();
        const { handleSubmit, redirect } = this.props;
        handleSubmit && handleSubmit(this.state.value);
        redirect && browserHistory.push(`/search?q=${this.state.value}`);
    };

    render() {
        const formClass = this.props.expanded
            ? 'search-input--expanded'
            : 'search-input';
        return (
            <span>
                <form className={formClass} onSubmit={this.onSearchSubmit}>
                    <svg
                        className="search-input__icon"
                        width="42"
                        height="42"
                        viewBox="0 0 32 32"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g>
                            <path
                                className="search-input__path"
                                d="M14.3681591,18.5706017 L11.3928571,21.6 L14.3681591,18.5706017 C13.273867,17.6916019 12.5714286,16.3293241 12.5714286,14.8 C12.5714286,12.1490332 14.6820862,10 17.2857143,10 C19.8893424,10 22,12.1490332 22,14.8 C22,17.4509668 19.8893424,19.6 17.2857143,19.6 C16.1841009,19.6 15.1707389,19.215281 14.3681591,18.5706017 Z"
                                id="icon-svg"
                            />
                        </g>
                    </svg>
                    <input
                        name="q"
                        className="search-input__inner"
                        type="search"
                        placeholder={tt('g.search')}
                        onChange={this.handleChange}
                        value={this.state.value}
                    />
                </form>
            </span>
        );
    }
}

export default ElasticSearchInput;
