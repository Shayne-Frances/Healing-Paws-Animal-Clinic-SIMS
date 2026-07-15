<?php
// Query tailored exactly to the new Master-Detail schema (sales_log)
$current_date_query = "SELECT sale_id, 
                              DATE_FORMAT(date_sold, '%h:%i %p') AS sale_time, 
                              total_amount 
                       FROM sales_log 
                       WHERE DATE(date_sold) = CURDATE() 
                       ORDER BY date_sold DESC";

$sales_result = $conn->query($current_date_query);
?>