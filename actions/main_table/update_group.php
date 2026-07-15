<?php
// actions/main_table/update_group.php
header('Content-Type: application/json');
include __DIR__ . '/../../includes/db.php';

// Retrieve the batch update payload
$data = json_decode(file_get_contents('php://input'), true);

$group_id = $data['group_id'] ?? null;
$group_name = $data['group_name'] ?? '';
$product_ids = $data['product_ids'] ?? [];

if (!$group_id || empty($group_name)) {
    echo json_encode(['success' => false, 'error' => 'Missing folder configurations.']);
    exit;
}

// Open transaction to ensure we don't end up with partial saves
$conn->begin_transaction();

try {
    // 1. Update Group Display Name Meta
    $stmtUpdate = $conn->prepare("UPDATE custom_groups SET group_name = ? WHERE group_id = ?");
    $stmtUpdate->bind_param("si", $group_name, $group_id);
    if (!$stmtUpdate->execute()) {
        throw new Exception("Failed to update folder details.");
    }
    $stmtUpdate->close();

    // 2. Erase existing mappings for this folder
    $stmtDelete = $conn->prepare("DELETE FROM product_group_mapping WHERE group_id = ?");
    $stmtDelete->bind_param("i", $group_id);
    if (!$stmtDelete->execute()) {
        throw new Exception("Failed to reset mapping layouts.");
    }
    $stmtDelete->close();

    // 3. Re-save the final selection of elements
    if (!empty($product_ids)) {
        $stmtInsert = $conn->prepare("INSERT INTO product_group_mapping (group_id, product_id) VALUES (?, ?)");
        foreach ($product_ids as $p_id) {
            $stmtInsert->bind_param("ii", $group_id, $p_id);
            if (!$stmtInsert->execute()) {
                throw new Exception("Failed to mapping group structures.");
            }
        }
        $stmtInsert->close();
    }

    // Commit if clean
    $conn->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    // Fallback everything if any step goes wrong
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>