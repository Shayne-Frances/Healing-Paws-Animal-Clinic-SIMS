<?php
include __DIR__ . '/includes/db.php';
include __DIR__ . '/includes/header.php';
include __DIR__ . '/actions/main_table/retrieve_products.php';
?>

<div class="row mt-4">
    <div class="col-12">
        <div class="product-section">
            <h5 class="text-dark-blue font-heading fw-bold mb-3">All Products</h5>

            <?php
            // Check if we actually have products in the database
            if ($products_result->num_rows > 0) {
                
                // Loop through every single row returned from the database
                while ($row = $products_result->fetch_assoc()) {
                    
                    // --- Dynamic Logic Preparation ---
                    
                    // 1. Check stock status
                    $stock_alert = "";
                    if ($row['stock_quantity'] <= $row['reorder_level']) {
                        $stock_alert = '<div class="text-danger mt-1" style="font-size: 0.75rem;">⚠️ Low Stock!</div>';
                    }

                    // 2. Handle missing pictures
                    $image_html = '<div class="rounded-3 bg-light d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; overflow: hidden;"><span class="fs-4">🧼</span></div>';
                    if (!empty($row['picture_link'])) {
                        $image_html = '<img src="' . htmlspecialchars($row['picture_link']) . '" style="width: 50px; height: 50px; object-fit: cover;" class="rounded-3">';
                    }
                    ?>

                    <div class="card rounded-4 border-0 shadow-sm mb-3 hp-product-card">
                        <div class="card-body d-flex align-items-center justify-content-between py-2 px-4">
                            
                            <div class="d-flex align-items-center" style="width: 30%;">
                                <?php echo $image_html; ?>
                                <div class="ms-3">
                                    <h6 class="mb-0 font-heading fw-bold text-dark-blue"><?php echo htmlspecialchars($row['brand_name']); ?></h6>
                                    <small class="text-muted"><?php echo htmlspecialchars($row['other_details']); ?></small>
                                </div>
                            </div>

                            <div class="text-center" style="width: 15%;">
                                <span class="badge rounded-pill bg-light text-dark px-3 py-2 border">
                                    <?php echo htmlspecialchars($row['size_volume']); ?>
                                </span>
                            </div>

                            <div class="text-center" style="width: 15%;">
                                <span class="fw-bold text-dark-blue font-heading">
                                    ₱<?php echo number_format($row['unit_price'], 2); ?>
                                </span>
                            </div>

                            <div class="text-center" style="width: 20%;">
                                <span class="fw-bold"><?php echo $row['stock_quantity']; ?> pcs left</span>
                                <?php echo $stock_alert; ?>
                            </div>

                            <div class="text-end" style="width: 20%;">
                                <span class="badge font-heading px-3 py-2" style="background-color: var(--light-blue-green); color: var(--dark-blue);">
                                    <?php echo htmlspecialchars($row['category_name']); ?>
                                </span>
                            </div>

                        </div>
                    </div>
                    <?php
                } // End of while loop
            } else {
                // What to show if the database is empty
                echo '<div class="alert alert-info rounded-4">No products found in inventory.</div>';
            }
            ?>

        </div>
    </div>
</div>

<?php 
include 'includes/footer.php';
?>