<?php
include __DIR__ . '/includes/db.php';
include __DIR__ . '/includes/header.php';
include __DIR__ . '/actions/main_table/retrieve_products.php';
include __DIR__ . '/actions/sales_log/retrieve_sales.php';
include __DIR__ . '/actions/categories/retrieve_categories.php';
?>

<div class="hp-main-wrapper" id="mainLayoutWrapper">
    <div class="container-fluid py-4">

        <?php include __DIR__ . '/includes/mode_switcher.php'; ?>
        
        <div class="product-section">
            <?php include __DIR__ . '/includes/toolbar.php'; ?>

            <div id="productGridContainer" class="d-flex flex-column w-100">
                <?php
                    if ($products_result->num_rows > 0) {
                        while ($row = $products_result->fetch_assoc()) {
                            include __DIR__ . '/includes/product_card.php';
                        } 
                    } else {
                        echo '<div class="alert alert-info rounded-4">No products found in inventory.</div>';
                    }
                ?>
            </div>
        </div>
    </div>
</div>

<?php 
include __DIR__ . '/includes/sales_log_panel.php';
include __DIR__ . '/includes/add_product_form.php';
include __DIR__ . '/includes/footer.php';
?>