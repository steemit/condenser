import React from 'react';
import styles from './styles.scss';

// Replaces LinkWithDropdown

export default class DropDownList extends React.PureComponent {
    render() {
        return (
            <div tabIndex={0} className="onclick-menu">
                Hello Iain
                <ul className="onclick-menu-content">{this.props.children}</ul>
            </div>
        );
    }
    s;
}

/*
                    <li>
                        <button onClick={() => alert('click 1')}>Look, mom</button>
                    </li>
                    <li>
                        <button onClick={() => alert('click 2')}>
                            no JavaScript!
                        </button>
                    </li>
                    <li>
                        <button onClick={() => alert('click 3')}>
                            Pretty nice, right?
                        </button>
                    </li>
*/

/*
export const Dropdown = ({
  className,
  position,
  size,
  ...restProps,
}) => {
  const classNames =
    cx(
      className,
      cxStyles(
        'dropdown-pane',
        'is-open',
        {
          [position]: includes(OVERLAY_POSITIONS_INTERNAL, position),
          [size]: includes(COMPONENT_SIZES, size),
        }
      )
    );

  return <div {...restProps} className={classNames} />;
};
*/

/*
const DropdownOverlay = ({
  placement, // eslint-disable-line no-unused-vars, react/prop-types
  arrowOffsetLeft, // eslint-disable-line no-unused-vars, react/prop-types
  arrowOffsetTop, // eslint-disable-line no-unused-vars, react/prop-types
  positionLeft, // eslint-disable-line no-unused-vars, react/prop-types
  positionTop, // eslint-disable-line no-unused-vars, react/prop-types
  ...restProps,
}) => <Dropdown {...restProps} />;
*/

/*
export const LinkWithDropdown = ({
  children,
  dropdownClassName,
  dropdownContent,
  dropdownId,
  dropdownPosition,
  dropdownAlignment = DROPDOWN_ALIGNMENTS_FROM_POSITION[dropdownPosition],
  dropdownSize,
  dropdownStyle,
  ...restProps,
}) => {
  const childProps = {
    'aria-haspopup': true,
    'aria-controls': dropdownId,
  };
  let labelledBy = null;
  let clonedChild = null;

  if (isValidElement(children)) {
    labelledBy = children.props.id;
    clonedChild = cloneElement(children, childProps);
  } else {
    clonedChild = <span {...childProps}>{children}</span>;
  }

  const dropdown = (
    <DropdownOverlay
      aria-labelledby={labelledBy}
      className={dropdownClassName}
      id={dropdownId}
      position={dropdownPosition}
      size={dropdownSize}
      style={dropdownStyle}
    >
      {dropdownContent}
    </DropdownOverlay>
  );

  return (
    <OverlayTrigger
      {...restProps}
      alignment={dropdownAlignment}
      overlay={dropdown}
      position={dropdownPosition}
    >
      {clonedChild}
    </OverlayTrigger>
  );
};
*/
