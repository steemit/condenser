
function send(target) {
    if (process.env.BROWSER) {
        if (window.ga) {
            if (target === 'SUCCESS_REG') {
                window.ga('send', 'pageview', `/SUCCESS_REG1`)
                window.ga('send', 'pageview', `/SUCCESS_REG2`)
                window.ga('send', 'pageview', `/SUCCESS_REG3`)
                window.ga('send', 'pageview', `/SUCCESS_REG4`)
            } else {
                window.ga('send', 'pageview', `/${target}`)
            }
        }
        if (window.yaCounter41829924) {
            window.yaCounter41829924.reachGoal(target)
        }
    }
}

export function successReg() {
    send('SUCCESS_REG')
}

export function popupClickButton() {
    send('POPUP_CLICK_BUTTON')
}

export function popupClickUrl() {
    send('POPUP_CLICK_URL')
}

export function buttonClick() {
    send('BUTTON_CLICK')
}
