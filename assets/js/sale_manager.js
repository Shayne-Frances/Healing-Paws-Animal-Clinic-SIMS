// assets/js/sale_manager.js
let cart = {}; // Object to hold our items: { product_id: { name, price, qty, maxStock } }

document.addEventListener('click', function(e) {
    // Only run this if we are in "Sale Mode" (Assuming you toggle a class on the body)
    if (!document.body.classList.contains('hp-mode-sale')) return;

    const productCard = e.target.closest('.hp-product-card');
    if (productCard) {
        handleProductClick(productCard);
    }
});

function handleProductClick(card) {
    const id = card.dataset.productId;
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const maxStock = parseInt(card.dataset.stock);
    const stockIndicator = document.getElementById(`stock-visual-${id}`);

    // Check if it's already in the cart and if we've hit the limit
    let currentQtyInCart = cart[id] ? cart[id].qty : 0;

    if (currentQtyInCart >= maxStock) {
        showToast(`Warning: ${name} has insufficient stock!`, 'warning');
        return;
    }

    // Add to cart object
    if (!cart[id]) {
        cart[id] = { name, price, qty: 1, maxStock };
    } else {
        cart[id].qty += 1;
    }

    // Optimistic UI Update: Deduct visual stock
    let visualStockLeft = maxStock - cart[id].qty;
    stockIndicator.textContent = visualStockLeft === 0 ? '0 pcs left' : `${visualStockLeft} pcs left`;

    renderPaperBag();
}

function removeOneFromCart(id) {
    if (cart[id]) {
        cart[id].qty -= 1;
        
        // Optimistic UI Update: Add visual stock back
        const stockIndicator = document.getElementById(`stock-visual-${id}`);
        let visualStockLeft = cart[id].maxStock - cart[id].qty;
        stockIndicator.textContent = `${visualStockLeft} pcs left`;

        if (cart[id].qty <= 0) {
            delete cart[id]; // Remove completely if 0
        }
        renderPaperBag();
    }
}

function renderPaperBag() {
    const bagContainer = document.getElementById('paperBagContainer');
    
    // Check if cart is completely empty
    if (Object.keys(cart).length === 0) {
        bagContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <div class="fs-1 mb-2">🛍️</div>
                <h6 class="fw-bold font-heading">Paper Bag is Empty</h6>
                <small>Click on products to add them to your cart.</small>
            </div>
        `;
        return;
    }

    // Otherwise, render the cart items
    let html = `<h5>🛍️ Current Sale</h5><ul class="list-group mb-3">`;
    let grandTotal = 0;

    for (let id in cart) {
        const item = cart[id];
        const lineTotal = item.price * item.qty;
        grandTotal += lineTotal;

        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center text-sm">
                <div>
                    <button class="btn btn-sm btn-outline-danger me-2 py-0 px-2 fw-bold" onclick="removeOneFromCart(${id})">✕</button>
                    ${item.name} <strong class="ms-1 text-primary">x${item.qty}</strong>
                </div>
                <span class="fw-bold text-dark">₱${lineTotal.toFixed(2)}</span>
            </li>`;
    }
    
    html += `</ul>
             <div class="d-flex justify-content-between fs-5 fw-bold mb-3 border-top pt-2">
                 <span>Total:</span>
                 <span class="text-success">₱${grandTotal.toFixed(2)}</span>
             </div>
             <button class="btn btn-success w-100 fw-bold py-2 shadow-sm" onclick="processCheckout()">Confirm Sale</button>`;
             
    bagContainer.innerHTML = html;
}

function processCheckout() {
    if (Object.keys(cart).length === 0) {
        showToast("Paper bag is empty!", "warning");
        return;
    }

    fetch('actions/sales_log/checkout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast("Sale completed successfully!", "success");
            cart = {}; // Empty the cart
            renderPaperBag();
            // Optional: setTimeout(() => window.location.reload(), 2000);
        } else {
            showToast(data.error || "Checkout failed.", "warning");
        }
    });
}