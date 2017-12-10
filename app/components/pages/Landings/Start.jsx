import React from 'react';
import Icon from '../../elements/Icon'
import ReactTooltip from 'react-tooltip'
import CTABlock from '../../elements/CTA/ctaBlock'

class Start extends React.Component {

    constructor() {
        super();
        this.state = {
            simple: true
        }
        this.toggleAnswer = this
            .toggleAnswer
            .bind(this);
    }

    toggleAnswer(e, answr) {
        e.preventDefault()
        this.setState({simple: answr})
    }

    render() {

        let {simple} = this.state
        let simpleAnswer = <p className='landing-start-block-text'>
            <b>{'Golos.io '}</b>
            — это блог-платформа на <span data-tip='Блокчейн — распределенная база данных'>блокчейне <ReactTooltip type='light' effect="solid" /></span>, где
            пользователи могут публиковать записи и голосовать за понравившиеся статьи.
            Голосуя за понравившуюся статью, они вознаграждают ее своими «голосами», которые
            можно перевести в реальные деньги.
        </p>

        let difAnswer = <p className='landing-start-block-text'>
            Каждый день мы отдаем все <span data-tip='Майнинг — деятельность по поддержанию блокчейна'>намайненое <ReactTooltip type='light' effect="solid" /> </span> в пул вознаграждения авторов. Он распределяется в зависимости от количества
            «голосов» пользователей под каждой публикацией.
        </p>

        return (
            <div className='landing-start'>
                <div className='landing-start-block'>
                    <div className='column large-12 medium-12 small-12'>
                        <h1>Golos.io</h1>
                        <h2>Блог-платформа следующего поколения</h2>
                    </div>
                    <div className='row'>
                        <div className='column small-12 medium-6 large-6'>
                            <div>
                                <iframe
                                    width="100%"
                                    height="220"
                                    src="https://www.youtube.com/embed/8a0TPACOu2k"
                                    frameBorder="0"
                                    allowFullScreen/>
                            </div>
                        </div>
                        <div className='column small-12 medium-6 large-6'>
                            <p className='landing-start-block-title-text'>Пишите, фотографируйте, комментируйте и получайте
                                <span
                                    data-tip='Токены, которыми вознаграждаются посты, можно перевести в любую мировую валюту.'> вознаграждение</span><ReactTooltip type='light' effect="solid" /> за любое действие</p>
                            <a href="/create_account" className="button">Создать аккаунт</a>
                        </div>
                    </div>
                </div>
                <div className='landing-start-block'>
                    <div className='column large-12 medium-12 small-12'>
                        <h2>Как это работает?</h2>
                        <div className='column large-12 medium-12 small-12'>
                            <hr/>
                        </div>
                        <div className='column large-12 medium-12 small-12'>
                            <div className='row'>
                                <div className='column large-12 medium-12 small-12'>
                                    <h3>
                                        <a
                                            className={simple
                                            ? ''
                                            : 'active'}
                                            href='#'
                                            onClick={(e) => this.toggleAnswer(e, true)}>Простой ответ</a>
                                        {' / '}
                                        <a
                                            className={simple
                                            ? 'active'
                                            : ''}
                                            href='#'
                                            onClick={(e) => this.toggleAnswer(e, false)}>Сложный ответ</a>
                                    </h3>
                                </div>
                                <div className='column large-12 medium-12 small-12'>
                                    {simple
                                        ? simpleAnswer
                                        : difAnswer}
                                </div>
                                <div className='landing-start-block-center column large-12 medium-12 small-12'>
                                    <a href="/create_account" className="button">Создать аккаунт</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='landing-start-block'>
                    <div className='column large-12 medium-12 small-12'>
                        <div className='row'>

                            <div className='column large-3 medium-3 small-6'>
                                <Icon name='team' size='10x'/>
                                <h5>Социальная значимость</h5>
                                <p className='landing-start-block-icon-text'>Наше сообщество ценит мнения, истории и творческий контент.</p>
                            </div>
                            <div className='column large-3 medium-3 small-6'>
                                <Icon name='money' size='10x'/>
                                <h5>Выгодно для блогинга</h5>
                                <p className='landing-start-block-icon-text'>Мы вознаграждаем как авторов, так и
                                    читателей — тех, кто оценивает и комментирует публикации</p>

                            </div>
                            <div className='column large-3 medium-3 small-6'>
                                <Icon name='rocket' size='10x'/>
                                <h5>В интересах каждого</h5>
                                <p className='landing-start-block-icon-text'>Писать можно обо всем на свете —
                                    расскажите о ракетостроении или выложите фотографию любимого кота</p>

                            </div>
                            <div className='column large-3 medium-3 small-6'>
                                    <Icon name='blockchain' size='10x'/>
                                <h5>Инновационная модель</h5>
                                <p className='landing-start-block-icon-text'>Golos.io работает на блокчейне, а
                                    значит информация пользователей принадлежит только им</p>

                            </div>

                            <div className='landing-start-block-center column large-12 medium-12 small-12'>
                                <a href="/create_account" className="button">Создать аккаунт</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='landing-start-block'>
                    <div className='column large-12 medium-12 small-12'>
                        <h2>О нас говорят</h2>
                        <div className='column large-12 medium-12 small-12'>
                            <hr/>
                        </div>
                        <div className='column large-12 medium-12 small-12'>
                            <div className='row'>
                                <div className='landing-start-person column large-3 medium-3 small-3'>
                                    <img
                                        className='landing-start-round-img'
                                        src='https://imgp.golos.io/120x120/https://images.golos.io/DQmQh3z15LkKqHcBUUfZedzed6Y263rvzJ9F7gn3beUgXrR/vv_ava.jpg'/>
                                    <p>
                                        <b>Познер Online</b>
                                    </p>
                                    <a href="/@pozneronline">@pozneronline</a>
                                </div>
                                <div className='column large-9 medium-9 small-9'>
                                    <p className='landing-start-block-text'>
                                        «Считаем «Голос» перспективным проектом и постараемся привлечь на него как можно
                                        больше пользователей»
                                    </p>
                                </div>
                                <div className='landing-start-block-center column large-12 medium-12 small-12'>
                                    <a href="/create_account" className="button">Создать аккаунт</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='landing-start-block'>
                    <div className='column large-12 medium-12 small-12'>
                        <h2>Зарегистрируйтесь,</h2>
                        <div className='row'>
                            <div className='column large-12 medium-12 small-12'>
                                <p className='landing-start-block-text reg landing-start-block-center'>чтобы
                                    начать делиться своими историями, подписываться на интересных авторов, оценивать
                                    публикации, знакомиться и получать вознаграждения</p>
                            </div>
                            <div className='landing-start-panel left column large-5 medium-5 small-12'>
                                <div className='row'>
                                    <div className='column large-2 medium-2 small-2'>
                                        <h1>1</h1>
                                    </div>
                                    <div className='column large-10 medium-10 small-10'>
                                        <h3 className=''>
                                            Регистрация<br/>
                                            бесплатна
                                        </h3>
                                    </div>
                                </div>
                            </div>
                            <div className='landing-start-panel right column large-5 medium-5 small-12'>
                                <div className='row'>
                                    <div className='column large-2 medium-2 small-2'>
                                        <h1>2</h1>
                                    </div>
                                    <div className='column large-10 medium-10 small-10'>
                                        <h3 className=''>
                                            Вознаграждаем
                                            <br/>с первой публикации
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='landing-start-block-center column large-12 medium-12 small-12'>
                        <a href="/create_account" className="button">Создать аккаунт</a>
                    </div>
                </div>
                <div className='landing-start-block'>
                    <div className='column large-12 medium-12 small-12'>
                        <h2>Остались вопросы?</h2>
                        <div className='column large-12 medium-12 small-12'>
                            <hr/>
                        </div>
                        <div className='row'>
                            <div className='column large-12 medium-12 small-12'>
                                <p className='landing-start-block-text landing-start-block-center'>
                                    У нас есть собственная <a href='https://wiki.golos.io/'>Википедия</a>,
                                    со всей информацией про блог-платформу Golos.io. Кроме того, мы
                                    оперативно ответим на любой технический вопрос в нашей группе в <a href='https://t.me/golos_support'>Телеграме</a>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'start',
    component: Start
};
