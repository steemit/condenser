import React, { Component } from 'react';
import { connect } from 'react-redux'
import user from 'app/redux/User';
// import HelpContent from 'app/components/elements/HelpContent';
import Icon from 'app/components/elements/Icon';
import MobileBanners from 'app/components/elements/MobileBanners/MobileBanners';
import WelcomeSlider from 'app/components/elements/welcome/WelcomeSlider';
import WelcomeCardPost from 'app/components/cards/welcome/WelcomeCardPost';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { getURL } from 'app/utils/URLConstants'

class Welcome extends Component {

    state = {
        tagsLoading: false,
        tagsActiveId: false,
        tagsCards: {},

        questionsLoading: false,
        questionsCards: [],
    }

    slides = [
        {
            name: 'Ольга', position: 'художник',
            link: '/@oagalakova',
            avatar: 'https://pp.userapi.com/c631522/v631522200/14581/JKKGVbOVQHg.jpg',
            description: `Это хороший проект и я в него верю! Я благодарна Голосу за то, что учит меня писать и учит жить. Благодарна за знакомство с новыми интересными людьми, которых заочно нежно люблю! `
        },
        {
            name: 'Артем', position: 'фотограф',
            link: '/@artemgukasov',
            avatar: 'https://pp.userapi.com/c841031/v841031059/65f35/kSq8tFfn6rQ.jpg',
            description: `Блог на голосе - это возможность показать мир, в котором мы живём, большему количеству людей. Это выход на совершенно новую аудиторию, в отличие от других соцсетей. Плюс ко всему, монетизация добавляет азарта (улыбающийся смайл).`
        },
        {
            name: 'Анастасия', position: 'редактор',
            link: '/@amidabudda',
            avatar: 'https://pp.userapi.com/c837532/v837532246/181c9/L07Y3iX3shs.jpg',
            description: `Это подвижная экосистема с элементами неожиданности.
Это отличное место для самореализации пишущей братии. Ваши произведения останутся в веках с подтверждённым авторством (преимущества блокчейна), а вознаграждение станет приятным бонусом. 
И, наконец, это глубокое погружение, которое, если делать всё с уважением и любовью, способно одарить вас бесценным сокровищем — близкими по духу людьми.`
        },
        {
            name: 'Павел', position: 'разработчик-фрилансер',
            link: '/@gapel',
            avatar: 'http://gapel.ru/Golos/2017/ava_beg.jpg',
            description: `Голос стал для меня мощным пинком, чтобы разобраться в криптовалютах, биржах, блокчейн-технологиях. Он принес мне новые знания в большом объеме. `
        },
        {
            name: 'Мария', position: 'автор',
            link: '/@aksena',
            avatar: 'https://pp.userapi.com/c830309/v830309125/427ce/uumi9rrai9Y.jpg',
            description: `В чём отличие Голоса от любой другой блог-платформы? Для меня это возможность поучаствовать в увлекательной экономической игре, а скилл написания хороших текстов серьёзно увеличивает здесь шансы на выигрыш.`
        }
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
                { author: 'vp-photo.pro', permlink: 'kak-privezti-interesnye-kadry-iz-puteshestvii-v-lyubykh-usloviyakh' },
                { author: 'genyakuc', permlink: '6geizx-raboty-ot-ostanovis-mgnovene' },
                { author: 'ratel', permlink: 'ratel-foto-145-lesnye-pticy-96' }
            ]
        }
    ]

    questions = [
        { author: 'sofya', permlink: 'moi-tri-mesyaca-na-golose-sovety-novichkam' },
        { author: 'valkommen', permlink: 'iz-lichnogo-opyta-s-kakimi-podvodnymi-kamnyami-mogut-stolknutsya-novichki-na-golose' },
        { author: 'vp-webdev', permlink: 'chto-nuzhno-znat-chtoby-ne-poteryat-klyuchi-ot-akkaunta' }
    ]

    componentDidMount() {
        this.fetchTagContents(this.tags[3])

        // questions posts
        this.setState({ questionsLoading: true })
        const promisesQuestions = this.questions.map(item => (
            this.props.getContent({ author: item.author, permlink: item.permlink })
        ))
        Promise.all(promisesQuestions).then(posts => {
            const usernames = posts.map(post => post.author)

            this.props.getAccount({ usernames }).then(() => {
                this.setState({
                    questionsLoading: false,
                    questionsCards: posts,
                })
            }).catch(() => {
                this.setState({ questionsLoading: false })
            })
        }).catch(() => {
            this.setState({ questionsLoading: false })
        })
    }

    fetchTagContents = (tag) => {
        // if tag's posts already cached
        if (this.state.tagsCards[tag.id]) {
            this.setState({ tagsActiveId: tag.id })
            return;
        }

        this.setState({ tagsLoading: true, tagsActiveId: false })

        const promisesTags = tag.items.map(item => (
            this.props.getContent({ author: item.author, permlink: item.permlink })
        ))
        Promise.all(promisesTags).then(posts => {
            const usernames = posts.map(post => post.author)
            this.props.getAccount({ usernames }).then(() => {
                this.setState({
                    tagsLoading: false,
                    tagsActiveId: tag.id,
                    tagsCards: { ...this.state.tagsCards, [tag.id]: posts },
                })
            }).catch(() => {
                this.setState({ tagsLoading: false, tagsActiveId: false })
            })
        }).catch(() => {
            this.setState({ tagsLoading: false, tagsActiveId: false })
        })
    }
    handleTagClick = (tag) => () => this.fetchTagContents(tag)

    render() {
        const {
            tagsLoading, tagsActiveId, tagsCards,
            questionsLoading, questionsCards
        } = this.state

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
                            <div className="Welcome__greeting">Добро пожаловать <br /> на Golos.io</div>
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
                            <div className="Welcome__about-subheader">Это уникальные тексты и мысли, которых нет в других частях Интернета. <br />
Это сила сообщества, генерирующая смыслы и действия.</div>
                            <div className="row small-up-1 medium-up-2 large-up-4">
                                <div className="columns">
                                    <div className="image">
                                        <img src="images/new/welcome/startup.svg" />
                                    </div>
                                    <div className="description">
                                        Оригинальные идеи, <span className="stroke">а не проплаченные статьи</span>
                                    </div>

                                </div>
                                <div className="columns">
                                    <div className="image">
                                        <img src="images/new/welcome/post.svg" />
                                    </div>
                                    <div className="description">
                                        Посты и комментарии, <span className="stroke">а не баннеры и реклама</span>
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="image">
                                        <img src="images/new/welcome/book.svg" />
                                    </div>
                                    <div className="description">
                                        Удобство выдачи, <span className="stroke">а не закрытые алгоритмы</span>
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="image">
                                        <img src="images/new/welcome/teamwork.svg" />
                                    </div>
                                    <div className="description">
                                        Информация принадлежит вам, <span className="stroke">а не модерируется</span>
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
                            <div className="row">
                                <div className="columns small-12 medium-3 large-2">
                                    <div className="Welcome__initial-subheader">Популярные темы:</div>
                                    <div className="initial-tags">
                                        {this.tags.map((tag) => {
                                            const activeClass = tag.id == tagsActiveId ? ' active' : ''
                                            return (
                                                <div
                                                    key={tag.id}
                                                    className={'initial-tag'+activeClass}
                                                    onClick={this.handleTagClick(tag)}
                                                >{tag.name}</div>
                                            )
                                        })}
                                    </div>
                                </div>
                                {tagsLoading ?
                                    <div className="columns align-self-middle">
                                            <center><LoadingIndicator type="circle" /></center>
                                    </div>
                                    :
                                    <div className="columns">
                                        <div className="row small-up-1 medium-up-2 large-up-3">
                                            {tagsCards[tagsActiveId] && tagsCards[tagsActiveId].map((post) => (
                                                <div className="columns" key={post.id}>
                                                    <WelcomeCardPost post={post} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                }
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
                                        <a className="button small violet hollow" href="https://wiki.golos.io/1-introduction/koshelek-klyuchi-viplati.html">Подробнее</a>
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
                                        <a className="button small violet hollow" href="https://wiki.golos.io/2-rewards/curation_rewards.html">Подробнее</a>
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
                                        <a className="button small violet hollow" href="https://wiki.golos.io/1-introduction/interfeis-lichnogo-bloga.html">Подробнее</a>
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
                                        <a className="button small violet hollow" href="https://wiki.golos.io/1-introduction/interfeis-lichnogo-bloga.html">Подробнее</a>
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
                                        <a className="button small violet hollow" href="https://wiki.golos.io/1-introduction/koshelek-klyuchi-viplati.html">Подробнее</a>
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="Welcome__mobile">
                    <div className="row align-middle">
                        <div className="columns small-12 medium-6">
                            <div className="Welcome__mobile-header">И да, вы можете пользоваться<br /> Golos.io через браузер или<br /> приложение для Android</div>
                            <div className="Welcome__mobile-subheader">Мы уже работаем над приложением для<br /> iPhone, оно будет готово летом.</div>
                            <div className="Welcome__mobile-links">
                                <MobileBanners showAndroid />
                            </div>

                        </div>
                        <div className="columns small-12 medium-6">
                            <img src="images/new/welcome/welcome__about.svg" />
                        </div>
                    </div>
                </section>

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

                <section className="Welcome__questions">
                    <div className="row align-middle">
                        <div className="columns">
                            <div className="Welcome__questions-header">Остались вопросы?</div>
                            <div className="Welcome__questions-subheader">Посмотрите, что наше сообщество советует новичкам:</div>
                            <div className="row">
                                <div className="columns small-12 medium-12 large-2">
                                    <div className="row small-up-2 medium-up-2 large-up-1 questions-links">
                                        <div className="columns">
                                            <a className="questions-link" href="https://t.me/golos_support"><Icon name="new/telegram" size="2x" />Спросите в телеграме</a>
                                        </div>
                                        <div className="columns">
                                            <a className="questions-link" href={getURL('WIKI_URL')}><Icon name="new/wikipedia" size="2x" />Посмотрите нашу википедию</a>
                                        </div>
                                        <div className="columns">
                                            <a className="questions-link" href="mailto:support@golos.io"><Icon name="new/envelope" size="2x" />Напишите на почту</a>
                                        </div>
                                        <div className="columns">
                                            <a className="questions-link" href="/submit.html?type=submit_feedback"><Icon name="new/monitor" size="2x" />Или через сайт</a>
                                        </div>
                                    </div>
                                </div>
                                {questionsLoading ?
                                    <div className="columns align-self-middle">
                                        <center><LoadingIndicator type="circle" /></center>
                                    </div>
                                    :
                                    <div className="columns">
                                        <div className="row small-up-1 medium-up-2 large-up-3">
                                            {questionsCards.map((post) => (
                                                <div className="columns" key={post.id}>
                                                    <WelcomeCardPost post={post} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                }
                            </div>
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
        null,
        dispatch => ({
            getContent: (payload) => (new Promise((resolve, reject) => {
                dispatch({ type: 'GET_CONTENT', payload: { ...payload, resolve, reject } })
            })),
            getAccount: (payload) => (new Promise((resolve, reject) => {
                dispatch(user.actions.getAccount({ ...payload, resolve, reject }))
            }))
        })
    )(Welcome)
};
