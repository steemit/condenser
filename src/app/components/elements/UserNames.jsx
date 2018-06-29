import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import { Link } from 'react-router';

function userLink(name) {
    return (
        <Link className="username" key={name} to={'/@' + name}>
            {name}
        </Link>
    );
}

class UserNames extends Component {
    static propTypes = {
        names: PropTypes.array,
        size: PropTypes.number,
    };
    static defaultProps = {
        size: 2,
    };

    render() {
        let { names, size } = this.props;

        if (!names) {
            return null;
        }

        // `size` is max number of names to list before "and <x>"
        if (size >= names.length) {
            // enforce bounds
            size = names.length - 1;
        }

        // if size == 0, there is no "and" in the output
        let and_names = size == 0 ? [] : names.splice(size);

        let out = [];

        // build first portion of output: "name1, name2, name3"
        for (var i = 0; i < names.length; i++) {
            if (i > 0) out.push(<span key={'_comma' + i}>, </span>);
            out.push(userLink(names[i]));
        }

        // build suffix: " and name4" or " and 3 others" (dropdown if and_names > 1)
        if (and_names.length > 0) {
            out.push(<span key="_and"> and </span>);
            if (and_names.length == 1) {
                // and <name>
                out.push(userLink(and_names[0]));
            } else {
                // and <x> others...
                out.push(
                    <DropdownMenu
                        key="_others"
                        selected={and_names.length + ' others'}
                        items={and_names.map(name => {
                            return { value: name, link: '/@' + name };
                        })}
                        el="div"
                    />
                );
            }
        }

        return <span className="UserNames">{out}</span>;
    }
}

export default connect((state, ownProps) => ownProps)(UserNames);
