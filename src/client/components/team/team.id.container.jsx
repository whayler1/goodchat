import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

class TeamId extends Component {
  static propTypes = {};
  render() {
    console.log('userId:', this.props.params.userId);
    return (
      <main role="main">
        <header className="page-header">
          <h1>Specific Team</h1>
        </header>
        <div class="page-body">
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
      </main>
    );
  }
}

export default connect(
  state => ({}),
  {}
)(TeamId);
