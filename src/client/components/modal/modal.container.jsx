import React, { Component, PropTypes } from 'react';

export default class Modal extends Component {
  static propTypes = {
    closeFunc: PropTypes.func.isRequired,
    className: PropTypes.string
  }

  componentWillMount = () => document.body.classList.add('no-scroll')

  componentWillUnmount = () => document.body.classList.remove('no-scroll')

  render() {
    const { className, closeFunc, children } = this.props;

    return (
      <div className={`modal-container${ className ? ' ' + className : '' }`}>
        <a className="modal-close-scrim" onClick={closeFunc}></a>
        <div className="modal-card-container">
          {children}
        </div>
      </div>
    );
  }
}
