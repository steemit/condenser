import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
// import PropTypes from 'prop-types';

if (typeof document !== 'undefined') {
  var MediumEditor = require('medium-editor'); // eslint-disable-line
}

class HighLight extends Component {
  state = {
    staticOptions: {
      // disableEditing: true,
      toolbar: {
        allowMultiParagraphSelection: true,
        buttons: [
          {
            name: 'h1',
            action: this.onAction('Ob'),
            aria: 'Create New Observation',
            tagNames: ['h2'],
            contentDefault: '<b>Ob</b>',
            classList: ['Button', 'Ob'],
          },
          {
            name: 'h2',
            action: this.onAction('Qu'),
            aria: 'Create New Question',
            tagNames: ['h2'],
            contentDefault: '<b>Qu</b>',
            classList: ['Button', 'Qu'],
          },
          {
            name: 'h3',
            action: this.onAction('Hy'),
            aria: 'Create New Hypothesis',
            tagNames: ['h2'],
            contentDefault: '<b>Hy</b>',
            classList: ['Button', 'Hy'],
          },
        ],
        standardizeSelectionStart: true,
        disableEditing: true,
      },
    },
  };

  componentDidMount() {
    // const dom = ReactDOM.findDOMNode(this); // eslint-disable-line
    this.medium = new MediumEditor( // eslint-disable-line
      '#HighLightWrapper',
      Object.assign(this.state.staticOptions, this.props.options || {})
    );
  }

  componentWillUnmount() {
    this.medium.destroy();
  }

  onAction(type) {
    return options => {
      const selection = options.contentWindow.getSelection();
      if (selection.type === 'None') return;
      const start = Math.min(selection.baseOffset, selection.focusOffset);
      const offset = selection.baseOffset + selection.focusOffset - start * 2;
      const highLight = {};
      if (selection.anchorNode && selection.anchorNode.data) {
        highLight.anchorText = selection.anchorNode.data.substr(start, offset);
        highLight.data = selection.anchorNode.data;
        highLight.offset = {
          baseOffset: selection.baseOffset,
          focusOffset: selection.focusOffset,
        };
        this.props.onHighLight(type, selection, highLight);

        if (this.medium) {
          if (this.medium.isActive) {
            this.medium.destroy();
            this.medium = new MediumEditor( // eslint-disable-line
              '#HighLightWrapper',
              Object.assign(this.state.staticOptions, this.props.options || {})
            );
          } else {
            this.medium.setup();
          }
        }
      }
    };
  }

  render() {
    return (
      <div data-disable-editing id="HighLightWrapper">
        {this.props.children}
      </div>
    );
  }
}

export default HighLight;
