import React from 'react';
import Icon from '../../elements/Icon'
import {Link} from 'react-router';

class Hardfork extends React.Component {
    render() {
        return (
            <div className='landing-hardfork'>
                <div className='landing-block'>
                    <div className="row">
                        <div className="column large-12 medium-12 small-12">
                            <h1>#<b>мы</b>ждем<b>хардфорк</b>
                            </h1>
                        </div>
                        <div className="indent column large-12 medium-12 small-12">
                            <p><b>Хардфорк</b> блокчейна «Голос» — это <b>серьезный апгрейд блокчейна</b>, разрабатываемый для вывода Голоса на <b>конкурентные позиции в мире</b>.</p>
                        </div>
                        <div className="text-block-main column large-8 medium-8 small-12">
                            <p>Блог-платформа <Link className="link" to="/@golosio" >Golos.io</Link> является клиентом блокчейна «Голос», то есть работает
                                на его «движке».
                            </p>
                            <p>Хардфорк блокчейна приведет <br></br>
                            <b>к существенному улучшению блог-платформы</b><br></br>
                                благодаря новому функционалу «Голоса».</p>
                        </div>
                        <div className="text-block-info column large-4 medium-4 small-12">
                            <div className='figure figure-small'>
                            <p ><b>Хардфорк</b> — это изменение программного кода блокчейна (изменение поведения
                                бизнес-логики). Подготовка хардфорка заняла почти полгода, ей занималась команда <Link className="link" to="/@goloscore" ><b>Golos•Core</b></Link>
                            </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='landing-block'>
                    <div className="row">
                        <div className="column large-12 medium-12 small-12">
                            <h2>Основные нововведения</h2>
                            <hr/>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf1' size='5x'/>
                            <p className='icon-block-text'>
                                Доступно подписание любых транзакций несколькими пользователями, это значительно
                                повышает уровень безопасности
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf2' size='5x'/>
                            <p className='icon-block-text'>
                                Добавлено делегирование Силы Голоса — любой пользователь «Голоса» может передать
                                свою Силу Голоса для использования другим пользователям
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf3' size='5x'/>
                            <p className='icon-block-text'>
                                Владельцы веб-приложений могут устанавливать процент, который они будут получать
                                от каждого вознаграждения пользователей
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf4' size='5x'/>
                            <p className='icon-block-text'>
                                Все посты и комментарии теперь получают выплату через семь дней после написания
                            </p>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf5' size='5x'/>
                            <p className='icon-block-text'>
                                Разделение пользовательского контента по естественным языкам
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf6' size='5x'/>
                            <p className='icon-block-text'>
                                Автоматическое обнуление голосов за делегатов раз в три месяца, с целью
                                стимулирования работы делегатов на благо сообщества
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf7' size='5x'/>
                            <p className='icon-block-text'>
                                Снято ограничение на длину ветки комментариев
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf8' size='5x'/>
                            <p className='icon-block-text'>
                                Фонды вознаграждения комментариев и постов разделены, фонд вознаграждения
                                комментариев составляет 10% от фонда выплат авторам
                            </p>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf9' size='5x'/>
                            <p className='icon-block-text'>
                                Снято временное ограничение на редактирование комментариев
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf10' size='5x'/>
                            <p className='icon-block-text'>
                                Улучшен плагин статистики, теперь любой желающий может получать развернутую
                                информацию по транзакциям в блокчейне
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf11' size='5x'/>
                            <p className='icon-block-text'>
                                Создан инструмент мониторинга свободного места хранилища для держателей нод
                                блокчейна
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf12' size='5x'/>
                            <p className='icon-block-text'>
                                Создан строгий машиночитаемый формат логирования работы блокчейна для упрощения
                                поиска ошибок, фильтрации и быстрого получения данных
                            </p>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf13' size='5x'/>
                            <p className='icon-block-text'>
                                Реализована возможность создавать собственные токены, привязанные к токену
                                Голоса
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf14' size='5x'/>
                            <p className='icon-block-text'>
                                Плата за регистрацию собственных токенов будет зависеть от длины названия токена
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf15' size='5x'/>
                            <p className='icon-block-text'>
                                Введена поддержка нескольких версий протокола бизнес-логики
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf16' size='5x'/>
                            <p className='icon-block-text'>
                                Прайс-фиды делегатов более не ограничены временем
                            </p>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf17' size='5x'/>
                            <p className='icon-block-text'>
                                Внедрена возможность использования кошелька из командной строки
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf18' size='5x'/>
                            <p className='icon-block-text'>
                                Сроки понижения силы голоса увеличены с 13 до 20 недель
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf19' size='5x'/>
                            <p className='icon-block-text'>
                                Удалена возможность изменения ключей через механизм хардфорка
                            </p>
                        </div>
                        <div className='icon-block column large-3 medium-6 small-12'>
                            <Icon name='hf/hf20' size='5x'/>
                            <p className='icon-block-text'>
                                Увеличен лимит на количество постов
                            </p>
                        </div>
                    </div>
                    <div className="row">
                            <div className='column large-12 medium-12 small-12'>
                                <p className='text-block-bottom'><b>Таблицу с голосованием делегатов по каждому нововведению можно увидеть <a href='https://docs.google.com/spreadsheets/d/1BF5XiPG-PDemntuyVVAbfbaoEfa9N0IXFl6z0HjrsOY/edit#gid=0'>здесь</a></b></p>
                            </div>
                        </div>
                </div>
                <div className='landing-block'>
                    <div className="row">
                        <div className="column large-12 medium-12 small-12">
                            <h2>Когда произойдет хардфорк?</h2>
                            <hr/>
                        </div>
                        <div className="column large-12 medium-12 small-12">
                            <p className='text-block-left'>Принятие хардфорка произойдет после согласования 17 из 21 <a href="/golosio/@golosio/otvety-golos-io-kak-stat-delegatom">делегата</a> всех нововведений. Сам программный код хардфорка полностью готов к запуску.</p>
                        </div>
                    </div>
                </div>
                <div className='landing-block'>
                    <div className="row">
                        <div className="column large-12 medium-12 small-12">
                            <h2>Как ускорить принятие хардфорка?</h2>
                            <hr/>
                        </div>
                    </div>
                    <div>
                        <div className='paragraph-block'>
                            <div className='row'>
                                <div className='paragraph-number column large-2 medium-2 small-2'>
                                    <h1>1</h1>
                                </div>
                                <div className='paragraph-text column large-10 medium-10 small-10'>
                                    <h3>
                                        <b>Расскажите делегатам</b>, за которых вы голосовали, <b>что вы хотите хардфорк</b>.
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className='paragraph-block'>
                            <div className='row'>
                                <div className='paragraph-number column large-2 medium-2 small-2'>
                                    <h1>2</h1>
                                </div>
                                <div className='paragraph-text column large-10 medium-10 small-10'>
                                    <h3>
                                    <Link className="link" to="/~witnesses">Снимите свой голос</Link> с кандидатов, которые не хотят его принятия.
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className='paragraph-block'>
                            <div className='row'>
                                <div className='paragraph-number column large-2 medium-2 small-2'>
                                    <h1>3</h1>
                                </div>
                                <div className='paragraph-text column large-10 medium-10 small-10'>
                                    <h3>
                                    <b><Link className="link" to="/~witnesses">Выберите тех делегатов</Link>, которые, как и вы, жаждут скорейшего принятия хардфорка.</b>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='landing-block-footer'>
                    <div className="row">
                        <div className="column large-12 medium-12 small-12">
                            <h2>Остались вопросы?</h2>
                            <hr/>
                        </div>
                    </div>
                    <div className='row'>
                        <div>
                            <p>Подробно узнать о составе хардфорка можно <Link className="link" to="/ru--golos/@goloscore/finalnoe-soglasovanie-funkcionala-khf-0-2-11-12-2017">здесь</Link>.</p>
                            <p>Разобраться с ролью делегата и тем, как им стать, можно прочитав <Link className="link" to="/golosio/@golosio/otvety-golos-io-kak-stat-delegatom">этот текст</Link>.</p>
                            <p>Понять, почему мы так ждем хардфорк можно <Link className="link" to=" /golosio/@golosio/chto-takoe-khardfork-golosa-i-pochemu-eto-vazhno">тут</Link>.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'hardfork',
    component: Hardfork
};