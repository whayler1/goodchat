import React, { Component, PropTypes } from 'react';

export default class Dropdown extends Component {
  static propTypes = {
    className: PropTypes.string,
    label: PropTypes.object,
    content: PropTypes.object,
    isRightAligned: PropTypes.bool
  }

  render() {
    const { label, content, isRightAligned, className } = this.props;
    const classes = [
      isRightAligned ? 'dropdown-right' : '',
      className ? className : ''
    ].filter(className => className.length > 0).map(className => ` ${className}`).join('');

    return (
      <div className={`dropdown-wrapper${ classes }`}>
        {label}
        <div className="dropdown-container">
          <div className="dropdown" ref={el => this.dropdown = el}>{content}</div>
        </div>
      </div>
    );
  }
}
