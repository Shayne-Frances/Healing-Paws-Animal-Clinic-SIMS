<?php
// Evaluate stock status
$is_out_of_stock = ($row['stock_quantity'] <= 0);
$card_classes = "card mb-3 shadow-sm hp-product-card rounded-4 border-0";

if ($is_out_of_stock) {
    // ONLY apply visual grey-out. Do NOT disable pointer-events via CSS
    $card_classes .= " opacity-50 bg-light hp-out-of-stock";
    $stock_alert = '<div class="text-danger mt-1 hp-stock-alert fw-bold">Out of Stock!</div>';
} elseif ($row['stock_quantity'] <= $row['reorder_level']) {
    $stock_alert = '<div class="text-warning mt-1 hp-stock-alert">⚠️ Low Stock!</div>';
} else {
    $stock_alert = "";
}

// Generate image rendering block
$image_html = '<div class="rounded-3 bg-light d-flex align-items-center justify-content-center hp-img-wrapper"><span class="fs-4">🧼</span></div>';
if (!empty($row['picture_link'])) {
    $image_html = '<img src="' . htmlspecialchars($row['picture_link']) . '" class="rounded-3 hp-img-cover">';
}
?>

<div class="<?php echo $card_classes; ?>" 
     data-id="<?php echo $row['product_id']; ?>"
     data-brand="<?php echo htmlspecialchars($row['brand_name']); ?>"
     data-generic="<?php echo htmlspecialchars($row['generic_name']); ?>"
     data-category="<?php echo htmlspecialchars($row['category_name']); ?>"
     data-size="<?php echo htmlspecialchars($row['size_volume']); ?>"
     data-price="<?php echo $row['unit_price']; ?>"
     data-stock="<?php echo $row['stock_quantity']; ?>"
     data-reorder="<?php echo $row['reorder_level']; ?>"
     data-picture="<?php echo htmlspecialchars($row['picture_link']); ?>"
     data-details="<?php echo htmlspecialchars($row['other_details']); ?>">
    
    <div class="card-body d-flex align-items-center justify-content-between py-2 px-4">
        <div class="d-flex align-items-center hp-col-brand">
            <div class="hp-product-select-wrapper">
                <input type="checkbox" class="form-check-input rounded-circle hp-product-checkbox shadow-sm">
            </div>
            <?php echo $image_html; ?>
            <div class="ms-3">
                <h6 class="mb-0 font-heading fw-bold text-dark-blue"><?php echo htmlspecialchars($row['brand_name']); ?></h6>
                <small class="text-muted"><?php echo htmlspecialchars($row['other_details']); ?></small>
            </div>
        </div>
        <div class="d-flex align-items-center hp-col-generic">
            <h6 class="mb-0 font-heading fw-bold fst-italic text-secondary"><?php echo htmlspecialchars($row['generic_name'] ?? 'N/A'); ?></h6>
        </div>
        <div class="text-center hp-col-size">
            <span class="badge rounded-pill bg-light text-dark px-3 py-2 border"><?php echo htmlspecialchars($row['size_volume']); ?></span>
        </div>
        <div class="text-center hp-col-price">
            <span class="fw-bold text-dark-blue font-heading">₱<?php echo number_format($row['unit_price'], 2); ?></span>
        </div>
        <div class="text-center hp-col-stock">
            <span class="fw-bold" id="stock-visual-<?php echo $row['product_id']; ?>"><?php echo $row['stock_quantity']; ?> pcs left</span>
            <?php echo $stock_alert; ?>
        </div>
        <div class="text-end hp-col-category">
            <span class="badge font-heading px-3 py-2 hp-badge-category"><?php echo htmlspecialchars($row['category_name']); ?></span>
        </div>
    </div>
</div>