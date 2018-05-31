import React, { Component } from 'react'
import LocalizedCurrency from 'app/components/elements/LocalizedCurrency'

const animateTime = 1500

class CircularProgress extends Component {

  state = { progress: 0 }

  static defaultProps = {
    size: "120",
    strokeWidth: "20",
    percentage: 0,
  }

  componentDidMount() {
    const { progress } = this.state
    const { percentage } = this.props

    this.animateValue(progress, percentage, animateTime)
  }

  componentWillReceiveProps(nextProps) {
    const { percentage } = nextProps

    if (nextProps.show && !this.props.show) {
      this.setState({ progress: 0 }, () => this.animateValue(0, percentage, animateTime))
    }
  }

  animateValue = (start, end, duration) => {
    const range = end - start
    const minTimer = 10
    const sTime = Math.abs(Math.floor(duration / range))
    const stepTime = Math.max(sTime, minTimer)
    const startTime = new Date().getTime()
    const endTime = startTime + duration

    const run = () => {
      const now = new Date().getTime()
      const remaining = Math.max((endTime - now) / duration, 0)
      const value = Math.ceil((end - remaining * range) * 10) / 10

      this.setState({ progress: value })
      if (value === end) {
        clearInterval(timer)
      }
    }

    const timer = setInterval(run, stepTime)

    run()
  }

  renderDefs = () => (
    <defs>
      <linearGradient cx="0" cy="100" r="100" id="red">
        <stop offset="0%" stopColor="#8B6DA5" />
        <stop offset="100%" stopColor="#db474c" />
      </linearGradient>
      <linearGradient cx="0" cy="100" r="100" id="blue">
        <stop offset="0%" stopColor="#8B6DA5" />
        <stop offset="100%" stopColor="#3b92fd" />
      </linearGradient>
    </defs>
  )

  render() {
    const { size, strokeWidth, percentage, show, children } = this.props
    const { progress } = this.state

    const radius = (parseInt(size) / 2) - (strokeWidth / 2)

    const cxy = radius + parseInt(strokeWidth) / 2

    const strokeDasharray = 2 * Math.PI * radius

    const strokeDashoffset = strokeDasharray * (1 - (100 - (show ? percentage : 0)) / 100)

    const progressStyle = {
      strokeDashoffset,
      strokeDasharray,
      fill: "transparent",
      stroke: "white",
      fillOpacity: "0.7",
      strokeOpacity: "0.7"
    }

    const red = {
      fill: "transparent",
      stroke: "url(#red)",
      strokeWidth
    }

    const blue = {
      fill: "transparent",
      stroke: "url(#blue)",
      strokeWidth
    }

    return (
      <div className="progress-container">
        <svg className="progress-bar" width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} version="1.1" xmlns="http://www.w3.org/2000/svg">
          {this.renderDefs()}
          <path d={`M ${strokeWidth / 2},${size / 2} a 1,1 0 0,0 ${size - strokeWidth},0`} style={red} />
          <path d={`M ${strokeWidth / 2},${size / 2} a 1,1 0 0,1 ${size - strokeWidth},0`} style={blue} />
          <circle className="progress-value" r={radius} cx={cxy} cy={cxy} strokeWidth={strokeWidth} style={progressStyle} />
        </svg>
        <div className="progress-text">
            <p>Voting power</p>
            <p className="percentage">{`${progress.toFixed(0)}%`}</p>
        </div>
        {children}
      </div>
    )
  }
}

export default CircularProgress