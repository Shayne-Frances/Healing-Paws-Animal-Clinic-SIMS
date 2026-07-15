<?php
// actions/main_table/delete_selected_elements.php
header('Content-Type: application/json');
include __DIR__ . '/../../includes/db.php';

$input = json_decode(file_get_contents('php://input'), true);

$product_ids = $input['product_ids'] ?? [];
$group_ids = $input['group_ids'] ?? [];

// If absolutely nothing was checked, exit early
if (empty($product_ids) && empty($group_ids)) {
    echo json_encode(['success' => false, 'error' => 'No elements selected for removal.']);
    exit;
}

// 1. Secure array sanitization (from your original validation code)
$product_ids = array_map('intval', $product_ids);
$group_ids = array_map('intval', $group_ids);

// 2. Open a database transaction to ensure ALL deletes succeed or none do
$conn->begin_transaction();

try {
    // 3. Delete Selected Products (if any are checked)
    if (!empty($product_ids)) {
        $product_placeholders = implode(',', array_fill(0, count($product_ids), '?'));
        $queryProducts = "DELETE FROM products WHERE product_id IN ($product_placeholders)";
        
        $stmtProducts = $conn->prepare($queryProducts);
        $typesProducts = str_repeat('i', count($product_ids));
        $stmtProducts->bind_param($typesProducts, ...$product_ids);
        
        if (!$stmtProducts->execute()) {
            throw new Exception("Product deletion failed: " . $stmtProducts->error);
        }
        $stmtProducts->close();
    }

    // 4. Delete Selected Groups (if any are checked)
    if (!empty($group_ids)) {
        $group_placeholders = implode(',', array_fill(0, count($group_ids), '?'));
        $queryGroups = "DELETE FROM custom_groups WHERE group_id IN ($group_placeholders)";
        
        $stmtGroups = $conn->prepare($queryGroups);
        $typesGroups = str_repeat('i', count($group_ids));
        $stmtGroups->bind_param($typesGroups, ...$group_ids);
        
        if (!$stmtGroups->execute()) {
            throw new Exception("Group deletion failed: " . $stmtGroups->error);
        }
        $stmtGroups->close();
    }

    // 5. Commit changes if everything executed successfully
    $conn->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    // If any query fails, roll back the entire transaction to protect data integrity
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>