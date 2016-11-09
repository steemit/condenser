import React from 'react';
import Icon from 'app/components/elements/Icon';
import { LinkWithDropdown } from 'react-foundation-components/lib/global/dropdown';
import VerticalMenu from 'app/components/elements/VerticalMenu';

const FoundationDropdownMenu = ({menu, icon, label, dropdownPosition, dropdownAlignment, className, onClick}) => {
    return <LinkWithDropdown
        closeOnClickOutside
        dropdownClassName={className}
        dropdownPosition={dropdownPosition}
        dropdownAlignment={dropdownAlignment}
        dropdownContent={
                                <VerticalMenu items={menu} />
                              }
        onClick={onClick}
    >
        <span className="FoundationDropdownMenu__label">
            {icon && <Icon name="share" className="space-right" />}{label}
            <Icon name="dropdown-arrow" />
        </span>
    </LinkWithDropdown>;
}

export default FoundationDropdownMenu;
