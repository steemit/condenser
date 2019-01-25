import React from 'react';
import { Link } from 'react-router';

// import Icon from 'app/components/Steemit/elements/Icon';
// import { APP_NAME } from 'app/client_config';
import logo from 'assets/images/static/logo_white.png';

export default function MiniHeader({ isBrowser = false }) {
  return (
    <div className="Navigation">
      <div className="LogoContainer">
        {isBrowser ? (
          <Link to="/">
            <img className="Logo" src={logo} alt="Knowledgr Logo" />
          </Link>
        ) : (
          <a href="/">
            <img className="Logo" src={logo} alt="Knowledgr Logo" />
          </a>
        )}
      </div>
    </div>
    // <header className="Header">
    //   <div className="Header__top header">
    //     <div className="expanded row">
    //       <div className="columns">
    //         <ul className="menu">
    //           <li className="Header__top-logo">
    //             <Link to="/">
    //               <img className="Logo" src={logo} alt="Knowledgr Logo" />
    //             </Link>
    //           </li>
    //           <li className="Header__top-steemit show-for-medium">
    //             <a href="/">
    //               <span className="beta">beta</span>
    //             </a>
    //           </li>
    //         </ul>
    //       </div>
    //     </div>
    //   </div>
    // </header>
  );
}
