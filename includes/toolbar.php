<div class="d-flex align-items-center mb-4 flex-wrap gap-3">
    
    <div class="d-flex align-items-center gap-3 hp-toolbar-side">
        <h5 class="text-dark-blue font-heading fw-bold mb-0">All Products</h5>
        <button class="btn font-heading btn-sm px-3 py-2 rounded-3 text-white hp-btn-add d-flex align-items-center justify-content-center" 
                data-bs-toggle="modal" 
                data-bs-target="#productModal" 
                id="btnAddNewProduct">
            +
        </button>
    </div>

    <div class="d-flex align-items-center gap-2 hp-toolbar-center">
        <input type="text" class="form-control rounded-pill hp-search-bar px-4 py-2 shadow-sm" id="productSearchBar" placeholder="🔍 Search generic or brand name...">
        
        <div class="dropdown">
            <button class="btn bg-white rounded-pill border shadow-sm dropdown-toggle px-3 py-2 font-heading text-dark-blue" type="button" data-bs-toggle="dropdown">
                Sort By
            </button>
            <ul class="dropdown-menu shadow border-0 rounded-3 mt-2">
                <li><a class="dropdown-item fw-bold text-dark-blue" href="#" data-sort="name">Brand Name (A-Z)</a></li>
                <li><a class="dropdown-item fw-bold text-dark-blue" href="#" data-sort="price_low">Price: Low to High</a></li>
                <li><a class="dropdown-item fw-bold text-dark-blue" href="#" data-sort="price_high">Price: High to Low</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item fw-bold text-danger" href="#" data-sort="stock_low">Stock: Low First</a></li>
            </ul>
        </div>
    </div>

    <div class="d-flex justify-content-end hp-toolbar-side">
        <button class="btn rounded-pill px-4 py-2 hp-btn-log shadow-sm d-flex align-items-center gap-2" id="toggleSalesLogBtn">
            📋 Sales Log: <?php echo date('n/j/Y'); ?>
        </button>
    </div>

</div>