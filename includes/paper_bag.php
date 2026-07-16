<style>
    /* Base Container Styling */
    .hp-paper-bag {
        width: 380px;
        max-height: 75vh;
        overflow-y: auto;
        z-index: 1050;
        display: none; 
        transition: all 0.3s ease-in-out;
    }

    /* Show only in Sale Mode */
    body.hp-mode-sale .hp-paper-bag {
        display: block;
    }

    /* Cart Pill UI styling */
    .hp-cart-pill {
        position: relative;
        background-color: #f8f9fa;
        border: 2px solid #e9ecef;
        border-radius: 50px;
        padding: 8px 16px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .hp-cart-pill:hover {
        border-color: #198754;
        transform: translateY(-1px);
    }

    .hp-cart-pill-img {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        object-fit: cover;
        background-color: #fff;
        border: 1px solid #dee2e6;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
    }

    .hp-cart-pill-details {
        flex-grow: 1;
        min-width: 0;
    }

    /* Floating Minus Button on Top-Right */
    .hp-btn-minus {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 22px;
        height: 22px;
        background-color: #dc3545;
        color: white;
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: background-color 0.2s ease, transform 0.1s active;
    }

    .hp-btn-minus:hover {
        background-color: #bd2130;
    }

    .hp-btn-minus:active {
        transform: scale(0.9);
    }

    /* Flying Item Animation Styling */
    .hp-flying-clone {
        position: fixed;
        z-index: 99999;
        pointer-events: none;
        transition: all 0.7s cubic-bezier(0.25, 1, 0.5, 1); /* Ultra-smooth arc drop */
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Cart item update pop animation */
    @keyframes cartPop {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); border-color: #198754; }
        100% { transform: scale(1); }
    }

    .hp-cart-bounce {
        animation: cartPop 0.3s ease-out;
    }
</style>

<div class="position-fixed bottom-0 end-0 m-4 p-4 shadow-lg rounded-4 bg-white border border-2 hp-paper-bag" id="paperBagContainer">
    <div class="text-center text-muted py-4">
        <div class="fs-1 mb-2">🛍️</div>
        <h6 class="fw-bold font-heading">Paper Bag is Empty</h6>
        <small>Click on products to add them to your cart.</small>
    </div>
</div>