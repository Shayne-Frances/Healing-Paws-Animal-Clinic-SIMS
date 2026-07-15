<?php
// actions/main_table/update_group.php
header('Content-Type: application/json');
include __DIR__ . '/../../includes/db.php';

// Retrieve the batch update payload
$data = json_decode(file_get_contents('php://input'), true);

// 🔥 FIX A: Explicitly cast the ID to an integer so MySQLi doesn't silently reject it
$group_id = isset($data['group_id']) ? (int)$data['group_id'] : 0;
$group_name = isset($data['group_name']) ? trim($data['group_name']) : '';

if ($group_id === 0 || empty($group_name)) {
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

    // SAFE FIX: Only touch mappings if 'product_ids' key was explicitly provided
    if (array_key_exists('product_ids', $data)) {
        $product_ids = $data['product_ids'] ?? [];

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
            
            // 🔥 FIX B: Bind the parameters ONCE outside the loop!
            $current_p_id = 0; 
            $stmtInsert->bind_param("ii", $group_id, $current_p_id);
            
            foreach ($product_ids as $p_id) {
                // Update the variable that was bound above
                $current_p_id = (int)$p_id; 
                if (!$stmtInsert->execute()) {
                    throw new Exception("Failed to map group structures.");
                }
            }
            $stmtInsert->close();
        }
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