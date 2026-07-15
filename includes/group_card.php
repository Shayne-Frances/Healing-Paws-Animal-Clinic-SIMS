<div class="card mb-2 shadow-sm hp-group-card rounded-4 border-0" data-group-id="<?php echo $group_id; ?>" data-expanded="false">
    <div class="card-body d-flex align-items-center justify-content-between py-3 px-4">
        
        <div class="d-flex align-items-center">
            <div class="hp-product-select-wrapper me-3">
                <input type="checkbox" class="hp-product-checkbox form-check-input" value="<?php echo $group_id; ?>">
            </div>

            <div class="hp-group-folder-icon me-3">📦</div>
            <div>
                <h6 class="mb-0 hp-group-title text-dark-blue fw-bold">
                    <?php echo htmlspecialchars($group['group_name']); ?>
                </h6>
                <small class="text-muted d-block"><?php echo $item_count; ?> Items linked inside</small>
            </div>
        </div>
        
        <div class="text-muted font-heading fw-bold hp-dropdown-arrow">▼</div>
    </div>
</div>

<div class="hp-group-nested-container d-none" id="nested-group-<?php echo $group_id; ?>">
    <?php
    while ($row = $child_result->fetch_assoc()) {
        include __DIR__ . '/product_card.php';
    }
    ?>
</div>