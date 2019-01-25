import React, { Component } from 'react';

import Input from 'app/components/pages/_Common/Input';
import { DropDown } from 'app/components/pages/_Common';

import orcID from 'assets/images/static/ORCID_logo.png';
import linkedIn from 'assets/images/static/linkedin_logo.png';

const basicInputs = [
  {
    key: 'firstName',
    type: 'Input',
    label: 'First Name',
    placeholder: 'John',
  },
  {
    key: 'lastName',
    type: 'Input',
    label: 'Last Name',
    placeholder: 'Smith',
  },
  {
    key: 'title',
    type: 'Input',
    label: 'Title',
    placeholder: 'Founder of the Company',
  },
];

const academicLevelInputs = [
  {
    key: 'highestObtainedEducation',
    type: 'Select',
    label: 'Highest Obtained Education',
    placeholder: 'Bachelors',
    data: [
      {
        label: 'No Degree',
        value: 'N.D',
      },
      {
        label: 'Bachelors',
        value: 'B.A',
      },
      {
        label: 'Masters',
        value: 'M.S',
      },
      {
        label: 'Doctorate',
        value: 'D.R',
      },
    ],
  },
  {
    key: 'schoolName',
    type: 'Input',
    label: 'School Name',
    placeholder: 'Oxford',
    childs: {
      key: 'degreeObtained',
      label: 'Degree Obtained',
      addKey: 'Degree',
    },
  },
  {
    key: 'academicDirectoryLink',
    type: 'Input',
    label: 'Academic Directory Link',
    placeholder: 'ucdavis.edu/john.smith',
  },
];

const expertiseInputs = [
  {
    key: 'expertiseType',
    type: 'Select',
    label: 'Select All Expertises',
    placeholder: 'Mathematics',
    levels: true,
    data: [
      {
        label: 'English',
        value: 'english',
      },
      {
        label: 'Mathematics',
        value: 'math',
      },
      {
        label: 'Computer',
        value: 'computer',
      },
      {
        label: 'Physics',
        value: 'physics',
      },
    ],
    childs: {
      key: 'expertiseTypes',
      label: 'Expertise',
      addKey: 'Expertise',
    },
  },
  {
    key: 'proofOfExpertise',
    type: 'Input',
    label: 'Proof Of Expertise',
    placeholder: 'www.proof.com/john.smith',
    childs: {
      key: 'proofOfExpertised',
      label: 'Proof Of Expertised',
      addKey: 'Proof',
    },
  },
];

const externalProfilesInputs = [
  {
    key: 'orcID',
    type: 'Image',
    image: orcID,
  },
  {
    key: 'linkedIn',
    type: 'Image',
    image: linkedIn,
  },
  {
    key: 'otherProfiles',
    type: 'Input',
    label: 'Other Profiles',
    placeholder: 'www.john.smith.com',
    childs: {
      key: 'otherProfileLinks',
      label: 'Other Profile',
      addKey: 'Link',
    },
  },
];

const fileds = [
  [
    {
      title: 'Basic Info',
      inputs: basicInputs,
    },
    {
      title: 'Academic Level',
      inputs: academicLevelInputs,
    },
  ],
  [
    {
      title: 'Expertise',
      inputs: expertiseInputs,
    },
  ],
  [
    {
      title: 'External Profiles',
      inputs: externalProfilesInputs,
    },
  ],
];

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // loading: true,
      firstName: '',
      lastName: '',
      title: '',
      highestObtainedEducation: null,
      schoolName: '',
      degreeObtained: ['B.A. English', 'D.R. Computer'],
      academicDirectoryLink: '',
      proofOfExpertise: '',
      proofOfExpertised: ['www.proof.com/john.smith'],
      otherProfiles: '',
      otherProfileLinks: [],
      expertiseType: null,
      expertiseTypes: [],
      expertiseLevel: 7,
    };
  }

  onFiledChange(key) {
    return e => {
      this.setState({
        [key]: e.target.value,
      });
    };
  }

  render() {
    return (
      <div className="SettingsWrapper">
        <div className="Title">Settings Page</div>
        <div className="SettingInputs">
          {fileds.map((row, fIndex) => (
            <div className="InputRow" key={fIndex}>
              {row.map((inputs, rIndex) => (
                <div className="Inputs" key={rIndex}>
                  <div className="Title">{inputs.title}</div>
                  {inputs.inputs.map((info, index) => (
                    <div className="Field" key={index}>
                      {info.type === 'Input' && (
                        <Input
                          label={info.label}
                          placeholder={info.placeholder}
                          onChange={this.onFiledChange(info.key)}
                          autoComplete="on"
                          refer={info.key}
                          required
                          value={this.state[info.key]}
                        />
                      )}
                      {info.type === 'Select' && (
                        <div className="DropDownLabel">
                          <div className="Label">{info.label}</div>
                          <DropDown
                            valueKey="value"
                            defaultValue={info.placeholder}
                            value={this.state[info.key]}
                            options={info.data}
                            onChange={value =>
                              this.setState({
                                [info.key]: value,
                              })
                            }
                          />
                        </div>
                      )}
                      {info.type === 'Image' && (
                        <div
                          className={`ImageButton ${
                            this.state[info.key] ? 'Active' : ''
                          }`}
                          onClick={e =>
                            this.setState({
                              [info.key]: !this.state[info.key],
                            })
                          }
                        >
                          <img src={info.image} alt={info.key} />
                        </div>
                      )}
                      {info.levels && (
                        <div className="Levels">
                          <div className="Label">
                            {info.childs.addKey} Level
                          </div>
                          <div className="LevelSelect">
                            {new Array(10).fill(1).map((key, lIndex) => (
                              <div
                                className={
                                  lIndex + 1 === this.state.expertiseLevel
                                    ? 'Active'
                                    : ''
                                }
                                onClick={e =>
                                  this.setState({
                                    expertiseLevel: lIndex + 1,
                                  })
                                }
                                key={lIndex}
                              >
                                {lIndex + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {info.childs && (
                        <div className="Childs">
                          {(this.state[info.childs.key] || []).map(
                            (child, cIndex) => (
                              <div key={cIndex}>
                                <Input
                                  label={info.childs.label}
                                  value={child}
                                  onChange={e => {
                                    const childs = this.state[info.childs.key];
                                    childs[cIndex] = e.target.value;
                                    this.setState({
                                      [info.childs.key]: childs,
                                    });
                                  }}
                                />
                              </div>
                            )
                          )}
                          <button
                            className="Button Black"
                            onClick={e => {
                              const childs = this.state[info.childs.key];
                              childs.push(`New ${info.childs.addKey}`);
                              this.setState({
                                [info.childs.key]: childs,
                              });
                            }}
                          >
                            {`Add ${info.childs.addKey} +`}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

module.exports = {
  path: '/@:username/settings',
  component: Settings,
};
