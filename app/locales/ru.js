<<<<<<< HEAD

import { APP_NAME, APP_URL, LANDING_PAGE_URL, OWNERSHIP_TOKEN, DEBT_TOKEN, DEBT_TOKEN_SHORT, CURRENCY_SIGN, INVEST_TOKEN, OWNERSHIP_TICKER } from 'config/client_config';
/**
 * see: app/locales/README.md
 */
=======
>>>>>>> steemit/develop
const ru = {
	// this variables mainly used in navigation section
	about: "О проекте",
	explore: "Исследовать",
<<<<<<< HEAD
	APP_NAME_whitepaper: "Бумага о " + APP_NAME,
	buy_OWNERSHIP_TOKEN: 'Купить ' + OWNERSHIP_TOKEN,
	sell_OWNERSHIP_TOKEN: 'Продать ' + OWNERSHIP_TOKEN,
	market: "Биржа",
	stolen_account_recovery: "Возврат украденного аккаунта",
	change_account_password: "Изменить пароль аккаунта",
	APP_NAME_chat: APP_NAME + " чат",
	witnesses: "Делегаты",
=======
	whitepaper: "Бумага о Steem",
	buy_steem: "Купить Steem",
	sell_steem: "Продать Steem",
	market: "Маркет",
	stolen_account_recovery: "Возврат украденного аккаунта",
	change_account_password: "Изменить пароль аккаунта",
	steemit_chat: "Steemit чат",
	witnesses: "Свидетели",
>>>>>>> steemit/develop
	privacy_policy: "Политика Конфиденциальности",
	terms_of_service: "Условия пользования",
	sign_up: "Регистрация",
	/* end navigation */
	buy: 'Купить',
	sell: 'Продать',
<<<<<<< HEAD
	buy_INVEST_TOKEN: 'Купить ' + INVEST_TOKEN,
	transaction_history: 'История транзакций',
	submit_a_story: 'Добавить пост',
	nothing_yet: 'Пока ничего нет',
	close: 'Закрыть',
	// next 5 strings were supposed to be sinngle block of text, but due large size,
	// code erros they were splitted.
	authors_get_paid_when_people_like_you_upvote_their_post: 'В сети Голос авторы получают вознаграждение, когда пользователи голосуют за их посты.',
	if_you_enjoyed_what_you_read_earn_amount: "Проголосовавшие читатели также вознаграждаются. Если вам понравился данный пост Вы можете вознаградить автора",
	when_you: "Для этого",
	when_you_link_text: 'зарегистрируйтесь',
	and_vote_for_it: 'и проголосуйте за пост',
	// post_promo_text: "Авторы получают вознаграждение, когда пользователи голосуют за их посты<br />Проголосовавшие также вознаграждаются. Если вам понравилось, то что вы прочитали здесь, заработайте {amount} в " + INVEST_TOKEN + "<br />. Для этого  {link} и проголосуете за пост.",
	post_promo_text_link: '',
	read_only_mode: 'Из-за технического обслуживания сервера мы работаем в режиме чтения. Извините за неудобство.',
	membership_invitation_only: 'Стать пользователем Голоса сейчас возможно только по приглашению. Попросите ваших знакомых о приглашении', // желающих зарегистрироваться ?
	submit_email_to_get_on_waiting_list: 'Добавьте ваш адрес электронной почты, чтобы попасть в список ожидания',
	login: 'Войти',
	logout: 'Выйти',
	show_less_low_value_posts: "Показать меньше сообщений низкой стоимости",
	show_more_low_value_posts: "Показать больше сообщений низкой стоимости",
=======
	buy_steem_power: 'Купить Steem Power',
	transaction_history: 'История транзакций',
	submit_a_story: 'Добавить историю',
	nothing_yet: 'Пока ничего нет',
	close: 'Закрыть',
	post_promo_text: "Authors get paid when people like you upvote their post \n If you enjoyed what you read here, earn ${amount} of Steem Power \n when you {link} and vote for it.",
	read_only_mode: 'Due to server maintenance we are running in read only mode. We are sorry for the inconvenience.',
	membership_invitation_only: 'Membership to Steemit.com is now under invitation only because of unexpectedly high sign up rate.',
	submit_email_to_get_on_waiting_list: 'Submit your email to get on the waiting list',
	login: 'Войти',
	logout: 'Выйти',
	show_less_low_value_posts: "Show less low value posts",
	show_more_low_value_posts: "Show more low value posts",
>>>>>>> steemit/develop
	select_topic: 'Выбрать топик',
	tags_and_topics: "Тэги и топики",
	filter: "Фильтр",
	show_more_topics: "Показать больше топиков",
<<<<<<< HEAD
	we_require_social_account: APP_NAME + ' спонсирует каждый аккаунт на сумму около {signup_bonus} в ' + INVEST_TOKEN + '; чтобы предотвратить злоупотребление, мы просим новых пользователей регистрироваться используя социальные сети.',
	personal_info_will_be_private: 'Ваша персональная информация будет оставаться',
	personal_info_will_be_private_link: 'приватной',
	continue_with_facebook: 'Продолжить с Facebook',
	continue_with_reddit: 'Продолжить с Reddit',
	continue_with_vk: 'Продолжить с Vk',
	requires_positive_karma: 'необходима позитивная карма Reddit комментирования',
	dont_have_facebook: 'Нет Facebook или Reddit аккаунта?',
	subscribe_to_get_sms_confirm: 'Подпишитесь чтобы получить SMS когда подтверждение будет доступно',
	by_verifying_you_agree: 'Подтверждая ваш аккаунт вы соглашаетесь с условиями проекта ' + APP_NAME,
	by_verifying_you_agree_terms_and_conditions: 'условиями и соглашениями',
	terms_and_conditions: 'Условия и Соглашения',
	// this is from top-right dropdown menu
	hot: 'Актуальное',
	trending: 'Популярное',
	payout_time: 'время выплаты',
	active: 'Обсуждаемое',
=======
	we_require_social_account: 'Steemit funds each account with over {signup_bonus} worth of Steem Power; to prevent abuse, we require new users to login via social media.',
	personal_info_will_be_private: 'Твоя персональная информация будет оставаться',
	personal_info_will_be_private_link: 'приватной',
	continue_with_facebook: 'Продолжить с Facebook',
	continue_with_reddit: 'Продолжить с Reddit',
	requires_positive_karma: 'необходима позитивная карма Reddit комментирования',
	dont_have_facebook: 'Нет Facebook или Reddit аккаунта?',
	subscribe_to_get_sms_confirm: 'Subscribe to get a notification when SMS confirmation is available',
	by_verifying_you_agree: 'Подтверждая ваш аккаунт вы соглашаетесь с Steemit',
	by_verifying_you_agree_terms_and_conditions: 'условиями и соглашениями',
	terms_and_conditions: 'Условия и Соглашения',
	// this is from top-right dropdown menu
	hot: 'горячее',
	trending: 'набирающее популярность',
	payout_time: 'время выплаты',
	active: 'активное',
>>>>>>> steemit/develop
	responses: 'ответы',
	popular: 'популярное',
	/* end dropdown menu */
	loading: 'Загрузка',
	cryptography_test_failed: 'Криптографический тест провален',
	unable_to_log_you_in: 'У нас не получится залогинить вас в этом браузере',
<<<<<<< HEAD
	// next 3 blocks will be used in conjunction
	/* this is how it will look like:
	'The latest versions of <a href="https://www.google.com/chrome/">Chrome</a> and <a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a> are well tested and known to work with steemit.com.' */
	the_latest_versions_of: 'Последние версии',
	and: 'и',
	are_well_tested_and_known_to_work_with: 'хорошо тестированы и работают с ' + APP_URL + '.',
	account_creation_succes: 'Твой аккаунт успешно создан!',
	account_recovery_succes: 'Твой аккаунт успено восстановлен!',
	password_update_succes: 'Пароль для {accountName} был успешно обновлен',
	password_is_bound_to_your_accounts_owner_key: "Этот пароль привязан к главному ключу аккаунта и не может быть использован для логинации на сайте",
	however_you_can_use_it_to: "Тем не менее его можно использовать чтобы",
	to_obtaion_a_more_secure_set_of_keys: "для получения более безопасного набора ключей",
	update_your_password: 'обновить твой пароль',
	enter_username: 'Введи свое имя пользователя',
	password_or_wif: 'Пароль или WIF',
	requires_auth_key: 'Эта операция требует вашего {authType} ключа (или используйте главный пароль)',
=======
	latest_browsers_do_work: 'Последние версии {chromeLink} и {mozillaLink} хорошо тестированы и работают с steemit.com.',
	account_creation_succes: 'Твой аккаунт успешно создан!',
	account_recovery_succes: 'Твой аккаунт успено восстановлен!',
	password_update_succes: 'Пароль для {accountName} был успешно обновлен',
	password_is_bound_to_account: "This password is bound to your account\'s owner key and can not be used to login to this site. \nHowever, you can use it to {changePasswordLink} to obtain a more secure set of keys.",
	update_your_password: 'обновить твой пароль',
	enter_username: 'Введи свой username',
	password_or_wif: 'Пароль или WIF',
	requires_auth_key: 'This operation requires your {authType} key (or use your master password)',
>>>>>>> steemit/develop
	keep_me_logged_in: 'Оставлять меня залогиненным',
	// this are used mainly in "submit a story" form
	title: "Заголовок",
	write_your_story: 'Написать свою историю',
	editor: 'Редактор',
	reply: 'Ответить',
	edit: 'Редактировать',
	delete: 'Удалить',
	cancel: 'Отмена',
	clear: 'Очистить',
	save: 'Сохранить',
	upvote_post: 'Проголосовать за пост',
	update_post: 'Обновить пост',
	markdown_is_supported: 'Поддерживается стилизация с Markdown',
	preview: 'Предварительный просмотр',
<<<<<<< HEAD
	markdown_not_supported: 'Markdown здесь не поддерживается',
	welcome_to_the_blockchain: 'Добро пожаловать в Blockchain!',
	your_voice_is_worth_something: 'Твой голос чего-то стоит',
	learn_more: 'Узнать больше',
	get_INVEST_TOKEN_when_sign_up: 'Получи {signupBonus} ' + INVEST_TOKEN + ' подписавшись сегодня.',
	all_accounts_refunded: 'Все потери по восстанавливаемым аккаунтам были полностью компенсированы',
	APP_URL_is_now_open_source: APP_URL + ' теперь Open Source',
	// this is mainly from ReplyEditor
	tag_your_story: 'Добавь тэги (до 5 штук), первый тэг станет основной категорией.',
	select_a_tag: 'Выбрать тэг',
	required: 'Обязательно',
	shorten_title: 'Сократите заголовок',
	exceeds_maximum_length: 'Превышает максимальную длину ({maxKb}KB)',
	including_the_category: "(включая категорию '{rootCategory}')",
	use_limited_amount_of_tags: 'У вас {tagsLength} тэгов, включая {includingCategory}. Пожалуйста, используйте не более 5 в посте и категории.',
	// this is mainly used in CategorySelector
	maximum_tag_length_is_24_characters: 'Максимальная длина категории 24 знака',
	use_limitied_amount_of_categories: 'Пожалуйста используйте не более {amount} категорий',
	use_only_lowercase_letters: 'Используйте только символы нижнего регистра',
=======
	// TODO do not forget to implment REQUIRED error in reply Editor
	markdown_not_supported: 'Markdown здесь не поддерживается',
	// markdown: 'Markdown', // эта строка возможно будет удалена
	welcome_to_the_blockchain: 'Добро пожаловать в Blockchain!',
	your_voice_is_worth_something: 'Your voice is worth something',
	learn_more: 'Узнать больше',
	get_sp_when_sign_up: 'Get {signupBonus} of Steem Power when you sign up today.',
	all_accounts_refunded: 'All Recovered Accounts have been fully Refunded',
	steemit_is_now_open_source: 'Steemit.com is now Open Source',
	// this is mainly from ReplyEditor
	tag_your_story: 'Tag (up to 5 tags), the first tag is your main category.',
	select_a_tag: 'Выбрать тэг',
	required: 'Обязательно',
	shorten_title: 'Сократите заголовок',
	exceeds_maximum_length: 'Пребывает максимальную длину ({maxKb}KB)',
	including_the_category: "(including the category '{rootCategory}')",
	use_limited_amount_of_tags: 'You have {tagsLength} tags total{includingCategory}.  Please use only 5 in your post and category line.',
	// this is mainly used in CategorySelector
	use_limitied_amount_of_categories: 'Пожалуйста используйте не более {amount} категорий',
>>>>>>> steemit/develop
	use_one_dash: 'Используйте только одно тире',
	use_spaces_to_separate_tags: 'Используйте пробел чтобы разделить тэги',
	use_only_allowed_characters: 'Используйте только строчные буквы, цифры и одно тире',
	must_start_with_a_letter: 'Должно начинаться с буквы',
	must_end_with_a_letter_or_number: 'Должно заканчиваться с буквы или номера',
	// tags page
	tag: 'Тэг',
	replies: 'Ответы',
	payouts: 'Выплаты',
	need_password_or_key: 'Вам нужен приватный пароль или ключ (не публичный ключ)',
	// BlocktradesDeposit
	change_deposit_address: 'Изменить адрес депозита',
	get_deposit_address: 'Получить адрес депозита',
	// for example 'powered by Blocktrades'
<<<<<<< HEAD
	powered_by: 'Powered by', // NOTE this might be deleted in future
	send_amount_of_coins_to: 'Отправить {value} {coinName} к',
	amount_is_in_form: 'Сумма должна быть в формате 99999.999',
	insufficent_funds: 'Недостаточно средств',
	update_estimate: 'Обновить оценку',
	get_estimate: 'Получить оценку',
	memo: 'Заметка',
	must_include_memo: 'Необходимо включить заметку',
	estimate_using: 'Подсчитать используя',
	amount_to_send: 'Сумма к отправке {estimateInputCoin}',
	deposit_using: 'Пополнить через', // example: 'deposit using Steem Power' // TODO: is this example right?
	suggested_limit: 'Предлогаемый лимит {depositLimit}',
=======
	powered_by: 'Powered by',
	send_amount_of_coins_to: 'Отправить {value} {coinName} к',
	amount_is_in_form: 'Amount is in the form 99999.999',
	insufficent_funds: 'Insufficent funds',
	update_estimate: 'Update Estimate',
	get_estimate: 'Get Estimate',
	memo: 'Memo',
	must_include_memo: 'You must include the memo above',
	estimate_using: 'Подсчитать используя',
	amount_to_send: 'Amount to send {estimateInputCoin}',
	deposit_using: 'Deposit using', // example: 'deposit using Steem Power' // TODO: is this example right?
	suggested_limit: 'Suggested limit {depositLimit}',
>>>>>>> steemit/develop
	internal_server_error: 'Внутренняя ошибка сервера',
	enter_amount: 'Ввести количество',
	processing: 'Обрабатывается',
	broadcasted: 'Транслируется',
	confirmed: 'Подтверждено',
	remove: 'Удалить',
	collapse_or_expand: "Свернуть/Развернуть",
	reveal_comment: 'Показать комментарий',
	are_you_sure: 'Вы уверены?',
	// PostFull.jsx
<<<<<<< HEAD
	by: ' ', // здеcь специально ничего нет, пример: "posted by 'Vitya'" > "добавил 'Vitya'"
=======
	by: ' ', // здеь специально ничего нет, пример: "posted by 'Vitya'" > "добавил 'Vitya'"
>>>>>>> steemit/develop
	in: 'в',
	share: 'Поделиться',
	in_reply_to: 'в ответ на',
	replied_to: 'ответил', // тоже что и 'by'
<<<<<<< HEAD
	transfer_amount_to_INVEST_TOKEN: "Перевести {amount} в " + INVEST_TOKEN,
	transfer_amount_INVEST_TOKEN_to: "Перевод {amount} " + INVEST_TOKEN + " в",
	recieve_amount_INVEST_TOKEN_from: "Получение {amount} " + INVEST_TOKEN + " от",
	transfer_amount_INVEST_TOKEN_from_to: "Передать {amount} " + INVEST_TOKEN + " от {from} к",
	transfer_amount_to: "Перевод {amount} на счёт",
	recieve_amount_from: "Получено {amount} от",
	transfer_amount_from: "Перевод {amount} со счёта",
  transfer_amount_steem_power_to: "Перевод {amount} "+OWNERSHIP_TICKER+" в Силу Голоса",
	stop_power_down: "Остабление Силы Голоса остановлено",
	start_power_down_of: "Ослабление Силы Голоса начато с",
	curation_reward_of_INVEST_TOKEN_for: 'Кураторские вознаграждения {reward} ' + INVEST_TOKEN + ' за',
	author_reward_of_INVEST_TOKEN_for: 'Авторские вознаграждения {payout} и {reward} ' + INVEST_TOKEN + ' за',
	recieve_interest_of: 'Получены проценты в размере {interest}',
	// TODO find where this is used and write an example
	from: 'от',
	to: 'к',
=======
	transfer_amount_to_steem_power: "Передать {amount} в STEEM POWER",
	transfer_amount_steem_power_to: "Передать {amount} STEEM POWER в",
	recieve_amount_steem_power_from: "Получить {amount} STEEM POWER от",
	transfer_amount_steem_power_from_to: "Передать {amount} STEEM POWER от {from} к",
	transfer_amount_to: "Передать {amount} к",
	recieve_amount_from: "Получить {amount} от",
	transfer_amount_from: "Передать {amount} от",
	stop_power_down: "Stop power down",
	start_power_down_of: "Start power down of",
	curation_reward_of_steem_power_for: 'Curation reward of {reward} STEEM POWER for',
	author_reward_of_steem_power_for: 'Author reward of {payout} and {reward} STEEM POWER for',
	recieve_interest_of: 'Receive interest of {interest}',
	// TODO find where this is used and write an example
	to: 'to',
>>>>>>> steemit/develop
	account_not_found: 'Аккаунт не найден',
	this_is_wrong_password: 'Это неправильный пароль',
	do_you_need_to: 'Вам нужно',
	recover_your_account: 'восстановить ваш аккаунт', // this probably will end with question mark
	reset_usernames_password: "Сбросить пароль пользователя {username}",
	this_will_update_usernames_authtype_key: 'Это обновит {username} {authType} ключ',
<<<<<<< HEAD

	the_rules_of_APP_NAME: "Первое правило сети" + APP_NAME + ": не теряйте свой пароль. <br /> Второе правило " + APP_NAME + ": <strong>Не</strong> теряйте свой пароль. <br /> Третье правило " + APP_NAME + ": мы не можем восстановить ваш пароль. <br /> Четвертое правило: если вы можете запомнить свой пароль, значит он не безопасен. <br /> Пятое правило: используйте только сгенерированные случайным образом пароли. <br /> Шестое правило: Никому не говорите свой пароль. <br /> Седьмое правило: Всегда надежно храните свой пароль.",

=======
	the_rules_of_steemit: "The first rule of Steemit is: Do not lose your password.<br /> The second rule of Steemit is: Do <strong>not</strong> lose your password.<br /> The third rule of Steemit is: We cannot recover your password.<br /> The fourth rule: If you can remember the password, it&apos;s not secure.<br /> The fifth rule: Use only randomly-generated passwords.<br /> The sixth rule: Do not tell anyone your password.<br /> The seventh rule: Always back up your password.",
>>>>>>> steemit/develop
	account_name: 'Имя аккаунта',
	recover_password: 'Восстановить аккаунт',
	current_password: 'Текущий пароль',
	recent_password: 'Недавний пароль',
	generated_password: 'Сгенерированный пароль',
	recover_account: 'Восстановить аккаунт',
<<<<<<< HEAD
	new: 'Новое', // ex. 'Generated Password (new)', but not exclusively
	backup_password_by_storing_it: 'Сделайте резервную копию в менеджере паролей или текстовом файле',
	click_to_generate_password: 'Нажмите чтобы сгененировать пароль',
	re_enter_generate_password: 'Повторно введите пароль',
	understand_that_APP_NAME_cannot_recover_password: 'Я понимаю что ' + APP_NAME + ' не сможет восстановить утраченный пароль',
=======
	new: 'новый', // ex. 'Generated Password (new)', but not exclusively
	backup_password_by_storing_it: 'Back it up by storing in your password manager or a text file',
	click_to_generate_password: 'Нажмите чтобы сгененировать пароль',
	re_enter_generate_password: 'Повторно введите пароль',
	understand_that_steemit_cannot_recover_password: 'Я понимаю что Steemit не сможет восстановить утраченный пароль',
>>>>>>> steemit/develop
	i_saved_password: 'Я надежно сохранил сгенерированный пароль',
	update_password: 'Обновить пароль',
	password_must_be_characters_or_more: 'Пароль должен быть {amount} символов или больше',
	passwords_do_not_match: 'Пароли не совпадают',
<<<<<<< HEAD
	you_need_private_password_or_key_not_a_public_key: 'Вам нужен приватный пароль или ключ (не публичный ключ)',
	account_updated: 'Аккаунт обновлен',
	warning: 'внимание',
	your_password_permissions_were_reduced: 'Ваши резрешения пароля были снижены',
	if_you_did_not_make_this_change: 'Если вы не делали этих изменений, пожалуйста',
	owhership_changed_on: 'Собственность изменена на',
	deadline_for_recovery_is: 'Крайним сроком для восстановления является',
	i_understand_dont_show_again: "Понимаю, больше не показывать",
	ok: 'Ок', // Лучше использовать "хорошо" или "ладно"?
	convert_to_INVEST_TOKEN: 'Перевести в ' + INVEST_TOKEN,
	DEBT_TOKEN_will_be_unavailable: 'Эта операция будет проходить через неделю от настоящего момента и ее нельзя отменить. Эти ' + DEBT_TOKEN + ' мгновенно станут недоступны',
	amount: 'Количество',
	convert: 'Конвертировать',
	invalid_amount: 'Неверное количество',
	insufficent_balance: 'Недостаточный баланс',
	in_week_convert_DEBT_TOKEN_to_OWNERSHIP_TOKEN: 'За неделю перевести {amount} ' + DEBT_TOKEN + ' в ' + OWNERSHIP_TOKEN,
=======
	you_need_private_password_or_key_not_a_public_key: 'You need a private password or key (not a public key)',
	account_updated: 'Аккаунт обновлен',
	warning: 'внимание',
	your_password_permissions_were_reduced: 'Your password permissions were reduced',
	if_you_did_not_make_this_change: 'If you did not make this change please',
	owhership_changed_on: 'Ownership Changed On',
	deadline_for_recovery_is: 'Deadline for recovery is',
	i_understand_dont_show_again: "Понимаю, больше не показывать",
	ok: 'Ок', // Лучше использовать "хорошо" или "ладно"?
	convert_to_steem: 'Convert to Steem',
	steem_dollars_will_be_unavailable: 'This action will take place one week from now and can not be canceled. These Steem Dollars will immediatly become unavailable',
	amount: 'Количество',
	steem_dollars: 'STEEM ДОЛЛАРЫ',
	convert: 'Конвертировать',
	invalid_amount: 'Неверное количество',
	insufficent_balance: 'Недостаточный баланс',
	in_week_convert_steem_dollars_to_steem: 'In one week, convert {amount} STEEM DOLLARS into STEEM',
>>>>>>> steemit/develop
	order_placed: 'Заказ размещен', // ex.: "Order placed: Sell {someamount_to_sell} for atleast {min_to_receive}"
	follow: 'Подписаться',
	unfollow: 'Отписаться',
	mute: 'Блокировать',
	unmute: 'Разблокировать',
	confirm_password: 'Подтвердить пароль',
<<<<<<< HEAD
	login_to_see_memo: 'войти чтобы увидеть заметку',
=======
	login_to_see_memo: 'login to see memo',
>>>>>>> steemit/develop
	post: 'Пост', // places used: tooltip in MediumEditor
	unknown: 'Неизвестный', // exp.: 'unknown error'
	account_name_is_not_available: 'Имя аккаунта не доступно',
	type: 'Тип',
	price: 'Цена',
	// Market.jsx
	last_price: 'Последняя цена',
	'24h_volume': 'Объем за 24 часа',
	bid: 'Покупка',
	ask: 'Продажа',
	spread: 'Разница',
	total: 'Итого',
	available: 'Доступно',
	lowest_ask: 'Лучшая цена продажи',
	highest_bid: 'Лучшая цена покупки',
	buy_orders: 'Заказы на покупку',
	sell_orders: 'Заказы на продажу',
	trade_history: 'История сделок',
	open_orders: 'Открытые сделки',
	sell_amount_for_atleast: 'Продать {amount_to_sell} за {min_to_receive} по цене  ({effectivePrice})',
	buy_atleast_amount_for: 'Купить {min_to_receive} за {amount_to_sell} ({effectivePrice})',
	higher: 'Дороже', // context is about prices
	lower: 'Дешевле', // context is about prices
<<<<<<< HEAD
	total_DEBT_TOKEN_SHORT_CURRENCY_SIGN: "Сумма " + DEBT_TOKEN_SHORT + ' (' + CURRENCY_SIGN + ')',
	// RecoverAccountStep1.jsx // recover account stuff
	not_valid: 'Недействительно',
	account_name_is_not_found: 'Имя аккаунта не найдено',
	unable_to_recover_account_not_change_ownership_recently: 'У нас не получилось восстановить этот аккаунт, он не менял владельца в недавнее время.',
	password_not_used_in_last_days: 'Этот пароль не использовался в этом аккаунте за последние 30 дней.',
	request_already_submitted_contact_support: 'Ваш запрос был отправлен, и мы работаем над этим. Пожалуйста, свяжитесь с t@cyber.fund для получения статуса вашего запроса.',
	recover_account_intro: "Иногда бывает что  ключ владельца может быть скомпрометирован. Восстановление украденного аккаунта дает законному владельцу 30 дней чтобы вернуть аккаунт с момента изменения владельческого ключа мошенником. Восстановление украденного аккаунта в " + APP_URL + " возможно только если владелец аккаунта ранее указал '" + APP_NAME + "' в качестве доверенного лица и согласился с Условиями Использования сайта  " + APP_NAME + ".",
	login_with_facebook_or_reddit_media_to_verify_identity: 'Пожалуйста, войдите используя Facebook или Reddit чтобы подтвердить вашу личность',
	login_with_social_media_to_verify_identity: 'Пожалуйста, зайдите с помощью {show_social_login} чтобы подтвердить вашу личность',
	enter_email_toverify_identity: 'Нам нужно подтвердить вашу личность. Пожалуйста укажите вашу электронную почту ниже, чтобы начать проверку.',
	email: 'Электронная почта',
	continue_with_email: "Продолжить",
	thanks_for_submitting_request_for_account_recovery: '<p>Благодарим Вас за отправку запроса на восстановление аккаунта используя основанную на блокчейне мультифакторную аутентификацию ' + APP_NAME + '’a.</p> <p>Мы ответим Вам как можно быстрее, однако, пожалуйста, ожидайте что может быть некоторая задержка из-за большого объема писем.</p> <p>Пожалуйста, будьте готовы подтвердить свою личность.</p>',
	recovering_account: 'Восстанавливаем аккаунт',
	checking_account_owner: 'Проверяем владельца аккаунта',
	sending_recovery_request: 'Отправляем запрос восстановления',
	cant_confirm_account_ownership: 'Мы не можем подтвердить владение аккаунтом. Проверьте ваш пароль.',
	account_recovery_request_not_confirmed: "Запрос восстановления аккаунта еще не подтвержден, пожалуйста проверьте позднее. Спасибо за ваше терпение.",
	vote: 'Проголосовать', // context: to vote? (title attribute on voting button)
	witness: 'Делегаты',
	top_witnesses: 'Топ делегатов',
=======
	total_sd_dollars: "Сумма SD ($)",
	sd_dollars: "SD ($)",
	// RecoverAccountStep1.jsx // recover account stuff
	not_valid: 'Недействительно',
	account_name_is_not_found: 'Имя аккаунта не найдено',
	unable_to_recover_account_not_change_ownership_recently: 'We are unable to recover this account, it has not changed ownership recently.',
	password_not_used_in_last_days: 'This password was not used on this account in the last 30 days.',
	request_already_submitted_contact_support: 'Your request has been already submitted and we are working on it. Please contact support@steemit.com for the status of your request.',
	recover_account_intro: "From time to time, a Steemian’s owner key may be compromised. Stolen Account Recovery gives the rightful account owner 30 days to recover their account from the moment the thief changed their owner key. Stolen Account Recovery can only be used on steemit.com if the account owner had perviously listed ‘Steemit’ as their account trustee and complied with Steemit’s Terms of Service.",
	login_with_facebook_or_reddit_media_to_verify_identity: 'Please login with Facebook or Reddit to verify your identity',
	login_with_social_media_to_verify_identity: 'Please login with {show_social_login} to verify you identity',
	enter_email_toverify_identity: 'We need to verify your identity. Please enter your email address below to begin the verification.',
	email: 'Электронная почта',
	continue_with_email: "Продолжить с электронной почтой",
	thanks_for_submitting_request_for_account_recovery: '<p>Thanks for submitting your request for Account Recovery using Steem’s blockchain-based multi factor authentication.</p> <p>We will respond to you as quickly as possible, however, please expect there may be some delay in response due to high volume of emails.</p> <p>Please be prepared to verify your identity.</p> <p>Regards,</p> <p>Ned Scott</p> <p>CEO Steemit</p>',
	recovering_account: 'Recovering account',
	checking_account_owner: 'Checking account owner',
	sending_recovery_request: 'Sending recovery request',
	cant_confirm_account_ownership: 'We can\'t confirm account ownership. Check your password',
	account_recovery_request_not_confirmed: "Account recovery request is not confirmed yet, please get back later, thank you for your patience.",
	vote: 'Vote',
	witness: 'Свидетели',
	top_witnesses: 'Топ свидетелей',
>>>>>>> steemit/develop
	// user's navigational menu
	feed: 'Лента',
	wallet: 'Кошелек',
	blog: 'Блог',
	change_password: 'Сменить пароль',
	// UserProfile
	unknown_account: 'Неизвестный аккаунт',
<<<<<<< HEAD
	user_hasnt_made_any_posts_yet: "Похоже что {name} еще не написал постов!",
	user_hasnt_started_bloggin_yet: "Похоже что {name} еще не завёл блог!",
	user_hasnt_followed_anything_yet: "Похоже что {name} еще никого ни на кого не подписан!",
	user_hasnt_had_any_replies_yet: "{name} еще не получил ответов",
=======
	user_hasnt_made_any_posts_yet: "Looks like {name} hasn't made any posts yet!",
	user_hasnt_started_bloggin_yet: "Looks like {name} hasn't started blogging yet!",
	user_hasnt_followed_anything_yet: "Looks like {name} hasn't followed anything yet!",
	user_hasnt_had_any_replies_yet: "{name} hasn't had any replies yet",
>>>>>>> steemit/develop
	users_blog: "блог {name}",
	users_posts: "посты {name}",
	users_wallet: "кошелек {name}",
	users_curation_rewards: "Кураторские вознаграждения {name}",
	users_author_rewards: "Авторские награды {name}",
	users_permissions: "Разрешения {name}",
<<<<<<< HEAD
	recent_replies_to_users_posts: "Недавние ответы к постам пользователя {name}",
	print: 'Распечатать',
=======
	recent_replies_to_users_posts: "Recent replies to {name}'s posts",
	print: 'Print',
>>>>>>> steemit/develop
	curation_rewards: "Кураторские награды",
	author_rewards: 'Авторские награды',
	feeds: 'Лента',
	rewards: 'Награды',
	permissions: 'Разрешения',
	password: 'Пароль',
	posts: 'Посты',
<<<<<<< HEAD
	// PLURALS
	// see locales/README.md on how to properly use them
=======
	// english language does not need plurals, but your language might need it
>>>>>>> steemit/develop
	// context usually is about profile stats: 'User has: 3 posts, 2 followers, 5 followed'
	post_count: `{postCount, plural,
		zero {0 постов}
		one {# пост}
		few {# поста}
		many {# постов}
	}`,
	follower_count: `{followerCount, plural,
		zero {0 подписчиков}
		one {# подписчик}
		few {# подписчика}
		many {# подписчиков}
	}`,
	followed_count: `{followingCount, plural,
		zero {0 подписок}
		one {# подписка}
		few {# подписки}
		many {# подписок}
	}`,
	vote_count: `{voteCount, plural,
		zero {0 голосов}
		one {# голос}
		few {# голоса}
		many {# голосов}
	}`,
	response_count: `{responseCount, plural,
		zero {0 ответов}
		one {# ответ}
		few {# ответа}
		many {# ответов}
	}`,
	reply_count: `{replyCount, plural,
		zero {0 ответов}
		one {# ответ}
		few {# ответа}
		many {# ответов}
	}`,
<<<<<<< HEAD
	this_is_users_reputations_score_it_is_based_on_history_of_votes: "Это количество очков репутации пользователя {name}.\n\nКоличество очков подсчитывается на основе истории полученных голосов и на его голосах против контента.",
=======
	this_is_users_reputations_score_it_is_based_on_history_of_votes: "This is ${name}'s reputation score.\n\nThe reputation score is based on the history of votes received by the account, and is used to hide low quality content.",
>>>>>>> steemit/develop
	newer: 'Новее',
	older: 'Старее',
	author_rewards_last_24_hours: 'Авторские вознаграждения за последние 24 часа',
	daily_average_author_rewards: 'Среднесуточные авторские вознаграждения',
	author_rewards_history: 'История авторских наград',
<<<<<<< HEAD
	balance: 'Баланс',
	balances: 'Балансы',
	estimate_account_value: 'Оценка стоимости аккаунта',
	next_power_down_is_scheduled_to_happen_at: 'Следующее понижение Силы Голоса запланировано на',
=======
	balances: 'Балансы',
	estimate_account_value: 'Оценочная ценность аккаунта',
	next_power_down_is_scheduled_to_happen_at: 'The next power down is scheduled to happen',
>>>>>>> steemit/develop
	transfers_are_temporary_disabled: 'Переводы временно отключены',
	history: 'История',
	// CurationRewards.jsx
	curation_rewards_last_24_hours: 'Кураторские награды за полседние 24 часа',
	daily_average_curation_rewards: 'Среднесуточные кураторские награды',
<<<<<<< HEAD
	estimated_curation_rewards_last_week: "Оценочные кураторские награды за последнюю неделю",
=======
	estimated_curation_rewards_last_week: "Оценочные кураторские награды за последгюю неделю",
>>>>>>> steemit/develop
	curation_rewards_last_week: "Кураторские награды за последнюю неделю",
	curation_rewards_history: 'История кураторских наград',
	// Post.jsx
	now_showing_comments_with_low_ratings: 'Отображаем комментарии с низким рейтингом',
	hide: 'Скрыть',
	show: 'Показать',
	sort_order: 'Порядок сортировки',
	comments_were_hidden_due_to_low_ratings: 'Комментарии были скрыты из-за низкого рейтинга',
<<<<<<< HEAD
	we_will_be_unable_to_create_account_with_this_browser: 'У нас не получится создать аккаунт используя этот браузер',
	you_need_to_logout_before_creating_account: 'Вам нужно {logoutLink} прежде чем вы сможете создать другой аккаунт',
	APP_NAME_can_only_register_one_account_per_verified_user: 'Пожалуйста, имейте ввиду что ' + APP_NAME + ' может регистрировть только один аккаунт для каждого подтвержденного пользователя',
	username: 'Имя пользователя',
	couldnt_create_account_server_returned_error: "Не получилось создать аккаунт. Сервер вернул эту ошибку",
	form_requires_javascript_to_be_enabled: 'Эта форма требует активированный в браузере javascript',
	our_records_indicate_you_already_have_account: 'Наши записи показывают что у вас уже есть ' + APP_NAME + ' аккант',
	// TODO
	to_prevent_abuse_APP_NAME_can_only_register_one_account_per_user: 'Чтобы предотвратить злоупотребление (каждый зарегистрированный аккаунт стоит {amount} в ' + OWNERSHIP_TOKEN + ') ' + APP_NAME + ' может регистрировать только один аккаунт для каждого подтвержденного пользователя.',
	// next 3 blocks are meant to be used together
	you_can_either: 'Вы можете или', // context 'you can either login'
	to_your_existing_account_or: 'в ваш существующий аккаунт или', // context: 'to your existing account or send us email'
	if_you_need_a_new_account: 'если вам нужен новый аккаунт',
	send_us_email: 'отправьте нам электронную почту',
	connection_lost_reconnecting: 'Связь потеряна, переподключаемся',
	// Voting.jsx
	stop_seeing_content_from_this_user: 'Перестать видеть контент от этого пользователя',
	flagging_post_can_remove_rewards_the_flag_should_be_used_for_the_following: 'Голос против может снять вознаграждения и сделать пост менее видимым. Голосование против должно основываться на',
	fraud_or_plagiarism: 'Мошенничество или плагиат',
	hate_speech_or_internet_trolling: 'Разжигание ненависти или интернет троллинг',
	intentional_miss_categorized_content_or_spam: 'Преднамеренная неправильная категоризация контента или спам',
	downvote: 'Голосовать против',
	pending_payout: 'Ожидаемая выплата',
	past_payouts: 'Прошлые выплаты',
	more: 'больше',
	remove_vote: 'Убрать голос',
	upvote: 'Голосовать за',
	we_will_reset_curation_rewards_for_this_post: 'сбросит ваши кураторские вознаграждения за этот пост',
	removing_your_vote: 'Удаление голоса',
	changing_to_an_upvote: 'Измение на голос за',
	changing_to_a_downvote: 'Измение на голос против',
	confirm_flag: 'Подтвердить голос против',
=======
	we_will_be_unable_to_create_account_with_this_browser: 'У нас не получится создать аккаунт с этим браузером',
	you_need_to_logout_before_creating_account: 'Вам нужно {logoutLink} прежде чем вы сможете создать другой аккаунт',
	steemit_can_only_register_one_account_per_verified_user: 'Пожалуйста, имейте ввиду что Steemit может регистрировть только один аккаунт для каждого подтвержденного пользователя',
	username: 'Юзернейм',
	couldnt_create_account_server_returned_error: "Не получилось создать аккаунт. Сервер вернул эту ошибку",
	form_requires_javascript_to_be_enabled: 'Эта форма требует активированный в браузере javascript',
	our_records_indicate_you_already_have_account: 'Наши записи показывают что у вас уже есть steem аккант',
	to_prevent_abuse_steemit_can_only_register_one_account_per_user: 'In order to prevent abuse (each registered account costs 3 STEEM) Steemit can only register one account per verified user.',
	you_can_either_login_or_send_us_email: 'You can either {loginLink} to your existing account or  if you need a new account',
	send_us_email: 'отправьте нам электронная почта',
	connection_lost_reconnecting: 'Связь потеряна, переподключаемся',
	// Voting.jsx
	stop_seeing_content_from_this_user: 'Stop seeing content from this user',
	flagging_post_can_remove_rewards_the_flag_should_be_used_for_the_following: 'Flagging a post can remove rewards and make this material less visible. The flag should be used for the following',
	fraud_or_plagiarism: 'Fraud or Plagiarism',
	hate_speech_or_internet_trolling: 'Hate Speech or Internet Trolling',
	intentional_miss_categorized_content_or_spam: 'Intentional miss-categorized content or Spam',
	downvote: 'Проголосовать против',
	pending_payout: 'Pending Payout',
	past_payouts: 'Past Payouts',
	and: 'и',
	more: 'больше',
	remove_vote: 'Убрать голос',
	upvote: 'Проголосовать за',
	we_will_reset_curation_rewards_for_this_post: 'will reset your curation rewards for this post',
	removing_your_vote: 'Удаляем ваш голос',
	changing_to_an_upvote: 'Изменяем на голос за',
	changing_to_a_downvote: 'Изменяем на голос против',
	confirm_flag: 'Confirm Flag',
	// TODO
>>>>>>> steemit/develop
	date_created: 'Дата создания',
	search: 'Поиск',
	begin_recovery: 'Начать восстановление',
	post_as: 'Запостить как', // 'Post as Misha'
	action: 'Действие',
<<<<<<< HEAD
	APP_NAME_app_center: 'Центр приложений ' + APP_NAME,
	witness_thread: 'пост делегата',
	you_have_votes_remaining: 'У вас осталось {votesCount} голосов',
	you_can_vote_for_maximum_of_witnesses: 'Вы можете голосовать максимум за 30 делегатов',
	information: 'Информация',
	if_you_want_to_vote_outside_of_top_enter_account_name: 'Если вы хотите проголосовать за делегата вне top 50, введите имя аккаунта ниже',
	view_the_direct_parent: 'Просмотр прямого родителя',
	you_are_viewing_single_comments_thread_from: 'Вы читаете одну нить комментариев от',
	view_the_full_context: 'Показать полный контекст',
	this_is_a_price_feed_conversion: 'Это котировка цены. Неделя отсрочки необходима чтобы предотвратить злоупотребление от игры на средней ценовой катировке.',
	your_existing_DEBT_TOKEN_are_liquid_and_transferable: 'Ваши существующие ' + DEBT_TOKEN + ' ликвидны и перемещаемы. Возможно, вы хотите торговать ' + DEBT_TOKEN + ' напрямую на этом сайте в разделе {link} или перевести на внешний рынок.',
	buy_or_sell: 'Купить или Продать',
	trending_30_day: 'популярное (30 дней)',
	promoted: 'Продвигаемое',
	comments: 'Комментарии',
	topics: 'Топики',
	// TODO
	this_password_is_bound_to_your_accounts_private_key: 'Этот пароль привязан к активному ключу вашего аккаунта и не может быть использован для входа на эту страницу. Вы можете использовать его для входа на другие более защищенные страницы как "кошелек" или "маркет".',
	potential_payout: 'Потенциальная выплата',
	boost_payments: 'Платеж за продвижение',
	authors: 'Авторы',
	curators: 'Кураторы',
=======
	steem_app_center: 'Steem App Center',
	witness_thread: 'witness thread',
	you_have_votes_remaining: 'You have {votesCount} votes remaining',
	you_can_vote_for_maximum_of_witnesses: 'You can vote for a maximum of 30 witnesses',
	information: 'Информация',
	if_you_want_to_vote_outside_of_top_enter_account_name: 'If you would like to vote for a witness outside of the top 50, enter the account name below to cast a vote',
	view_the_direct_parent: 'View the direct parent',
	you_are_viewing_single_comments_thread_from: 'You are viewing a single comment&#39;s thread from',
	view_the_full_context: 'View the full context',
	this_is_a_price_feed_conversion: 'This is a price feed conversion. The one week day delay is necessary to prevent abuse from gaming the price feed average',
	your_existing_SD_are_liquid_and_transferable: 'Your existing Steem Dollars are liquid and transferable.  Instead you may wish to trade Steem Dollars directly in this site under {link} or transfer to an external market.',
	buy_or_sell: 'Buy or Sells',
	trending_30_day: 'трендовое (30 дней)',
	promoted: 'Продвигаемое',
	comments: 'Комментарии',
	topics: 'Topics',
	this_password_is_bound_to_your_accounts_private_key: 'This password is bound to your account\'s active key and can not be used to login to this page. You may use this active key on other more secure pages like the Wallet or Market pages.',
	potential_payout: 'Potential Payout',
	boost_payments: 'Boost Payments',
	authors: 'Authors',
	curators: 'Curators',
>>>>>>> steemit/develop
	date: 'Дата',
	no_responses_yet_click_to_respond: 'Ответов пока нет. Нажмите чтобы ответить.',
	click_to_respond: 'Нажмите чтобы ответить',
	new_password: 'Новый пароль',
<<<<<<< HEAD
	paste_a_youtube_or_vimeo_and_press_enter: 'Вставьте YouTube или Vimeo ссылку и нажмите Enter',
	there_was_an_error_uploading_your_image: 'Произошла ошибка во время загрузки изображения',
	raw_html: 'HTML код',
	please_remove_following_html_elements: 'Пожалуйста удалите эти HTML элементы из вашего поста:',
	reputation: "Репутация",
	remember_voting_and_posting_key: "Запомнить голос и постинг ключ",
=======
	paste_a_youtube_or_vimeo_and_press_enter: 'Paste a YouTube or Vimeo and press Enter',
	there_was_an_error_uploading_your_image: 'There was an error uploading your image',
	raw_html: 'Raw HTML',
	please_remove_following_html_elements: 'Please remove the following HTML elements from your post: ',
	reputation: "Репутация",
	remember_voting_and_posting_key: "Remember voting & posting key",
>>>>>>> steemit/develop
	// example usage: 'Autologin? yes/no'
	auto_login_question_mark: 'Заходить автоматически?',
	yes: 'Да',
	no: 'Нет',
	hide_private_key: 'Скрыть приватный ключ',
<<<<<<< HEAD
	show_private_key: 'Показать приватный ключ',
	login_to_show: 'Войти чтобы показать',
	APP_NAME_cannot_recover_passwords_keep_this_page_in_a_secure_location: APP_NAME + ' не может восстановить пароли. Сохраните эту страницу в безопасном месте, например, в огнестойком сейфе или в депозитарной ячейке.',
	APP_NAME_password_backup: APP_NAME + ' резервное копирование пароля',
	APP_NAME_password_backup_required: APP_NAME + ' резервное копирование пароля (обязательно)',
	after_printing_write_down_your_user_name: 'После печати запишите ваше имя пользователя',
=======
	login_to_show: 'Войти чтобы показать',
	steemit_cannot_recover_passwords_keep_this_page_in_a_secure_location: 'Steemit cannot recover passwords.  Keep this page in a secure location, such as a fireproof safe or safety deposit box.',
	steemit_password_backup: 'Steemit Password Backup',
	steemit_password_backup_required: 'Steemit Password Backup (required)',
	after_printing_write_down_your_user_name: 'After printing, write down your user name',
>>>>>>> steemit/develop
	public: 'Публичное',
	private: 'Приватное',
	public_something_key: 'Публичный {key} ключ',
	private_something_key: 'Приватный {key} ключ',
<<<<<<< HEAD
	// UserProfile > Permissions
	posting_key_is_required_it_should_be_different: 'Постинг ключ используется для постинга и голосования. Он должен отличаться от активного и ключа владельца.',
	the_active_key_is_used_to_make_transfers_and_place_orders: 'Активный ключ используется для переводов и размещения заказов на внутреннем рынке.',
	the_owner_key_is_required_to_change_other_keys: 'Ключ владельца это главный ключ ко всему аккаунта, он необходим для изменения других ключей.',
	the_private_key_or_password_should_be_kept_offline: 'Приватный ключ или пароль должен храниться в оффлайне так часто насколько возможно.',
	the_memo_key_is_used_to_create_and_read_memos: 'Ключ заметок используется для создания и чтения заметок.',
	previous: 'Предыдущий',
	next: 'Следующий',
	browse: 'Посмотреть',
	not_valid_email: 'Не действительный адрес',
	thank_you_for_being_an_early_visitor_to_APP_NAME: 'Благодарим вас за то что являетесь ранним посетителем ' + APP_NAME + '. Мы свяжемся с Вами при первой же возможности.',
	estimated_author_rewards_last_week: "Оценочные авторские вознаграждения за прошлую неделю",
	author_rewards_last_week: "Оценочные авторские вознаграждения за прошлую неделю",
	confirm: 'Подтвердить',
	asset: 'Актив',
	this_memo_is_private: 'Эта заметка является приватной',
	this_memo_is_public: 'Эта заметка является публичной',
	power_up: 'Усилить силу голоса',
	power_down: 'Уменьшить силу голоса',
	cancel_power_down: 'Отменить понижение силы голоса',
	transfer: 'Передать',
	deposit: 'Купить',
	basic: 'Базовый',
	advanced: 'Продвинутый',
	convert_to_OWNERSHIP_TOKEN: 'Перевести в ' + OWNERSHIP_TOKEN,
	transfer_to_account: 'Передать пользователю',
	buy_OWNERSHIP_TOKEN_or_INVEST_TOKEN: 'Купить ' + OWNERSHIP_TOKEN + ' или ' + INVEST_TOKEN,
	// TODO
	version: 'Версия',
	about_APP_NAME: 'О ' + APP_NAME,
	APP_NAME_is_a_social_media_platform_where_everyone_gets_paid_for_creating_and_curating_content: APP_NAME + ' это социальная медиа платформа в которой <strong>все</strong>&nbsp;получают <strong>деньги</strong> за создание и курирование контента',
	APP_NAME_is_a_social_media_platform_where_everyone_gets_paid: APP_NAME + ' это социальная медиа платформа в которой каждый зарабатывает за создание и курирование контента. Он использует надежную систему цифровых очков под названием ' + OWNERSHIP_TOKEN + ', который поддерживает реальную ценность для цифровых наград через выявление рыночной цены и ликвидности.',
	learn_more_at_LANDING_PAGE_URL: 'Узнать больше в ' + LANDING_PAGE_URL,
	resources: 'Ресурсы',
	join_our_slack: 'Присоединяйтесь к нашему Slack',
	APP_NAME_support: APP_NAME + ' поддержка',
	please_email_questions_to: 'Пожалуйста, шлите ваши вопросы на электронную почту',
	sorry_your_reddit_account_doesnt_have_enough_karma: "Извините, у вашего Reddit аккаунта недостаточно Reddit кармы чтобы иметь возможность бесплатной регистрации. Пожалуйста, добавьте вашу электронную почту чтобы записаться в лист ожидания",
	register_with_facebook: 'Регистрация с Facebook',
	or_click_the_button_below_to_register_with_facebook: 'Или нажмите кнопку, чтобы зарегистрироваться с Facebook',
	trending_24_hour: 'популярное (24 часа)',
	home: 'Лента',
	'24_hour': '24 часа',
	'30_day': '30 дней',
	flag: "Голосовать против",
	promote: 'Продвинуть',
	// Tips.js
	tradeable_tokens_that_may_be_transferred_anywhere_at_anytime: 'Перемещаемые цифровые токены, которые могут переданы куда угодно в любой момент.',
	OWNERSHIP_TOKEN_can_be_converted_to_INVEST_TOKEN_in_a_process_called_powering_up: OWNERSHIP_TOKEN + ' может быть конвертирован в ' + INVEST_TOKEN + ', этот процесс называется "усиление голоса".',
	tokens_worth_about_AMOUNT_of_OWNERSHIP_TOKEN: 'Перемещаемые цифровые токены, цена которых всегда равна ~1 мг золота в ' + OWNERSHIP_TOKEN + '.',
	influence_tokens_which_earn_more_power_by_holding_long_term: 'Неперемещаемые цифровые токены, их количество увеличевается при долгосрочном хранении.',
	the_more_you_hold_the_more_you_influence_post_rewards: 'Чем их больше, тем сильней вы влияете на вознаграждения за пост и тем больше зарабатываете за голосование.',
	the_estimated_value_is_based_on_a_7_day_average_value_of_OWNERSHIP_TOKEN_in_currency: 'Оценочная стоимость расчитывается из 7-ми дневной средней стоимости ' + OWNERSHIP_TOKEN + '.',
	INVEST_TOKEN_is_non_transferrable_and_will_require_2_years_and_104_payments_to_convert_back_to_OWNERSHIP_TOKEN: INVEST_TOKEN + ' нельзя передавать и потребуется 2 года и 104 выплаты чтобы перевести обратно в ' + OWNERSHIP_TOKEN + '.',
	// TODO
	converted_INVEST_TOKEN_can_be_sent_to_yourself_but_can_not_transfer_again: 'Конвертированная ' + INVEST_TOKEN + ' может быть отправлена себе или кому-то еще, но не может быть передана вновь без конвертирования назад в ' + OWNERSHIP_TOKEN + '.',
	profile: 'Профиль',
	send_to_account: 'Отправить аккаунту',
	confirm_email: 'Подтвердить электронную почту',
	authenticate_for_this_transaction: 'Авторизируйтесь для этой транзакции',
	login_to_your_APP_NAME_account: 'Зайдите в ваш ' + APP_NAME + ' аккаунт',
	// UserProfile > Permissions
	posting: 'Постинг',
	owner: 'Владелец',
	active_or_owner: 'активный или владельца',
	sign: 'Войти',
	dismiss: 'Скрыть',
	// next 3 strings are used conditionally together
	show_more: 'Показать больше',
	show_less: 'Показать меньше',
	value_posts: 'сообщений низкой стоимости',
	// PormotePost.jsx
  leave_this_unchecked_to_receive_half_your_reward: 'не пытайтесь покинуть Омск',
	promote_post: 'Продвинуть пост',
	spend_your_DEBT_TOKEN_to_advertise_this_post: 'Используйте ваши ' + DEBT_TOKEN + ' чтобы прорекламировать этот пост в секции продвигаемого контента',
	you_successdully_promoted_this_post: 'Вы успешно продвинули этот пост',
	pay_me_100_in_INVEST_TOKEN: 'Заплатите мне 100% в ' + INVEST_TOKEN,
	requires_5_or_more_reddit_comment_karma: 'необходимо 5 или больше Reddit кармы комментирования',
	this_post_was_hidden_due_to_low_ratings: 'Этот пост был скрыт из-за низкого рейтинга',
	reblogged_by: 'Поделился',
	reblog: 'Поделиться',
	updated: 'обновленное',
	created: 'новое',
	settings: 'Настройки',
	incorrect_password: 'Неправильный пароль',
	username_does_not_exist: 'Такого имени не существует',
	// string with a '.'(dot) is returned from the server, so you should add it too, despite rules
	account_name_should_be_longer: 'Имя аккаунта должно быть длиннее.',
	account_name_should_be_shorter: 'Имя аккаунта должно быть короче.',
	account_name_should_start_with_a_letter: 'Имя аккаунта должно начинаться с буквы.',
	account_name_should_have_only_letters_digits_or_dashes: 'Имя аккаунта должно должно состоять только из букв, цифр или дефисов.',
	choose_language: 'Выберите язык',
	choose_currency: 'Выберите валюту',
	crowdsale: 'Краудсейл',
	followers: 'Подписчики',
	cannot_increase_reward_of_post_within_the_last_minute_before_payout: 'Награда за пост не может быть увеличена по истечении 24 часов с момента публикации',
=======
	posting_key_is_required_it_should_be_different: 'The posting key is used for posting and voting. It should be different from the active and owner keys.',
	the_active_key_is_used_to_make_transfers_and_place_orders: 'The active key is used to make transfers and place orders in the internal market.',
	the_owner_key_is_required_to_change_other_keys: 'The owner key is the master key for the account and is required to change the other keys.',
	the_private_key_or_password_should_be_kept_offline: 'The private key or password for the owner key should be kept offline as much as possible.',
	the_memo_key_is_used_to_create_and_read_memos: 'The memo key is used to create and read memos.',
	previous: 'Предыдущий',
	next: 'Следующий',
	browse: 'Посмотреть',
	not_valid_email: 'Не действительный адресы',
	thank_you_for_being_an_early_visitor_to_steemit: 'Thank you for being an early visitor to Steemit. We will get back to you at the earliest possible opportunity.',
	estimated_author_rewards_last_week: "Estimated author rewards last week",
	author_rewards_last_week: "Estimated author rewards last week",
	confirm: 'Подтвердить',
	asset: 'Актив',
	this_memo_is_private: 'This Memo is Private',
	this_memo_is_public: 'This Memo is Public',
	power_up: 'Power Up',
	transfer: 'Transfer',
	basic: 'Basic',
	advanced: 'Advanced',
	convert_to_steem_power: 'Convert to Steem Power',
	transfer_to_account: 'Transfer to Account',
	buy_steem_or_steem_power: 'Buy Steem or Steem Power',
	version: 'Version',
	about_steemit: 'About Steemit',
	steemit_is_a_social_media_platform_where_everyone_gets_paid_for_creating_and_curating_content: 'Steemit is a social media platform where <strong>everyone</strong>&nbsp;gets <strong>paid</strong> for creating and curating content',
	steemit_is_a_social_media_platform_where_everyone_gets_paid: 'Steemit is a social media platform where everyone gets paid for creating and curating content. It leverages a robust digital points system, called Steem, that supports real value for digital rewards through market price discovery and liquidity.',
	learn_more_at_steem_io: 'Learn more at steem.io',
	resources: 'Resources',
	steem_whitepaper: 'Steem Whitepaper',
	join_our_slack: 'Join our Slack',
	steemit_support: 'Steemit Support',
	please_email_questions_to: 'Please email your questions to',
	sorry_your_reddit_account_doesnt_have_enough_karma: "Sorry, your Reddit account doesn't have enough Reddit Karma to qualify for a free sign up. Please add your email for a place on the waiting list",
	register_with_facebook: 'Register with Facebook',
	or_click_the_button_below_to_register_with_facebook: 'Or click the button below to register with Facebook',
	trending_24_hour: 'trending (24 hour)',
	home: 'home',
	'24_hour': '24 hour',
	'30_day': '30 day',
	flag: "Flag",

>>>>>>> steemit/develop
}

export { ru }
