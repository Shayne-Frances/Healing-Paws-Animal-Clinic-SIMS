<?php
header('Content-Type: application/json');
include __DIR__ . '/../../includes/db.php';

$search = $_GET['search'] ?? '';
$group_id = $_GET['group_id'] ?? 0;

if (empty($search) || empty($group_id)) {
    echo json_encode(['success' => false, 'error' => 'Missing parameters']);
    exit;
}

$search_param = "%" . $search . "%";

// Find products matching the search that are NOT already in THIS group
$query = "SELECT product_id, brand_name, generic_name 
          FROM products 
          WHERE (brand_name LIKE ? OR generic_name LIKE ?) 
          AND product_id NOT IN (
              SELECT product_id FROM product_group_mapping WHERE group_id = ?
          ) LIMIT 10";

$stmt = $conn->prepare($query);
$stmt->bind_param("ssi", $search_param, $search_param, $group_id);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

echo json_encode(['success' => true, 'items' => $items]);
$stmt->close();
$conn->close();
?>