import React, { Component } from 'react';
import { connect } from 'react-redux'
// import HelpContent from 'app/components/elements/HelpContent';
import MobileBanners from 'app/components/elements/MobileBanners/MobileBanners';
import WelcomeSlider from 'app/components/elements/welcome/WelcomeSlider';

class Welcome extends Component {

    state = {
        tagsLoading: false,
        tagsActive: false,
        tagsCards: {},
    }

    slides = [
        { name: 'Дима Иванов', description: 'Ты еще не знаешь что такое Голос?..  Блуждаешь в океане интернет-информации и боишься попасться на крючок?.. Открой для себя Голос!!! Здесь все рыбы дружелюбны и важны!))'},
        { name: 'Дима Иванов', description: 'Ты еще не знаешь что такое Голос?..  Блуждаешь в океане интернет-информации и боишься попасться на крючок?.. Открой для себя Голос!!! Здесь все рыбы дружелюбны и важны!))'},
        { name: 'Дима Иванов', description: 'Ты еще не знаешь что такое Голос?..  Блуждаешь в океане интернет-информации и боишься попасться на крючок?.. Открой для себя Голос!!! Здесь все рыбы дружелюбны и важны!))'},
        { name: 'Дима Иванов', description: 'Ты еще не знаешь что такое Голос?..  Блуждаешь в океане интернет-информации и боишься попасться на крючок?.. Открой для себя Голос!!! Здесь все рыбы дружелюбны и важны!))'}
    ]

    tags = [
        {
            id: 1,
            name: 'Блокчейн',
            items: [
                { author: 'master-set', permlink: 'blokchein-tolkovyi-slovar-kriptovalyutnykh-terminov' },
                { author: 'aleco', permlink: 'kriptoinvestor-koshelki-dlya-ethereum-mist-vs-myetherwallet' },
                { author: 'forklog', permlink: 'hodl-volny-bitkoina-novyi-instrument-analiza-dannykh' }
            ]
        },
        {
            id: 2,
            name: 'Технологии',
            items: [
                { author: 'activist', permlink: 'ru-istoriya-razvitiya-tekhnologiij-dopolnennoij-i-virtualxnoij-realxnosti' },
                { author: 'teeves', permlink: 'mir-bez-rasstoyaniij-proizvodstvo-smeshchaetsya-k-potrebitelyu' },
                { author: 'prabaker', permlink: 'kvant-kotoryi-teper-eshyo-i-kompyuter-mnogabukaf' }
            ]
        },
        {
            id: 3,
            name: 'Культура',
            items: [
                { author: 'natabelu', permlink: 'andaluzskii-pyos-pyos-ego-znaet-o-chyom-etot-film' },
                { author: 'rblogger', permlink: 'vladimir-mayakovskii-v-stikhakh-i-pesnyakh' },
                { author: 'vp-painting', permlink: 'pikasso-szhiganie-kartin-i-konflikt-s-luvrom' }
            ]
        },
        {
            id: 4,
            name: 'История',
            items: [
                { author: 'ms-boss', permlink: 'dela-v-temnye-veka' },
                { author: 'vood.one', permlink: 'nacionalnaya-politika-aleksandra-ii-i-polnyi-bardak-v-voprose-brachnykh-otnoshenii' },
                { author: 'istfak', permlink: 'san-francisko-gorod-pokhoronennykh-korablei' }
            ]
        },
        {
            id: 5,
            name: 'Путешествия',
            items: [
                { author: 'nameless-berk', permlink: 'peresechenie-graniczy-yekvadora-s-bezhenczami-50-ottenkov-mrachnogo-i-neprivetlivogo-quito' },
                { author: 'vp-zarubezhje', permlink: 'ledyanyie-vanny-v-molochnoij-reke-i-poiski-villy-shtrausa' },
                { author: 'megumi-tyan', permlink: 'chto-nuzhno-znat-otpravlyayas-v-puteshestvie-primer-shri-lanka' }
            ]
        },
        {
            id: 6,
            name: 'Фотография',
            items: [
                { author: 'vp-photo.pro', permlink: 'kak-privezti-interesnye-kadry-iz-puteshestvii-v-lyubykh-usloviyakh ' },
                { author: 'genyakuc', permlink: '6geizx-raboty-ot-ostanovis-mgnovene' },
                { author: 'ratel', permlink: 'ratel-foto-145-lesnye-pticy-96' }
            ]
        }
    ]

