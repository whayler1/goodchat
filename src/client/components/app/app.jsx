import React, {Component} from 'react';
import Navbar from '../navbar/navbar.container.jsx';

export default class App extends Component {
  render() {
    return (
      <div>
        <Navbar/>
        {this.props.children}
      </div>
    )
  }
}
