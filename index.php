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
            if ($products_result->num_rows > 0) {
                while ($row = $products_result->fetch_assoc()) {
                    
                    $stock_alert = "";
                    if ($row['stock_quantity'] <= $row['reorder_level']) {
                        $stock_alert = '<div class="text-danger mt-1 hp-stock-alert">⚠️ Low Stock!</div>';
                    }

                    $image_html = '<div class="rounded-3 bg-light d-flex align-items-center justify-content-center hp-img-wrapper"><span class="fs-4">🧼</span></div>';
                    if (!empty($row['picture_link'])) {
                        $image_html = '<img src="' . htmlspecialchars($row['picture_link']) . '" class="rounded-3 hp-img-cover">';
                    }
                    ?>

                    <div class="card rounded-4 border-0 shadow-sm mb-3 hp-product-card">
                        <div class="card-body d-flex align-items-center justify-content-between py-2 px-4">
                            
                            <div class="d-flex align-items-center hp-col-name">
                                <?php echo $image_html; ?>
                                <div class="ms-3">
                                    <h6 class="mb-0 font-heading fw-bold text-dark-blue"><?php echo htmlspecialchars($row['brand_name']); ?></h6>
                                    <small class="text-muted"><?php echo htmlspecialchars($row['other_details']); ?></small>
                                </div>
                            </div>

                            <div class="text-center hp-col-size">
                                <span class="badge rounded-pill bg-light text-dark px-3 py-2 border">
                                    <?php echo htmlspecialchars($row['size_volume']); ?>
                                </span>
                            </div>

                            <div class="text-center hp-col-price">
                                <span class="fw-bold text-dark-blue font-heading">
                                    ₱<?php echo number_format($row['unit_price'], 2); ?>
                                </span>
                            </div>

                            <div class="text-center hp-col-stock">
                                <span class="fw-bold"><?php echo $row['stock_quantity']; ?> pcs left</span>
                                <?php echo $stock_alert; ?>
                            </div>

                            <div class="text-end hp-col-category">
                                <span class="badge font-heading px-3 py-2 hp-badge-category">
                                    <?php echo htmlspecialchars($row['category_name']); ?>
                                </span>
                            </div>

                        </div>
                    </div>
                    <?php
                } 
            } else {
                echo '<div class="alert alert-info rounded-4">No products found in inventory.</div>';
            }
            ?>

        </div>
    </div>
</div>

<?php 
include 'includes/footer.php';
?>