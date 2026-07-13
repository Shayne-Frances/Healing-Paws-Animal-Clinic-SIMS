 <?php
include __DIR__ . '/../../includes/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $brand_name = $_POST['brand_name'] ?? '';
    $generic_name = $_POST['generic_name'] ?? null;
    $category_id = $_POST['category_id'] ?? null;
    $size_volume = $_POST['size_volume'] ?? null;
    $unit_price = $_POST['unit_price'] ?? 0.00;
    $stock_quantity = $_POST['stock_quantity'] ?? 0;
    $reorder_level = $_POST['reorder_level'] ?? 0;
    $picture_link = $_POST['picture_link'] ?? null;
    $other_details = $_POST['other_details'] ?? null;

    // Handle File Upload or Pasted Image Binary
    if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
        $file_tmp = $_FILES['image_file']['tmp_name'];
        $file_name = $_FILES['image_file']['name'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        
        // Handle clipboard pasted images which default to 'blob' with no extension
        if (empty($file_ext) || $file_ext === 'blob') {
            $file_ext = 'png'; 
        }

        $new_file_name = 'prod_' . time() . '_' . uniqid() . '.' . $file_ext;
        $upload_dir = __DIR__ . '/../../uploads/';
        
        if (move_uploaded_file($file_tmp, $upload_dir . $new_file_name)) {
            $picture_link = 'uploads/' . $new_file_name; 
        }
    }

    $query = "INSERT INTO products (brand_name, generic_name, category_id, size_volume, unit_price, stock_quantity, reorder_level, picture_link, other_details) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
              
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ssisdiiss", $brand_name, $generic_name, $category_id, $size_volume, $unit_price, $stock_quantity, $reorder_level, $picture_link, $other_details);

    if ($stmt->execute()) {
        header("Location: ../../index.php?success=added");
    } else {
        header("Location: ../../index.php?error=failed");
    }
    $stmt->close();
    $conn->close();
}
?>