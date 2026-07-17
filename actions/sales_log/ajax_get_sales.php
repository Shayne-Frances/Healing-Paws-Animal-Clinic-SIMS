<?php
// actions/sales_log/ajax_get_sales.php
include __DIR__ . '/../../includes/db.php'; 

$selected_date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
$safe_date = $conn->real_escape_string($selected_date);

// Fetch main sales (ADDED client, patient, cashier)
$current_date_query = "SELECT sale_id, DATE_FORMAT(date_sold, '%h:%i %p') AS sale_time, total_amount, client, patient, cashier 
                       FROM sales_log WHERE DATE(date_sold) = '$safe_date' ORDER BY date_sold DESC";
$sales_result = $conn->query($current_date_query);

// Fetch lines
$lines_query = "SELECT sl.sale_id, p.brand_name, sl.quantity, sl.price_at_sale 
                FROM sales_line sl JOIN products p ON sl.product_id = p.product_id
                JOIN sales_log log ON sl.sale_id = log.sale_id
                WHERE DATE(log.date_sold) = '$safe_date'";
$lines_result = $conn->query($lines_query);

$sales_lines_grouped = [];
if ($lines_result && $lines_result->num_rows > 0) {
    while ($line = $lines_result->fetch_assoc()) {
        $sales_lines_grouped[$line['sale_id']][] = $line;
    }
}

// Generate HTML
if ($sales_result && $sales_result->num_rows > 0) {
    $counter = $sales_result->num_rows; 
    
    while ($sale = $sales_result->fetch_assoc()) {
        $padded_counter = str_pad($counter, 2, '0', STR_PAD_LEFT);
        $collapse_id = "saleDetails_ajax_" . $sale['sale_id'];
        ?>
        <div class="hp-log-group border-bottom">
            <div class="d-flex justify-content-between align-items-center py-3 hp-log-item px-2" 
                 data-bs-toggle="collapse" data-bs-target="#<?php echo $collapse_id; ?>" 
                 style="cursor: pointer; transition: background-color 0.2s;"
                 onmouseover="this.style.backgroundColor='#f8f9fa'" onmouseout="this.style.backgroundColor='transparent'">
                <span class="fw-bold text-dark-blue hp-col-log-no"><?php echo $padded_counter; ?></span>
                <span class="text-muted small hp-col-log-id">#<?php echo htmlspecialchars($sale['sale_id']); ?></span>
                <span class="text-muted small hp-col-log-time"><?php echo htmlspecialchars($sale['sale_time']); ?></span>
                <span class="fw-bold text-dark-blue font-heading hp-col-log-total">₱<?php echo number_format($sale['total_amount'], 2); ?></span>
            </div>

            <div id="<?php echo $collapse_id; ?>" class="collapse">
                <div class="p-3 mb-3 mx-2 rounded shadow-sm" style="background-color: var(--light-blue); font-size: 0.85rem;">
                    
                    <!-- ADDED: Client and Patient Info -->
                    <div class="mb-2 pb-2 border-bottom border-secondary-subtle text-dark">
                        <div class="mb-1"><span class="text-muted fw-bold">Client:</span> <?php echo htmlspecialchars($sale['client'] ?? 'Walk-in'); ?></div>
                        <?php if (!empty($sale['patient'])): ?>
                        <div><span class="text-muted fw-bold">Patient/s:</span> <?php echo htmlspecialchars($sale['patient']); ?></div>
                        <?php endif; ?>
                    </div>

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
                                <span class="fw-bold" style="width: 50%; padding-left: 1rem; text-indent: -1rem;"><?php echo htmlspecialchars($line['brand_name']); ?></span>
                                <span class="text-muted" style="width: 20%; text-align: center;">x<?php echo $line['quantity']; ?></span>
                                <span class="fw-bold" style="width: 30%; text-align: right;">₱<?php echo number_format($line_total, 2); ?></span>
                            </div>
                            <?php
                        }
                    } else {
                        echo '<div class="text-muted fst-italic text-center py-1">No item details found.</div>';
                    }
                    ?>

                    <div class="d-flex justify-content-end gap-2 mt-3 pt-2 border-top border-secondary-subtle">
                        <button class="btn btn-sm btn-outline-secondary fw-bold px-2 py-1" 
                                style="font-size: 0.75rem; border-radius: 4px;"
                                onclick="viewReceipt(<?php echo $sale['sale_id']; ?>)">
                            👁️ View Receipt
                        </button>
                        <button class="btn btn-sm btn-dark-blue text-white fw-bold px-2 py-1" 
                                style="font-size: 0.75rem; border-radius: 4px; background-color: var(--dark-blue);"
                                onclick="printReceipt(<?php echo $sale['sale_id']; ?>)">
                            🖨️ Print Receipt
                        </button>
                    </div>

                </div>
            </div>
        </div>
        <?php
        $counter--; 
    }
} else {
    echo '<div class="text-center text-muted small py-4">No sales records logged for this date.</div>';
}
?>