import React, { useContext, useEffect, useState } from 'react';
import './Navbar.css';
import KidoLogo from './kido-logo.png';
import fire from '../../config/Fire';
import { AuthContext } from '../../context/Auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import {NavLink , withRouter } from "react-router-dom";
import Axios from "axios";


const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);

      const [registerUser, setRegisterUser] = useState("");
  const [isadmin, setIsadmin] = useState(false);

  useEffect(() => {
    getRegisteredUserDetail();
  }, []);

  const getRegisteredUserDetail = () => {
    Axios
    .get(`https://vidyalankar-canteen-app-default-rtdb.firebaseio.com/user.json?orderBy="userEmail"&equalTo="${currentUser.email}"&print="pretty"`)
    .then((response) => {
      setRegisterUser(response.data)
      if(Object.keys(response.data).length) {
        setIsadmin(true)
      };
    })
    .catch((error) => console.log(error));
  }



  useEffect(() => {
    if (!currentUser) return;

    const cartRef = fire.database().ref(`cart/${currentUser.uid}`);
    
    // 🔥 Real-time listener for cart count
    const listener = cartRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const totalItems = Object.values(data).reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        );
        setCartCount(totalItems);
      } else {
        setCartCount(0);
      }
    });

    // Cleanup listener when component unmounts
    return () => cartRef.off('value', listener);
  }, [currentUser]);

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-light bg-blue fixed-top bg-border-btm d-flex justify-content-between align-items-center px-3">
        
        {/* 🧭 Left: Logo */}
        <div className="text-center Usericon">
          <img src={KidoLogo} width="100" alt="icon" />
        </div>

        {/* 🛒 Right: Cart + Sign Out */}
        <div className="d-flex align-items-center gap-4">

          {/* 🛒 Cart Icon with Count */}
      {!isadmin ? 
      <>
            <NavLink to="/cart" className="cart-icon position-relative" style={{ cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faShoppingCart} size="lg" className="text-primary" />
            {cartCount > 0 && (
              <span
                className="badge bg-danger text-white position-absolute top-0 start-100 translate-middle"
                style={{
                  fontSize: '0.7rem',
                  borderRadius: '50%',
                  padding: '4px 6px',
                }}
              >
                {cartCount}
              </span>
            )}
          </NavLink>

          <NavLink to="/orders" className="btn btn-outline-primary ml-5">
            My Orders
            </NavLink>
            </>
  : ""}

          {/* 🔌 Sign Out */}
          <div className="nav-sign-out ml-5">
            <a
              className="nav-signout text-primary"
              onClick={() => fire.auth().signOut()}
              style={{ cursor: 'pointer' }}
            >
              <FontAwesomeIcon icon={faPowerOff} className="mr-3" />
              <small>Sign-Out</small>
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
