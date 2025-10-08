import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { AuthProvider } from './context/Auth';
import PrivateRoute from './common/guards/PrivateRoute';
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import SignUp from './pages/SignUp/SignUp';
import Blogs from './pages/Blogs/Blogs';
import './App.css';



function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <PrivateRoute exact path="/" component={Home} />
          <PrivateRoute path="/product" component={Blogs} />
          <Route path="/Login" component={Login} />
          <Route path="/mlh-trust-dashboard-SignUp" component={SignUp} />
          <Route exact path="*" component={Home} />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
