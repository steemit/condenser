import React, {Component, PropTypes} from "react";
import settings from './settings'
import tt from 'counterpart';


export default class AndroidMarket extends Component {

    constructor(props) {
        super(props)
        this.state = {language: false}
    }


    componentDidMount(){
        if(process.env.BROWSER){
            let lang = localStorage.getItem('language')
            if (!lang){
                lang = ((navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage)
            }
            this.setState({language: lang})
        }
    }

    render() {
        let {language} = this.state
        if (!language) 
            return null
        else{
            let imgsrc = (language == 'ru' || language == 'ru-RU') ? settings.android.img_url_ru : settings.android.img_url
            return <a href={settings.android.market_source + "&utm_source=" + settings.android.utm_source + "&utm_campaign=" + settings.android.utm_campaign +"&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"}><img alt={tt('about_jsx.mobileBannerAlt')} src={imgsrc}/></a>    
        }
    }
}
