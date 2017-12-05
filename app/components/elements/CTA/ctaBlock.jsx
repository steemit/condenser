import React, {Component, PropTypes} from "react";
import { connect } from 'react-redux';
import Userpic from 'app/components/elements/Userpic';
import {parsePayoutAmount} from 'app/utils/ParsersAndFormatters';
import posts from './specialPostsList'


class CTABlock extends Component {

    static propTypes = {
        user: React.PropTypes.string.isRequired,
        post: React.PropTypes.string.isRequired,
        payout: React.PropTypes.number,
        visible: React.PropTypes.bool,
        isSpecial: React.PropTypes.string, 
    };

    constructor(props) {
        super(props);
    }    

    render() {
        let {user, post, payout, visible, isSpecial} = this.props
        
        let ctablock = <div className='ctablock'>
        <div className='row'>
            <div className=' column large-2 medium-2 small-2'>
                <Userpic account={user}/>   
            </div>
            <div className='column large-7 medium-7 small-7'>
                <p className='left cta-block-text'>
                   Сообщество Golos.io высоко оценило этот пост! <a href={'/@' + user}>{user}</a> заработал более {payout} рублей.<a href={'/start'}>Делитесь своими мыслями и получайте вознаграждение.</a> 
                </p>
            </div>
            <div className='column large-3 medium-3 small-3'>
                <a href="/create_account" className="button">Создать аккаунт</a>
            </div>
        </div>
        </div>

        return (
          visible ? ctablock : null
        )
    }
}


export default connect(
    (state, ownProps) => {
        const post = state.global.getIn(['content', ownProps.post])
        if (!post) return ownProps
        
        let current_account = state.user.get('current')
        let user = post.get('author')

        let link = post.get('category') + '/@' + user + '/' + post.get('permlink')

        function compareLinks(specialLink, incomingLink) {
            return specialLink == incomingLink;
        }

        function isSpecialPost(array, link){
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                if(compareLinks(array[index], link)){
                    return  array[index]
                    break;
                } else return null
            }
        }

        let isSpecial = isSpecialPost(posts.posts, link)
        let pending_payout = parsePayoutAmount(post.get('pending_payout_value'))
        let total_author_payout = parsePayoutAmount(post.get('total_payout_value'))
        let total_curator_payout = parsePayoutAmount(post.get('curator_payout_value'))

        let payout = ((pending_payout + total_author_payout + total_curator_payout)/1000|0)*1000
        let visible = (current_account == null) && ((payout >= 2000) || isSpecial != null)

        return {
            post: ownProps.post,
            user, 
            payout,
            visible,
            isSpecial
        }
    }
)(CTABlock)