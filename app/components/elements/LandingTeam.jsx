import React from 'react'
import Icon from 'app/components/elements/Icon'

export default class LandingTeam extends React.Component {
// •
	render() {
		return (
			<section className="Team">
				<div className="row text-center">
					<div className="small-12 columns">
						<h2 className="Team__header" id="team">Команда</h2>
					</div>
				</div>

				<div className="row Team__members">
					<div className="small-6 medium-4 large-3 columns Team__member">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="https://avatars2.githubusercontent.com/u/410789?v=3&s=400" alt="фотография Димы Стародубцева" />
						</div>
						<strong>Дмитрий Стародубцев</strong>
						<p>Сооснователь cyber.fund</p>
						<ul>
							<li><a href="https://github.com/21xhipster"><img src="images/landing/github_icon.jpg" /></a></li>
							<li><a href="https://cyber.fund/"><img style={{width:'40px', height:'40px'}} src="https://cyber.fund/images/cybF.svg" /></a></li>
						</ul>
					</div>

					<div className="small-6 medium-4 large-3 columns Team__member">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="https://avatars1.githubusercontent.com/u/1690657?v=3&s=400" alt="фотография Валерия Литвина" />
						</div>
						<strong>Валерий Литвин</strong>
						<p>Блокчейн-разработка</p>
						<ul>
							<li><a href="https://www.linkedin.com/in/valery-litvin-97864267"><img src="images/landing/linkedin_icon.jpg" /></a></li>
							<li><a href="https://www.facebook.com/bessonby"><Icon name="facebook" size="2x" /></a></li>
							<li><a href="https://github.com/ValeryLitvin"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>
					<div className="small-6 medium-4 large-3 columns Team__member Team__member__marina">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="images/landing/Marina.jpg" alt="фотография Марины Гуревой" />
						</div>
						<strong>Марина Гурева</strong>
						<p>Партнерство</p>
						<ul>
							<li><a href="https://fr.linkedin.com/in/marina-guryeva-1390a03b"><img src="images/landing/linkedin_icon.jpg" /></a></li>
							<li><a href="https://www.facebook.com/marina.guryeva.79"><Icon name="facebook" size="2x" /></a></li>
							<li><a href="https://www.github.com/mguryeva"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>

					<div className="small-6 medium-4 large-3 columns Team__member Team__member__alexey">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="images/landing/alexey.jpg" alt="фотография Алексея Фрумина" />
						</div>
						<strong>Алексей Фрумин</strong>
						<p>Моральная поддержка</p>
						<ul>
							<li><a href="https://www.linkedin.com/in/alexey-frumin-9a330a42"><img src="images/landing/linkedin_icon.jpg" /></a></li>
							<li><a href="https://cyber.fund/"><img style={{width:'40px', height:'40px'}} src="https://cyber.fund/images/cybF.svg" /></a></li>
							<li><a href="https://github.com/tomarcafe"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>
					<div className="small-6 medium-4 large-3 columns Team__member Team__member__vitaly">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="https://s3.amazonaws.com/keybase_processed_uploads/bc86969a26560b7a081d1f720f6f3c05_360_360_square_360.jpeg" alt="фотография Виталия Львова" />
						</div>
						<strong>Виталий Львов</strong>
						<p>Финансы и аудит</p><br/>
						<ul>
							<li><a href="https://cyber.fund/"><img style={{width:'40px', height:'40px'}} src="https://cyber.fund/images/cybF.svg" /></a></li>
							<li><a href="https://twitter.com/vitalylvov"><img src="images/landing/twitter_icon.jpg" /></a></li>
							<li><a href="https://github.com/vitalylvov"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>

					<div className="small-6 medium-4 large-3 columns Team__member Team__member__kostya">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="images/landing/kostya.jpg" alt="фотография Контстантина Ломашука" />
						</div>
						<strong>Константин Ломашук</strong>
						<p>Развитие бизнеса</p>
						<ul>
							<li><a href="https://ru.linkedin.com/in/lomashuk"><img src="images/landing/linkedin_icon.jpg" /></a></li>
							<li><a href="https://www.facebook.com/k.lomashuk"><Icon name="facebook" size="2x" /></a></li>
							<li><a href="https://github.com/lomashuk"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>
					<div className="small-6 medium-4 large-3 columns Team__member Team__member__misha">
						<div className="Team__members__image-wrapper">
							{/* <img className="Team__member__img" src="https://pp.vk.me/c619721/v619721379/1de32/S_1velJqxSA.jpg" alt="фотография Михаила Палей" /> */}
							<img className="Team__member__img" src="https://pp.vk.me/c637427/v637427379/6319/yNXcC70HrLA.jpg" alt="фотография Михаила Палей" />
						</div>
						<strong>Михаил Палей</strong>
						<p>Front-end разработка</p>
						<ul>
							<li><a href="https://www.vk.com/paleyblog">vk</a></li>
							<li><a href="https://www.github.com/Undeadlol1"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>
				</div>

				<div className="row center Team__partners">
					<div className="small-6 medium-4 large-3 small-centered medium-centered large-centered columns Team__member">
						<div className="Team__members__image-wrapper">
							<a href="https://www.facebook.com/mike.chobanyan.7"><img className="Team__member__img" src="http://kuna.com.ua/wp-content/uploads/2015/12/DSC_3422-240x300.jpg.pagespeed.ce.vQtihTFuzz.jpg" /></a>
						</div>
						<strong>Михаил Чобанян</strong>
						<p>Информационная поддержка в Украине</p>
						<ul>
							<li></li>
						</ul>
					</div>
					<div className="small-6 medium-4 large-3 small-centered medium-centered large-centered columns Team__member">
						<div className="Team__members__image-wrapper">
							<a href="http://kuna.com.ua/about/"><img className="Team__member__img" src="http://kuna.com.ua/wp-content/uploads/2014/08/kuna_logo_258x258.png.pagespeed.ce.qhr50_CAH4.png" /></a>
						</div>
						<strong>Kuna</strong>
						<p>Информационная поддержка в Украине</p>
						<ul>
							<li></li>
						</ul>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
