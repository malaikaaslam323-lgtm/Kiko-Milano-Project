import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, removeFromCart, updateCartQuantity, globalDiscount } = useCart();

  // Pricing Calculations
  const getItemPrice = (item) => globalDiscount > 0 ? Math.round(item.price * (1 - globalDiscount / 100)) : item.price;
  const subtotal = cartItems.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
  const shipping = subtotal > 50000 || subtotal === 0 ? 0 : 250; // Free shipping over 50,000 PKR, else 250 PKR
  const total = subtotal + shipping;

  return (
    <div className="cart-wrapper" style={{ padding: '60px 50px', fontFamily: 'Montserrat, sans-serif' }}>
      <h1 className="cart-title">Your Shopping Bag</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart-message" style={{ textAlign: 'center', padding: '50px 0' }}>
          <h3>Your shopping bag is currently empty.</h3>
          <Link to="/products" className="btn-secondary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>
            CONTINUE SHOPPING
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          
          {/* Left: Cart Items Table */}
          <div className="cart-items-section">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="cart-product-cell">
                        <Link to={`/products/${item._id}`}>
                          <img src={`/${item.image}`} className="cart-thumb" alt={item.name} onError={(e) => { e.target.src = '/Logo.webp'; }} />
                        </Link>
                        <div>
                          <Link to={`/products/${item._id}`} className="cart-product-name">{item.name}</Link>
                          <div style={{ fontSize: '11px', color: '#888', marginTop: '5px', fontWeight: '600' }}>
                            Category: {item.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {globalDiscount > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '11px', fontWeight: 'normal' }}>
                            PKR {item.price.toLocaleString()}
                          </span>
                          <span style={{ color: '#ff1493' }}>
                            PKR {getItemPrice(item).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span>PKR {item.price.toLocaleString()}</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          value={item.quantity}
                          min="1"
                          max={item.stock}
                          className="cart-qty-input"
                          onChange={(e) => updateCartQuantity(item._id, parseInt(e.target.value) || 1)}
                          style={{ width: '60px', padding: '5px', textAlign: 'center' }}
                        />
                      </div>
                      <div style={{ fontSize: '11px', color: '#777', marginTop: '5px', fontWeight: '500' }}>
                        {item.stock} left in stock
                      </div>
                    </td>
                    <td style={{ fontWeight: '700' }}>
                      PKR {(getItemPrice(item) * item.quantity).toLocaleString()}
                    </td>
                    <td>
                      <button 
                        type="button" 
                        className="cart-remove-btn" 
                        onClick={() => removeFromCart(item._id)}
                        title="Remove Item"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Summary Box */}
          <div className="cart-summary-section">
            <h2 className="summary-title">Order Summary</h2>
            
            {globalDiscount > 0 && (
              <div className="summary-row" style={{ color: '#ff1493', fontWeight: '700', fontSize: '12px' }}>
                <span>Campaign Sale Applied</span>
                <span>{globalDiscount}% OFF ALL</span>
              </div>
            )}

            <div className="summary-row">
              <span>Bag Subtotal</span>
              <span>PKR {subtotal.toLocaleString()}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping Cost</span>
              {shipping === 0 ? (
                <span style={{ color: '#ff1493', fontWeight: '700' }}>FREE</span>
              ) : (
                <span>PKR {shipping.toLocaleString()}</span>
              )}
            </div>

            <div style={{ fontSize: '11px', color: '#777', lineHeight: '1.4', marginBottom: '20px' }}>
              * Shipping is free for orders over PKR 50,000.
            </div>

            <div className="summary-row total-row">
              <span>Total Amount</span>
              <span>PKR {total.toLocaleString()}</span>
            </div>

            <Link to="/checkout" className="checkout-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              PROCEED TO CHECKOUT
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}