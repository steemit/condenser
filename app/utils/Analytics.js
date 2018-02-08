
function send(target) {
    if (process.env.BROWSER) {
        if (window.ga) {
            window.ga('send', 'pageview', target)
        }
    }
}

export function successReg() {
    send('/SUCCESS_REG')
}

export function popupClickButton() {
    send('/POPUP_CLICK_BUTTON')
}

export function popupClickUrl() {
    send('/POPUP_CLICK_URL')
}

export function buttonClick() {
    send('/BUTTON_CLICK')
}
