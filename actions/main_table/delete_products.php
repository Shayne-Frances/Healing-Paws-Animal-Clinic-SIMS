<?php
header('Content-Type: application/json');
include __DIR__ . '/../../includes/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$product_ids = $input['product_ids'] ?? [];

if (empty($product_ids)) {
    echo json_encode(['success' => false, 'error' => 'No items targets selected for processing.']);
    exit;
}

// Ensure integers array validation mapping context
$product_ids = array_map('intval', $product_ids);
$clause_placeholders = implode(',', array_fill(0, count($product_ids), '?'));

$query = "DELETE FROM products WHERE product_id IN ($clause_placeholders)";
$stmt = $conn->prepare($query);

$types = str_repeat('i', count($product_ids));
$stmt->bind_param($types, ...$product_ids);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conn->close();
?>