import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import * as FeatherIcons from 'react-feather';

class SideMenu extends Component {
  render() {
    return (
      <div className="Sticky">
        <div className="SideMenu">
          <div className="Social">
            <div className="Item" title="Create New Question">
              <span className="Icon">Q+</span>
            </div>
            <div className="Item" title="Create New Review">
              <span className="Icon">R+</span>
            </div>
            <div className="Item" title="Share">
              <span className="Icon">
                <FeatherIcons.Share2 />
              </span>
            </div>
            <div className="Item" title="Bookmark">
              <span className="Icon">
                <FeatherIcons.Star />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SideMenu.defaultProps = {};

SideMenu.propTypes = {};

export default SideMenu;
