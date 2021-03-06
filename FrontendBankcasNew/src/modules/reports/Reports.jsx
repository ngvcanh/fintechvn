import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';

import { Error404 } from 'modules';
import { RevenueIndex } from './revenue';
import { RolicyExpired } from './policyExpired';

class User extends Component {

  render() {
    return (
      <Switch>
        <Route exact path="/reports/revenue" component={ RevenueIndex } />
        <Route exact path="/reports/policy-expired" component={ RolicyExpired } />
        <Route component={ Error404 } />
      </Switch>
    );
  }
}
export default withRouter(User);