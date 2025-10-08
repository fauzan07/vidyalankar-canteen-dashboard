import React, {useContext} from 'react';
import {NavLink , withRouter } from "react-router-dom";
import $ from "jquery";
import fire from '../../config/Fire';
import { AuthContext } from '../../context/Auth';
import './Sidebar.css';


const Sidebar=()=> {
  const { currentUser } = useContext(AuthContext);
  var str= !currentUser.email ? "" :  currentUser.email;
  const result = str.split('@')[0];

  // console.log(currentUser);
  const tooglesidebar=()=>
  {
    $('#sidebar').toggleClass('active');
  }


  return (
  
      <>
        {currentUser ? (
		    <nav id="sidebar" className="nav-mar shadow  border">
				<div className="custom-menu">
					<button type="button" id="sidebarCollapse" onClick={tooglesidebar} className="btn btn-primary d-sm-block"></button>
        </div>
	  			<div className="user-logo pl-4 pt-3">
            <small>online now</small>
            <h1>{currentUser.displayName}</h1>
	  		</div>
        <hr/>
       
        <ul className="list-unstyled components mb-5">
          <li>
            <NavLink exact to="/home" >Home</NavLink>
          </li>
          <li>
            <NavLink exact to="/product" >Create Product</NavLink>
          </li>
          {/* <li>
            <a href="http://www.mlhngo.com/" target="_blank" rel="noopener noreferrer">MLH Trust</a>
          </li> */}
          <li>
            <a  onClick={()=>fire.auth().signOut()}>Sign Out</a>
          </li>
        </ul>
      </nav>
      ) : (
      <div></div>
       
      )}
      </>
  );
  
}


export default withRouter(Sidebar);