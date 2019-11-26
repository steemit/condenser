import React from 'react';
import Autocomplete from 'react-autocomplete';

function matchLanguageToTerm(state, value) {
    return (
        state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
        state.abbr.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
}

/**
 * An example of how to implement a relevancy-based sorting method. States are
 * sorted based on the location of the match - For example, a search for "or"
 * will return "Oregon" before "North Carolina" even though "North Carolina"
 * would normally sort above Oregon. Strings where the match is in the same
 * location (or there is no match) will be sorted alphabetically - For example,
 * a search for "or" would return "North Carolina" above "North Dakota".
 */
export function sortLanguages(a, b, value) {
    const aLower = a.name.toLowerCase();
    const bLower = b.name.toLowerCase();
    const valueLower = value.toLowerCase();
    const queryPosA = aLower.indexOf(valueLower);
    const queryPosB = bLower.indexOf(valueLower);
    if (queryPosA !== queryPosB) {
        return queryPosA - queryPosB;
    }
    return aLower < bLower ? -1 : 1;
}

class AutocompleteInput extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        value: this.props.initialValue,
    };

    render() {
        return (
            <div>
                <label htmlFor="states-autocomplete">{this.props.label}</label>
                <Autocomplete
                    value={this.state.value}
                    inputProps={{ id: 'states-autocomplete' }}
                    wrapperStyle={{
                        position: 'relative',
                        display: 'inline-block',
                    }}
                    items={this.props.values}
                    getItemValue={item => item.name}
                    shouldItemRender={matchLanguageToTerm}
                    sortItems={sortLanguages}
                    onChange={(event, value) => this.setState({ value })}
                    onSelect={value => {
                        this.setState({ value });
                        this.props.onSelect(value);
                    }}
                    renderMenu={children => (
                        <div className="react-autocomplete-input">
                            {children}
                        </div>
                    )}
                    renderItem={(item, isHighlighted) => (
                        <div
                            className={`item ${
                                isHighlighted ? 'item-highlighted' : ''
                            }`}
                            key={item.abbr}
                        >
                            {item.name}
                        </div>
                    )}
                />
            </div>
        );
    }
}

export default AutocompleteInput;
