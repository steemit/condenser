import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Userpic from 'app/components/elements/Userpic';
import { parsePayoutAmount } from 'app/utils/ParsersAndFormatters';
import LocalizedCurrency, {
    localizedCurrency,
} from 'app/components/elements/LocalizedCurrency';
import ctaInfo from './ctainfo';
import { popupClickUrl, popupClickButton } from 'app/utils/Analytics';

class CTABlock extends PureComponent {
    static propTypes = {
        user: PropTypes.string.isRequired,
        post: PropTypes.string.isRequired,
        payout: PropTypes.number,
        visible: PropTypes.bool,
        special: PropTypes.object,
        currency: PropTypes.string,
    };

    state = {
        loading: true,
    };

    componentDidMount() {
        this._timeout = setTimeout(() => {
            this.setState({ loading: false });
        }, 1000);
    }

    componentWillUnmount() {
        clearTimeout(this._timeout);
    }

    render() {
        const { user, visible } = this.props;

        if (!visible || this.state.loading) {
            return null;
        }

        return (
            <div className="ctablock">
                <div className="ctablock__main">
                    <div className="ctablock__user-pic">
                        <Userpic account={user} />
                    </div>
                    <div className="ctablock__content">
                        {this._renderTextBlock()}
                    </div>
                </div>
                <div className="ctablock__button-block">
                    <a
                        href="/create_account"
                        className="ctablock__button button"
                        onClick={this._onCreateAccClick}
                    >
                        Создать аккаунт
                    </a>
                </div>
            </div>
        );
    }

    _renderTextBlock() {
        const { user, payout, special, currency } = this.props;

        if (special) {
            return (
                <div className="ctablock__text-special">
                    {ctaInfo.specialStartText} <b>{user}</b> {special.text}
                    <a href={'/start'} onClick={() => popupClickUrl()}>
                        {' '}
                        {ctaInfo.specialEndText}
                    </a>
                </div>
            );
        }

        return (
            <div className="ctablock__text-regular">
                Сообщество <b>Golos.io</b>{' '}
                {ctaInfo.regularStartText}{' '}
                <b>{user}</b> заработал более{' '}
                <span className="ctablock__text-regular">
                    <LocalizedCurrency
                        amount={payout}
                        rounding={true}
                        noSymbol={true}
                    />
                </span>
                {' '}{currency}.{' '}
                <a
                    href={'/start'}
                    onClick={() => popupClickUrl()}
                >
                    {ctaInfo.regularEndText}
                </a>
            </div>
        );
    }

    _onCreateAccClick = () => {
        popupClickButton();
    };
}

export default connect((state, props) => {
    const post = state.global.getIn(['content', props.post]);

    if (!post) {
        return props;
    }

    const currentAccount = state.user.get('current');
    const user = post.get('author');

    const link =
        post.get('category') + '/@' + user + '/' + post.get('permlink');

    function compareLinks(specialLink, incomingLink) {
        return specialLink === incomingLink;
    }

    function isSpecialPost(array, link) {
        for (let i = 0; i < array.length; i++) {
            if (compareLinks(array[i].link, link)) {
                return array[i];
            }
        }
    }

    let showMinCurrency, currency, currentCurrency;

    if (process.env.BROWSER) {
        currentCurrency = localStorage.getItem('xchange.picked');
    }

    if (currentCurrency)
        if (currentCurrency === 'RUB') {
            showMinCurrency = ctaInfo.minRubValueToShow;
            currency = ctaInfo.rub;
        } else if (currentCurrency === 'USD') {
            showMinCurrency = ctaInfo.minUsdValueToShow;
            currency = ctaInfo.usd;
        } else {
            showMinCurrency = ctaInfo.minRubValueToShow;
            currency = currentCurrency;
        }

    const special = isSpecialPost(ctaInfo.specialLinks, link);

    const pendingPayout = parsePayoutAmount(post.get('pending_payout_value'));
    const totalAuthorPayout = parsePayoutAmount(post.get('total_payout_value'));
    const totalCuratorPayout = parsePayoutAmount(
        post.get('curator_payout_value')
    );

    const payout = pendingPayout + totalAuthorPayout + totalCuratorPayout;
    const localizedPayoutValue = localizedCurrency(payout, {
        noSymbol: true,
        rounding: true,
    });

    const visible =
        !currentAccount &&
        (localizedPayoutValue >= showMinCurrency || special != null);

    return {
        post: props.post,
        user,
        payout,
        visible,
        special,
        currency,
    };
})(CTABlock);
