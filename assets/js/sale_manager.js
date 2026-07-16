// assets/js/sale_manager.js
let cart = {}; // Store items: { product_id: { name, price, qty, maxStock, picture } }

document.addEventListener('click', function(e) {
    // ONLY execute POS logic if the app is physically in Sale Mode
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
 * Handles adding an individual product to the cart with flight effects
 */
function handleProductClick(card) {
    const id = card.dataset.id;
    const name = card.dataset.brand;
    const price = parseFloat(card.dataset.price);
    const maxStock = parseInt(card.dataset.stock);
    const picture = card.dataset.picture;
    const stockIndicator = document.getElementById(`stock-visual-${id}`);

    // Fetch live quantity currently sitting in our virtual basket
    let currentQtyInCart = cart[id] ? cart[id].qty : 0;

    // Out of Stock Logic check
    if (maxStock <= 0) {
        showToast(`Warning: ${name} is completely out of stock! Not including this in the paper bag.`, 'warning');
        return;
    }

    if (currentQtyInCart >= maxStock) {
        showToast(`Warning: ${name} has insufficient stock to add more!`, 'warning');
        return;
    }

    // Capture starting position for flight animation
    const rect = card.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    // Trigger Fly Animation using the product image or the fallback soap emoji
    const animContent = picture ? `<img src="${picture}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">` : `<span style="font-size: 1.5rem;">🧼</span>`;
    triggerFlightAnimation(startX, startY, animContent, () => {
        // This callback runs only AFTER the item lands safely inside the bag
        if (!cart[id]) {
            cart[id] = { name, price, qty: 1, maxStock, picture };
        } else {
            cart[id].qty += 1;
        }
        renderPaperBag();
        triggerCartBounce();
    });

    // Optimistic UI Update: Instantly decrement visual main-screen counter
    let visualStockLeft = maxStock - (currentQtyInCart + 1);
    stockIndicator.textContent = visualStockLeft === 0 ? '0 pcs left' : `${visualStockLeft} pcs left`;
}

/**
 * Handles bulk-adding nested products with a singular "📦 Package" flight
 */
function handleGroupBulkAdd(groupCard) {
    const groupId = groupCard.getAttribute('data-group-id');
    const nestedContainer = document.getElementById(`nested-group-${groupId}`);

    if (!nestedContainer) {
        showToast("Error: Group has no products assigned.", "warning");
        return;
    }

    const nestedProducts = nestedContainer.querySelectorAll('.hp-product-card');
    let itemsToProcess = [];
    let skippedItems = [];

    // Evaluate which products qualify for inclusion
    nestedProducts.forEach(card => {
        const id = card.dataset.id;
        const name = card.dataset.brand;
        const maxStock = parseInt(card.dataset.stock);
        let currentQtyInCart = cart[id] ? cart[id].qty : 0;

        if (maxStock <= 0 || currentQtyInCart >= maxStock) {
            skippedItems.push(name);
        } else {
            itemsToProcess.push(card);
        }
    });

    // If everything inside the package is out of stock, drop execution
    if (itemsToProcess.length === 0) {
        if (skippedItems.length > 0) {
            showToast(`Warning: Group items (${skippedItems.join(', ')}) are out of stock!`, 'warning');
        }
        return;
    }

    // Flight Path configuration for the single package container
    const rect = groupCard.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    triggerFlightAnimation(startX, startY, `<span style="font-size: 2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">📦</span>`, () => {
        // Unpack package contents into the cart database model
        itemsToProcess.forEach(card => {
            const id = card.dataset.id;
            const name = card.dataset.brand;
            const price = parseFloat(card.dataset.price);
            const maxStock = parseInt(card.dataset.stock);
            const picture = card.dataset.picture;
            const stockIndicator = document.getElementById(`stock-visual-${id}`);

            let currentQtyInCart = cart[id] ? cart[id].qty : 0;

            if (!cart[id]) {
                cart[id] = { name, price, qty: 1, maxStock, picture };
            } else {
                cart[id].qty += 1;
            }

            // Sync original card visual trackers
            let visualStockLeft = maxStock - (currentQtyInCart + 1);
            stockIndicator.textContent = visualStockLeft === 0 ? '0 pcs left' : `${visualStockLeft} pcs left`;
        });

        renderPaperBag();
        triggerCartBounce();

        if (skippedItems.length > 0) {
            showToast(`Note: Added active products. Skipped ${skippedItems.join(', ')} (out of stock).`, 'warning');
        } else {
            showToast(`Group products unpacked successfully inside paper bag!`, 'success');
        }
    });
}

/**
 * Creates and executes absolute spatial coordinates fly transitions
 */
function triggerFlightAnimation(startX, startY, htmlContent, callback) {
    const bagElement = document.getElementById('paperBagContainer');
    const bagRect = bagElement.getBoundingClientRect();
    const endX = bagRect.left + bagRect.width / 4;
    const endY = bagRect.top + bagRect.height / 4;

    // Generate flying element clone
    const clone = document.createElement('div');
    clone.className = 'hp-flying-clone';
    clone.innerHTML = htmlContent;
    clone.style.left = `${startX - 20}px`;
    clone.style.top = `${startY - 20}px`;
    document.body.appendChild(clone);

    // Forces a browser reflow so transition animation works smoothly
    clone.offsetWidth;

    // Launch element towards targets
    clone.style.left = `${endX}px`;
    clone.style.top = `${endY}px`;
    clone.style.transform = 'scale(0.3) rotate(360deg)';
    clone.style.opacity = '0.4';

    // FIX: Using setTimeout instead of transitionend prevents multi-triggering 
    // from the 4 transitioning properties (left, top, transform, opacity)
    setTimeout(() => {
        clone.remove();
        if (callback) callback();
    }, 700); // 700ms perfectly matches our 0.7s CSS transition
}

/**
 * Decrements the visual cart pill, adding back to the main inventory counts
 */
function removeOneFromCart(id) {
    if (cart[id]) {
        cart[id].qty -= 1;
        
        // Return visual inventory level back up to main screen indicator
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
 * Cart update physical bounce effect
 */
function triggerCartBounce() {
    const bagElement = document.getElementById('paperBagContainer');
    bagElement.classList.add('hp-cart-bounce');
    bagElement.addEventListener('animationend', () => {
        bagElement.classList.remove('hp-cart-bounce');
    }, { once: true });
}

/**
 * Renders the clean medical Pill list UI inside the Paper Bag container
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

    let html = `<h5 class="fw-bold font-heading mb-3">🛍️ Current Sale</h5>`;
    html += `<div style="max-height: 40vh; overflow-y: auto; padding-right: 5px;">`;

    let grandTotal = 0;

    for (let id in cart) {
        const item = cart[id];
        const lineTotal = item.price * item.qty;
        grandTotal += lineTotal;

        // Render picture or soap fallback
        const imageBlock = item.picture 
            ? `<img src="${item.picture}" class="hp-cart-pill-img">` 
            : `<div class="hp-cart-pill-img">🧼</div>`;

        // The Pill structure requested
        html += `
            <div class="hp-cart-pill">
                <button class="hp-btn-minus" onclick="removeOneFromCart(${id})" title="Remove One">✕</button>
                
                ${imageBlock}
                
                <div class="hp-cart-pill-details">
                    <h6 class="mb-0 text-truncate fw-bold text-dark" style="font-size: 0.9rem;">${item.name}</h6>
                    <span class="text-muted small">₱${item.price.toFixed(2)}</span>
                </div>
                
                <div class="text-end ps-2">
                    <span class="badge bg-success rounded-pill fw-bold" style="font-size: 0.85rem;">x${item.qty}</span>
                </div>
            </div>`;
    }
    
    html += `</div>`; // Close scrollable item wrapper
    
    html += `
         <div class="d-flex justify-content-between fs-5 fw-bold mt-3 mb-3 border-top pt-2">
             <span class="font-heading">Total:</span>
             <span class="text-success">₱${grandTotal.toFixed(2)}</span>
         </div>
         <button class="btn btn-success w-100 fw-bold py-2 rounded-3 shadow-sm" onclick="processCheckout()">Confirm Sale</button>`;
             
    bagContainer.innerHTML = html;
}

/**
 * Transmit checkout payload securely to actions/checkout.php
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
            setTimeout(() => window.location.reload(), 1500); // Reload to sync DB stock levels with frontend elements
        } else {
            showToast(data.error || "Checkout failed.", "warning");
        }
    });
}