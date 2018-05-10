import * as React from 'react';
import { RouteProps, Redirect, Route, Switch } from 'react-router-dom';
import Callback from '../Callback';
import App from '../../App';
import Auth from '../../Auth';

// This has to change. It should be in a saga
const auth = new Auth();

const handleAuthentication = (prop: RouteProps) => {
  if (prop.location && /access_token|id_token|error/.test(prop.location.hash)) {
    auth.handleAuthentication();
  }
};

const Routes = () => (
  <Switch>
    <Route
      path="/"
      exact={true}
      render={props => !auth.isAuthenticated() ?
        <Redirect to="/home" />
        : <App auth={auth} {...props} />}
    />
    <Route
      path="/callback"
      render={props => {
        handleAuthentication(props);
        return <Callback />;
      }}
    />

    <Route exact={true} path="/home" render={props => <App auth={auth} {...props} />} />
    <Route
      exact={true}
      path="/profile"
      render={props =>
      !auth.isAuthenticated() ?
        <Redirect to="/home" />
        : <App auth={auth} {...props} />}
    />

  </Switch>
);

export default Routes;
