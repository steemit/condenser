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
                    <div className="small-12">
                        <h3>
                            GOLOS.io
							<a href="/@golosio "><Icon name={APP_ICON} size="2x" /></a>
                            <a href="https://t.me/golos_support"><Icon name="telegram" size="2x" /></a>
                        </h3>
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
                            <li><a href="https://facebook.com/george.komarow"><img className="Team__facebook-logo" src="https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-512.png" /></a></li>
                            <li><a href="mailto:Gkkazak@gmail.com" title="mail to Gkkazak@gmail.com"><Icon name="envelope" size="2x" /></a></li>
                            <li><a href="/@insider"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member ">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/jevgenika.jpg" />
                        </div>
                        <strong>Евгения Харченко</strong>
                        <p>Product Owner</p>
                        <ul>
                            <li><a href="https://www.linkedin.com/in/jevgenija-kharchenko-1a816b10/"><img src="images/landing/linkedin_icon.jpg" /></a></li>
                            <li><a href="https://www.facebook.com/jevgenija.kharchenko"><img className="Team__facebook-logo" src="https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-512.png" /></a></li>
                            <li><a href="mailto:marketing@golos.io" title="mail to marketing@golos.io"><Icon name="envelope" size="2x" /></a></li>
                            <li><a href="/@jevgenika"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/shtefan.jpg" />
                        </div>
                        <strong>Николай Штефан</strong>
                        <p>Team Lead, Scrum Master</p>
                        <ul>
                            <li><a href="https://github.com/NickShtefan"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@nickshtefan"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="https://avatars2.githubusercontent.com/u/3322340?v=3&s=460" alt="фотография Ткаченко Игоря" />
                        </div>
                        <strong>Ткаченко Игорь</strong>
                        <p>Web dev</p>
                        <ul>
                            <li><a href="https://github.com/b1acksun"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@b1acksun"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="https://avatars0.githubusercontent.com/u/19325076?v=3&s=460" alt="фотография Дениса Захаренкова" />
                        </div>
                        <strong>Денис Захаренков</strong>
                        <p>DevOps</p>
                        <ul>
                            <li><a href="https://github.com/muhazzz/"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@muhazokotuha"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="https://avatars3.githubusercontent.com/u/25533641?v=3&s=460" alt="фотография Горошко Павла" />
                        </div>
                        <strong>Горошко Павел</strong>
                        <p>Web dev</p>
                        <ul>
                            <li><a href="https://github.com/pavelit"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="https://golos.io/@pav"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="https://avatars1.githubusercontent.com/u/13299756?s=460&v=4" />
                        </div>
                        <strong>Юрий Бородкин</strong>
                        <p>Android Developer</p>
                        <ul>
                            <li><a href="https://github.com/yurivlad/"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@yuri-vlad"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/sergeim.png" />
                        </div>
                        <strong>Сергей Монастырский</strong>
                        <p>iOs dev</p>
                        <ul>
                            <li><a href="https://github.com/Monserg"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@msm72"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/firsov.png" />
                        </div>
                        <strong>Александр Фирсов</strong>
                        <p>Head of Communications</p>
                        <ul>
                            <li><a href="https://www.facebook.com/alex.v.firsov"><img className="Team__facebook-logo" src="https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-512.png" /></a></li>
                            <li><a href="mailto:pr@golos.io" title="mail to pr@golos.io"><Icon name="envelope" size="2x" /></a></li>
                            <li><a href="/@alex-firsov"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member ">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/rodnikova.jpg"/>
                        </div>
                        <strong>Юлия Родникова</strong>
                        <p>Комьюнити-менеджер</p>
                        <ul>
                            <li><a href="mailto:community@golos.io" title="mail to community@golos.io"><Icon name="envelope" size="2x" /></a></li>
                            <li><a href="/@yulia.rodnikova"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member ">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/dankinescop.jpeg" />
                        </div>
                        <strong>Денис Белых</strong>
                        <p>Support Manager</p>
                        <ul>
                            <li><a href="mailto:support@golos.io" title="mail to support@golos.io"><Icon name="envelope" size="2x" /></a></li>
                            <li><a href="/@dan-kinescop"><Icon name={APP_ICON} size="2x" /></a></li>
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
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/agutnik.jpg" />
                        </div>
                        <strong>Алексей Гутник</strong>
                        <p>Web dev</p>
                        <ul>
                            <li><a href="https://github.com/sualex"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@sualex"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/pevgenii.png" />
                        </div>
                        <strong>Евгений Паршин</strong>
                        <p>QA Tester</p>
                        <ul>
                            <li><a href="https://github.com/BaroH4er"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@dekol"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>
                </div>

                <div className="row"><div className="small-12"><h3>Golos Core</h3></div></div>
                <div className="row Team__members text-center">
                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/andrew.jpg" />
                        </div>
                        <strong>Андрей Фалалеев</strong>
                        <p>Блокчейн разработка</p>
                        <ul>
                            <li><a href="https://github.com/afalaleev"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@andreypf"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="https://avatars2.githubusercontent.com/u/958279?v=4&s=400" />
                        </div>
                        <strong>Александр Боргардт</strong>
                        <p>Блокчейн разработка</p>
                        <ul>
                            <li><a href="https://github.com/kotbegemot"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@kotbegemot"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/timur.jpg" />
                        </div>
                        <strong>Тимур Купаев</strong>
                        <p>Data scientist</p>
                        <ul>
                            <li><a href="https://github.com/timurkupaev"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@timurku"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/maria-d.jpg" />
                        </div>
                        <strong>Мария Дьячук</strong>
                        <p>Community Manager</p>
                        <ul>
                            <li><a href="mailto:mariacore@golos.io" title="mail to mariacore@golos.io"><Icon name="envelope" size="2x" /></a></li>
                            <li><a href="/@mariadia"><Icon name={APP_ICON} size="2x" /></a></li>
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

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/konstantin.jpg" />
                        </div>
                        <strong>Константинов Константин</strong>
                        <p>Блокчейн разработка</p>
                        <ul>
                            <li><a href="https://github.com/zxcat"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@zxcat"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/vpavliv.jpg" />
                        </div>
                        <strong>Владимир Павлив</strong>
                        <p>Блокчейн разработка</p>
                        <ul>
                            <li><a href="https://github.com/vpavliv"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@abgvedr"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="images/landing/erlan.jpg" />
                        </div>
                        <strong>Ерлан Шиндаулетов</strong>
                        <p>Инженер-программист</p>
                        <ul>
                            <li><a href="https://github.com/epexa"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@epexa"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>

                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="https://avatars0.githubusercontent.com/u/19325076?v=3&s=460" alt="фотография Дениса Захаренкова" />
                        </div>
                        <strong>Денис Захаренков</strong>
                        <p>DevOps</p>
                        <ul>
                            <li><a href="https://github.com/muhazzz/"><img src="images/landing/github_icon.jpg" /></a></li>
                            <li><a href="/@muhazokotuha"><Icon name={APP_ICON} size="2x" /></a></li>
                        </ul>
                    </div>
                </div>

                <hr />
            </section>
        )
    }
}
