<?php
// actions/categories/retrieve_categories.php
$cat_query = "SELECT * FROM categories ORDER BY category_name ASC";
$cat_result = $conn->query($cat_query);
?>