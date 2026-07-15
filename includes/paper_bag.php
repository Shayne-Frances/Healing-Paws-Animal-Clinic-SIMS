<style>
    /* * Paper Bag Base Styling 
     * Pinned to bottom right, scrollable if items exceed height
     */
    .hp-paper-bag {
        width: 380px;
        max-height: 75vh;
        overflow-y: auto;
        z-index: 1050;
        display: none; /* Hidden by default */
        transition: all 0.3s ease-in-out;
    }

    /* * Mode Check
     * Only display the paper bag when the body has the sale mode class
     */
    body.hp-mode-sale .hp-paper-bag {
        display: block;
    }
</style>

<div class="position-fixed bottom-0 end-0 m-4 p-4 shadow-lg rounded-4 bg-white border border-2 hp-paper-bag" id="paperBagContainer">
    
    <div class="text-center text-muted py-4">
        <div class="fs-1 mb-2">🛍️</div>
        <h6 class="fw-bold font-heading">Paper Bag is Empty</h6>
        <small>Click on products to add them to your cart.</small>
    </div>

</div>