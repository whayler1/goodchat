import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

class CalendarAvailableTimes extends Component {
  static propTypes = {};

  render() {
    return (
      <section className="card">
        <header className="card-header">
          <h3>Schedule meeting</h3>
          <button className="card-header-close btn-no-style">
            <i className="material-icons">close</i>
          </button>
        </header>
      </section>
    );
  }
}
