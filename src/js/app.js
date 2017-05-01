import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import { Redirect, HashRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

const { ipcRenderer } = require('electron');

import { toggleSettingsModal } from './actions';
import configureStore from './store/configureStore';
import Sidebar from './components/sidebar';
import Loading from './components/loading';
import LoginPage from './components/login';
import NotificationsRoute from './routes/notifications';
import EnterpriseLoginPage from './components/enterprise-login';
import SettingsModal from './components/settings-modal';

// Store
const store = configureStore();

ipcRenderer.on('toggle-settings', (event) => {
  store.dispatch(toggleSettingsModal());
});

export class NotFound extends React.Component {
  render() {
    return <h2>Not found</h2>;
  }
};

const PrivateRoute = ({ component: Component, ...rest }) => {
  const authReducer = store.getState().auth;
  const isAuthenticated = authReducer.get('token') !== null || authReducer.get('enterpriseAccounts').size > 0;

  return (
    <Route {...rest} render={props => (
      isAuthenticated ? (
        <Component {...props}/>
      ) : (
        <Redirect to={{
          pathname: '/login',
          state: { from: props.location }
        }}/>
      )
    )}/>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <Router>

      <div className="wrapper">
        <Loading />
        <SettingsModal />
        <Sidebar />

        <Switch>
          <PrivateRoute path="/" exact component={NotificationsRoute} />
          <Route path="/login" component={LoginPage} />
          <Route path="/enterpriselogin" component={EnterpriseLoginPage} />
          <Route component={NotFound}/>
        </Switch>
      </div>

    </Router>
  </Provider>,
  document.getElementById('gitify')
);
