import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import Routes from './routes.jsx';

import reducer from './reducers/index';
import thunk from 'redux-thunk';

require('./main.less');

const store = createStore(
  reducer,
  applyMiddleware(thunk)
);

class GoodChat extends Component {
  render() {
    return (
      <Provider store={store}>
        <Routes />
      </Provider>
    );
  }
}

ReactDOM.render(<GoodChat/>, document.getElementById('app'));
