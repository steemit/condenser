import React from 'react';

export class SidebarModule extends React.Component {
    render() {
        return (
            <div className="c-sidebar__module">
                <div className="c-sidebar__header">
                    <h3 className="c-sidebar__h3">Links React Component</h3>
                </div>
                <div className="c-sidebar__content">
                    <ul className="c-sidebar__list">
                        <li className="c-sidebar__list-item">
                            <a className="c-sidebar__link" href="#">
                                Test
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}
