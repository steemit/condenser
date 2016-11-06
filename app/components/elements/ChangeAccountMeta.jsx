import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';

// change it field by field
class ChangeAccountMeta extends Component {
  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="metaKey">meta key</label>
          <Field name="metaKey" component="input" type="text"/>
        </div>
        <div>
          <label htmlFor="metaValue">meta value</label>
          <Field name="metaValue" component="input" type="email"/>
        </div>
        <div>
          <label htmlFor="passord">First Name</label>
          <Field name="password" component="input" type="password"/>
        </div>
        <button type="submit">Submit</button>
      </form>
    );
  }
}

// Decorate the form component
ChangeAccountMeta = reduxForm({
  form: 'changeAccountMeta' // a unique name for this form
})(ChangeAccountMeta);
