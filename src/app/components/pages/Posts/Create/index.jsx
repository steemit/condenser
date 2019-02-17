import React, { Component } from 'react';
import Select from 'react-select';

import { browserHistory } from 'react-router';
import ReplyEditor from 'app/components/Steemit/elements/ReplyEditor';
import { SUBMIT_FORM_ID } from 'shared/constants';

import TypeSelector from 'app/components/pages/_Common/TypeSelector';

const formId = SUBMIT_FORM_ID;
const SubmitReplyEditor = ReplyEditor(formId);

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
      type: 'Qu',
    };

    this.success = (/*operation*/) => {
      // const { category } = operation
      localStorage.removeItem('replyEditorData-' + formId);
      browserHistory.push('/created'); //'/category/' + category)
    };
  }

  onUpdateState(key) {
    return value =>
      this.setState({
        [key]: value,
      });
  }

  render() {
    const { type, node } = this.props;
    const typeString = getTypeString(type);

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
                    <span className="Ob">Ob</span> Observation
                  </div>
                ),
              },
              {
                type: 'Qu',
                render: () => (
                  <div>
                    <span className="Q">Qu</span> Question
                  </div>
                ),
              },
              {
                type: 'Hy',
                render: () => (
                  <div>
                    <span className="H">Hy</span> Hypothesis
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
              defaultValue={node}
              placeholder="Select In Response To..."
              getOptionValue={item => item.id}
              getOptionLabel={item => (
                <div className="Type">
                  <span className={item.type}>{item.type}</span> {item.title}
                </div>
              )}
              options={[node]}
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
            <div className="Label">{typeString} Title</div>
            <input placeholder={typeString} />
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
            <textarea placeholder="Summary" rows={5} />
          </div>
          <div className="Field">
            <div className="Label">{typeString}</div>
            <SubmitReplyEditor
              type="submit_story"
              typePlace={typeString}
              successCallback={this.success}
            />
          </div>
        </div>
      </div>
    );
  }
}

function getTypeString(type) {
  let ret = '';
  switch (type) {
    case 'Qu':
      ret = 'Question';
      break;
    case 'Hy':
      ret = 'Hypothesis';
      break;
    default:
      ret = 'Observation';
  }
  return ret;
}

export default Create;