    componentDidMount() {
        this.fetchTagContents(this.tags[3])
    }

    fetchTagContents = (tag) => {
        console.log(1)
        //this.setState({ tagsLoading: true })
        const promises = tag.items.map(item => (
            this.props.getContent({ author: item.author, permlink: item.permlink })
        ))

        Promise.all(promises).then(values => {
            this.setState({
                tagsCards: { ...this.state.tagsCards, [tag.id]: values },
                tagsLoading: false
            })
            console.log(100500, values)
        }).catch(() => {
            console.log(2)
            //this.setState({ tagsLoading: false })
        })
    }
    handleTagClick = (tag) => this.fetchTagContents(tag)

    render() {
        return (
            <div className="Welcome">
                {/*
                <div className="row">
                    <div className="column">
                        <HelpContent path="welcome"/>
                    </div>
                </div>
                */}

                <section className="Welcome__hero">
                    <div className="row align-middle">
                        <div className="column small-12 medium-7">
                            <div className="Welcome__greeting">Добро пожаловать <br/> на Golos.io</div>
                            <div className="Welcome__congratulations">Поздравляем с регистрацией.</div>
                        </div>
                        <div className="column small-12 medium-5">
                            <img src="images/new/welcome/welcome__hero.svg" />
                        </div>
                    </div>
                </section>
                <section className="Welcome__about">
                    <div className="row align-middle">
                        <div className="columns">
                            <div className="Welcome__about-header">Golos.io</div>
                            <div className="Welcome__about-subheader">Это уникальные тексты и мысли, которых нет в других частях Интернета. <br/> 
Это сила сообщества, генерирующая смыслы и действия.</div>
                            <div className="row small-up-1 medium-up-2 large-up-4">
                                <div className="columns">
                                    <div className="image">
                                        <img src="images/new/welcome/startup.svg" />
                                    </div>
                                    <div className="description">
                                        Оригинальные идеи,
                                        <div className="stroke">а не проплаченные статьи</div>
                                    </div>

                                </div>
                                <div className="columns">
                                    <div className="image">
                                        <img src="images/new/welcome/post.svg" />
                                    </div>
                                    <div className="description">
                                        Посты и комментарии,
                                        <div className="stroke">а не баннеры и реклама</div>
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="image">
                                        <img src="images/new/welcome/book.svg" />
                                    </div>
                                    <div className="description">
                                        Удобство выдачи,
                                        <div className="stroke">а не закрытые алгоритмы</div>
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="image">
                                        <img src="images/new/welcome/teamwork.svg" />
                                    </div>
                                    <div className="description">
                                        Информация принадлежит вам
                                        <div className="stroke">а не модерируется</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="Welcome__initial">
                    <div className="row align-middle">
                        <div className="columns">
                            <div className="Welcome__initial-header">С чего начать и о чем писать?</div>
                            <div className="row align-middle Welcome__initial-top-row">
                                <div className="columns small-3">
                                    <div className="Welcome__initial-subheader">Популярные темы:</div>
                                </div>
                                <div className="columns flex-container align-top">
                                    <div className="initial-tag">История</div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="columns small-3">
                                    <div className="initial-tags">
                                        {this.tags.map((tag) => (
                                            <div key={tag.id} className="initial-tag" onClick={this.handleTagClick(tag)}>{tag.name}</div>)
                                        )}
                                    </div>
                                </div>
                                <div className="columns">

                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="Welcome__differences">
                    <div className="row align-middle">
                        <div className="columns">
                            <div className="Welcome__differences-header">Маленькие отличия</div>
                            <div className="row small-up-1 medium-up-2 large-up-3">
                                <div className="columns">
                                    <div className="block align-top align-justify flex-dir-column flex-container">
                                        <div className="block-info">
                                            <div className="image">
                                                <img src="images/new/welcome/password.svg" />
                                            </div>
                                            <div className="header">Ключи</div>
                                            <div className="description">Виртуальный паспорт в мире блокчейна. Ключи подтверждают, что ваш аккаунт и токены принадлежит только вам. Распечатайте ключи. В отличие от настоящего паспорта, никто не сможет вам их восстановить. </div>
                                        </div>
                                        <div className="button small violet hollow">Подробнее</div>
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="block align-top align-justify flex-dir-column flex-container">
                                        <div className="block-info">
                                            <div className="image">
                                                <img src="images/new/welcome/monitor-like.svg" />
                                            </div>
                                            <div className="header">Голосование</div>
                                            <div className="description">Каждый день у вас есть 40 голосов чтобы оценить чужие посты. Не упустите их, когда вы нажимаете кнопку «Вверх» рядом с постом — топ Golos.io становится интереснее, а вы получить награду за курирование.</div>
                                        </div>
                                        <div className="button small violet hollow">Подробнее</div>
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="block align-top align-justify flex-dir-column flex-container">
                                        <div className="block-info">
                                            <div className="image">
                                                <img src="images/new/welcome/monitor.svg" />
                                            </div>
                                            <div className="header">Tеги</div>
                                            <div className="description">Это темы, по которым можно искать посты. Каждый пост должен иметь как минимум один тег. Вы можете подписаться не только на автора, но и на тег.</div>
                                        </div>
                                        <div className="button small violet hollow">Подробнее</div>
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="block align-top align-justify flex-dir-column flex-container">
                                        <div className="block-info">
                                            <div className="image">
                                                <img src="images/new/welcome/website.svg" />
                                            </div>
                                            <div className="header">Поста</div>
                                            <div className="description">В отличие от других соцсетей, у нас есть не одна, а несколько лент. Новое —  все, что только что опубликовали, актуальное —  посты с активным обсуждением и популярное — здесь посты с самым большим вознаграждением.</div>
                                        </div>
                                        <div className="button small violet hollow">Подробнее</div>
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="block align-top align-justify flex-dir-column flex-container">
                                        <div className="block-info">
                                            <div className="image">
                                                <img src="images/new/welcome/bitcoin.svg" />
                                            </div>
                                            <div className="header">Токены</div>
                                            <div className="description">Монеты блокчейна, на основе которого работает Golos.io. Все награды за посты, комментарии и курирование выплачиваются токенами. Их можно поменять на любые криптовалюты или привычные деньги на биржах.</div>
                                        </div>
                                        <div className="button small violet hollow">Подробнее</div>
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="block align-top align-justify flex-dir-column flex-container">
                                        <div className="block-info">
                                            <div className="image">
                                                <img src="images/new/welcome/bitcoin-chain.svg" />
                                            </div>
                                            <div className="header">Посты не удаляются</div>
                                            <div className="description">Все, что написано на Golos.io, остается в блокчейне.</div>
                                        </div>
                                        <div className="button small violet hollow">Подробнее</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/*  */}

                <section className="Welcome__reviews">
                    <div className="row align-middle">
                        <div className="columns small-12 medium-6">
                            <img src="images/new/welcome/welcome__reviews.svg" />
                        </div>
                        <div className="columns small-12 medium-6">
                            <div className="Welcome__reviews-header">Голоса сообщества</div>
                            <WelcomeSlider slides={this.slides} />
                        </div>
                    </div>
                </section>

                <section className="Welcome__mobile">
                    <div className="row align-middle">
                        <div className="columns small-12 medium-6">
                            <div className="Welcome__mobile-header">И да, вы можете пользоваться<br/> Golos.io через браузер или<br/> приложение для Android</div>
                            <div className="Welcome__mobile-subheader">Мы уже работаем над приложением для<br/> iPhone, оно будет готово летом.</div>
                            <div className="Welcome__mobile-links">
                                <MobileBanners showAndroid />
                            </div>

                        </div>
                        <div className="columns small-12 medium-6">
                            <img src="images/new/welcome/welcome__about.svg" />
                        </div>
                    </div>
                </section>

            </div>
        );
    }
}

module.exports = {
    path: 'welcome',
    component: connect(
        dispatch => ({
            getContent: (payload) => (new Promise((resolve, reject) => {
                dispatch({ type: 'GET_CONTENT', payload: { ...payload, resolve, reject } })
            }))
        })
    )(Welcome)
};
