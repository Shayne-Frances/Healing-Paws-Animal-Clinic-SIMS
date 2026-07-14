<?php
include __DIR__ . '/../../includes/db.php';

$search = $_GET['search'] ?? '';
$sort = $_GET['sort'] ?? 'name';

// Strict white-list mapping to prevent SQL Injection
$order_by = "p.brand_name ASC";
if ($sort === 'price_low') {
    $order_by = "p.unit_price ASC";
} elseif ($sort === 'price_high') {
    $order_by = "p.unit_price DESC";
} elseif ($sort === 'stock_low') {
    $order_by = "p.stock_quantity ASC";
}

$query = "SELECT p.*, c.category_name 
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.category_id";

if (!empty($search)) {
    $query .= " WHERE p.brand_name LIKE ? OR p.generic_name LIKE ?";
}

$query .= " ORDER BY " . $order_by;

$stmt = $conn->prepare($query);

if (!empty($search)) {
    $search_param = "%" . $search . "%";
    $stmt->bind_param("ss", $search_param, $search_param);
}

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        include __DIR__ . '/../../includes/product_card.php';
    }
} else {
    echo '<div class="alert alert-info rounded-4 w-100">No products found matching your criteria.</div>';
}

$stmt->close();
$conn->close();
?>