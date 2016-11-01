
import React from 'react'
import transaction from 'app/redux/Transaction'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import {PrivateKey} from 'shared/ecc'
import {key_utils} from 'shared/ecc'
import Apis from 'shared/api_client/ApiInstances'
import {cleanReduxInput} from 'app/utils/ReduxForms'
import { translate, translateHtml } from '../../Translator';
import { FormattedHTMLMessage } from 'react-intl';

import
class changeAccountMeta extends React.Component {
  static propTypes = {
      // HTML properties
      username: string,
      password: string,
      key: string,
      value: string,
      meta: string,
  }
  consctructor(){
    super(props)
    this.state = {accountName: props.username, generated: false}
  //  this.onNameChange = this.onNameChange.bind(this)
  //  this.generateWif = this.generateWif.bind(this)
  }
  dispatchSubmit = () => {
  render(){
    return
      <span className="changeAccountMeta"><form onSubmit={handleSubmit(() => {this.dispatchSubmit()})}>
			{/* tests area for current development */}
			<div className="column small-12">
				<input type="hidden" id="test-form-meta-key" value="upic"/>
				{/* external url */}
				<input type="hidden" id="test-form-meta-value" value="https://cyber.fund/images/cyberFund.svg"/>
				<input type="hidden" id="test-form-usernmae" value="tort"/>
				<input type="password" id="test-form-password" disabled={loading}/>
				<button onClick={this.testFormSubmit.bind(this)} disabled={loading} className="red">X X X X X</button>
			</div>
    </form></span>
  }
}

export default reduxForm(
    { form: 'changeAccountMeta', fields: ['password', 'key', 'value'] },
    // mapStateToProps
    (state, ownProps) => {
        //const {authType} = ownProps
        //const enable2fa = authType == null
        return {
            ...ownProps, enable2fa,
            validate: keyValidate,
            initialValues: {twofa: false, password: ownProps.defaultPassword},
        }
    },
    // mapDispatchToProps
    dispatch => ({
        changeAccountMeta: (
             meta, accountName, signingKey,success, error
        ) => {

            dispatch(transaction.actions.broadcastOperation(
                {type: 'update_account_meta',
                operation: {json_meta: meta, account_name: accountName},
            }))
        }
    })
)(changeAccountMeta)
