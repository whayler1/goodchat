import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import App from './components/app/app.jsx';
import Home from './components/home/home.container.jsx';
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
        <Router history={hashHistory}>
          <Route path="/" component={App}>
            <IndexRoute component={Home}/>
          </Route>
        </Router>
      </Provider>
    );
  }
}

ReactDOM.render(<GoodChat/>, document.getElementById('app'));
