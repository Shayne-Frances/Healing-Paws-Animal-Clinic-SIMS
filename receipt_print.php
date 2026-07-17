<?php
// receipt_print.php
include __DIR__ . '/includes/db.php'; // Adjust this to match your DB path

$sale_id = isset($_GET['sale_id']) ? intval($_GET['sale_id']) : 0;
$action = isset($_GET['action']) ? $_GET['action'] : 'view'; // 'view' or 'print'

if ($sale_id === 0) {
    die("Invalid Sale ID.");
}

// 1. Fetch main sale details (ADDED client, patient, cashier)
$sale_query = "SELECT sale_id, total_amount, date_sold, client, patient, cashier FROM sales_log WHERE sale_id = $sale_id";
$sale_result = $conn->query($sale_query);
if (!$sale_result || $sale_result->num_rows === 0) {
    die("Sale record not found.");
}
$sale = $sale_result->fetch_assoc();

// 2. Fetch detailed product lines (ADDED sl.custom_name)
$lines_query = "SELECT sl.quantity, sl.price_at_sale, sl.custom_name, p.brand_name, p.generic_name, p.size_volume 
                FROM sales_line sl
                JOIN products p ON sl.product_id = p.product_id
                WHERE sl.sale_id = $sale_id";
$lines_result = $conn->query($lines_query);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt #<?php echo $sale['sale_id']; ?></title>
    <style>
        /* Base Thermal Styling (Formatted for standard 80mm paper) */
        * {
            box-sizing: border-box;
            font-family: 'Courier New', Courier, monospace;
            color: #000;
        }
        body {
            margin: 0;
            padding: 0;
            background-color: #f0f2f5;
        }

        /* Simulated Roll Preview for Web "View" Mode */
        .receipt-container {
            width: 80mm;
            min-height: 120mm;
            padding: 5mm;
            background: #fff;
            margin: 20px auto;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            border-radius: 4px;
            position: relative;
        }

        /* Direct printing layout removes gray backgrounds and margins */
        @media print {
            body {
                background-color: #fff;
            }
            .receipt-container {
                width: 100%;
                margin: 0;
                padding: 0;
                box-shadow: none;
                border-radius: 0;
            }
            @page {
                margin: 0;
            }
        }

        /* Receipt formatting styles */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .logo-placeholder {
            font-size: 1.2rem;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 3px;
        }
        
        .clinic-address {
            font-size: 0.75rem;
            line-height: 1.2;
            margin-bottom: 10px;
        }

        .separator {
            border-top: 1px dashed #000;
            margin: 8px 0;
        }

        .meta-info {
            font-size: 0.8rem;
            margin-bottom: 12px;
            line-height: 1.4;
        }

        /* Items Layout */
        .item-row {
            font-size: 0.82rem;
            margin-bottom: 6px;
            line-height: 1.2;
        }
        .item-details {
            font-style: italic;
            font-size: 0.75rem;
            padding-left: 10px;
        }
        .item-pricing {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            padding-left: 10px;
            margin-top: 2px;
        }

        /* Total Area */
        .totals-section {
            font-size: 0.9rem;
            font-weight: bold;
            margin-top: 15px;
        }

        .footer-thankyou {
            font-size: 0.75rem;
            margin-top: 25px;
            line-height: 1.3;
        }
    </style>
</head>
<body>

<div class="receipt-container">
    
    <div class="text-center">
        <div class="logo-placeholder">
            <img src="/assets/images/website/HPAC (Logo + Wordmark).png" class="navbar-logo" alt="Healing Paws Logo" style="max-height: 40px;">
        </div>
        <div class="clinic-address">
            Mezzanine Floor, Faralles Building,<br>
            Cabrera St, Pagadian City,<br>
            Zamboanga del Sur, Philippines
        </div>
    </div>

    <div class="separator"></div>

    <div class="meta-info">
        <div><strong>Transaction #:</strong> <?php echo str_pad($sale['sale_id'], 6, '0', STR_PAD_LEFT); ?></div>
        <div><strong>Date:</strong> <?php echo date('M d, Y h:i A', strtotime($sale['date_sold'])); ?></div>
        <div><strong>Cashier:</strong> <?php echo htmlspecialchars($sale['cashier'] ?? 'Susan'); ?></div>
        
        <!-- ADDED: Client - Patient Formatting -->
        <div style="margin-top: 6px;">
            <strong>Customer:</strong> 
            <?php 
                $client = htmlspecialchars($sale['client'] ?? 'Walk-in');
                $patient = htmlspecialchars($sale['patient'] ?? '');
                
                if (!empty($patient)) {
                    echo $client . ' - ' . $patient;
                } else {
                    echo $client;
                }
            ?>
        </div>
    </div>

    <div class="separator"></div>

    <div>
        <?php 
        if ($lines_result && $lines_result->num_rows > 0) {
            while ($line = $lines_result->fetch_assoc()) {
                $item_total = $line['quantity'] * $line['price_at_sale'];
                ?>
                <div class="item-row">
                    <strong>
                        <?php 
                            // If custom_name exists and isn't empty, use it. Otherwise, use brand_name.
                            echo htmlspecialchars(!empty($line['custom_name']) ? $line['custom_name'] : $line['brand_name']); 
                        ?>
                    </strong>
                    
                    <?php if (!empty($line['generic_name']) || !empty($line['size_volume'])): ?>
                        <div class="item-details">
                            (<?php 
                                $details = array_filter([$line['generic_name'], $line['size_volume']]);
                                echo htmlspecialchars(implode(' - ', $details)); 
                            ?>)
                        </div>
                    <?php endif; ?>

                    <div class="item-pricing">
                        <span><?php echo $line['quantity']; ?> x ₱<?php echo number_format($line['price_at_sale'], 2); ?></span>
                        <span>₱<?php echo number_format($item_total, 2); ?></span>
                    </div>
                </div>
                <?php
            }
        }
        ?>
    </div>

    <div class="separator"></div>

    <div class="totals-section">
        <div class="item-pricing" style="font-size: 1rem;">
            <span>TOTAL AMOUNT:</span>
            <span>₱<?php echo number_format($sale['total_amount'], 2); ?></span>
        </div>
    </div>

    <div class="separator"></div>

    <div class="text-center footer-thankyou">
        Thank you for trusting Healing Paws!<br>
        Veterinary Care with Love.<br>
        *** This is your transaction log ***
    </div>

</div>

<?php if ($action === 'print'): ?>
<script>
    window.addEventListener('DOMContentLoaded', () => {
        window.print();
        // Closes the tab/window cleanly after printing triggers
        setTimeout(() => { window.close(); }, 500); 
    });
</script>
<?php endif; ?>

</body>
</html>