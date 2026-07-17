<?php
// Check if a specific date was requested in the URL, otherwise default to today
$selected_date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// Secure the date string to prevent SQL injection
$safe_date = $conn->real_escape_string($selected_date);

// 1. Fetch the main sales log for the selected date (ADDED client, patient, cashier)
$current_date_query = "SELECT sale_id, 
                              DATE_FORMAT(date_sold, '%h:%i %p') AS sale_time, 
                              total_amount,
                              client,
                              patient,
                              cashier
                       FROM sales_log 
                       WHERE DATE(date_sold) = '$safe_date' 
                       ORDER BY date_sold DESC";
$sales_result = $conn->query($current_date_query);

// 2. Fetch all sales lines for the selected date
$lines_query = "SELECT sl.sale_id, p.brand_name, sl.quantity, sl.price_at_sale 
                FROM sales_line sl
                JOIN products p ON sl.product_id = p.product_id
                JOIN sales_log log ON sl.sale_id = log.sale_id
                WHERE DATE(log.date_sold) = '$safe_date'";
$lines_result = $conn->query($lines_query);

// 3. Group the line items by sale_id for easy access
$sales_lines_grouped = [];
if ($lines_result && $lines_result->num_rows > 0) {
    while ($line = $lines_result->fetch_assoc()) {
        $sales_lines_grouped[$line['sale_id']][] = $line;
    }
}
?>