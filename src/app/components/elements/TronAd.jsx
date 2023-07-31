import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { recordAdsView } from 'app/utils/ServerApiClient';

class TronAd extends Component {
    constructor() {
        super();
        this.setRecordAdsView = this.setRecordAdsView.bind(this);
        this.caculateHeight = this.caculateHeight.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.getLang = this.getLang.bind(this);
        this.isInit = this.isInit.bind(this);
        this.hasInit = false;
        this.state = {
            heightState: 0,
        };
    }

    componentDidMount() {
        if (this.isInit()) {
            this.initAd();
        }
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    initAd() {
        console.log('get in initAd', this.hasInit, this.state.heightState);
        if (this.hasInit) return;
        const { wrapperName, pid, isMock, lang, ratioClass } = this.props;

        new initAds({
            env: 1,
            wrapper: wrapperName,
            pid,
            is_mock: isMock,
            lang: this.getLang(lang),
            loadSuccessCallback: () => {
                this.hasInit = true;
                this.setState({
                    heightState: this.caculateHeight(
                        this.refs[pid].clientWidth,
                        ratioClass
                    ),
                });
                console.log('load tron ad success cb.', pid);
            },
            loadFailCallback: err => {
                console.error('load tron ad fail cb:', err);
            },
            clickEventCallback: () => {
                this.setRecordAdsView(this.props.adTag);
            },
        });
    }

    setRecordAdsView(tag) {
        recordAdsView({
            trackingId: this.props.trackingId,
            adTag: tag,
        });
    }

    caculateHeight(width, ratioClass) {
        let ratio = 1;
        switch (ratioClass) {
            case 'ratio-1-1':
                ratio = 1;
                break;
            case 'ratio-10-1':
                ratio = 10;
                break;
            case 'ratio-375-80':
                ratio = 375 / 80;
                break;
        }
        return Math.floor(width / ratio);
    }

    /**
     * This method is to charge whether to init ad position.
     * Each ad position only inits once.
     * And we will control the box visiable in Ad.scss by media query.
     * @returns bool
     */
    isInit() {
        const { ratioClass } = this.props;
        // refer to Ad.scss
        const TRON_AD_DEVICE_WIDTH_THRESHOLD = 760;
        let isInit = true;
        switch (ratioClass) {
            case 'ratio-10-1':
            case 'ratio-1-1':
                isInit = window.innerWidth >= TRON_AD_DEVICE_WIDTH_THRESHOLD;
                break;
            case 'ratio-375-80':
                isInit = window.innerWidth < TRON_AD_DEVICE_WIDTH_THRESHOLD;
                break;
        }
        return isInit;
    }

    handleResize() {
        if (this.hasInit == false) {
            return this.initAd();
        }
        const { pid, ratioClass } = this.props;
        if (this.refs[pid]) {
            this.setState({
                heightState: this.caculateHeight(
                    this.refs[pid].clientWidth,
                    ratioClass
                ),
            });
        }
    }

    getLang(lang) {
        let finalLang;
        // const supportLang = [
        //     'en','zh_Hant','cn','ja','ko','ar','ru','es','tr',
        // ];
        switch (lang) {
            case undefined:
            case '':
            case 'fr':
            case 'it':
            case 'pl':
                finalLang = 'en';
                break;
            case 'zh':
                finalLang = 'cn';
                break;
            default:
                finalLang = lang;
        }
        return finalLang;
    }

    render() {
        const { wrapperName, ratioClass, pid } = this.props;

        const { heightState } = this.state;

        const classSetting = `ad-ratio-wrapper ${ratioClass}`;
        const isInit = this.isInit();

        return (
            <div className="tron-ad-box">
                <div
                    ref={pid}
                    id={wrapperName}
                    className={classSetting}
                    style={{
                        height: `${heightState}px`,
                    }}
                />
            </div>
        );
    }
}

TronAd.propTypes = {
    env: PropTypes.number.isRequired,
    trackingId: PropTypes.string.isRequired,
    wrapperName: PropTypes.string.isRequired,
    pid: PropTypes.string.isRequired,
    isMock: PropTypes.number.isRequired,
    adTag: PropTypes.string.isRequired,
    ratioClass: PropTypes.string.isRequired,
    lang: PropTypes.string,
};

export default connect(
    (state, props) => {
        return {};
    },
    dispatch => ({})
)(TronAd);
