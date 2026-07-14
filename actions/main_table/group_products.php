<?php
header('Content-Type: application/json');
include __DIR__ . '/../../includes/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$product_ids = $input['product_ids'] ?? [];

if (count($product_ids) < 2) {
    echo json_encode(['success' => false, 'error' => 'Insufficient items count chosen for collection.']);
    exit;
}

$product_ids = array_map('intval', $product_ids);

// Step A: Create Parent Group Entity Entry
$group_name = "New Group";
$group_stmt = $conn->prepare("INSERT INTO custom_groups (group_name) VALUES (?)");
$group_stmt->bind_param("s", $group_name);

if (!$group_stmt->execute()) {
    echo json_encode(['success' => false, 'error' => 'Failed establishing group trace registry entry.']);
    exit;
}

$new_group_id = $conn->insert_id;
$group_stmt->close();

// Step B: Multi-Row Insert mapping generation iteration block
$mapping_stmt = $conn->prepare("INSERT INTO product_group_mapping (group_id, product_id) VALUES (?, ?)");

$transaction_error = false;
foreach ($product_ids as $id) {
    $mapping_stmt->bind_param("ii", $new_group_id, $id);
    if (!$mapping_stmt->execute()) {
        $transaction_error = true;
        break;
    }
}

if (!$transaction_error) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error writing downstream individual component mappings.']);
}

$mapping_stmt->close();
$conn->close();
?>