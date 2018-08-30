import React, {Component} from 'react'
import Button from '@elements/Button';

class LeavePage extends Component {
    goBack = () => {
        this.props.router.goBack()
    }

    leaveOut = target => () => {
        window.location.assign(target)
    }

    render() {
        const targetPage = this.props.location.search.slice(1)
        return (
            <div className="leave-page" style={{ backgroundImage: 'url(images/leave-bg.svg)' }}>
                <div className="leave-page_content row medium-7 large-7">
                    <div className="column">
                        <h4>
                            Вы покидаете <a href="https://golos.io/" target="_blank">Golos.io</a>
                        </h4>
                        <p>
                            Вы кликнули на ссылку, ведущую на внешний ресурс, и покидаете блог-платформу <a href="https://golos.io/" target="_blank">Golos.io</a>.
                        </p>
                        <p>
                            Ссылка, на которую вы кликнули, переведет вас по адресу: <strong>{targetPage}</strong></p>
                        <p>
                            <a href="https://golos.io/" target="_blank">Golos.io</a> не имеет никакого отношения к сайту, расположенному по ссылке выше, и не может гарантировать вам безопасность его использования. Сайты с закрытым исходным кодом могут содержать вредоносные скрипты и использовать мошеннические схемы.
                        </p>
                        <p>
                            Рекомендуем вам не переходить по ссылке, если у вас нет серьезных оснований доверять внешнему ресурсу. Помните, что активный ключ вашего аккаунта на <a href="https://golos.io/" target="_blank">Golos.io</a> не может быть восстановлен, а доступ к нему позволит мошенникам завладеть всеми вашими средствами.
                        </p>
                        <p className="text-center medium-text-left">
                            <Button round onClick={this.goBack}>
                                Вернуться на Golos.io
                            </Button>
                            <Button type="secondary" onClick={this.leaveOut(targetPage)} round>
                                Перейти по ссылке
                            </Button>
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}

export default {
    path: 'leave_page',
    component: LeavePage
};
