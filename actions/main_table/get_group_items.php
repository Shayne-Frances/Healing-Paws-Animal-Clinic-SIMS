<?php
// actions/main_table/get_group_items.php

// Tell the browser we are sending JSON data back, not HTML
header('Content-Type: application/json');

// Include your database connection
include __DIR__ . '/../../includes/db.php';

// Get the group ID from the URL
$group_id = $_GET['group_id'] ?? null;

if (!$group_id) {
    echo json_encode(['success' => false, 'error' => 'No Group ID provided.']);
    exit;
}

// Query to get all products linked to this specific group
$query = "SELECT p.product_id, p.brand_name, p.generic_name 
          FROM products p
          JOIN product_group_mapping pgm ON p.product_id = pgm.product_id
          WHERE pgm.group_id = ?
          ORDER BY p.brand_name ASC";

$stmt = $conn->prepare($query);

if ($stmt) {
    $stmt->bind_param("i", $group_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    
    // Send the success response with the array of products
    echo json_encode(['success' => true, 'items' => $items]);
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'error' => 'Database query failed.']);
}

$conn->close();
?>