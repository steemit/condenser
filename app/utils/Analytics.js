
function send(target) {
    if (process.env.BROWSER) {
        if (window.ga) {
            switch(target) {
                case 'POPUP_CLICK_BUTTON': 
                    window.ga('send', 'pageview', '/POPUP_CLICK_BUTTON')
                    window.ga('send', 'pageview', '/SUCCESS_REG2')
                break

                case 'POPUP_CLICK_URL':
                    window.ga('send', 'pageview', '/POPUP_CLICK_URL')
                    window.ga('send', 'pageview', '/SUCCESS_REG3')
                break

                case 'BUTTON_CLICK':
                    window.ga('send', 'pageview', '/BUTTON_CLICK')
                    window.ga('send', 'pageview', '/SUCCESS_REG4')
                break

                default:
                    window.ga('send', 'pageview', '/SUCCESS_REG1')
            }
        }
        if (window.yaCounter41829924) {
            window.yaCounter41829924.reachGoal(target)
            window.yaCounter41829924.reachGoal('SUCCESS_REG')
        }
        localStorage.removeItem('_atarget')
    }
}

export function successReg() {
    const target = localStorage.getItem('_atarget')
    if (target) {
        send(target)
    }
}

export function popupClickButton() {
    localStorage.setItem('_atarget', 'POPUP_CLICK_BUTTON')
}

export function popupClickUrl() {
    localStorage.setItem('_atarget', 'POPUP_CLICK_URL')
}

export function buttonClick() {
    localStorage.setItem('_atarget', 'BUTTON_CLICK')
}
