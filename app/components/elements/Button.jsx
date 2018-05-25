import React, {Component} from 'react';
import cn from 'classnames';

class Button extends Component {

  static defaultProps = {
    round: false,
    type: 'primary',
  }

  render() {
    const {onClick, children, type, round} = this.props
    const btnClasses = cn('golos-btn', {
      [`btn-${type}`]: true,
      'btn-round': round
    })
    return (
      <button className={btnClasses} onClick={onClick} role="button">{children}</button>
    )
  }
}

export default Button;
