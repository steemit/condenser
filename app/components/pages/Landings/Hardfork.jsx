import React from 'react';
import Icon from '../../elements/Icon'
import {Link} from 'react-router';

//<Link className="link" to="/@golosio" >Golos.io<Link/>

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
                        <div className="column large-12 medium-12 small-12">
                            <p>Хардфорк блокчейна «Голос» — это серьезный апгрейд блокчейна, разрабатываемый
                                для вывода Голоса на конкурентные позиции в мире.</p>
                        </div>
                        <div className="column large-8 medium-8 small-8">
                            <p>Блог-платформа Golos.io является клиентом блокчейна «Голос», то есть работает
                                на его «движке».
                            </p>
                            <p>Хардфорк блокчейна приведет к существенному улучшению блог-платформы
                                благодаря новому функционалу «Голоса».</p>
                        </div>
                        <div className="column large-4 medium-4 small-4">
                            <p>Хардфорк — это изменение программного кода блокчейна (изменение поведения
                                бизнес-логики). Подготовка хардфорка заняла почти полгода, ей занималась команда
                                Golos•Core (https://golos.io/@goloscore).</p>
                        </div>
                    </div>
                </div>
                <div className='landing-block'>
                    <div className="row">
                        <div className="column large-12 medium-12 small-12">
                            <h1>Основные нововведения</h1>
                            <hr/>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf1' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Доступно подписание любых транзакций несколькими пользователями, это значительно
                                повышает уровень безопасности
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf2' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Добавлено делегирование Силы Голоса — любой пользователь «Голоса» может передать
                                свою Силу Голоса для использования другим пользователям
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf3' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Владельцы веб-приложений могут устанавливать процент, который они будут получать
                                от каждого вознаграждения, пользователей
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf4' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Все посты и комментарии теперь получают выплату через семь дней после написания
                            </p>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf5' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Отключение майнинга, который утратил свою актуальность
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf6' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Автоматическое обнуление голосов за делегатов раз в три месяца, с целью
                                стимулирования работы делегатов на благо сообщества
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf7' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Снято ограничение на длину ветки комментариев
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf8' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Фонды вознаграждения комментариев и постов разделены, фонд вознаграждения
                                комментариев составляет 10% от фонда выплат авторам
                            </p>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf9' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Снято временное ограничение на редактирование комментариев
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf10' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Улучшен плагин статистики, теперь любой желающий, может получать развернутую
                                информацию по транзакциям в блокчейне
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf11' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Создан инструмент мониторинга свободного места хранилища для держателей нод
                                блокчейна
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf12' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Создан строгий машиночитаемый формат логирования работы блокчейна для упрощения
                                поиска ошибок, фильтрации и быстрого получения данных
                            </p>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf13' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Реализована возможность создавать собственные токены, привязанные к токену
                                Голоса
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf14' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Плата за регистрацию собственных токенов будет зависеть от длины названия токена
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf15' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Введена поддержка нескольких версий протокола бизнес-логики
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf16' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Прайс-фиды делегатов более не ограничены временем
                            </p>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf17' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Внедрена возможность использования кошелька из командной строки
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf18' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Сроки понижения силы голоса увеличены с 13 до 20 недель
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf19' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Изменение лицензии на MIT
                            </p>
                        </div>
                        <div className='column large-3 medium-3 small-3'>
                            <Icon name='hf/hf20' size='5x'/>
                            <p className='landing-start-block-icon-text'>
                                Увеличен лимит на количество постов с четырех до восьми в сутки
                            </p>
                        </div>
                        <div className="row">
                            <div className='column large-12 medium-12 small-12'>
                                <p>Таблицу с голосованием делегатов по каждому нововведению можно увидеть здесь</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='landing-block'>
                    <div className="row">
                        <div className="column large-12 medium-12 small-12">
                            <h1>Когда произойдет хардфорк?</h1>
                            <hr/>
                        </div>
                        <div className="column large-12 medium-12 small-1">
                            <p>Принятие хардфорка произойдет после согласования 17 из 21 делегата
                                (https://golos.io/golosio/@golosio/otvety-golos-io-kak-stat-delegatom) всех
                                нововведений. Сам программный код хардфорка полностью готов к запуску.</p>
                        </div>
                    </div>
                </div>
                <div className='landing-block'>
                    <div className="row">
                        <div className="column large-12 medium-12 small-12">
                            <h1>Как ускорить принятие хардфорка?</h1>
                            <hr/>
                        </div>
                    </div>
                    <div>
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
                <div className='landing-block-footer'>
                <div className='landing-block'>
                <div className="row">
                        <div className="column large-12 medium-12 small-12">
                            <h1>остались вопросы?</h1>
                            <hr/>
                        </div>
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