import React, { Component } from 'react';
import Select from 'react-select';

import { TypeSelector } from 'app/components/pages/_Common';
import { Posts } from './DummyData';

const customStyles = {
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? '#e6e6e6'
            : state.isFocused ? '#f2f2f2' : 'white',
        '&:hover': {
            backgroundColor: state.isSelected ? '#e6e6e6' : '#f2f2f2',
        },
        '&:active': {
            backgroundColor: '#e6e6e6',
        },
    }),
    control: provided => ({
        ...provided,
        '&:hover': {
            borderColor: 'hsl(0, 0%, 100%)',
            boxShadow: '0 0 0 1px #e6e6e6',
        },
        borderColor: 'hsl(0, 0%, 100%)',
        boxShadow: '0 0 0 1px #e6e6e6',
    }),
};

class Create extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // loading: true,
            type: 'Q',
        };
    }

    onUpdateState(key) {
        return value =>
            this.setState({
                [key]: value,
            });
    }

    render() {
        const { type } = this.state;

        return (
            <div className="CreateWrapper">
                <div className="Form">
                    <TypeSelector
                        label="Post Type"
                        types={[
                            {
                                type: 'Ob',
                                render: () => (
                                    <div>
                                        <span className="Ob">Ob</span>{' '}
                                        Observation
                                    </div>
                                ),
                            },
                            {
                                type: 'Q',
                                render: () => (
                                    <div>
                                        <span className="Q">Q</span> Question
                                    </div>
                                ),
                            },
                            {
                                type: 'H',
                                render: () => (
                                    <div>
                                        <span className="H">H</span> Hypothesis
                                    </div>
                                ),
                            },
                        ]}
                        value={type}
                        onChange={this.onUpdateState('type')}
                    />
                    <div className="Field">
                        <div className="Label">In Response To</div>
                        <Select
                            styles={customStyles}
                            classNamePrefix="Select"
                            defaultValue={Posts[0]}
                            placeholder="Select In Response To..."
                            getOptionValue={item => item.id}
                            getOptionLabel={item => (
                                <div className="Type">
                                    <span className={item.type}>
                                        {item.type}
                                    </span>{' '}
                                    {item.title}
                                </div>
                            )}
                            options={Posts}
                            isClearable
                            isSearchable
                        />
                    </div>
                    <div className="Field">
                        <div className="Label">Expertise</div>
                        <Select
                            styles={{
                                control: provided => ({
                                    ...provided,
                                    width: 200,
                                }),
                            }}
                            classNamePrefix="Select"
                            defaultValue={{ value: 'ocean', label: 'Science' }}
                            name="color"
                            options={[
                                { value: 'ocean', label: 'Science' },
                                { value: 'ocean1', label: 'Physics' },
                                { value: 'ocean2', label: 'Mathematics' },
                            ]}
                            isClearable
                            isSearchable
                        />
                    </div>
                    <div className="Field">
                        <div className="Label">Hypothesis Title</div>
                        <input placeholder="Hypothesis" />
                    </div>
                    <div className="Field Multi">
                        <div className="Label">Citations</div>
                        <Select
                            classNamePrefix="Select"
                            defaultValue={{ value: 'ocean', label: 'Ocean' }}
                            isClearable="true"
                            isSearchable="true"
                            name="color"
                            options={[
                                { value: 'ocean1', label: 'Ocean' },
                                { value: 'ocean2', label: 'Ocean' },
                                { value: 'ocean3', label: 'Ocean' },
                                { value: 'ocean4', label: 'Ocean' },
                            ]}
                        />
                    </div>
                    <div className="Field">
                        <div className="Label">Summary</div>
                        <input placeholder="Summary" />
                    </div>
                    <div className="Field">
                        <div className="Label">Hypothesis</div>
                        <input placeholder="Hypothesis" />
                    </div>
                </div>
            </div>
        );
    }
}

export default Create;
