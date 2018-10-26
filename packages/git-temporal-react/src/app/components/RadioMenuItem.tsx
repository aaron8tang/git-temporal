import React from 'react';
import { style } from 'app/styles';
import { TestProps } from 'app/interfaces';
import { MenuItem } from 'app/components/MenuItem';
import { ToggleButton } from 'app/components/ToggleButton';

export interface RadioMenuItemProps {
  // The children are the menu content
  children: string | JSX.Element | JSX.Element[];
  isSelected: boolean;
  onClick: (evt) => void;
  style?: string | object;
  disabled?: boolean;
}

const toggleButtonStyle = {
  display: 'inline-block',
  width: 15,
  height: 15,
  borderRadius: 7,
  marginRight: 10,
};

export class RadioMenuItem extends React.Component<
  RadioMenuItemProps & TestProps
> {
  render() {
    return (
      <MenuItem
        style={style(this.props.style)}
        onClick={this.props.onClick}
        disabled={this.props.disabled}
      >
        <div>
          <ToggleButton
            style={toggleButtonStyle}
            isSelected={this.props.isSelected}
            onClick={this.props.onClick}
          />
          {this.props.children}
        </div>
      </MenuItem>
    );
  }
}