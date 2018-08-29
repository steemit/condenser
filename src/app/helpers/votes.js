import tt from 'counterpart';
import DialogManager from 'app/components/elements/common/DialogManager';

export async function confirmVote(prevVote, percent) {
    // Maybe need add condition (prevVote.weight > 0)
    if (prevVote) {
        let action;

        if (prevVote.percent > 0) {
            if (percent === 0) {
                action = tt('voting_jsx.removing_your_vote');
            } else if (percent < 0) {
                action = tt('voting_jsx.changing_to_a_downvote');
            }
        } else if (prevVote.percent < 0) {
            if (percent > 0) {
                action = tt('voting_jsx.changing_to_an_upvote');
            }
        }

        if (action) {
            if (
                !(await DialogManager.confirm(
                    action + tt('voting_jsx.we_will_reset_curation_rewards_for_this_post')
                ))
            ) {
                return false;
            }
        }
    }

    return true;
}
