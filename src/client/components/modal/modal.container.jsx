import React, { Component, PropTypes } from 'react';
// import { connect } from 'react-redux';

export default class Modal extends Component {
  static propTypes = {
    closeFunc: PropTypes.func.isRequired
  }

  componentWillMount = () => document.body.classList.add('no-scroll')

  componentWillUnmount = () => document.body.classList.remove('no-scroll')

  render() {
    return (
      <div className="modal-container">
        <a className="modal-close-scrim" onClick={this.props.closeFunc}></a>
        <div className="modal-card-container">
          {this.props.children}
        </div>
      </div>
    );
  }
}
