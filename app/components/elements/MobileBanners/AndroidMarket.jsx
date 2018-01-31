import React, {Component, PropTypes} from "react";
import settings from './settings'
import tt from 'counterpart';


export default class AndroidMarket extends Component {

    render() {
        if(process.env.BROWSER)
        {
            let language = (localStorage.getItem('language')) 
            let imgsrc
            if(language == 'ru')
                imgsrc = settings.android.img_url_ru
            else
                imgsrc = settings.android.img_url

            return <a href={settings.android.market_source + "&utm_source=" + settings.android.utm_source + "&utm_campaign=" + settings.android.utm_campaign +"&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"}><img alt={tt('about_jsx.mobileBannerAlt')} src={imgsrc}/></a>    
        } else return null
    }
}
