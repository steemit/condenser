import React, {Component, PropTypes} from "react";
import settings from './settings'
import tt from 'counterpart';


export default class AndroidMarket extends Component {

    componentWillMount(){
        if(process.env.BROWSER){
            let language = localStorage.getItem('language')
            language = language ? language : (window.navigator.userLanguage || window.navigator.language)
            this.setState({language: language})
        }
    }

    render() {
        let {language} = this.state
        let imgsrc = (language == 'ru') ? settings.android.img_url_ru : settings.android.img_url
            return <a href={settings.android.market_source + "&utm_source=" + settings.android.utm_source + "&utm_campaign=" + settings.android.utm_campaign +"&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"}><img alt={tt('about_jsx.mobileBannerAlt')} src={imgsrc}/></a>
    }
}
