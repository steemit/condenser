import { fromJS, Map } from 'immutable';
import tt from 'counterpart';

export default function transactionErrorReducer(
    state,
    { payload: { operations, error, hideErrors, errorCallback } }
) {
    let errorStr = error.toString();
    let errorKey = 'Transaction broadcast error.';

    for (const [type] of operations) {
        switch (type) {
            case 'vote':
                if (errorStr.includes('uniqueness constraint')) {
                    errorKey = 'You already voted for this post';
                    console.error('You already voted for this post.');
                }
                break;
            case 'comment':
                if (errorStr.includes('maximum_block_size')) {
                    errorKey = 'Body is too big.';
                } else if (
                    errorStr.includes('You may only post once per minute')
                ) {
                    errorKey = 'You may only post once per minute.';
                } else if (errorStr === 'Testing, fake error') {
                    errorKey = 'Testing, fake error';
                }
                break;
            case 'transfer':
                if (errorStr.includes('get_balance')) {
                    errorKey = 'Insufficient balance.';
                }
                break;
            case 'withdraw_vesting':
                if (
                    errorStr.includes(
                        'Account registered by another account requires 10x ' +
                            'account creation fee worth of Steem Power'
                    )
                ) {
                    errorKey =
                        'Account requires 10x the account creation fee in Steem Power ' +
                        '(approximately 300 SP) before it can power down.';
                }
                break;
        }

        if (state.hasIn(['TransactionError', type + '_listener'])) {
            if (!hideErrors) {
                state = state.setIn(
                    ['TransactionError', type],
                    fromJS({ key: errorKey, exception: errorStr })
                );
            }
        } else {
            if (error.message) {
                // Depends on FC_ASSERT formatting
                // https://github.com/steemit/steemit.com/issues/222
                const err_lines = error.message.split('\n');

                if (err_lines.length > 2) {
                    errorKey = err_lines[1];
                    const txt = errorKey.split(': ');

                    if (txt.length && txt[txt.length - 1].trim() !== '') {
                        errorKey = errorStr = txt[txt.length - 1];
                    } else {
                        errorStr = `Transaction failed: ${err_lines[1]}`;
                    }
                }
            }

            if (errorStr.length > 200) {
                errorStr = errorStr.substring(0, 200);
            }

            if (errorKey.includes('Body is empty')) {
                errorKey = errorStr = tt('post_editor.empty_body_error');
            } else if (errorKey.includes('maximum_block_size')) {
                errorKey = errorStr = tt(
                    'post_editor.body_length_over_limit_error'
                );
            } else if (
                errorKey.includes('You may only comment once every 20 seconds')
            ) {
                errorKey = errorStr = tt(
                    'chain_errors.only_comment_once_every'
                );
            } else if (
                errorKey.includes('You may only post once every 5 minutes')
            ) {
                errorKey = errorStr = tt('chain_errors.only_post_once_every');
            } else if (
                errorKey.includes(
                    'Account exceeded maximum allowed bandwidth per vesting share'
                )
            ) {
                errorKey = errorStr = tt(
                    'chain_errors.exceeded_maximum_allowed_bandwidth'
                );
            } else if (
                errorKey.includes('You have already voted in a similar way')
            ) {
                errorKey = errorStr = tt('chain_errors.already_voted');
            } else if (errorKey.includes('Can only vote once every')) {
                errorKey = errorStr = tt('chain_errors.only_vote_once_every');
            }

            if (!hideErrors) {
                state = state.update('errors', errors => {
                    if (errors) {
                        return errors.set(errorKey, errorStr);
                    } else {
                        return Map({ [errorKey]: errorStr });
                    }
                });
            }
        }
    }

    if (errorCallback) {
        setTimeout(() => errorCallback(errorKey));
    }

    return state;
}
