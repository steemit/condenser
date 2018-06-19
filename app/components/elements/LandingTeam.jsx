import React from 'react'
import Icon from 'app/components/elements/Icon';
import {APP_ICON} from 'app/client_config';

export default class LandingTeam extends React.Component {
    render() {
        return (
            <section className="Team">
                <div className="row text-center">
                    <div className="small-12 columns">
                        <h2 className="Team__header" id="team">Команда</h2>
                    </div>
                </div>

                <div className="row">
                    <div className="small-12"><h3>GOLOS.io</h3></div>
                </div>
                <div className="row align-middle collapse">
                    <div className="columns small-12 medium-6">
                        Разработка, поддержка и развитие клиента <a href="/welcome">Golos.io</a>
                    </div>
                    <div className="columns small-12 medium-6">
                        <a className="button" href="/@golosio">Новости проекта</a>
                    </div>
                </div>
                <div className="row Team__members text-center">

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member ">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/george.komarow.jpg" />
                        </div>
                        <strong>Георгий Комаров</strong>
                        <p>CEO</p>
                        <ul>
                            <li><a href="/@insider"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="mailto:Gkkazak@gmail.com" title="mail to Gkkazak@gmail.com"><Icon name="envelope" size="2x" /></a></li>
                            <li><a href="https://facebook.com/george.komarow"><img className="Team__facebook-logo" src="https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-512.png" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/shtefan.jpg" />
                        </div>
                        <strong>Николай Штефан</strong>
                        <p>Team Lead, Scrum Master</p>
                        <ul>
                            <li><a href="/@nickshtefan"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/NickShtefan"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member ">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/jevgenika.jpg" />
                        </div>
                        <strong>Евгения Харченко</strong>
                        <p>CMO, Product Owner</p>
                        <ul>
                            <li><a href="/@jevgenika"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/jevgenika"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="mailto:marketing@golos.io" title="mail to marketing@golos.io"><Icon name="envelope" size="2x" /></a></li>
                            <li><a href="https://www.linkedin.com/in/jevgenija-kharchenko-1a816b10/"><img src="images/landing/linkedin_icon.jpg" /></a></li>
                            <li><a href="https://www.facebook.com/jevgenija.kharchenko"><img className="Team__facebook-logo" src="https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-512.png" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="https://avatars2.githubusercontent.com/u/3322340?v=3&s=460" alt="фотография Игоря Ткаченко" />
                        </div>
                        <strong>Игорь Ткаченко</strong>
                        <p>Web Developer</p>
                        <ul>
                            <li><a href="/@b1acksun"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/b1acksun"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/olegpavlov.jpg" alt="фотография Олег Павлов" />
                        </div>
                        <strong>Олег Павлов</strong>
                        <p>Web Developer</p>
                        <ul>
                            <li><a href="/@format-x22"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/Format-X22"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="https://avatars0.githubusercontent.com/u/19325076?v=3&s=460" alt="фотография Дениса Захаренкова" />
                        </div>
                        <strong>Денис Захаренков</strong>
                        <p>DevOps</p>
                        <ul>
                            <li><a href="/@muhazokotuha"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/muhazzz/"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/allakuchinskaya.jpg" alt="фотография Аллы Кучинской" />
                        </div>
                        <strong>Алла Кучинская</strong>
                        <p>Designer</p>
                        <ul>
                            <li><a href="/@kuchinskaya"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/kucinskaya.alla"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="https://avatars1.githubusercontent.com/u/13299756?s=460&v=4" />
                        </div>
                        <strong>Юрий Бородкин</strong>
                        <p>Android Developer</p>
                        <ul>
                            <li><a href="/@yuri-vlad"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/yurivlad/"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/sergeim.png" />
                        </div>
                        <strong>Сергей Монастырский</strong>
                        <p>iOs dev</p>
                        <ul>
                            <li><a href="/@msm72"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/Monserg"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/alexeyelizarov.jpg" alt="фотография Алексея Елизарова" />
                        </div>
                        <strong>Алексей Елизаров</strong>
                        <p>Web Developer</p>
                        <ul>
                            <li><a href="/@devall"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/beautyfree"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/ilyalebedev.jpg" alt="фотография Ильи Лебедева" />
                        </div>
                        <strong>Илья Лебедев</strong>
                        <p>Web Developer</p>
                        <ul>
                            <li><a href="/@bacher"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/Bacher"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/pevgenii.png" />
                        </div>
                        <strong>Евгений Паршин</strong>
                        <p>QA Tester</p>
                        <ul>
                            <li><a href="/@dekol"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/BaroH4er"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/firsov.png" />
                        </div>
                        <strong>Александр Фирсов</strong>
                        <p>Head of Communications</p>
                        <ul>
                            <li><a href="/@alex-firsov"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="mailto:pr@golos.io" title="mail to pr@golos.io"><Icon name="envelope" size="2x" /></a></li>
                            <li><a href="https://www.facebook.com/alex.v.firsov"><img className="Team__facebook-logo" src="https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-512.png" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member ">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/rodnikova.jpg"/>
                        </div>
                        <strong>Юлия Родникова</strong>
                        <p>Комьюнити-менеджер</p>
                        <ul>
                            <li><a href="/@yulia.rodnikova"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="mailto:community@golos.io" title="mail to community@golos.io"><Icon name="envelope" size="2x" /></a></li>
                            <li><a href="https://github.com/rodnikova"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/evgeniymoykin.jpg" alt="фотография Евгения Мойкина" />
                        </div>
                        <strong>Евгений Мойкин</strong>
                        <p>Digital marketing</p>
                        <ul>
                            <li><a href="/@moykin"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/moykin"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member ">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/dankinescop.jpeg" />
                        </div>
                        <strong>Денис Белых</strong>
                        <p>Support Manager</p>
                        <ul>
                            <li><a href="/@dan-kinescop"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="mailto:support@golos.io" title="mail to support@golos.io"><Icon name="envelope" size="2x" /></a></li>
                            <li><a href="https://github.com/dankinescop"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member ">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/Alessia.jpg" />
                        </div>
                        <strong>Алеся Николаенкова</strong>
                        <p>Support Manager</p>
                        <ul>
                            <li><a href="/@chinpu"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/chinpu"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/anastasiyazhuravleva.jpg" alt="фотография Анастасии Журавлевой" />
                        </div>
                        <strong>Анастасия Журавлева</strong>
                        <p>Wounderwoman</p>
                        <ul>
                            <li><a href="/@anastasia.mark"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/anastasiamarkovna"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/anastasiapirogova.jpg" alt="фотография Анастасии Журавлевой" />
                        </div>
                        <strong>Анастасия Пирогова</strong>
                        <p>Office Manager</p>
                        <ul>
                            <li><a href="/@pirogova"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/irinanemogaeva.jpg" alt="фотография Ирины Немогаевой" />
                        </div>
                        <strong>Ирина Немогаева</strong>
                        <p>HR</p>
                        <ul>
                            <li><a href="https://github.com/nemogaevairina"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>
                </div>

                <div className="row">
                    <div className="small-12"><h3>Golos Core</h3></div>
                </div>
                <div className="row align-middle collapse">
                    <div className="columns small-12 medium-6">
                        Разработка, поддержка и развитие блокчейна Golos
                    </div>
                    <div className="columns small-12 medium-6">
                        <a className="button" href="/@goloscore">Новости проекта</a>
                    </div>
                </div>
                <div className="row Team__members text-center">
                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/andrew.jpg" />
                        </div>
                        <strong>Андрей Фалалеев</strong>
                        <p>Блокчейн разработка</p>
                        <ul>
                            <li><a href="/@andreypf"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/afalaleev"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/maria-d.jpg" />
                        </div>
                        <strong>Мария Дьячук</strong>
                        <p>Project manager</p>
                        <ul>
                            <li><a href="/@mariadia"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/marijadia"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/alexandernazarov.jpg" alt="фотография Александр Назаров" />
                        </div>
                        <strong>Александр Назаров</strong>
                        <p>Технический писатель</p>
                        <ul>
                            <li><a href="/@anazarov79"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/anazarov79"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/konstantin.jpg" />
                        </div>
                        <strong>Константин Константинов</strong>
                        <p>Блокчейн разработка</p>
                        <ul>
                            <li><a href="/@zxcat"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/zxcat"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/korpusenko.jpg" />
                        </div>
                        <strong>Антон Корпусенко</strong>
                        <p>Блокчейн разработка</p>
                        <ul>
                            <li><a href="https://github.com/AKorpusenko"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="https://avatars0.githubusercontent.com/u/19325076?v=3&s=460" alt="фотография Дениса Захаренкова" />
                        </div>
                        <strong>Денис Захаренков</strong>
                        <p>DevOps</p>
                        <ul>
                            <li><a href="/@muhazokotuha"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/muhazzz/"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/vadim-ka.jpg" alt="фотография Вадим Кайнаров" />
                        </div>
                        <strong>Вадим Кайнаров</strong>
                        <p>С++ dev</p>
                        <ul>
                            <li><a href="/@kaynarov"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/kaynarov"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/uliya-zh.png" alt="фотография Юлия Журавлева" />
                        </div>
                        <strong>Юлия Журавлева</strong>
                        <p>С++ dev</p>
                        <ul>
                            <li><a href="/@maslenitsa"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/maslenitsa93"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/timur.jpg" />
                        </div>
                        <strong>Тимур Купаев</strong>
                        <p>Блокчейн аналитик</p>
                        <ul>
                            <li><a href="/@timurku"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/timurkupaev"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/erlan.jpg" />
                        </div>
                        <strong>Ерлан Шиндаулетов</strong>
                        <p>Инженер-программист</p>
                        <ul>
                            <li><a href="/@epexa"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/epexa"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/anna-ch.jpg" alt="фотография Анна Чемерицкая" />
                        </div>
                        <strong>Анна Чемерицкая</strong>
                        <p>Community manager</p>
                        <ul>
                            <li><a href="/@annaeq"><Icon name={APP_ICON} size="2x" /></a></li>
                            <li><a href="https://github.com/annaeq"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>
                </div>

                <hr />
            </section>
        )
    }
}
