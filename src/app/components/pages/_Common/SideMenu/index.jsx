import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import {
    ThumbsUp,
    ThumbsDown,
    Feather,
    MessageSquare,
    Bookmark,
    Download,
} from 'react-feather';

class SideMenu extends Component {
    render() {
        return (
            <div className="Sticky">
                <div className="SideMenu">
                    <div className="Vote">
                        <span className="Icon">
                            <ThumbsUp />
                        </span>
                        <span className="Value">1234</span>
                        <span className="Icon">
                            <ThumbsDown />
                        </span>
                    </div>
                    <div className="Social">
                        <div className="Item">
                            <span className="Icon">
                                <Feather />
                            </span>
                        </div>
                        <div className="Item">
                            <span className="Icon">
                                <MessageSquare />
                            </span>
                        </div>
                        <div className="Item">
                            <span className="Icon">
                                <Bookmark />
                            </span>
                        </div>
                        <div className="Item">
                            <span className="Icon">
                                <Download />
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
