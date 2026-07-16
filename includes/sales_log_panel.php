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
                // FIX 1: Start counter at total rows, count backwards so oldest is #1
                $counter = $sales_result->num_rows; 
                
                while ($sale = $sales_result->fetch_assoc()) {
                    $padded_counter = str_pad($counter, 2, '0', STR_PAD_LEFT);
                    $collapse_id = "saleDetails_" . $sale['sale_id'];
                    ?>
                    
                    <div class="hp-log-group border-bottom">
                        <div class="d-flex justify-content-between align-items-center py-3 hp-log-item px-2" 
                             data-bs-toggle="collapse" 
                             data-bs-target="#<?php echo $collapse_id; ?>" 
                             style="cursor: pointer; transition: background-color 0.2s;"
                             onmouseover="this.style.backgroundColor='#f8f9fa'" 
                             onmouseout="this.style.backgroundColor='transparent'">
                             
                            <span class="fw-bold text-dark-blue hp-col-log-no"><?php echo $padded_counter; ?></span>
                            <span class="text-muted small hp-col-log-id">#<?php echo htmlspecialchars($sale['sale_id']); ?></span>
                            <span class="text-muted small hp-col-log-time"><?php echo htmlspecialchars($sale['sale_time']); ?></span>
                            <span class="fw-bold text-dark-blue font-heading hp-col-log-total">₱<?php echo number_format($sale['total_amount'], 2); ?></span>
                        </div>

                        <div id="<?php echo $collapse_id; ?>" class="collapse">
                            <div class="p-3 mb-3 mx-2 rounded shadow-sm" style="background-color: var(--light-blue); font-size: 0.85rem;">
                                <div class="d-flex justify-content-between border-bottom border-secondary pb-1 mb-2 fw-bold text-dark-blue font-heading">
                                    <span style="width: 50%;">Brand</span>
                                    <span style="width: 20%; text-align: center;">Qty</span>
                                    <span style="width: 30%; text-align: right;">Total</span>
                                </div>
                                
                                <?php
                                if (isset($sales_lines_grouped[$sale['sale_id']])) {
                                    foreach ($sales_lines_grouped[$sale['sale_id']] as $line) {
                                        $line_total = $line['quantity'] * $line['price_at_sale'];
                                        ?>
                                        <div class="d-flex justify-content-between text-dark mb-1">
                                            <span class="fw-bold" style="width: 50%; padding-left: 1rem; text-indent: -1rem;">
                                                <?php echo htmlspecialchars($line['brand_name']); ?>
                                            </span>
                                            <span class="text-muted" style="width: 20%; text-align: center;">x<?php echo $line['quantity']; ?></span>
                                            <span class="fw-bold" style="width: 30%; text-align: right;">₱<?php echo number_format($line_total, 2); ?></span>
                                        </div>
                                        <?php
                                    }
                                } else {
                                    echo '<div class="text-muted fst-italic text-center py-1">No item details found.</div>';
                                }
                                ?>
                            </div>
                        </div>
                    </div>
                    
                    <?php
                    // Decrement the counter for the next item
                    $counter--; 
                }
            } else {
                echo '<div class="text-center text-muted small py-4">No sales records logged today.</div>';
            }
            ?>
        </div>

    </div>
</div>