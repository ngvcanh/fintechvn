import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';

import {
  HomeAsync,
  UserAsync,
  Error404,
  ProfileAsync,
  GroupsAsync,
  CategoriesAsync
} from 'modules';

class Content extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={ HomeAsync } />
        <Route path="/users" component={ UserAsync } />
        <Route path="/profile" component={ ProfileAsync } />
        <Route path="/groups" component={ GroupsAsync } />
        <Route path="/categories" component={ CategoriesAsync } />
        <Route component={ Error404 } />
      </Switch>
    );
  }
}

export default withRouter(Content);