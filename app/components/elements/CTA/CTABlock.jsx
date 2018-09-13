import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Userpic from 'app/components/elements/Userpic';
import { parsePayoutAmount } from 'app/utils/ParsersAndFormatters';
import ctaInfo from './ctainfo';
import { popupClickUrl, popupClickButton } from 'app/utils/Analytics';
import { renderValue } from 'src/app/helpers/currency';

@connect((state, props) => {
    const post = state.global.getIn(['content', props.post]);

    if (!post) {
        return;
    }

    const currentAccount = state.user.get('current');
    const user = post.get('author');

    const link = post.get('category') + '/@' + user + '/' + post.get('permlink');

    function isSpecialPost(array, link) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].link === link) {
                return array[i];
            }
        }
    }

    const special = isSpecialPost(ctaInfo.specialLinks, link);

    const pendingPayout = parsePayoutAmount(post.get('pending_payout_value'));
    const totalAuthorPayout = parsePayoutAmount(post.get('total_payout_value'));
    const totalCuratorPayout = parsePayoutAmount(post.get('curator_payout_value'));

    const payout = pendingPayout + totalAuthorPayout + totalCuratorPayout;
    const payoutString = renderValue(payout, 'short');

    let visible = false;

    if (special != null) {
        visible = true;
    } else if (!currentAccount) {
        if (payoutString.startsWith('$') || payoutString.startsWith('€')) {
            const amount = payoutString.match(/^.(\d+)/)[1];
            visible = amount > ctaInfo.minUsdValueToShow;
        } else if (payoutString.endsWith('₽')) {
            visible = parseFloat(payoutString) > ctaInfo.minRubValueToShow;
        }
    }

    return {
        user,
        payout,
        visible,
        special,
    };
})
export default class CTABlock extends PureComponent {
    static propTypes = {
        user: PropTypes.string.isRequired,
        post: PropTypes.string.isRequired,
        payout: PropTypes.number,
        visible: PropTypes.bool,
        special: PropTypes.object,
    };

    state = {
        loading: true,
    };

    componentDidMount() {
        this._timeout = setTimeout(() => {
            this.setState({ loading: false });

            if (this.props.visible) {
                document.body.classList.add('with-cta-block');
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearTimeout(this._timeout);
    }

    componentDidUpdate(prevProps) {
        if (this.props.visible !== prevProps.visible) {
            document.body.classList.toggle('with-cta-block', this.props.visible);
        }
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
                    <div className="ctablock__content">{this._renderTextBlock()}</div>
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
        const { user, payout, special } = this.props;

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
                Сообщество <b>Golos.io</b> {ctaInfo.regularStartText} <b>{user}</b> заработал более{' '}
                <span className="ctablock__text-regular">
                    {renderValue(payout, 'adaptive')}
                </span>.{' '}
                <a href={'/start'} onClick={() => popupClickUrl()}>
                    {ctaInfo.regularEndText}
                </a>
            </div>
        );
    }

    _onCreateAccClick = () => {
        popupClickButton();
    };
}
