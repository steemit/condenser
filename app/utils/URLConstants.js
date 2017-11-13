export function getURL(type) {
    let url = 'https://'
    const APP_DOMAIN = $STM_Config.site_domain

    switch (type) {
        case 'WIKI_URL':
            url +=  'wiki.golos.io' //`wiki.${APP_DOMAIN}/`
            break
        
        case 'LANDING_PAGE_URL':
            url += `${APP_DOMAIN}/about`
            break
            
        case 'TERMS_OF_SERVICE_URL':
            url += `${APP_DOMAIN}/legal/terms_of_service.pdf`
            break
        
        case 'PRIVACY_POLICY_URL':
            url += `${APP_DOMAIN}/ru--konfidenczialxnostx/@golos/politika-konfidencialnosti`
            break
        
        case 'WHITEPAPER_URL':
            url += `${APP_DOMAIN}/ru--golos/@golos/golos-russkoyazychnaya-socialno-mediinaya-blokchein-platforma`
            break
        
        case 'SALE_AGREEMENT_URL':
            url += `${APP_DOMAIN}/ru--golos/@golos/dogovor-kupli-prodazhi-tokenov-sila-golosa` 
            break
        
        case 'MARKDOWN_STYLING_GUIDE':
             url += `${APP_DOMAIN}/ru--golos/@on0tole/osnovy-oformleniya-postov-na-golose-polnyi-kurs-po-rabote-s-markdown`
             break

        default:
            url += APP_DOMAIN
    }

    return url
}