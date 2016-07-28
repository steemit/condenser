/* eslint react/prop-types: 0 */
import React from 'react'
import {connect} from 'react-redux'
import {renderToString} from 'react-dom/server'
import g from 'app/redux/GlobalReducer'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import Icon from 'app/components/elements/Icon'
import {key_utils} from 'shared/ecc'

const {bool} = React.PropTypes
export const steemitCannotRecoverPasswords = 'Steemit cannot recover passwords.  Keep this page in a secure location, such as a fireproof safe or safety deposit box.'

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
                <Icon name="steem" size="2x" /> Steemit
                <hr />
                <div>
                    {print ? <h5>Steemit Password Backup</h5> : <h5>Steemit Password Backup (required)</h5>}
                    {steemitCannotRecoverPasswords}
                </div>
                <br />
                <div>
                    {print && <div>
                        <label>Username</label>
                        <div>
                            <code><u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></code>
                        </div>
                    </div>}
                    {!print && <div>After printing, write down your user name.</div>}
                </div>
                <br />
                <div>
                    {!print && <a onClick={() => openPP(render(true))}>
                        <Icon name="printer" size="3x" />&nbsp;Print&nbsp;&nbsp;
                        <br />
                        <br />
                    </a>}
                    <label>Password</label>
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
            suggestedPassword: state.global.get('suggestedPassword'),
        }
    },
    // mapDispatchToProps
    dispatch => ({
        createSuggestedPassword: () => {
            const PASSWORD_LENGTH = 32
            const private_key = key_utils.get_random_key()
            const suggestedPassword = private_key.toWif().substring(3, 3 + PASSWORD_LENGTH)
            dispatch(g.actions.set({key: 'suggestedPassword', value: suggestedPassword}))
        },
    })
)(SuggestPassword)