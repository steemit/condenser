import React from 'react';
import SvgImage from 'app/components/Steemit/elements/SvgImage';

class NotFound extends React.Component {
  render() {
    return (
      <div>
        <div className="Header__top header">
          <div className="columns">
            <div className="top-bar-left">
              {/* <ul className="menu">
                <li className="Header__top-logo">
                  <Link to="/">
                    <img src={logoImg} alt="Knowledgr Logo" />
                  </Link>
                </li>
                <li className="Header__top-steemit show-for-medium noPrint">
                  <a href="/">
                    Knowledgr
                  </a>
                </li>
              </ul> */}
            </div>
          </div>
        </div>
        <div className="NotFound float-center">
          <div>
            <SvgImage name="404" width="320" height="240" />
            <h4 className="NotFound__header">
              Sorry! This page doesn't exist.
            </h4>
            <p>
              Not to worry. You can head back to{' '}
              <a style={{ fontWeight: 800 }} href="/">
                our homepage
              </a>, or check out some great posts.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = {
  path: '*',
  component: NotFound,
};
