<?php
// actions/sales_log/checkout.php
header('Content-Type: application/json');
include __DIR__ . '/../../includes/db.php';

$payload = json_decode(file_get_contents('php://input'), true);

// Extract the items array and the new info
$cart = $payload['items'] ?? [];
$client = $payload['client'] ?? 'Walk-in';
$patient = $payload['patient'] ?? null; // Nullable
$cashier = $payload['cashier'] ?? 'Susan';

if (empty($cart)) {
    echo json_encode(['success' => false, 'error' => 'Cart is empty']);
    exit;
}

// Calculate grand total on the backend (never trust the frontend math!)
$grand_total = 0;
foreach ($cart as $item) {
    $grand_total += ($item['price'] * $item['qty']);
}

// Start Transaction
$conn->begin_transaction();

try {
    // 1. Insert into sales_log with the new columns included
    $stmt_log = $conn->prepare("INSERT INTO sales_log (total_amount, client, patient, cashier) VALUES (?, ?, ?, ?)");
    $stmt_log->bind_param("dsss", $grand_total, $client, $patient, $cashier);
    $stmt_log->execute();
    $sale_id = $conn->insert_id;
    $stmt_log->close();

    // Prepare our repeatable statements
    $stmt_line = $conn->prepare("INSERT INTO sales_line (sale_id, product_id, custom_name, quantity, price_at_sale) VALUES (?, ?, ?, ?, ?)");
    $stmt_stock = $conn->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ? AND stock_quantity >= ?");

    // 2. Loop through items
    foreach ($cart as $product_id => $item) {
        $qty = $item['qty'];
        $price = $item['price'];
        $custom_name = $item['name']; // Grab the custom name from the JS cart

        // Insert into sales_line (Updated bind_param: iisid = int, int, string, int, double)
        $stmt_line->bind_param("iisid", $sale_id, $product_id, $custom_name, $qty, $price);
        $stmt_line->execute();

        // Update Stock (The WHERE clause ensures we don't go negative on the DB level)
        $stmt_stock->bind_param("iii", $qty, $product_id, $qty);
        $stmt_stock->execute();

        // If no rows were updated, it means stock was insufficient!
        if ($stmt_stock->affected_rows === 0) {
            throw new Exception("Insufficient stock for " . $item['name']);
        }
    }

    $stmt_line->close();
    $stmt_stock->close();

    // 3. If we made it here with no errors, Commit the transaction!
    $conn->commit();
    // Pass the newly created sale_id back to JavaScript
    echo json_encode(['success' => true, 'sale_id' => $sale_id]);

} catch (Exception $e) {
    // If anything failed, undo EVERYTHING
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>