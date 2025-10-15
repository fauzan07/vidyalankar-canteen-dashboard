import React, { useContext, useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { AuthContext } from "../../context/Auth";
import firebase from "../../config/Fire";

const Orders = () => {
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const ordersRef = firebase.database().ref(`orders/${currentUser.uid}`);

    // 🔥 Real-time listener for user's orders
    const listener = ordersRef.on("value", (snapshot) => {
      const data = snapshot.val();
      setOrders(data || {});
      setLoading(false);
    });

    return () => ordersRef.off("value", listener);
  }, [currentUser]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 text-center">
          <h4>Loading your orders...</h4>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ marginTop: "80px" }}>
        <h2 className="text-primary mb-4">📦 My Orders</h2>

        {Object.keys(orders).length === 0 ? (
          <div className="text-center p-5 bg-light border rounded shadow-sm">
            <h4>You have no orders yet 😔</h4>
          </div>
        ) : (
          Object.entries(orders)
            .sort((a, b) => b[1].timestamp - a[1].timestamp) // newest first
            .map(([orderId, order]) => (
              <div key={orderId} className="card mb-4 shadow-sm">
                <div className="card-header bg-primary text-white d-flex justify-content-between">
                  <span>Order ID: {orderId}</span>
                  <span>Status: {order.status}</span>
                </div>
                <div className="card-body">
                  <h5 className="mb-3">Customer Details:</h5>
                  <p>Name: {order.customerDetails.name}</p>
                  <p>Phone: {order.customerDetails.phone}</p>
                  <p>Address: {order.customerDetails.address}</p>
                  <p>Payment: {order.customerDetails.paymentMethod}</p>

                  <h5 className="mt-4 mb-2">Items:</h5>
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price (₹)</th>
                        <th>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(order.items).map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price}</td>
                          <td>{item.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-end mt-3">
                    <h5>
                      <strong>Total Amount: ₹{order.totalAmount}</strong>
                    </h5>
                    <p className="text-muted">
                      Ordered on: {formatDate(order.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </>
  );
};

export default Orders;
