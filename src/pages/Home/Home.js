import React, { useContext, useEffect, useState } from 'react';
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import KidoLogo from "../../assets/kido-logo.png";
import { AuthContext } from '../../context/Auth';
import firebase from '../../config/Fire';
import Axios from "axios";
import parse from 'html-react-parser';


function Home() {
  const { currentUser } = useContext(AuthContext);
  const [registerUser, setRegisterUser] = useState("");
  const [isadmin, setIsadmin] = useState(false);
  const [postData, setPostData] = useState("");
  const [quantities, setQuantities] = useState({}); // 🆕 track qty for each product

  const [analytics, setAnalytics] = useState({
  totalOrders: 0,
  totalSales: 0,
  totalUsers: 0,
  topProduct: ""
});


  useEffect(() => {
    getRegisteredUserDetail();
    getPostData();
  }, []);

  useEffect(() => {
  if (isadmin) {
    fetchAnalytics();
  }
}, [isadmin]);

const fetchAnalytics = async () => {
  try {
    // 🔹 Total Users
    const usersSnapshot = await firebase.database().ref("user").get();
    const usersData = usersSnapshot.val() || {};
    const totalUsers = Object.keys(usersData).length;

    // 🔹 All Orders
    const ordersSnapshot = await firebase.database().ref("orders").get();
    const ordersData = ordersSnapshot.val() || {};

    let totalOrders = 0;
    let totalSales = 0;
    const productCount = {};

    Object.values(ordersData).forEach(userOrders => {
      Object.values(userOrders).forEach(order => {
        totalOrders += 1;
        totalSales += parseFloat(order.totalAmount) || 0;

        // Count product sales
        Object.values(order.items).forEach(item => {
          if (productCount[item.productName]) {
            productCount[item.productName] += item.quantity;
          } else {
            productCount[item.productName] = item.quantity;
          }
        });
      });
    });

    // 🔹 Top-selling product
    let topProduct = "";
    let maxCount = 0;
    Object.entries(productCount).forEach(([product, qty]) => {
      if (qty > maxCount) {
        maxCount = qty;
        topProduct = product;
      }
    });

    setAnalytics({ totalOrders, totalSales, totalUsers, topProduct });

  } catch (err) {
    console.error("Analytics error:", err);
  }
};


  const getRegisteredUserDetail = () => {
    Axios
      .get(`https://vidyalankar-canteen-app-default-rtdb.firebaseio.com/user.json?orderBy="userEmail"&equalTo="${currentUser.email}"&print="pretty"`)
      .then((response) => {
        setRegisterUser(response.data);
        if (Object.keys(response.data).length) {
          setIsadmin(true);
        }
      })
      .catch((error) => console.log(error));
  };

  const getPostData = () => {
    firebase.database().ref(`products`).get()
      .then((response) => {
        setTimeout(() => setPostData(response.val()), 500);
      })
      .catch((error) => console.log(error));
  };

  // 🆕 Handle quantity change
  const handleQtyChange = (productId, value) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: parseInt(value) || 1
    }));
  };

  // 🛒 Add to Cart Function
  const handleAddToCart = (productId, productData) => {
    if (!currentUser) {
      alert("Please login first!");
      return;
    }

    const qty = quantities[productId] || 1;
    const price = parseFloat(productData.postPositionNo);
    const totalPrice = price * qty;

    const userCartRef = firebase.database().ref(`cart/${currentUser.uid}/${productId}`);

    const cartItem = {
      productId,
      productName: productData.postTopicName,
      productImage: productData.postImage,
      price,
      quantity: qty,
      totalPrice,
      description: productData.postLongDetail.substring(0, 100),
      addedAt: new Date().toISOString(),
      userEmail: currentUser.email
    };

    userCartRef
      .set(cartItem)
      .then(() => {
        alert(`✅ ${productData.postTopicName} (x${qty}) added to cart!`);
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
      });
  };

  return (
    <>
      <Navbar />
      {isadmin ? (
        <div className="wrapper d-flex align-items-stretch">
    <Sidebar />
    <div className="container main bg-light py-5">
      {/* <img src={KidoLogo} width="100" alt="icon" /> */}
      <div className="our-achivements py-3">
        <h4 className="text-primary mb-4">Canteen Dashboard</h4>

        {/* 🔹 Analytics Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm p-3 text-center bg-info text-white">
              <h5>Total Orders</h5>
              <h4>{analytics.totalOrders}</h4>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm p-3 text-center bg-success text-white">
              <h5>Total Sales (₹)</h5>
              <h4>{analytics.totalSales.toFixed(2)}</h4>
            </div>
          </div>
          {/* <div className="col-md-3 mb-3">
            <div className="card shadow-sm p-3 text-center bg-warning text-dark">
              <h5>Total Users</h5>
              <h3>{analytics.totalUsers}</h3>
            </div>
          </div> */}
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm p-3 text-center bg-primary text-white">
              <h5>Top Product</h5>
              <h6>{analytics.topProduct || "-"}</h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
      ) : (
        <div className='container mainhome bg-light py-5'>
          <div className='row justify-content-center'>
            {postData ? (
              Object.entries(postData)
                .sort((a, b) => a[1].postPositionNo - b[1].postPositionNo)
                .map(([id, item]) => (
                  <div className={"col-lg-4 session-card " + item.postTopicName} key={id}>
                    <div className="card activity-card-product shadow mb-3" style={{ width: "100%" }}>
                      <img className="card-img-top" src={item.postImage} alt="Card image cap" />
                      <div className="card-body">
                        <h3 className="card-title blog-post-title">{item.postIsEventStatus}</h3>
                        <h4 className="card-title blog-post-title mt-4">{item.postTopicName}</h4>
                        <p className="post-discription activity-discription card-text">
                          {parse(`${item.postLongDetail.substring(0, 100)}`)}
                        </p>
                        <div className='d-flex justify-content-between'>
                        <h4 className="card-title blog-post-title mb-2">
                          Rs. {item.postPositionNo}
                        </h4>

                        {/* 🆕 Quantity Selector */}
                        <div className="d-flex align-items-center mb-3">
                          <label className="me-2">Qty:</label>
                          <input
                            type="number"
                            min="1"
                            value={quantities[id] || 1}
                            onChange={(e) => handleQtyChange(id, e.target.value)}
                            className="form-control"
                            style={{ width: "70px" }}
                          />
                        </div>
                        </div>
                        {/* 🧮 Display Total Price */}
                        <h4 className="fw-bold mb-3">
                          Total: Rs. {(item.postPositionNo * (quantities[id] || 1)).toFixed(2)}
                        </h4>

                        <button
                          className='btn btn-primary w-100'
                          onClick={() => handleAddToCart(id, item)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="row justify-content-center pt-4">
                <div className="col-lg-12">
                  <div className="noprogramAdded text-center bg-white border shadow p-5">
                    <h2 className="noTaskAdded">Coming Soon</h2>
                    <span>We'll notify you as soon as something becomes available.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Home;