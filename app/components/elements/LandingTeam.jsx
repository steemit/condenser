import React from 'react'

export default class LandingTeam extends React.Component {
	render() {
		return (
			<section className="Team">
				<div className="row text-center">
					<div className="small-12 columns">
						<h2 className="Team__header" id="team">Команда</h2>
					</div>
				</div>

				<div className="row Team__members text-center">
                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 small-centered medium-centered large-centered columns Team__member Team__member__sergey">
                        <div className="Team__members__image-wrapper">
                            <a href="https://www.facebook.com/serejandmyself"><img className="Team__member__img" src="images/landing/sergey.jpg" /></a>
                        </div>
                        <strong>Сергей Симановский</strong>
                        <p>Project Manager</p>
                        <ul>
                            <li><a href="https://www.linkedin.com/in/sergey-simanovsky-87b5ab100"><img src="images/landing/linkedin_icon.jpg" /></a></li>
                            <li><a href="https://www.facebook.com/serejandmyself"><img className="Team__facebook-logo" src="https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-512.png" /></a></li>
                        </ul>
                    </div>
                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 small-centered medium-centered large-centered columns Team__member Team__member__anton">
                        <div className="Team__members__image-wrapper">
                            <a href="https://www.linkedin.com/in/solodikov"><img className="Team__member__img" src="images/landing/anton.jpg" /></a>
                        </div>
                        <strong>Антон Солодиков</strong>
                        <p>СМО</p>
                        <ul>
                            <li><a href="https://www.linkedin.com/in/solodikov"><img src="images/landing/linkedin_icon.jpg" alt="фотография Антона Солодикова" /></a></li>
                            <li><a href="https://www.facebook.com/solodikov"><img className="Team__facebook-logo" src="https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-512.png" /></a></li>
                        </ul>
                    </div>
					<div data-wow-delay="1s" className="wow fadeIn small-12 medium-12 large-3 columns small-centered Team__member Team__member__mihail">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="https://s23.postimg.org/ju1d2msuz/2765860.png" alt="фотография Михаила Комарова" />
						</div>
						<strong>Михаил Комаров</strong>
						<p>Блокчейн разработка</p>
						<ul>
							<li><a href="https://github.com/Nemo1369"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>
                    <div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="https://avatars3.githubusercontent.com/u/25533641?v=3&s=460" alt="фотография Горошко Павла" />
                        </div>
                        <strong>Горошко Павел</strong>
                        <p>Web разработка</p>
                        <ul>
                            <li><a href="https://github.com/pavelit"><img src="images/landing/github_icon.jpg" /></a></li>
                        </ul>
                    </div>
					<div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member Team__member__pavel">
                        <div className="Team__members__image-wrapper">
                            <img className="Team__member__img" src="https://avatars2.githubusercontent.com/u/3322340?v=3&s=460" alt="фотография Ткаченко Игоря" />
                        </div>
                        <strong>Ткаченко Игорь</strong>
                        <p>Web разработка</p>
                        <ul>
                            <li><a href="https://github.com/b1acksun"><img src="images/landing/github_icon.jpg" /></a></li>
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
                        </ul>
                    </div>

                </div>

				<div className="row text-center">
					<div className="small-12 columns">
						<h2 className="Team__header">Основатели</h2>
					</div>
				</div>

				<div className="row Team__members text-center">
					<div className="small-12 medium-4 large-3 columns Team__member wow fadeIn" data-wow-delay="1s">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="https://avatars2.githubusercontent.com/u/410789?v=3&s=400" alt="фотография Димы Стародубцева" />
						</div>
						<strong>Дима Стародубцев</strong>
						<p>Экономика</p>
						<ul>
							<li><a href="https://cyber.fund/"><img style={{width:'33px', height:'33px'}} src="https://cyber.fund/images/cybF.svg" /></a></li>
							<li><a href="https://github.com/21xhipster"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>

					<div className="small-12 medium-4 large-3 columns Team__member wow fadeIn" data-wow-delay="1s">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="https://avatars1.githubusercontent.com/u/1690657?v=3&s=400" alt="фотография Валерия Литвина" />
						</div>
						<strong>Валерий Литвин</strong>
						<p>Блокчейн-разработка</p>
						<ul>
							<li><a href="https://cyber.fund/@besson_by"><img style={{width:'33px', height:'33px'}} src="https://cyber.fund/images/cybF.svg" /></a></li>
							<li><a href="https://www.facebook.com/bessonby"><img className="Team__facebook-logo" src="https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-512.png" /></a></li>
							<li><a href="https://github.com/ValeryLitvin"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>
					<div className="small-12 medium-4 large-3 columns Team__member Team__member__marina wow fadeIn" data-wow-delay="1s">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="images/landing/Marina.jpg" alt="фотография Марины Гуревой" />
						</div>
						<strong>Марина Гурева</strong>
						<p>Партнерства</p>
						<ul>
							<li><a href="https://fr.linkedin.com/in/marina-guryeva-1390a03b"><img src="images/landing/linkedin_icon.jpg" /></a></li>
							<li><a href="https://www.facebook.com/marina.guryeva.79"><img className="Team__facebook-logo" src="https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-512.png" /></a></li>
							<li><a href="https://www.github.com/mguryeva"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>

					<div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns Team__member Team__member__alexey">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="images/landing/alexey.jpg" alt="фотография Алексея Фрумина" />
						</div>
						<strong>Алексей Фрумин</strong>
						<p>Back-end разработка</p>
						<ul>
							<li><a href="https://cyber.fund/"><img style={{width:'33px', height:'33px'}} src="https://cyber.fund/images/cybF.svg" /></a></li>
							<li><a href="https://github.com/tomarcafe"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>
					<div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns Team__member Team__member__vitaly">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="https://s3.amazonaws.com/keybase_processed_uploads/bc86969a26560b7a081d1f720f6f3c05_360_360_square_360.jpeg" alt="фотография Виталия Львова" />
						</div>
						<strong>Виталий Львов</strong>
						<p>Финансы и аудит</p><br/>
						<ul>
							<li><a href="https://cyber.fund/"><img style={{width:'33px', height:'33px'}} src="https://cyber.fund/images/cybF.svg" /></a></li>
							<li><a href="https://twitter.com/vitalylvov"><img src="images/landing/twitter_icon.jpg" /></a></li>
							<li><a href="https://github.com/vitalylvov"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>

					<div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns Team__member Team__member__kostya">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="images/landing/kostya.jpg" alt="фотография Константина Ломашука" />
						</div>
						<strong>Константин Ломашук</strong>
						<p>Развитие бизнеса</p>
						<ul>
							<li><a href="https://ru.linkedin.com/in/lomashuk"><img src="images/landing/linkedin_icon.jpg" /></a></li>
							<li><a href="https://www.facebook.com/k.lomashuk"><img className="Team__facebook-logo" src="https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-512.png" /></a></li>
							<li><a href="https://github.com/lomashuk"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>
					<div data-wow-delay="1s" className="wow fadeIn small-12 medium-4 large-3 columns Team__member Team__member__valentin">
						<div className="Team__members__image-wrapper">
							<img className="Team__member__img" src="https://avatars2.githubusercontent.com/u/28658?v=3&s=400" alt="фотография Валентина Завгороднева" />
						</div>
						<strong>Валентин Завгороднев</strong>
						<p>Консультации</p>
						<ul>
							<li><a href="https://www.linkedin.com/in/valentine"><img src="images/landing/linkedin_icon.jpg" /></a></li>
							<li><a href="https://github.com/valzav"><img src="images/landing/github_icon.jpg" /></a></li>
						</ul>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
