<?php 
// Determine the display date for the input field and title
$display_date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
$title_text = ($display_date == date('Y-m-d')) ? "Today's Sales" : date('M d, Y', strtotime($display_date));
?>
<div id="salesLogPanel" class="hp-side-panel shadow-lg border-start">
    <div class="p-4 d-flex flex-column h-100">
        
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="font-heading fw-bold text-dark-blue mb-0"><?php echo $title_text; ?></h5>
            
            <div class="d-flex align-items-center gap-2">
                <input type="date" id="salesLogDate" 
                       class="form-control form-control-sm border-secondary text-dark-blue fw-bold shadow-sm" 
                       style="border-radius: 6px; cursor: pointer; outline: none; background-color: var(--light-blue);"
                       value="<?php echo htmlspecialchars($display_date); ?>">
                <button type="button" class="btn-close ms-2" id="closeSalesLogBtn"></button>
            </div>
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
        </div>
    </div>
</div>

<script>
// Receipt Printing Engine (Opens in a tiny popup to clear up workspace space)
function printReceipt(saleId) {
    const width = 450;
    const height = 650;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    // Opens small receipt window with instructions to auto-trigger the print sequence
    window.open(
        'receipt_print.php?sale_id=' + saleId + '&action=print', 
        'ReceiptPrintWindow', 
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );
}

// Receipt Viewing Engine (Opens in full page tab)
function viewReceipt(saleId) {
    window.open('receipt_print.php?sale_id=' + saleId + '&action=view', '_blank');
}

// 1. Existing listener for when you manually change the date
document.getElementById('salesLogDate').addEventListener('change', function() {
    const selectedDate = this.value;
    const listContainer = document.querySelector('.hp-log-list');
    const titleElement = document.querySelector('#salesLogPanel h5');
    
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localToday = (new Date(today - offset)).toISOString().split('T')[0];

    // Update title
    if (selectedDate === localToday) {
        titleElement.textContent = "Today's Sales";
    } else {
        const dateObj = new Date(selectedDate);
        titleElement.textContent = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }

    // Show loading spinner
    listContainer.innerHTML = '<div class="text-center text-muted small py-4 spinner-border spinner-border-sm mx-auto d-block" role="status"></div><div class="text-center text-muted small mt-2">Loading sales...</div>';

    // Fetch new data
    fetch('actions/sales_log/ajax_get_sales.php?date=' + selectedDate)
        .then(response => response.text())
        .then(html => {
            listContainer.innerHTML = html;
        })
        .catch(err => {
            console.error('Error fetching sales:', err);
            listContainer.innerHTML = '<div class="text-center text-danger small py-4">Failed to load sales data.</div>';
        });
});

// 2. Reset to today's date when the close button is clicked
document.getElementById('closeSalesLogBtn').addEventListener('click', function() {
    const dateInput = document.getElementById('salesLogDate');
    
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localToday = (new Date(today - offset)).toISOString().split('T')[0];

    if (dateInput.value !== localToday) {
        dateInput.value = localToday; // Reset input field
        dateInput.dispatchEvent(new Event('change')); // Trigger fetch
    }
});
</script>