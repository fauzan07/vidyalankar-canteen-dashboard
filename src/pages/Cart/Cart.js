import React, { useContext, useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { AuthContext } from "../../context/Auth";
import firebase from "../../config/Fire";
import {Link , useHistory } from "react-router-dom";

const Cart = () => {
  const { currentUser } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(true);

  const history = useHistory();


  useEffect(() => {
    if (!currentUser) return;

    const cartRef = firebase.database().ref(`cart/${currentUser.uid}`);

    // 🔥 Real-time cart listener
    const listener = cartRef.on("value", (snapshot) => {
      const data = snapshot.val();
      setCartItems(data || {});
      setLoading(false);
    });

    return () => cartRef.off("value", listener);
  }, [currentUser]);

  // 🗑️ Remove item
  const handleRemoveItem = (productId) => {
    firebase
      .database()
      .ref(`cart/${currentUser.uid}/${productId}`)
      .remove()
      .then(() => alert("🗑️ Item removed from cart!"))
      .catch((err) => console.error(err));
  };

  // 🔢 Update quantity
  const handleQtyChange = (productId, newQty) => {
    if (newQty < 1) return;

    const itemRef = firebase.database().ref(`cart/${currentUser.uid}/${productId}`);
    const item = cartItems[productId];

    const updatedItem = {
      ...item,
      quantity: newQty,
      totalPrice: item.price * newQty,
    };

    itemRef
      .update(updatedItem)
      .catch((err) => console.error("Error updating quantity:", err));
  };

  const calculateTotal = () => {
    return Object.values(cartItems).reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
  };

   const goToCheckout = () => {
    history.push("/checkout");
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
        <h2 className="text-primary mb-4">🛒 My Cart</h2>

        {Object.keys(cartItems).length === 0 ? (
          <div className="text-center p-5 bg-light border rounded shadow-sm">
            <h4>Your cart is empty 😔</h4>
            <Link to="/home" className="btn-primary btn">Buy Again</Link>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-bordered align-middle shadow-sm">
                <thead className="table-primary">
                  <tr>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Price (₹)</th>
                    <th style={{ width: "150px" }}>Qty</th>
                    <th>Total (₹)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cartItems).map(([id, item]) => (
                    <tr key={id}>
                      <td>
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          width="80"
                          height="80"
                          className="rounded"
                        />
                      </td>
                      <td>{item.productName}</td>
                      <td>{item.price}</td>

                      {/* 🔢 Quantity input with + / - buttons */}
                      <td>
                        <div className="d-flex align-items-center justify-content-center">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() =>
                              handleQtyChange(id, item.quantity - 1)
                            }
                          >
                            −
                          </button>
                          <input
                            type="number"
                            className="form-control text-center mx-2"
                            style={{ width: "60px" }}
                            value={item.quantity}
                            min="1"
                            onChange={(e) =>
                              handleQtyChange(id, parseInt(e.target.value))
                            }
                          />
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() =>
                              handleQtyChange(id, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td>{item.totalPrice}</td>

                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveItem(id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 💰 Total summary */}
            <div className="text-end mt-4">
              <h4>
                <strong>Total: ₹{calculateTotal().toFixed(2)}</strong>
              </h4>
           <button className="btn btn-success mt-3" onClick={goToCheckout}>
            Proceed to Checkout
            </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
