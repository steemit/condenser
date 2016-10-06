import React from 'react'

export default class LandingTeam extends React.Component {

	// const teamMember
	// functiom renderTeam() {
	// 	//
	// }

	render() {
		return (
			<section className="Team">
				<div className="row text-center">
					<div className="small-12 columns">
						<h2>Команда</h2>
					</div>
				</div>
				<div className="row">
					<div className="small-6 medium-4 large-3 columns Team__member">
						<img height="180px" width="180px" src="images/landing/Marina.jpg" alt="фотография Марины Гуревой" />
						<strong>Марина Гурева</strong>
						<p>CEO, Генеральный директор</p>
						<ul>
							<li>https://fr.linkedin.com/in/marina-guryeva-1390a03b</li>
							<li>https://www.facebook.com/marina.guryeva.79</li>
							<li>Github: mguryeva</li>
						</ul>
					</div>
					<div className="small-6 medium-4 large-3 columns Team__member">
						<img height="180px" width="180px" src="https://avatars2.githubusercontent.com/u/410789?v=3&s=400" alt="фотография Димы Стародубцева" />
						<strong>Дмитрий Стародубцев</strong>
						<p>Сооснователь cyber.fund</p>
						<ul>
							<li>in</li>
							<li>tw</li>
							<li>gt</li>
						</ul>
					</div>
					<div className="small-6 medium-4 large-3 columns Team__member">
						<img height="180px" width="180px" src="https://avatars1.githubusercontent.com/u/1690657?v=3&s=400" alt="фотография Валерия Литвина" />
						<strong>Валерий Литвин</strong>
						<p>Блокчейн-разработчик</p>
						<ul>
							<li>https://www.linkedin.com/in/valery-litvin-97864267</li>
							<li>https://www.facebook.com/bessonby</li>
							<li>https://github.com/ValeryLitvin</li>
						</ul>
					</div>
					<div className="small-6 medium-4 large-3 columns Team__member">
						<img height="180px" width="180px" src="https://pp.vk.me/c638029/v638029751/ed2/r85nY79Snfs.jpg" alt="фотография Алексея Фрумина" />
						<strong>Алексей Фрумин</strong>
						<p>cyber.fund</p>
						<ul>
							<li>in</li>
							<li>tw</li>
							<li>gt</li>
						</ul>
					</div>
					<div className="small-6 medium-4 large-3 columns Team__member">
						<img height="180px" width="180px" src="https://s3.amazonaws.com/keybase_processed_uploads/bc86969a26560b7a081d1f720f6f3c05_360_360_square_360.jpeg" alt="фотография Виталия Львова" />
						<strong>Виталий Львов</strong>
						<p>Финансы и аудит</p>
						<ul>
							<li>https://cyber.fund/</li>
							<li>https://twitter.com/vitalylvov</li>
							<li>https://github.com/vitalylvov</li>
						</ul>
					</div>
					<div className="small-6 medium-4 large-3 columns Team__member">
						<img height="180px" width="180px" src="images/landing/kostya.jpg" alt="фотография Контстантина Ломашука" />
						<strong>Константин Ломашук</strong>
						<p>Сооснователь cyber.fund</p>
						<ul>
							<li>https://ru.linkedin.com/in/lomashuk</li>
							<li>https://www.facebook.com/k.lomashuk</li>
							<li>https://github.com/lomashuk</li>
						</ul>
					</div>
					<div className="small-6 medium-4 large-3 columns Team__member">
						<img height="180px" width="180px" src="https://pp.vk.me/c619721/v619721379/1de32/S_1velJqxSA.jpg" alt="фотография Михаила Палей" />
						<strong>Михаил Палей</strong>
						<p>писатель скриптов руками</p>
						<ul>
							<li>in</li>
							<li>tw</li>
							<li>gt</li>
						</ul>
					</div>
				</div>
				<div className="row">
					<div className="small-12 columns">
						<button className="button block">Регистрация</button>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
