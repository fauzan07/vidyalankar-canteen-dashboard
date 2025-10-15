import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { AuthProvider } from './context/Auth';
import PrivateRoute from './common/guards/PrivateRoute';
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import SignUp from './pages/SignUp/SignUp';
import Products from './pages/Products/Products';
import './App.css';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Orders from './pages/Orders/Orders';
import AdminOrders from './pages/AdminOrders/AdminOrders';



function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <PrivateRoute exact path="/" component={Home} />
          <PrivateRoute path="/product" component={Products} />
          <PrivateRoute path="/cart" component={Cart} />
          <PrivateRoute path="/checkout" component={Checkout} />
          <PrivateRoute path="/orders" component={Orders} />
          <PrivateRoute path="/admin-orders" component={AdminOrders} />
          <Route path="/Login" component={Login} />
          <Route path="/vidyalankar-dashboard-SignUp" component={SignUp} />
          <Route exact path="*" component={Home} />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
