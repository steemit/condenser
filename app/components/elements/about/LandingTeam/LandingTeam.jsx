import React, { PureComponent } from 'react';
import Icon from 'app/components/elements/Icon';
import { APP_ICON } from 'app/client_config';

import golosTeam from './golos-team.json';
import coreTeam from './core-team.json';

const CONTACTS_ORDER = ['golos', 'email', 'github', 'linkedin', 'facebook'];

export default class LandingTeam extends PureComponent {
    render() {
        return (
            <section className="Team">
                <div className="row text-center">
                    <div className="small-12 columns">
                        <h2 className="Team__header" id="team">
                            Команда
                        </h2>
                    </div>
                </div>
                {this._renderSection('GOLOS.io', golosTeam, 'golos.io')}
                {this._renderSection('Golos Core', coreTeam, 'core')}
            </section>
        );
    }

    _renderSection(title, team, type) {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="small-12">
                        <h3 className="Team__title">{title}</h3>
                    </div>
                </div>
                <div className="row align-middle collapse">
                    {type === 'golos.io' ? (
                        <div className="Team__info columns small-12 medium-6">
                            Разработка, поддержка и развитие клиента<br/>
                            <a href="/@golosio">Читать блог Golos.io</a>&nbsp;-&nbsp;
                            <a href="/@golosio" title="Новости Golos.io">
                                @golosio
                            </a>.
                        </div>
                    ) : (
                        <div className="Team__info columns small-12 medium-6">
                            Разработка, поддержка и развитие блокчейна<br/>
                            <a href="/@goloscore">Читать блог Golos Core</a>&nbsp;-&nbsp;
                            <a href="/@goloscore" title="Новости Golos Core">
                                @goloscore
                            </a>.
                        </div>
                    )}
                </div>
                <div className="row Team__members text-center">
                    {team.map(member => this._renderMember(member))}
                </div>
            </React.Fragment>
        );
    }

    _renderMember({ name, role, avatar, avatarUrl, contacts }) {
        const contactsElements = [];

        let avaUrl;

        let avatarElement;

        if (avatarUrl) {
            avatarElement = (
                <div className="Team__member-avatar-wrapper">
                    <img className="Team__member-external-avatar" src={avatarUrl} />
                </div>
            );
        } else {
            avatarElement = (
                <img
                    className="Team__member-avatar"
                    src={`images/team/${avatar}${
                        process.env.BROWSER && window.devicePixelRatio > 1 ? '@2x' : ''
                    }.jpg`}
                />
            );
        }

        for (let contact of CONTACTS_ORDER) {
            if (contacts[contact]) {
                contactsElements.push(
                    <span key={contact} className="Team__member-contact-item">
                        {this._renderContact(contact, contacts[contact])}
                    </span>
                );
            }
        }

        return (
            <div
                key={name}
                className="wow fadeIn small-12 medium-4 large-3 columns small-centered Team__member"
                data-wow-delay="1s"
            >
                {avatarElement}
                <div className="Team__member-name">{name}</div>
                <p>{role}</p>
                <div>{contactsElements}</div>
            </div>
        );
    }

    _renderContact(type, data) {
        switch (type) {
            case 'golos':
                return (
                    <a href={`/@${data}`}>
                        <Icon name={APP_ICON} size="2x" />
                    </a>
                );
            case 'email':
                return (
                    <a href={`mailto:${data}`} title={`mail to ${data}`}>
                        <Icon name="envelope" size="2x" />
                    </a>
                );
            case 'github':
                return (
                    <a href={`https://github.com/${data}`}>
                        <img src="images/landing/github_icon.jpg" />
                    </a>
                );
            case 'linkedin':
                return (
                    <a href={`https://www.linkedin.com/in/${data}/`}>
                        <img src="images/landing/linkedin_icon.jpg" />
                    </a>
                );
            case 'facebook':
                return (
                    <a href={`https://facebook.com/${data}`}>
                        <img
                            className="Team__facebook-logo"
                            src="https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-512.png"
                        />
                    </a>
                );
        }
    }
}
