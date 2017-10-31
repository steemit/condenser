import React from 'react';

const SidebarLinks = ({ username }) => (
    <div className="c-sidebar__module">
        <div className="c-sidebar__header">
            <h3 className="c-sidebar__h3">Links</h3>
        </div>
        <div className="c-sidebar__content">
          <ul className="c-sidebar__list">
            <li className="c-sidebar__list-item"><a className="c-sidebar__link" href={'/@' + username}>My blog</a></li>
            <li className="c-sidebar__list-item"><a className="c-sidebar__link" href={'/@' + username + '/transfers'}>My wallet</a></li>
           {/*   <li className="c-sidebar__list-item"><a className="c-sidebar__link" href={username + ''}>Pay someone</a></li> */}
            {/* <li className="c-sidebar__list-item"><a className="c-sidebar__link" href="/market">Token market</a></li>  */}
          </ul>
        </div>
    </div>
);

export default SidebarLinks;

