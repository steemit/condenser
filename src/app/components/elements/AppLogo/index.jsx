import React from 'react';

import logo from 'app/assets/images/static/logo.png';

const AppLogo = () => {
    return (
        <span className="LogoWrapper">
            <img src={logo} alt="Knowledgr" />
        </span>
    );
};

export default AppLogo;
