import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import firebase from "../../config/Fire";
import Sidebar from "../../components/Sidebar/Sidebar";

const AdminOrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersRef = firebase.database().ref("orders");

    const listener = ordersRef.on("value", (snapshot) => {
      const data = snapshot.val() || {};

      // Flatten all orders into an array
      const allOrders = [];
      Object.entries(data).forEach(([userId, userOrders]) => {
        Object.entries(userOrders).forEach(([orderId, order]) => {
          allOrders.push({
            orderId,
            userId,
            userEmail: order.userEmail,
            customerName: order.customerDetails.name,
            customerPhone: order.customerDetails.phone,
            itemsCount: Object.keys(order.items).length,
            totalAmount: order.totalAmount,
            status: order.status,
            timestamp: order.timestamp,
            items: order.items,
          });
        });
      });

      // Sort newest first
      allOrders.sort((a, b) => b.timestamp - a.timestamp);

      setOrders(allOrders);
      setLoading(false);
    });

    return () => ordersRef.off("value", listener);
  }, []);

  const statusOptions = ["Pending", "Preparing", "Out for Delivery", "Completed"];

  const handleStatusChange = (userId, orderId, newStatus) => {
    firebase
      .database()
      .ref(`orders/${userId}/${orderId}`)
      .update({ status: newStatus })
      .catch((err) => console.error("Status update error:", err));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 text-center">
          <h4>Loading orders...</h4>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
            <div className="wrapper d-flex align-items-stretch">
                <Sidebar />
      <div className="container py-5" style={{ marginTop: "80px" }}>
        <h2 className="text-primary mb-4">🛠 Admin Orders Dashboard</h2>

        {orders.length === 0 ? (
          <div className="text-center p-5 bg-light border rounded shadow-sm">
            <h4>No orders yet.</h4>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-primary">
                <tr>
                  <th>Order ID</th>
                  <th>User Email</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Items Count</th>
                  <th>Total Amount (₹)</th>
                  <th>Status</th>
                  <th>Order Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td>{order.orderId}</td>
                    <td>{order.userEmail}</td>
                    <td>{order.customerName}</td>
                    <td>{order.customerPhone}</td>
                    <td>{order.itemsCount}</td>
                    <td>{order.totalAmount}</td>
                    <td>
                      <select
                        className="form-select"
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.userId, order.orderId, e.target.value)
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{formatDate(order.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default AdminOrdersTable;
