<?php
include __DIR__ . '/../../includes/db.php';

$search = $_GET['search'] ?? '';
$sort = $_GET['sort'] ?? 'name';
$category = $_GET['category'] ?? '';

// Establish sorting rules
$order_by = "p.brand_name ASC";
if ($sort === 'price_low') {
    $order_by = "p.unit_price ASC";
} elseif ($sort === 'price_high') {
    $order_by = "p.unit_price DESC";
} elseif ($sort === 'stock_low') {
    $order_by = "p.stock_quantity ASC";
}

$total_rendered = 0;

// --- STEP 1: LOAD CUSTOM GROUPS (ON TOP) ---
if (empty($category)) {
    // FIXED: Removed the hallucinated 'created_at' and replaced it with 'group_id'
    $group_query = "SELECT * FROM custom_groups ORDER BY group_id DESC";
    $group_result = $conn->query($group_query);

    if ($group_result) {
        while ($group = $group_result->fetch_assoc()) {
            $group_id = $group['group_id'];

            // Fetch products within this folder matching active search conditions
            $child_query = "SELECT p.*, c.category_name 
                            FROM products p 
                            LEFT JOIN categories c ON p.category_id = c.category_id
                            JOIN product_group_mapping pgm ON p.product_id = pgm.product_id 
                            WHERE pgm.group_id = ?";
            
            if (!empty($search)) {
                $child_query .= " AND (p.brand_name LIKE ? OR p.generic_name LIKE ?)";
            }
            
            $child_query .= " ORDER BY " . $order_by;
            $child_stmt = $conn->prepare($child_query);

            if (!empty($search)) {
                $search_param = "%" . $search . "%";
                $child_stmt->bind_param("iss", $group_id, $search_param, $search_param);
            } else {
                $child_stmt->bind_param("i", $group_id);
            }

            $child_stmt->execute();
            $child_result = $child_stmt->get_result();
            $item_count = $child_result->num_rows;

            if ($item_count > 0) {
                $total_rendered += $item_count;
                // Render the complete group framework using our new include file
                include __DIR__ . '/../../includes/group_card.php';
            }
            $child_stmt->close();
        }
    }
}

// --- STEP 2: LOAD UNGROUPED STANDALONE PRODUCTS (BELOW) ---
$query = "SELECT p.*, c.category_name 
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.category_id 
          WHERE p.product_id NOT IN (SELECT product_id FROM product_group_mapping)";

if (!empty($category)) {
    $query .= " AND p.category_id = ? ";
}

if (!empty($search)) {
    $query .= " AND (p.brand_name LIKE ? OR p.generic_name LIKE ?)";
}

$query .= " ORDER BY " . $order_by;
$stmt = $conn->prepare($query);

if (!empty($category) && !empty($search)) {
    $search_param = "%" . $search . "%";
    $stmt->bind_param("iss", $category, $search_param, $search_param);
} elseif (!empty($category)) {
    $stmt->bind_param("i", $category);
} elseif (!empty($search)) {
    $search_param = "%" . $search . "%";
    $stmt->bind_param("ss", $search_param, $search_param);
}

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $total_rendered += $result->num_rows;
    while ($row = $result->fetch_assoc()) {
        include __DIR__ . '/../../includes/product_card.php';
    }
}

// Global empty state indicator trigger
if ($total_rendered === 0) {
    include __DIR__ . '/../../includes/empty_state.php';
}

$stmt->close();
$conn->close();
?>