// assets/js/sale_manager.js
let cart = {}; // Store items: { product_id: { name, price, qty, maxStock } }

document.addEventListener('click', function(e) {
    // Only run if the page is currently in Sale Mode
    if (!document.body.classList.contains('hp-mode-sale')) return;

    // 1. Check if clicking an individual Product Card
    const productCard = e.target.closest('.hp-product-card');
    if (productCard) {
        e.stopPropagation();
        handleProductClick(productCard);
        return;
    }

    // 2. Check if clicking a Group Card (excluding the toggle arrow)
    const groupCard = e.target.closest('.hp-group-card');
    if (groupCard && !e.target.closest('.hp-dropdown-arrow')) {
        e.stopPropagation();
        handleGroupBulkAdd(groupCard);
    }
});

/**
 * Handles adding an individual product card to the cart
 */
function handleProductClick(card) {
    const id = card.dataset.id; // Changed from productId to id
    const name = card.dataset.brand; // Changed from name to brand
    const price = parseFloat(card.dataset.price);
    const maxStock = parseInt(card.dataset.stock);
    const stockIndicator = document.getElementById(`stock-visual-${id}`);

    // If out of stock right from the beginning
    if (maxStock <= 0) {
        showToast(`Clinical Warning: ${name} is completely out of stock and cannot be added.`, 'warning');
        return;
    }

    let currentQtyInCart = cart[id] ? cart[id].qty : 0;

    if (currentQtyInCart >= maxStock) {
        showToast(`Clinical Warning: ${name} has insufficient stock to add more!`, 'warning');
        return;
    }

    // Add/Increment Cart Item
    if (!cart[id]) {
        cart[id] = { name, price, qty: 1, maxStock };
    } else {
        cart[id].qty += 1;
    }

    // Visual Stock UI Update (Optimistic)
    let visualStockLeft = maxStock - cart[id].qty;
    stockIndicator.textContent = visualStockLeft === 0 ? '0 pcs left' : `${visualStockLeft} pcs left`;

    renderPaperBag();
}

/**
 * Handles clicking a group card to bulk-add all of its nested products
 */
function handleGroupBulkAdd(groupCard) {
    const groupId = groupCard.getAttribute('data-group-id');
    const nestedContainer = document.getElementById(`nested-group-${groupId}`);

    if (!nestedContainer) {
        showToast("Error: No items found inside this group.", "warning");
        return;
    }

    // Select all product cards inside the expanded/nested group container
    const nestedProducts = nestedContainer.querySelectorAll('.hp-product-card');
    let addedCount = 0;
    let skippedItems = [];

    nestedProducts.forEach(card => {
        const id = card.dataset.id;
        const name = card.dataset.brand;
        const maxStock = parseInt(card.dataset.stock);
        let currentQtyInCart = cart[id] ? cart[id].qty : 0;

        // If item is completely out of stock or cart limit is reached, skip and warn
        if (maxStock <= 0 || currentQtyInCart >= maxStock) {
            skippedItems.push(name);
        } else {
            // Reuse individual add logic
            handleProductClick(card);
            addedCount++;
        }
    });

    // Notify the user if items were skipped during bulk-add
    if (skippedItems.length > 0) {
        showToast(`Warning: Skipped ${skippedItems.join(', ')} because they are out of stock.`, 'warning');
    } else if (addedCount > 0) {
        showToast(`Added items in group to paper bag!`, 'success');
    }
}

/**
 * Decrement item count by one
 */
function removeOneFromCart(id) {
    if (cart[id]) {
        cart[id].qty -= 1;
        
        // Return visual stock levels
        const stockIndicator = document.getElementById(`stock-visual-${id}`);
        let visualStockLeft = cart[id].maxStock - cart[id].qty;
        stockIndicator.textContent = `${visualStockLeft} pcs left`;

        if (cart[id].qty <= 0) {
            delete cart[id];
        }
        renderPaperBag();
    }
}

/**
 * Update current Paper Bag visual DOM
 */
function renderPaperBag() {
    const bagContainer = document.getElementById('paperBagContainer');
    
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

    let html = `<h5>🛍️ Current Sale</h5><ul class="list-group mb-3" style="max-height: 40vh; overflow-y: auto;">`;
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

/**
 * Transmit checkout payload securely to backend
 */
function processCheckout() {
    if (Object.keys(cart).length === 0) {
        showToast("Paper bag is empty!", "warning");
        return;
    }

    fetch('actions/checkout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast("Sale completed successfully!", "success");
            cart = {};
            renderPaperBag();
        } else {
            showToast(data.error || "Checkout failed.", "warning");
        }
    });
}