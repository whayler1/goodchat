import React, { Component, PropTypes } from 'react';

export default class TeamQuestionDropdownListItem extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    onSelected: PropTypes.func.isRequired
  })
  onSelected = () => this.props.onSelected(value);
  render() {
    return (
      <a onClick={this.onSelected}>
        {value}
      </a>
    );
  }
};
