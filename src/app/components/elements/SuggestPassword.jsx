/* eslint react/prop-types: 0 */
import React from 'react'
import {connect} from 'react-redux'
import {renderToString} from 'react-dom/server'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import Icon from 'app/components/elements/Icon'
import tt from 'counterpart';
import { APP_NAME, APP_ICON } from 'app/client_config';
import {key_utils} from 'steem/lib/auth/ecc';


const {bool} = React.PropTypes
export const steemitCannotRecoverPasswords = tt('suggestpassword_jsx.APP_NAME_cannot_recover_passwords_keep_this_page_in_a_secure_location')

class SuggestPassword extends React.Component {
    static propTypes = {
        print: bool,
    }
    componentWillMount() {
        const {suggestedPassword, createSuggestedPassword} = this.props
        if(!suggestedPassword)
            createSuggestedPassword()
    }
    shouldComponentUpdate = shouldComponentUpdate(this, 'SuggestPassword')
    componentDidUpdate() {
        const {print} = this.props
        if(print && !this.printed) {
            this.printed = true
            window.print()
        }
    }
    render() {
        const {suggestedPassword} = this.props
        const render = print =>
            <span className="SuggestPassword">
                <Icon name={APP_ICON} size="2x" /> {APP_NAME}
                <hr />
                <div>
                    <h5>{print ? tt('suggestpassword_jsx.APP_NAME_password_backup', {APP_NAME}) : tt('suggestpassword_jsx.APP_NAME_password_backup_required', {APP_NAME})}</h5>
                    {steemitCannotRecoverPasswords}
                </div>
                <br />
                <div>
                    {print && <div>
                        <label>{tt('g.username')}</label>
                        <div>
                            <code><u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></code>
                        </div>
                    </div>}
                    {!print && <div>{tt('suggestpassword_jsx.after_printing_write_down_your_user_name')}.</div>}
                </div>
                <br />
                <div>
                    {!print && <a onClick={() => openPP(render(true))}>
                        <Icon name="printer" size="3x" />&nbsp;{tt('g.print')}&nbsp;&nbsp;
                        <br />
                        <br />
                    </a>}
                    <label>{tt('g.password')}</label>
                    <div className="overflow-ellipsis">
                        <code>{suggestedPassword}</code>
                    </div>
                </div>
            </span>
        return render()
    }
                // <p>
                //     <label>Password (again)</label>
                //     {print && <br />}
                //     {suggestedPassword && <QRCode text={suggestedPassword} />}
                // </p>
}
function openPP(el) {
    const yourDOCTYPE = "<!DOCTYPE html>"
    const printPreview = window.open('about:blank', 'print_preview', "resizable=yes,scrollbars=yes,status=yes")
    const printDocument = printPreview.document
    printDocument.open()
    printDocument.write(`
        ${yourDOCTYPE}
        <html>
            ${renderToString(el)}
            <script>window.print()</script>
        </html>`
    )
    printDocument.close()
}
export default connect(
    // mapStateToProps
    (state, ownProps) => {
        return {
            ...ownProps,
            suggestedPassword: state.getIn(['global', 'suggestedPassword']),
        }
    },
    // mapDispatchToProps
    dispatch => ({
        createSuggestedPassword: () => {
            const PASSWORD_LENGTH = 32
            const private_key = key_utils.get_random_key()
            const suggestedPassword = private_key.toWif().substring(3, 3 + PASSWORD_LENGTH)
            dispatch({type: 'global/SET', payload: {key: 'suggestedPassword', value: suggestedPassword}})
        },
    })
)(SuggestPassword)
