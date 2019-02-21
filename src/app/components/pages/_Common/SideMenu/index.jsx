import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as FeatherIcons from 'react-feather';

const menuItems = [
  {
    type: 'Ob',
    description: 'Create New Observation',
    content: 'Ob+',
  },
  {
    type: 'Qu',
    description: 'Create New Question',
    content: 'Qu+',
  },
  {
    type: 'Hy',
    description: 'Create New Hypothesis',
    content: 'Hy+',
  },
  {
    type: 'R',
    description: 'Create New Review',
    content: 'R+',
  },
  {
    type: 'Share',
    description: 'Share',
    content: <FeatherIcons.Share2 />,
  },
  {
    type: 'Star',
    description: 'Star',
    content: <FeatherIcons.Star />,
  },
];

class SideMenu extends Component {
  render() {
    const { onClickSideMenu } = this.props;
    return (
      <div className="Sticky">
        <div className="SideMenu">
          <div className="Social">
            {menuItems.map(item => (
              <div
                key={item.type}
                className="Item"
                title={item.description}
                onClick={() => {
                  onClickSideMenu(item.type);
                }}
              >
                <span className="Icon">{item.content}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

SideMenu.defaultProps = {
  onClickSideMenu: () => {},
};

SideMenu.propTypes = {
  onClickSideMenu: PropTypes.func,
};

export default SideMenu;
