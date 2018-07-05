import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import tt from 'counterpart';

import { Link } from 'react-router';

import { TabLink } from 'golos-ui/Tab';
import Icon from 'golos-ui/Icon';

import { LinkWithDropdown } from 'react-foundation-components/lib/global/dropdown';
import VerticalMenu from 'app/components/elements/VerticalMenu';

import Container from './../Container';

const Wrapper = styled.div`
    flex-wrap: wrap;
    min-height: 50px;
    background-color: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
`;

const RightIcons = styled.div`
    display: flex;
    flex: 1;
    justify-content: flex-end;
`;

const SettingsIcon = styled(Icon)``;

const IconLink = styled(Link)`
   display: flex;

   ${SettingsIcon} {
       color: #b7b7b9;

<<<<<<< HEAD:src/app/components/UserNavigation/UserNavigation.js
       &.${props => props.activeClassName},
       &:hover {
           color: #333;
       }
   }
`;
IconLink.defaultProps = {
   activeClassName: 'active'
};
=======
        &.${props => props.activeClassName},
        &:hover {
            color: #333;
        }
    }
`;
IconLink.defaultProps = {
    activeClassName: 'active'
};

>>>>>>> WIP left side and fixes #669:src/app/components/UserNavigation/UserNavigation.jsx

export default class UserNavigation extends PureComponent {
    propTypes = {
        accountName: PropTypes.string,
        isOwner: PropTypes.bool,
    };

    render() {
        const { accountName, isOwner, section } = this.props;

        // const items = [
        //     { value: 'Посты', to: `/@${accountName}` },
        //     { value: tt('g.replies'), to: `/@${accountName}/recent-replies` },
        //     { value: 'Избранное', to: '--' },
        //     { value: 'Уведомления', to: '--' },
        //     { value: 'Сообщения', to: '--' },
        //     { value: 'Мои ключи', to: '--' },
        //     { value: tt('g.wallet'), to: `/@${accountName}/transfers` },
        // ];
        const items = [
            { value: tt('g.blog'), to: `/@${accountName}` },
            { value: tt('g.comments'), to: `/@${accountName}/comments` },
            { value: tt('g.replies'), to: `/@${accountName}/recent-replies` },
            { value: tt('g.wallet'), to: `/@${accountName}/transfers` },
        ];

        const rewardsMenu = [
            {
                link: `/@${accountName}/curation-rewards`,
                label: tt('g.curation_rewards'),
            },
            {
                link: `/@${accountName}/author-rewards`,
                label: tt('g.author_rewards'),
            },
        ];

        const rewardsActive = ['curation-rewards', 'author-rewards'].includes(
            section
        );

        return (
            <Wrapper>
                <Container align="center" wrap="wrap">
                    {items.map(({ value, to }, key) => (
                        <TabLink key={key} to={to}>
                            {value}
                        </TabLink>
                    ))}
                    <LinkWithDropdown
                        closeOnClickOutside
                        dropdownPosition="bottom"
                        dropdownContent={<VerticalMenu items={rewardsMenu} />}
                    >
                        <TabLink active={rewardsActive}>
                            {tt('g.rewards')}
                        </TabLink>
                    </LinkWithDropdown>

                    <RightIcons>
                        {isOwner && (
                            <IconLink
                                to={`/@${accountName}/settings`}
                                title={tt('g.settings')}
                            >
                                <SettingsIcon name="setting" size="24px" />
                            </IconLink>
                        )}
                    </RightIcons>
                </Container>
            </Wrapper>
        );
    }
}
