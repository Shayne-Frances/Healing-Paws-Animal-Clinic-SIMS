<div class="d-flex align-items-center mb-4 flex-wrap gap-3">
    
    <!-- Left: Title & Add Button -->
    <div class="d-flex align-items-center gap-3 hp-toolbar-side">
        <h5 class="text-dark-blue font-heading fw-bold mb-0">All Products</h5>
        <button class="btn font-heading btn-sm px-3 py-2 rounded-3 d-none hp-btn-pink" id="btnBulkDelete">
            🗑️ Delete
        </button>
        <button class="btn font-heading btn-sm px-3 py-2 rounded-3 d-none hp-btn-dark-blue" id="btnBulkGroup">
            📦 Group
        </button>
        <button class="btn font-heading btn-sm px-3 py-2 rounded-3 text-white hp-btn-add d-flex align-items-center justify-content-center" 
                data-bs-toggle="modal" 
                data-bs-target="#productModal" 
                id="btnAddNewProduct">
            +
        </button>
    </div>

    <!-- Center: Search, Filter, & Sort -->
    <div class="d-flex align-items-center gap-2 hp-toolbar-center">
        <input type="text" class="form-control rounded-pill hp-search-bar px-4 py-2 shadow-sm" id="productSearchBar" placeholder="🔍 Search...">
        
        <!-- Category Filter Dropdown -->
        <div class="dropdown">
            <button class="btn bg-white rounded-pill border shadow-sm dropdown-toggle px-3 py-2 font-heading text-dark-blue" type="button" data-bs-toggle="dropdown" id="categoryFilterBtn">
                All Categories
            </button>
            <ul class="dropdown-menu shadow border-0 rounded-3 mt-2">
                <li><a class="dropdown-item fw-bold text-dark-blue hp-cat-option" href="#" data-category="">All Categories</a></li>
                <li><hr class="dropdown-divider"></li>
                <?php
                if (isset($cat_result) && $cat_result->num_rows > 0) {
                    while ($cat = $cat_result->fetch_assoc()) {
                        echo '<li><a class="dropdown-item fw-bold text-dark-blue hp-cat-option" href="#" data-category="' . $cat['category_id'] . '">' . htmlspecialchars($cat['category_name']) . '</a></li>';
                    }
                }
                ?>
            </ul>
        </div>

        <!-- Sort Dropdown -->
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

    <!-- Right: Sales Log Trigger -->
    <div class="d-flex justify-content-end hp-toolbar-side">
        <button class="btn rounded-pill px-4 py-2 hp-btn-log shadow-sm d-flex align-items-center gap-2" id="toggleSalesLogBtn">
            📋 Sales Log: <?php echo date('n/j/Y'); ?>
        </button>
    </div>

</div>