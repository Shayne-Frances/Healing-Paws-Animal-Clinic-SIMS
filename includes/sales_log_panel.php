<div id="salesLogPanel" class="hp-side-panel shadow-lg border-start">
    <div class="p-4 d-flex flex-column h-100">
        
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="font-heading fw-bold text-dark-blue mb-0">Today's Sales Log</h5>
            <button type="button" class="btn-close" id="closeSalesLogBtn"></button>
        </div>

        <div class="d-flex justify-content-between px-2 mb-2 small fw-bold text-secondary text-uppercase border-bottom pb-2">
            <span class="hp-col-log-no">No.</span>
            <span class="hp-col-log-id">Sale ID</span>
            <span class="hp-col-log-time">Time</span>
            <span class="hp-col-log-total">Total</span>
        </div>

        <div class="flex-grow-1 overflow-auto pe-2 hp-log-list mt-2">
            <?php
            if (isset($sales_result) && $sales_result->num_rows > 0) {
                $counter = 1;
                while ($sale = $sales_result->fetch_assoc()) {
                    $padded_counter = str_pad($counter, 2, '0', STR_PAD_LEFT);
                    ?>
                    <div class="d-flex justify-content-between align-items-center py-3 hp-log-item px-2">
                        <span class="fw-bold text-dark-blue hp-col-log-no"><?php echo $padded_counter; ?></span>
                        <span class="text-muted small hp-col-log-id">#<?php echo htmlspecialchars($sale['sale_id']); ?></span>
                        
                        <span class="text-muted small hp-col-log-time"><?php echo htmlspecialchars($sale['sale_time']); ?></span>
                        
                        <span class="fw-bold text-dark-blue font-heading hp-col-log-total">₱<?php echo number_format($sale['total_amount'], 2); ?></span>
                    </div>
                    <?php
                    $counter++;
                }
            } else {
                echo '<div class="text-center text-muted small py-4">No sales records logged today.</div>';
            }
            ?>
        </div>

    </div>
</div>