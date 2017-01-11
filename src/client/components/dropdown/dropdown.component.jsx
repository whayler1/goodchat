import React, { Component, PropTypes } from 'react';

class DropdownListItemAnchor extends Component {
  static propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onClick: PropTypes.func
  }
  onClick = () => this.props.onClick(this.props.value);
  render() {
    return <a onClick={this.onClick}>{this.props.label}</a>;
  }
}

export default class Dropdown extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    })).isRequired,
    readOnly: PropTypes.boolean,
    onChange: PropTypes.func,
    value: PropTypes.string
  };
  onDropdownItemClick = value => this.props.onChange(value);
  render() {
    const { name, options, readOnly, onChange, value } = this.props;
    return (
      <div className="input-group">
        <input
          id={name}
          name={name}
          type="text"
          readOnly={readOnly || false}
          onChange={onChange}
          value={value}
          className="form-control"
        />
        <span className="input-group-addon">
          <i className="material-icons">keyboard_arrow_down</i>
        </span>
        <div className="dropdown-container">
          <div className="dropdown">
            <ul className="dropdown-list">
              {options.map(option => (
                <li key={option.value}>
                  <DropdownListItemAnchor
                    label={option.label}
                    value={option.value}
                    onClick={this.onDropdownItemClick}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
