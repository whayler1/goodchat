import React, { Component, PropTypes } from 'react';

export default class Dropdown extends Component {
  static propTypes = {
    label: PropTypes.object,
    content: PropTypes.object,
    isRightAligned: PropTypes.bool
  }

  render() {
    const { label, content, isRightAligned } = this.props;

    return (
      <div className={`dropdown-wrapper${ isRightAligned ? ' dropdown-right' : '' }`}>
        {label}
        <div className="dropdown-container">
          <div className="dropdown" ref={el => this.dropdown = el}>{content}</div>
        </div>
      </div>
    );
  }
}
