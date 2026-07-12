<?php
$sql = "SELECT p.*, c.category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.category_id 
        ORDER BY p.brand_name ASC";

$products_result = $conn->query($sql);

if (!$products_result) {
    die("Error retrieving products: " . $conn->error);
}

?>