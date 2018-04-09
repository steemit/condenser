import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cn from 'classnames';
import { connect } from 'react-redux';
import CircularProgress from './CircularProgress'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';

class Userpic extends Component {

    static propTypes = {
        account: PropTypes.string,
        votingPower: PropTypes.number
    }

    static defaultProps = {
        width: 48,
        height: 48,
        hideIfDefault: false
    }

    constructor() {
        super()

        this.state = {
            showVotePow: false
        }
    }

    componentDidMount() {
        this.mounted = true
        document.addEventListener('click', this.handleDocumentClick, false)
    }

    shouldComponentUpdate = shouldComponentUpdate(this, 'Userpic')

    componentWillUnmount() {
        document.removeEventListener('click', this.handleDocumentClick, false)
    }

    /**
     * Обработчик клика по документу
     * @param {object} target - DOM элемент по которому был клик
     */
    handleDocumentClick = ({ target }) => {
        if (this.mounted && !ReactDOM.findDOMNode(this).contains(target)) {
            this.setState({ showVotePow: false })
        }
    }

    extractUrl = () => {
        const { json_metadata, width, hideIfDefault } = this.props

        let url = null;

        // TODO: переписать блок ниже

        // try to extract image url from users metaData
        try {
            const md = JSON.parse(json_metadata);
            if(md.profile) url = md.profile.profile_image;
        } catch (e) {
          console.warn('Try to extract image url from users metaData failed!')
        }

        if (url && /^(https?:)\/\//.test(url)) {
            const size = width && width > 48 ? '320x320' : '120x120';
            if($STM_Config.img_proxy_prefix) {
                url = $STM_Config.img_proxy_prefix + size + '/' + url;
            }
        } else {
            if(hideIfDefault) {
                return null;
            }
            url = require('app/assets/images/user.png');
        }

        return url
    }

    votingPowerToPercents = power => power / 100

    toggleVotePow = () => this.setState({ showVotePow: !this.state.showVotePow })

    getVotingIndicator = (percentage) => {
      const { showVotePow } = this.state

      const votingClasses = cn('voting_power', {
        show: showVotePow
      })

      return (
        <div className={votingClasses}>
          <CircularProgress percentage={percentage} show={showVotePow} size={this.props.width} strokeWidth={4} />
        </div>
      )
    }

    render() {
        const { width, height, votingPower } = this.props

        const style = {
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage: `url(${this.extractUrl()})`
        }

        const percentage = this.votingPowerToPercents(votingPower)

        return (
          <div ref={n => { this.userPick = n }} className="Userpic" onClick={this.toggleVotePow} style={style}>
            {percentage ? this.getVotingIndicator(percentage) : null}
          </div>
        )
    }
}

export default connect(
    (state, ownProps) => {
        const { account, width, height, hideIfDefault } = ownProps
        return {
            json_metadata: state.global.getIn(['accounts', account, 'json_metadata']),
            width,
            height,
            hideIfDefault,
        }
    }
)(Userpic)
