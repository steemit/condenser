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
        allowMultiParagraphSelection: false,
        buttons: [
          {
            name: 'h1',
            action: this.onAction('create'),
            aria: 'Create Post',
            tagNames: ['h2'],
            contentDefault: '<b>Create</b>',
            classList: ['Button', 'CreatePost'],
          },
          {
            name: 'h2',
            action: this.onAction('share'),
            aria: 'Share',
            tagNames: ['h2'],
            contentDefault: '<b>Share</b>',
            classList: ['Button', 'Share'],
          },
          {
            name: 'h3',
            action: this.onAction('tweet'),
            aria: 'Tweet',
            tagNames: ['h2'],
            contentDefault: '<b>Tweet</b>',
            classList: ['Button', 'Tweet'],
          },
        ],
        standardizeSelectionStart: true,
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
        console.log(selection, JSON.stringify(highLight));

        if (type === 'create') {
          localStorage.setItem('high_light', JSON.stringify(highLight));
          location.href = '/submit.html';
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
