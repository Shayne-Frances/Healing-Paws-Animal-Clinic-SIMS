// assets/js/sale_manager.js
let cart = {}; 

document.addEventListener('click', function(e) {
    if (!document.body.classList.contains('hp-mode-sale')) return;

    const productCard = e.target.closest('.hp-product-card');
    if (productCard) {
        e.stopPropagation();
        handleProductClick(productCard);
        return;
    }

    const groupCard = e.target.closest('.hp-group-card');
    if (groupCard && !e.target.closest('.hp-dropdown-arrow')) {
        e.stopPropagation();
        handleGroupBulkAdd(groupCard);
    }
});

function handleProductClick(card) {
    const id = card.dataset.id;
    const name = card.dataset.brand;
    const price = parseFloat(card.dataset.price);
    const maxStock = parseInt(card.dataset.stock);
    const picture = card.dataset.picture;
    const category = card.dataset.category || '';
    const isService = (category.toLowerCase() === 'service');
    const stockIndicator = document.getElementById(`stock-visual-${id}`);

    let currentQtyInCart = cart[id] ? cart[id].qty : 0;

    // Standard out of stock check applies to everything (since you'll set service stock to 9999)
    if (maxStock <= 0) {
        showToast(`Warning: ${name} is completely out of stock! Not including this in the paper bag.`, 'warning');
        return;
    }

    if (currentQtyInCart >= maxStock) {
        showToast(`Warning: ${name} has insufficient stock to add more!`, 'warning');
        return;
    }

    const rect = card.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const animContent = picture ? `<img src="${picture}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">` : `<span style="font-size: 1.5rem;">🧼</span>`;
    triggerFlightAnimation(startX, startY, animContent, () => {
        if (!cart[id]) {
            cart[id] = { name, price, qty: 1, maxStock, picture, isService };
        } else {
            cart[id].qty += 1;
        }
        renderPaperBag();
        triggerCartBounce();
    });

    let visualStockLeft = maxStock - (currentQtyInCart + 1);
    if(stockIndicator) stockIndicator.textContent = visualStockLeft === 0 ? '0 pcs left' : `${visualStockLeft} pcs left`;
}

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

    if (itemsToProcess.length === 0) {
        if (skippedItems.length > 0) {
            showToast(`Warning: Group items (${skippedItems.join(', ')}) are out of stock!`, 'warning');
        }
        return;
    }

    const rect = groupCard.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    triggerFlightAnimation(startX, startY, `<span style="font-size: 2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">📦</span>`, () => {
        itemsToProcess.forEach(card => {
            const id = card.dataset.id;
            const name = card.dataset.brand;
            const price = parseFloat(card.dataset.price);
            const maxStock = parseInt(card.dataset.stock);
            const picture = card.dataset.picture;
            const category = card.dataset.category || '';
            const isService = (category.toLowerCase() === 'service');
            const stockIndicator = document.getElementById(`stock-visual-${id}`);

            let currentQtyInCart = cart[id] ? cart[id].qty : 0;

            if (!cart[id]) {
                cart[id] = { name, price, qty: 1, maxStock, picture, isService };
            } else {
                cart[id].qty += 1;
            }

            let visualStockLeft = maxStock - (currentQtyInCart + 1);
            if(stockIndicator) stockIndicator.textContent = visualStockLeft === 0 ? '0 pcs left' : `${visualStockLeft} pcs left`;
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

function triggerFlightAnimation(startX, startY, htmlContent, callback) {
    const bagElement = document.getElementById('paperBagContainer');
    const bagRect = bagElement.getBoundingClientRect();
    const endX = bagRect.left + bagRect.width / 4;
    const endY = bagRect.top + bagRect.height / 4;

    const clone = document.createElement('div');
    clone.className = 'hp-flying-clone';
    clone.innerHTML = htmlContent;
    clone.style.left = `${startX - 20}px`;
    clone.style.top = `${startY - 20}px`;
    document.body.appendChild(clone);

    clone.offsetWidth;

    clone.style.left = `${endX}px`;
    clone.style.top = `${endY}px`;
    clone.style.transform = 'scale(0.3) rotate(360deg)';
    clone.style.opacity = '0.4';

    setTimeout(() => {
        clone.remove();
        if (callback) callback();
    }, 700); 
}

function removeOneFromCart(id) {
    if (cart[id]) {
        cart[id].qty -= 1;
        
        const stockIndicator = document.getElementById(`stock-visual-${id}`);
        let visualStockLeft = cart[id].maxStock - cart[id].qty;
        if(stockIndicator) stockIndicator.textContent = `${visualStockLeft} pcs left`;

        if (cart[id].qty <= 0) {
            delete cart[id];
        }
        renderPaperBag();
    }
}

function triggerCartBounce() {
    const bagElement = document.getElementById('paperBagContainer');
    bagElement.classList.add('hp-cart-bounce');
    bagElement.addEventListener('animationend', () => {
        bagElement.classList.remove('hp-cart-bounce');
    }, { once: true });
}

// NEW: Updates the price dynamically in the cart array and re-renders
function updateItemPrice(id, newPrice) {
    if (cart[id]) {
        cart[id].price = parseFloat(newPrice) || 0;
        renderPaperBag(); 
    }
}

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
    html += `<div style="max-height: 35vh; overflow-y: auto; padding-right: 5px; margin-bottom: 10px;">`;

    let grandTotal = 0;

    for (let id in cart) {
        const item = cart[id];
        const lineTotal = item.price * item.qty;
        grandTotal += lineTotal;

        const imageBlock = item.picture 
            ? `<img src="${item.picture}" class="hp-cart-pill-img">` 
            : `<div class="hp-cart-pill-img">🧼</div>`;

        // Check if it's a service to show the editable input
        const priceBlock = item.isService 
            ? `<div class="d-flex align-items-center mt-1">
                 <span class="text-muted small me-1">₱</span>
                 <input type="number" class="form-control form-control-sm p-1 text-success fw-bold border-success" 
                        style="width: 80px; height: 24px; font-size: 0.85rem;" 
                        value="${item.price}" 
                        onchange="updateItemPrice('${id}', this.value)" 
                        min="0" step="0.01">
               </div>`
            : `<span class="text-muted small">₱${item.price.toFixed(2)}</span>`;

        html += `
            <div class="hp-cart-pill">
                <button class="hp-btn-minus" onclick="removeOneFromCart(${id})" title="Remove One">✕</button>
                
                ${imageBlock}
                
                <div class="hp-cart-pill-details">
                    <h6 class="mb-0 text-truncate fw-bold text-dark" style="font-size: 0.9rem;">${item.name}</h6>
                    ${priceBlock}
                </div>
                
                <div class="text-end ps-2">
                    <span class="badge bg-success rounded-pill fw-bold" style="font-size: 0.85rem;">x${item.qty}</span>
                </div>
            </div>`;
    }
    
    html += `</div>`; 
    
    html += `
        <div class="bg-light p-2 rounded-3 mb-3 border">
            <div class="mb-2">
                <label class="small text-muted fw-bold mb-1">Client Name</label>
                <input type="text" id="checkout-client" class="form-control form-control-sm" value="Walk-in">
            </div>
            <div class="mb-2">
                <label class="small text-muted fw-bold mb-1">Patient Name/s</label>
                <input type="text" id="checkout-patient" class="form-control form-control-sm" placeholder="Optional">
            </div>
            <div>
                <label class="small text-muted fw-bold mb-1">Cashier</label>
                <input type="text" id="checkout-cashier" class="form-control form-control-sm" value="Susan">
            </div>
        </div>
    `;

    html += `
         <div class="d-flex justify-content-between fs-5 fw-bold mb-3 pt-2">
             <span class="font-heading">Total:</span>
             <span class="text-success">₱${grandTotal.toFixed(2)}</span>
         </div>
         <button class="btn btn-success w-100 fw-bold py-2 rounded-3 shadow-sm" onclick="processCheckout()">Confirm Sale</button>`;
             
    bagContainer.innerHTML = html;
}

function processCheckout() {
    if (Object.keys(cart).length === 0) {
        showToast("Paper bag is empty!", "warning");
        return;
    }

    const clientName = document.getElementById('checkout-client').value || 'Walk-in';
    const patientName = document.getElementById('checkout-patient').value || '';
    const cashierName = document.getElementById('checkout-cashier').value || 'Susan';

    const payload = {
        items: cart,
        client: clientName,
        patient: patientName,
        cashier: cashierName
    };

    fetch('actions/sales_log/checkout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast("Sale completed successfully!", "success");
            cart = {};
            renderPaperBag();
            
            // NEW: Automatically open the receipt in a small popup window!
            if (data.sale_id) {
                const width = 450;
                const height = 650;
                const left = (screen.width - width) / 2;
                const top = (screen.height - height) / 2;
                
                window.open(
                    `receipt_print.php?sale_id=${data.sale_id}&action=print`, 
                    'ReceiptPrintWindow', 
                    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
                );
            }
            
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showToast(data.error || "Checkout failed.", "warning");
        }
    });
}