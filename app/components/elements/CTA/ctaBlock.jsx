import React, {Component, PropTypes} from "react";
import {connect} from 'react-redux';
import Userpic from 'app/components/elements/Userpic';
import {parsePayoutAmount} from 'app/utils/ParsersAndFormatters';
import LocalizedCurrency, {localizedCurrency} from 'app/components/elements/LocalizedCurrency';
import ctainfo from './ctainfo'

class CTABlock extends Component {

    static propTypes = {
        user: React.PropTypes.string.isRequired,
        post: React.PropTypes.string.isRequired,
        payout: React.PropTypes.number,
        visible: React.PropTypes.bool,
        isSpecial: React.PropTypes.object,
        currency: React.PropTypes.string
    };

    constructor(props) {
        super(props);
    }

    componentWillMount(){
        this.setState({loading: true} )
    }

    componentDidMount() {
        var self = this;
        setTimeout(() => {
          self.setState({loading: false}); }, 500);
      }

    render() {
        let {user, post, payout, visible, isSpecial, currency} = this.props
        let textBlock;

        if(isSpecial){
            textBlock = <p className='left cta-block-text-special'>
            {ctainfo.specialStartText} <b>{user}</b> {isSpecial.text}
           <a href={'/start'}> {isSpecial.specialEndText}</a>
           </p>
        }  else{
            textBlock = <p className='left cta-block-text-regular'>
            Сообщество <b>Golos.io</b> {ctainfo.regularStartText} <b>{user}</b>  заработал более <LocalizedCurrency amount={payout} rounding={true} noSymbol={true}/> {currency}.<a href={'/start'}> {ctainfo.regularEndText}</a>
        </p>
        }            

        let ctablock = <div className='ctablock'>
            <div className='row'>
                <div className=' column large-1 medium-1 small-1'>
                    <Userpic account={user}/>
                </div>
                <div className='column large-8 medium-8 small-8'>
                        {textBlock}
                </div>
                <div className='column large-3 medium-3 small-3'>
                    <a href="/create_account" className="button">Создать аккаунт</a>
                </div>
            </div>
        </div>

        if (this.state.loading)
            return null
        else
            return (visible
                ? ctablock
                : null)
    }
}

export default connect((state, ownProps) => {
    const post = state
        .global
        .getIn(['content', ownProps.post])
    if (!post) 
        return ownProps

    let current_account = state
        .user
        .get('current')
    let user = post.get('author')

    let link = post.get('category') + '/@' + user + '/' + post.get('permlink')

    function compareLinks(specialLink, incomingLink) {
        return specialLink === incomingLink;
    }

    function isSpecialPost(array, link) {
        for (let i = 0; i < array.length; i++) {
            if (compareLinks(array[i].link, link)) {
                return array[i]
            }
        }
    }

    let currentCurrency = localStorage.getItem('xchange.picked')
    let showMinCurrency, currency;
    
    if (currentCurrency && currentCurrency == 'RUB'){
        showMinCurrency = ctainfo.minRubValueToShow
        currency = ctainfo.rub
    }
    else {
        showMinCurrency = ctainfo.minUsdValueToShow 
        currency = ctainfo.usd
    } 
        
    let isSpecial = isSpecialPost(ctainfo.specialLinks, link)

    let pending_payout = parsePayoutAmount(post.get('pending_payout_value'))
    let total_author_payout = parsePayoutAmount(post.get('total_payout_value'))
    let total_curator_payout = parsePayoutAmount(post.get('curator_payout_value'))

    let payout = (pending_payout + total_author_payout + total_curator_payout)
    let localizedPayoutValue = localizedCurrency(payout, {noSymbol: true, rounding: true})

    let visible = (current_account == null) && (localizedPayoutValue >= showMinCurrency || isSpecial != null)

    return {post: ownProps.post, user, payout, visible, isSpecial, currency}
})(CTABlock)