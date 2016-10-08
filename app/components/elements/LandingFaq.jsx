import React from 'react'
import Accordion from 'app/components/elements/Accordion'

export default class LandingFaq extends React.Component {
	render() {
		const elements = [
			{
				title: 'Чем Голос отличается от других платформ?',
				content: 'Обычно криптовалютные платформы требуют от пользователей что то предпринять для того, чтобы вознаградить других за их вклад. У Голос вознаграждение других осуществляется путем голосования за публикацию также просто как это вы сделали бы это например в социальных сетях Facebook или ВКонтакте.'
			},
			{
				title: 'Как оплачивается создание контента и кураторство?',
				content: 'Блокчейн распределяет выплаты в следующей пропорции: 50% добавляется в Силу Голоса для голосования и 50% Золотых. Вознаграждения распределяются в блокчейне подобно тому, как майнерам выплачивается награда в Bitcoin, и происходит примерно через 24 часа после размещения публикации и подачи голосов.'
			},
			{title: 'Откуда берется стоимость Золотого?'},
			{title: 'Почему называется Голос?'},
			{title: 'Как рассчитывается выплата за размещение поста?'},
			{title: 'Что такое Сила Голоса?'}
		]

		return (
			<section className="Faq" id="qa">
				<div className="row text-center Faq__headers">
					<div className="small-12 columns">
						<h2 className="Landing__h2_blue">Вопросы - ответы</h2>
						<span className="Faq__supporting-text">Узнайте больше о Голосе</span>
					</div>
				</div>
				{/* <div className="row Faq__accordion">
					<div className="small-12 columns">
						<Accordion elements={elements} />
					</div>
				</div> */}
				<div className="row Faq__action">
					<div className="small-12 columns">
						<p className="Faq__p">Остались вопросы? Наше комьюнити поможет Вам найти ответы</p>
						<button className="button">Ответы на вопросы</button>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
