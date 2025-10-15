import React, { useContext, useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { AuthContext } from "../../context/Auth";
import firebase from "../../config/Fire";

const Checkout = () => {
  const { currentUser } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "COD",
  });

  useEffect(() => {
    if (!currentUser) return;

    const cartRef = firebase.database().ref(`cart/${currentUser.uid}`);

    const listener = cartRef.on("value", (snapshot) => {
      const data = snapshot.val();
      setCartItems(data || {});
      setLoading(false);
    });

    return () => cartRef.off("value", listener);
  }, [currentUser]);

  const calculateTotal = () => {
    return Object.values(cartItems).reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      alert("⚠️ Please fill all required fields");
      return;
    }

    const orderId = firebase.database().ref().push().key;
    const totalAmount = calculateTotal();

    const orderData = {
      orderId,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      items: cartItems,
      totalAmount,
      customerDetails: form,
      status: "Pending",
  timestamp:  new Date().toUTCString(),
    };

    try {
      // 🛒 Save order in Firebase
      await firebase.database().ref(`orders/${currentUser.uid}/${orderId}`).set(orderData);

      // 🧹 Clear the cart
      await firebase.database().ref(`cart/${currentUser.uid}`).remove();

      alert("✅ Order placed successfully!");
      window.location.href = "/"; // redirect to homepage or order summary page
    } catch (error) {
      console.error("Order Error:", error);
      alert("❌ Failed to place order. Try again.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 text-center">
          <h4>Loading your cart...</h4>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ marginTop: "80px" }}>
        <h2 className="text-primary mb-4">Checkout 🧾</h2>

        {Object.keys(cartItems).length === 0 ? (
          <div className="text-center p-5 bg-light border rounded shadow-sm">
            <h4>Your cart is empty 😔</h4>
          </div>
        ) : (
          <div className="row">
            {/* 🧍 Customer Details */}
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm p-4">
                <h5 className="mb-3 text-secondary">Customer Information</h5>
                <div className="form-group mb-3">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Address</label>
                  <textarea
                    name="address"
                    className="form-control"
                    rows="3"
                    placeholder="Enter delivery address"
                    value={form.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Payment Method</label>
                  <select
                    name="paymentMethod"
                    className="form-control"
                    value={form.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="COD">Cash on Delivery</option>
                    <option value="Online">Online Payment</option>
                  </select>
                </div>
                <button
                  className="btn btn-primary w-100 mt-3"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </button>
              </div>
            </div>

            {/* 🧾 Order Summary */}
            <div className="col-md-6">
              <div className="card shadow-sm p-4">
                <h5 className="mb-3 text-secondary">Order Summary</h5>
                {Object.entries(cartItems).map(([id, item]) => (
                  <div
                    key={id}
                    className="d-flex justify-content-between border-bottom py-2"
                  >
                    <span>
                      {item.productName} x {item.quantity}
                    </span>
                    <span>₹{item.totalPrice}</span>
                  </div>
                ))}
                <div className="mt-3 text-end">
                  <h5>
                    <strong>Total: ₹{calculateTotal().toFixed(2)}</strong>
                  </h5>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Checkout;
