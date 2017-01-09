const it = 	{
	// this variables mainly used in navigation section
	about: "About",
	explore: "Explore",
	whitepaper: "Steem Whitepaper",
	buy_steem: "Compra Steem",
	sell_steem: "Vendi Steem",
	market: "Mercato",
	currency_market: "Mercato di Valuta",
	stolen_account_recovery: "Recupera Account Perso",
	change_account_password: "Modifica Password Account",
	steemit_chat: "Steemit Chat",
	steemit_api_docs: "Steemit API Docs",
	witnesses: "Testimoni",
	vote_for_witnesses: "Vota per Testimoni",
	privacy_policy: "Privacy Policy",
	terms_of_service: "Termini di Servizio",
	sign_up: "Iscriviti",
	/* end navigation */
	buy: 'Compra',
	sell: 'Vendi',
	buy_steem_power: 'Compra Steem Power',
	transaction_history: 'Storico delle Transazioni',
	submit_a_story: 'Scrivi un Articolo',
	nothing_yet: 'Ancora nulla',
	close: 'Chiudi',
	post_promo_text: "Gli autori vengono pagati nel momento in cui persone come te votano i loro post \n Se ti è piaciuto quello che hai letto, guadagni ${amount} di Steem Power \n quando tu {link} e lo voti.",
	read_only_mode: 'A causa della manutenzione server, il sistema sta funzionando in modalità di sola lettura. Ci scusiamo per il contrattempo.',
	membership_invitation_only: 'Diventare membri di Steemit.com avviene solamente tramite invito a causa di un inaspettato numero di iscrizioni.',
	submit_email_to_get_on_waiting_list: 'Inserisci la tua email per entrare nella lista di attesa',
	login: 'Login',
	logout: 'Logout',
	show_less_low_value_posts: "Mostra meno articoli di poco valore",
	show_more_low_value_posts: "Mostra più articoli di poco valore",
	select_topic: 'Seleziona Argomento',
	tags_and_topics: "Tags e Argomenti",
	filter: "Filtro",
	show_more_topics: "Mostra più argomenti",
	we_require_social_account: 'Steemit assegna ad ogni account {signup_bonus} valorizzati in Steem Power; per prevenire gli abusi, ai nuovi utenti è richiesto di accedere tramite social.',
	personal_info_will_be_private: 'Le tue informazioni personali verranno custodite',
	personal_info_will_be_private_link: 'Privato',
	continue_with_facebook: 'Continua con Facebook',
	continue_with_reddit: 'Continua con Reddit',
	requires_positive_karma: 'richiede Reddit comment karma positivi',
	dont_have_facebook: 'Non hai un account Facebook o Reddit?',
	subscribe_to_get_sms_confirm: 'Iscritivi per ottenere una notifica quando il sistema a conferma SMS sia attivo',
	by_verifying_you_agree: 'Verificando il tuo account l\'utente accetta Steemit',
	by_verifying_you_agree_terms_and_conditions: 'termini e condizioni',
	terms_and_conditions: 'Termini e Condizioni',
	// this is from top-right dropdown menu
	hot: 'hot',
	trending: 'trending',
	payout_time: 'in corso di pagamento',
	active: 'attivi',
	responses: 'con più risposte',
	popular: 'popolari',
	/* end dropdown menu */
	loading: 'Loading',
	cryptography_test_failed: 'Test di crittografia fallito',
	unable_to_log_you_in: 'Non è possibile fare il login con questo browser',
	latest_browsers_do_work: 'L\'ultima versione di {chromeLink} e di {mozillaLink} sono state testate e funzionano con steemit.com.',
	account_creation_succes: 'Il tuo account è stato creato con successo!',
	account_recovery_succes: 'Il tuo account è stato recuperato con successo!',
	password_update_succes: 'La password dell\'account {accountName} è stata aggiornata',
	password_is_bound_to_account: "Questa password è legata alla chiave proprietaria del tuo account e non può essere usata per effettuare il login a questo sito. \nPerò, puoi utilizzarla per {changePasswordLink} ottenere un set più sicuro di chiavi.",
	update_your_password: 'Aggiorna password',
	enter_username: 'Inserisci username',
	password_or_wif: 'Password o WIF',
	requires_auth_key: 'Questa operazione necessita l\'uso della chiave {authType} (o l\'utilizzo della tua master password)',
	keep_me_logged_in: 'Mantieni l\'accesso',
	// this are used mainly in "submit a story" form
	title: "Titolo",
	write_your_story: 'Scrivi Articolo',
	editor: 'Editor',
	reply: 'Rispondi',
	edit: 'Modifica',
	delete: 'Elminina',
	cancel: 'Annulla',
	clear: 'Pulisci',
	save: 'Salva',
	upvote_post: 'Vota il post',
	update_post: 'Aggiorna il Post',
	markdown_is_supported: 'I tag di Styling con Markdown sono supportati',
	preview: 'Anteprima',
	// TODO do not forget to implment REQUIRED error in reply Editor
	markdown_not_supported: 'I Markdown non sono supportati qui',
	// markdown: 'Markdown', // this will probably be removed
	welcome_to_the_blockchain: 'Welcome to the Blockchain!',
	your_voice_is_worth_something: 'La tua voce ha un certo valore',
	learn_more: 'Approfondisci',
	get_sp_when_sign_up: 'Ottieni un bonus di {signupBonus} di Steem Power se ti iscrivi oggi.',
	all_accounts_refunded: 'Tutti gli account recuperati sono stati rimborsati pienamente',
	steemit_is_now_open_source: 'Steemit.com è ora Open Source',
	// this is mainly from ReplyEditor
	tag_your_story: 'Tag (massimo 4 tags), il primo tag rappresenta la categoria principale.',
	select_a_tag: 'Seleziona un tag',
	required: 'Richiesto',
	shorten_title: 'Titoletto',
	exceeds_maximum_length: 'Exceeds maximum length ({maxKb}KB)',
	including_the_category: "(including the category '{rootCategory}')",
	use_limited_amount_of_tags: 'You have {tagsLength} tags total{includingCategory}.  Per cortesia utilizzane un massimo di 5 per post.',
	// this is mainly used in CategorySelector
	use_limitied_amount_of_categories: 'Please use only {amount} categories',
	use_one_dash: 'Utilizza un solo trattino',
	use_spaces_to_separate_tags: 'Usa gli spazi per separare i vari tag',
	use_only_allowed_characters: 'Usa solo lettere minuscole, numeri e un trattino',
	must_start_with_a_letter: 'Deve iniziare con una lettera',
	must_end_with_a_letter_or_number: 'Deve terminare con una lettera o numero',
	// tags page
	tag: 'Tag',
	replies: 'Risposte',
	payouts: 'Pagamenti',
	need_password_or_key: 'Hai bisogno di una password o della chiave privata (non chiave pubblica)',
	// BlocktradesDeposit
	change_deposit_address: 'Cambia Indirizzo di Deposito',
	get_deposit_address: 'Ottieni Indirizzo di Deposito',
	// for example 'powered by Blocktrades'
	powered_by: 'Offerto da',
	send_amount_of_coins_to: 'Invia {value} {coinName} a',
	amount_is_in_form: 'L\'ammontare è nella forma di 99999.999',
	insufficent_funds: 'Fondi insufficienti',
	update_estimate: 'Aggiorna stima',
	get_estimate: 'Ottieni stima',
	memo: 'Memo',
	must_include_memo: 'Devi includere il campo memo',
	estimate_using: 'Estimate using',
	amount_to_send: 'Ammontare da inviare {estimateInputCoin}',
	deposit_using: 'Deposita usando', // example: 'deposit using Steem Power' // TODO: is this example right?
	suggested_limit: 'Limite suggerito {depositLimit}',
	internal_server_error: 'Internal Server Error',
	enter_amount: 'Inserisci ammontare',
	processing: 'Processing',
	broadcasted: 'Broadcasted',
	confirmed: 'Confirmed',
	remove: 'Remove',
	collapse_or_expand: "Richiudi/Espandi",
	reveal_comment: 'Rivela commento',
	are_you_sure: 'Sei sicuro?',
	// PostFull.jsx
	by: 'by',
	in: 'in',
	share: 'Condividi',
	in_reply_to: 'in risposta a',
	replied_to: 'risposto a',
	transfer_amount_to_steem_power: "Trasferisci {amount} a STEEM POWER",
	transfer_amount_steem_power_to: "Trasferisci {amount} STEEM POWER a",
	recieve_amount_steem_power_from: "Ricevuto {amount} STEEM POWER da",
	transfer_amount_steem_power_from_to: "Trasferisci {amount} STEEM POWER da {from} a",
	transfer_amount_to: "Trasferisci {amount} a",
	recieve_amount_from: "Ricevuto {amount} da",
	transfer_amount_from: "Trasferisci {amount} da",
	stop_power_down: "Stop power down",
	start_power_down_of: "Start power down of",
	curation_reward_of_steem_power_for: 'Curation reward di {reward} STEEM POWER per',
	author_reward_of_steem_power_for: 'Author reward di {payout} e {reward} STEEM POWER per',
	recieve_interest_of: 'Ricevuti interessi di {interest}',
	// TODO find where this is used and write an example
	to: 'a',
	account_not_found: 'Account non trovato',
	this_is_wrong_password: 'Questa è la password sbagliata',
	do_you_need_to: 'Hai bisogno di',
	recover_your_account: 'recuperare il tuo account', // this probably will end with question mark
	reset_usernames_password: "Reimpostare {username}\'s Password",
	this_will_update_usernames_authtype_key: 'Questo aggiornerà la {username} {authType} chiave',
	the_rules_of_steemit: "La prima regola di Steemit è: Non smarrire la tua password.<br /> La seconda regola di Steemit è: <strong>Non</strong> smarrire la tua password.<br /> La terza regola di Steemit è: Non possiamo recuperare la tua password smarrita.<br /> La quarta regola: Se riesci a ricordarti la password, non è abbastanza sicura.<br /> La quinta regola: Usa password generate randomaticamente.<br /> La sesta regola: Non condividere con nessuno la tua password.<br /> La settima regola: Conserva sempre una copia della tua password.",
	account_name: 'Nome Account',
	recover_password: 'Recupera Account',
	current_password: 'Password Attuale',
	recent_password: 'Password Recente',
	generated_password: 'Password Generata',
	recover_account: 'Recupera Account',
	new: 'nuovo', // ex. 'Generated Password (new)', but not exclusively
	age: 'nuovo',
	votes: 'votes',
	backup_password_by_storing_it: 'Fai un backup della tua password o scrivila su un foglio di carta',
	click_to_generate_password: 'Clicca per generare una password',
	re_enter_generate_password: 'Riscrivi la Password generata',
	understand_that_steemit_cannot_recover_password: 'Io capisco che Steemit non può recuperare le password smarrite',
	i_saved_password: 'Io ho salvato e messo al sicuro la mia password generata',
	update_password: 'Aggiorna Password',
	password_must_be_characters_or_more: 'La password deve essere di {amount} caratteri o più',
	passwords_do_not_match: 'Password non corretta',
	you_need_private_password_or_key_not_a_public_key: 'Hai bisogno di una password privata o chiave (non chiave pubblica)',
	account_updated: 'Account Aggiornato',
	warning: 'attenzione',
	your_password_permissions_were_reduced: 'I permessi della tua password sono stati ridotti',
	if_you_did_not_make_this_change: 'Se non sei stato tu a fare questo, modifica',
	owhership_changed_on: 'Ownership Changed On',
	deadline_for_recovery_is: 'La Deadline per il recupero è',
	i_understand_dont_show_again: "Ho capito, non mostrare più",
	ok: 'Ok',
	convert_to_steem: 'Converti in Steem',
	steem_dollars_will_be_unavailable: 'Questa azione durerà una settimana da ora e non potrà essere cancellata. Questi Steem Dollars diventeranno immediatamente inutilizzabili',
	amount: 'Quantità',
	steem_dollars: 'STEEM DOLLARS',
	convert: 'Converti',
	invalid_amount: 'Quantità non valida',
	insufficent_balance: 'Saldo insufficiente',
	in_week_convert_steem_dollars_to_steem: 'in una settimana, converte {amount} STEEM DOLLARS in STEEM',
	order_placed: 'Ordine piazzato', // ex.: "Order placed: Sell {someamount_to_sell} for atleast {min_to_receive}"
	follow: 'Follow',
	unfollow: 'Unfollow',
	mute: 'Mute',
	unmute: 'Unmute',
	confirm_password: 'Conferma Password',
	login_to_see_memo: 'effettua login per vedere memo',
	post: 'Post', // places used: tooltip in MediumEditor
	unknown: 'Unknown', // exp.: 'unknown error'
	account_name_is_not_available: 'Il nome account non è disponibile',
	type: 'Type',
	price: 'Prezzo',
	// Market.jsx
	last_price: 'Ultimo prezzo',
	'24h_volume': '24h volume',
	bid: 'Bid',
	ask: 'Ask',
	spread: 'Spread',
	total: 'Total',
	available: 'Disponibile',
	lowest_ask: 'Lowest ask',
	highest_bid: 'Highest bid',
	buy_orders: 'Buy Orders',
	sell_orders: 'Sell Orders',
	trade_history: 'Storia Ordini',
	open_orders: 'Open Orders',
	sell_amount_for_atleast: 'Vendi {amount_to_sell} per almeno {min_to_receive} ({effectivePrice})',
	buy_atleast_amount_for: 'Buy at least {min_to_receive} for {amount_to_sell} ({effectivePrice})',
	price_warning_above: 'This price is well above the current market price of {marketPrice}, are you sure?', //FIXME
	price_warning_below: 'This price is well below the current market price of {marketPrice}, are you sure?', //FIXME
	order_cancel_confirm: 'Cancel order {order_id} from {user}?', //FIXME
	order_cancelled: 'Order {order_id} cancelled.', //FIXME
	higher: 'Higher', // context is about prices
	lower: 'Lower', // context is about prices
	total_sd_dollars: "Total SD ($)",
	sd_dollars: "SD ($)",
	// RecoverAccountStep1.jsx // recover account stuff
	not_valid: 'Non valido',
	account_name_is_not_found: 'Il nome account non è stato trovato',
	unable_to_recover_account_not_change_ownership_recently: 'Non è possibile recuperare questo account, non è stata cambiata la sua proprietà di recente.',
	password_not_used_in_last_days: 'Questa password non è stata utilizzata per questo account negli ultimi 30 giorni.',
	request_already_submitted_contact_support: 'La tua richiesta è stata aggiunta e ci stiamo lavorando. Per cortesia contatta support@steemit.com per richiede lo stato della tua richiesta.',
	recover_account_intro: "Di volta in volta, una chiave proprietaria di uno Steemian’s può essere compromessa. Stolen Account Recovery dà al proprietario dell'account legittimo 30 giorni per recuperarlo dal momento in cui il ladro ha cambiato la chiave proprietaria. Stolen Account Recovery può essere usata su steemit.com if se il proprietario dell\'account ha precedentemente legato ‘Steemit’ tramite account fiduciario e rispettato i termini di servizio.",
	login_with_facebook_or_reddit_media_to_verify_identity: 'Per cortesia effettua un login con Facebook o Reddit per verificare la tua identità',
	login_with_social_media_to_verify_identity: 'Per cortesia effettua un login con {provider} per verificare la tua identità',
	enter_email_toverify_identity: 'Abbiamo bisogono di verificare la tua identità. Per cortesia inserisci il tuo indirizzo email di seguito per iniziare la procedura di verifica.',
	email: 'Email',
	continue_with_email: "Continua con Email",
	thanks_for_submitting_request_for_account_recovery: '<p>Grazie per aver inserito la tua richiesta per l\'Account Recovery usando Steem’s blockchain-based multi factor authentication.</p> <p>Risponderemo il prima possibile, ma aspettati per cortesia dei possibili ritardi dovuti al gran numero di email che riceviamo.</p> <p>Per cortesia sii preparato per verificare la tua idendità.</p> <p>Cordiali Saluti,</p> <p>Ned Scott</p> <p>CEO Steemit</p>',
	recovering_account: 'Recupero account',
	checking_account_owner: 'Controllo account proprietario',
	sending_recovery_request: 'Invia richiesta di recupero',
	cant_confirm_account_ownership: 'Non possiamo confermare la proprietà dell\'account. Controlla la tua password',
	account_recovery_request_not_confirmed: "La richiesta del recupero account non è stata ancora confermata, per cortesia controlla più tardi, grazie per la tua pazienza.",
	vote: 'Vote',
	witness: 'Witness',
	top_witnesses: 'Top Witnesses',
	// user's navigational menu
	feed: 'Feed',
	wallet: 'Portafoglio',
	blog: 'Blog',
	change_password: 'Cambia Password',
	// UserProfile
	unknown_account: 'Account Sconosciuto',
	user_hasnt_made_any_posts_yet: "Sembra che {name} non ha ancora scritto nessun post!",
	user_hasnt_started_bloggin_yet: "Sembra che {name} non ha ancora scritto nessun articolo!",
	user_hasnt_followed_anything_yet: "Sembra che {name} non ha ancora seguito nessuno!",
	user_hasnt_had_any_replies_yet: "{name} non ha avuto ancora nessuna risposta",
	users_blog: "{name}'s blog",
	users_posts: "{name}'s posts",
	users_wallet: "{name}'s portafoglio",
	users_curation_rewards: "{name}'s curation rewards",
	users_author_rewards: "{name}'s author rewards",
	users_permissions: "{name}'s permessi",
	recent_replies_to_users_posts: "Risposta recente al post di {name}",
	print: 'Stampa',
	curation_rewards: "Curation rewards",
	author_rewards: 'Author rewards',
	feeds: 'Feeds',
	rewards: 'Ricompensa',
	permissions: 'Permessi',
	password: 'Password',
	posts: 'Posts',
	// english language does not need plurals, but your language might need it
	// context usually is about profile stats: 'User has: 3 posts, 2 followers, 5 followed'
	post_count: `{postCount, plural,
		zero {0 posts}
		one {# post}
		few {# posts}
		many {# posts}
	}`,
	follower_count: `{followerCount, plural,
		=0 {no followers}
		one {1 follower}
		other {{followerCount} followers}
	}`,
	followed_count: `{followingCount, plural,
		=0 {not following anybody}
		one {1 following}
		other {{followingCount} following}
	}`,
	vote_count: `{voteCount, plural,
		zero {0 votes}
		one {# votes}
		few {# votes}
		many {# votes}
	}`,
	response_count: `{responseCount, plural,
		zero {0 responses}
		one {# responses}
		few {# responses}
		many {# responses}
	}`,
	reply_count: `{replyCount, plural,
		zero {0 replies}
		one {# replies}
		few {# replies}
		many {# replies}
	}`,
	this_is_users_reputations_score_it_is_based_on_history_of_votes: "Questo è il punteggo di reputazione di ${name}.\n\nIl punteggio di reputazione si basa sulla storia dei voti ricevuti dall\'account, e viene utilizzato per nascondere i contenuti di bassa qualità.",
	newer: 'Recenti',
	older: 'Più Vecchi',
	author_rewards_last_24_hours: 'Author rewards delle ultime 24 ore',
	daily_average_author_rewards: 'Media giornaliera author rewards',
	author_rewards_history: 'Storico Author Rewards',
	balances: 'Bilancio',
	estimate_account_value: 'Stima Valore Account',
	next_power_down_is_scheduled_to_happen_at: 'Il prossimo power down è previsto per',
	transfers_are_temporary_disabled: 'I trasferimento sono temporaneamente disabilitati',
	history: 'Storia',
	// CurationRewards.jsx
	curation_rewards_last_24_hours: 'Curation rewards delle ultime 24 ore',
	daily_average_curation_rewards: 'Media giornaliera curation rewards',
	estimated_curation_rewards_last_week: "Curation rewards stimata di settimana scorsa",
	curation_rewards_last_week: "Curation rewards settimana scorsa",
	curation_rewards_history: 'Storico Curation Rewards',
	// Post.jsx
	now_showing_comments_with_low_ratings: 'mostra commenti di bassa qualità',
	hide: 'Nascondi',
	show: 'Mostra',
	sort_order: 'Ordinamento',
	comments_were_hidden_due_to_low_ratings: 'commenti nascosti per via della qualità scadente',
	we_will_be_unable_to_create_account_with_this_browser: 'Potremmo avere problemi a creare il tuo account Steem con questo browser',
	you_need_to_logout_before_creating_account: 'Dovresti fare il {logoutLink} prima di poter creare un nuvoo account',
	steemit_can_only_register_one_account_per_verified_user: 'Steemit può registrare un solo account per utente verificato',
	username: 'Username',
	couldnt_create_account_server_returned_error: "Non è possibile creare l'\account. Il Server ha riportato il seguente errore",
	form_requires_javascript_to_be_enabled: 'Questo form necessita l\'abilitazione del javascript',
	our_records_indicate_you_already_have_account: 'Hai già un account Steemit',
	to_prevent_abuse_steemit_can_only_register_one_account_per_user: 'Per prevenire abusi, Steemit può registrare un solo account per utente per ogni utente verificato.',
	you_can_either_login_or_send_us_email: 'è possibile fare il {loginLink} al tuo account esistente o se ne hai bisogno ad un nuovo account',
	send_us_email: 'inviaci un\'email',
	connection_lost_reconnecting: 'Connessione persa, riconnessione in corso',
	// Voting.jsx
	stop_seeing_content_from_this_user: 'Smetti di visualizzare il contentuto da questo utente',
	flagging_post_can_remove_rewards_the_flag_should_be_used_for_the_following: 'Flaggare un post ne riduce il valore e lo rende meno visibile. Il flag dovrebbe essere utilizzato per le seguenti categorie',
    disagreement_on_rewards: 'Disaccordo sui premi',
    fraud_or_plagiarism: 'post Fraudolento o Plagio',
	hate_speech_or_internet_trolling: 'Pessimi discorsi o Internet Trolling',
	intentional_miss_categorized_content_or_spam: 'Contenuto non categorizzato o Spam',
	downvote: 'Downvote',
	pending_payout: 'Payout in corso',
	past_payouts: 'Vecchi Payouts',
	and: 'e',
	more: 'altro',
	remove_vote: 'Rimuovi Voto',
	upvote: 'Upvote',
	we_will_reset_curation_rewards_for_this_post: 'cancellerà la tua curation rewards per questo post',
	removing_your_vote: 'Rimuovi il tuo voto',
	changing_to_an_upvote: 'Cambia in un Upvote',
	changing_to_a_downvote: 'Cambia in un  Downvote',
	confirm_flag: 'Conferma Flag',
	//  TODO
	date_created: 'Data di Creazione',
	search: 'Cerca',
	begin_recovery: "Inizia recupero",
	post_as: 'Posta come', // 'Post as Misha'
	action: 'Azione',
	steem_app_center: 'Steem App Center',
	witness_thread: 'witness thread',
	you_have_votes_remaining: 'Hai ancora {votesCount} upvote rimasti',
	you_can_vote_for_maximum_of_witnesses: 'puoi votare per un massimo di 30 witnesses',
	set_witness_proxy: "You can also choose a proxy that will vote for witnesses for you. This will reset your current witness selection.", // FIXME
	witness_set: "You have set a voting proxy. If you would like to reenable manual voting, please clear your proxy.", // FIXME
	witness_proxy_current: "Your current proxy is", // FIXME
	witness_proxy_set: "Set proxy", // FIXME
	witness_proxy_clear: "Clear proxy", // FIXME
	information: 'Informationi',
	if_you_want_to_vote_outside_of_top_enter_account_name: 'Se vuoi votare per un witness al di fuori della top 50, scrivine il nome account ed esegui un upvote',
	view_the_direct_parent: 'Visualizza cartella principale',
	you_are_viewing_single_comments_thread_from: 'You are viewing a single comment&#39;s thread from',
	view_the_full_context: 'Visualizza tutto il contesto',
	this_is_a_price_feed_conversion: 'This is a price feed conversion. The 3.5 day delay is necessary to prevent abuse from gaming the price feed average',
	your_existing_SD_are_liquid_and_transferable: 'I tuoi Steem Dollars esistenti sono liquidi and trasferibili.  Instead you may wish to trade Steem Dollars directly in this site under {link} or transfer to an external market.',
	buy_or_sell: 'Compra or Vendi',
	trending_30_day: 'trending (30 day)',
	promoted: 'Pubblicizzati',
	comments: 'Commenti',
	topics: 'Topics',
	this_password_is_bound_to_your_accounts_private_key: 'Questa password è legata alla chiave attiva del tuo account e non può essere utilizzata per effettuare il login a questa pagina. Dovresti utilizzarla per la pagine realvite al tuo portafoglio o alla pagina di mercato.',
	potential_payout: 'Payout Potenziale',
	boost_payments: 'Incentiva Compenso',
	authors: 'Autori',
	curators: 'Curatori',
	date: 'Data',
	no_responses_yet_click_to_respond: 'Ancora nessuna risposta. Clicca per rispondere.',
	click_to_respond: 'Clicca per rispondere',
	new_password: 'Nuova Password',
	paste_a_youtube_or_vimeo_and_press_enter: 'Incolla un vido YouTube o un video Vimeo e premi Invio',
	there_was_an_error_uploading_your_image: 'C\'è stato un errore durante l\'upload della tua immagine',
	raw_html: 'Raw HTML',
	please_remove_following_html_elements: 'Per cortesia, rimuovi i seguenti elementi HTML dal tuo post: ',
	reputation: "Reputazione",
	remember_voting_and_posting_key: "Remember voting & posting key",
	// example usage: 'Autologin? yes/no'
	auto_login_question_mark: 'Auto login?',
	yes: 'Yes',
	no: 'No',
	hide_private_key: 'Nascondi private key',
	login_to_show: 'Login per visualizzare',
	steemit_cannot_recover_passwords_keep_this_page_in_a_secure_location: 'Steemit non può recuperare le password. Tieni al sicuro questa pagina.',
	steemit_password_backup: 'Steemit Password Backup',
	steemit_password_backup_required: 'Steemit Password Backup (richiesto)',
	after_printing_write_down_your_user_name: 'Dopo la stampa, scrivi il tuo username',
	public: 'Public',
	private: 'Private',
	public_something_key: 'Public {key} Key',
	private_something_key: 'Private {key} Key',
	posting_key_is_required_it_should_be_different: 'La posting key è utilizzata per creare e votare post. Dovrebbe essere differente dalla active key e dalla owner key.',
	the_active_key_is_used_to_make_transfers_and_place_orders: 'L\'active key è utilizzata per trasferire e piazzare ordini nel mercato interno.',
	the_owner_key_is_required_to_change_other_keys: 'L\'owner key è la chiave master dell\'account e viene utilizzata per modificare tutte le altre.',
	the_private_key_or_password_should_be_kept_offline: 'La private key o la password proprietaria dovrebbero essere tenute offline il più possibile.',
	the_memo_key_is_used_to_create_and_read_memos: 'La memo key è utilizzata per creare e visualizzare memo.',
	previous: 'Precedente',
	next: 'Prossimo',
	browse: 'Browse',
	not_valid_email: 'email non valida',
	thank_you_for_being_an_early_visitor_to_steemit: 'Grazie per essere uno dei primi visitatori di Steemit. Ci metteremo in contatto con voi il più presto possibile.',
	estimated_author_rewards_last_week: "Stima dell\'author rewards di settimana scorsa",
	author_rewards_last_week: "author rewards di settimana scorsa",
	confirm: 'Conferma',
	canceled: 'Annulla',
	asset: "Asset",
	this_memo_is_private: 'Questa Memo is Privata',
	this_memo_is_public: 'Questa Memo is Pubblica',
	power_up: 'Power Up',
	transfer: 'Trasferisci',
	basic: 'Base',
	advanced: 'Avanzato',
	convert_to_steem_power: 'Converti in Steem Power',
	transfer_to_account: 'Trasferisci all\'Account',
	buy_steem_or_steem_power: 'Compra Steem o Steem Power',
	version: 'Versione',
	about_steemit: 'About Steemit',
	steemit_is_a_social_media_platform_where_everyone_gets_paid_for_creating_and_curating_content: 'Steemit è una piattaforma social dove <strong>tutti</strong>&nbsp;ottengono <strong>un guadagno</strong> per la creazione e per la valutazione degli articoli',
	steemit_is_a_social_media_platform_where_everyone_gets_paid: 'Steemit è una piattaforma social dove tutti ottengono un guadagno per la creazione e per la valutazione degli articoli. Sfrutta un robusto sistema a punteggio, chiamato Steem, che supporta il reale valore digitale attraverso la liquidità presente nei mercati.',
	learn_more_at_steem_io: 'Approfondisci su steem.io',
	resources: 'Risorse',
	steem_whitepaper: 'Steem Whitepaper',
	join_our_slack: 'Vieni a far parte del nostro Slack',
	steemit_support: 'Steemit Support',
	please_email_questions_to: 'Per cortesia invia tramite email la tua domanda a',
	sorry_your_reddit_account_doesnt_have_enough_karma: "Scusa, il tuo account Reddit non ha abbastanza Reddit Karma per essere qualificato e utilizzato per iscriversi. Per cortesia, inserisci la tua email per essere aggiunto alla lista di attesa",
	register_with_facebook: 'Registra tramite Facebook',
	or_click_the_button_below_to_register_with_facebook: 'O clicca qui sotto per registrare tramite Facebook',
	trending_24_hour: 'trending (24 ore)',
	home: 'home',
	'24_hour': '24 ore',
	'30_day': '30 giorni',
	flag: "Flag",

}

export { it }
