<div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow hp-modal-custom">
            
            <div class="modal-header border-0 hp-modal-header-dark rounded-top-4 px-4 py-3">
                <h5 class="modal-title font-heading fw-bold" id="productModalLabel">Product Details</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <form id="mainProductForm" method="POST" action="" enctype="multipart/form-data">
                <div class="modal-body px-4 pb-4 pt-4">
                    
                    <input type="hidden" id="product_id" name="product_id">

                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="brand_name" class="form-label small hp-form-label">Brand Name</label>
                            <input type="text" class="form-control rounded-3" id="brand_name" name="brand_name" required>
                        </div>
                        <div class="col-md-6">
                            <label for="generic_name" class="form-label small hp-form-label">Generic Name</label>
                            <input type="text" class="form-control rounded-3" id="generic_name" name="generic_name">
                        </div>

                        <div class="col-md-6">
                            <label for="category_id" class="form-label small hp-form-label">Category</label>
                            <select class="form-select rounded-3" id="category_id" name="category_id" required>
                                <option value="" selected disabled>Select Category</option>
                                <?php 
                                if (isset($categories_result) && $categories_result->num_rows > 0) {
                                    while ($cat = $categories_result->fetch_assoc()) {
                                        echo '<option value="' . $cat['category_id'] . '">' . htmlspecialchars($cat['category_name']) . '</option>';
                                    }
                                }
                                ?>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="size_volume" class="form-label small hp-form-label">Size / Volume</label>
                            <input type="text" class="form-control rounded-3" id="size_volume" name="size_volume">
                        </div>

                        <div class="col-md-4">
                            <label for="unit_price" class="form-label small hp-form-label">Unit Price (₱)</label>
                            <input type="number" step="0.01" class="form-control rounded-3" id="unit_price" name="unit_price" required>
                        </div>
                        <div class="col-md-4">
                            <label for="stock_quantity" class="form-label small hp-form-label">Stock Quantity</label>
                            <input type="number" class="form-control rounded-3" id="stock_quantity" name="stock_quantity" required>
                        </div>
                        <div class="col-md-4">
                            <label for="reorder_level" class="form-label small hp-form-label">Reorder Level</label>
                            <input type="number" class="form-control rounded-3" id="reorder_level" name="reorder_level" required>
                        </div>

                        <div class="col-12">
                            <label class="form-label small hp-form-label">Product Image</label>
                            <input type="file" id="image_file" name="image_file" accept="image/*" class="d-none">
                            
                            <div id="image_paste_zone" class="border rounded-3 p-3 text-center bg-light position-relative hp-paste-zone">
                                <div id="paste_zone_prompt" class="my-2">
                                    <span class="fs-3">📷</span>
                                    <p class="mb-0 small text-muted">Click to select, or click here and press <kbd>Ctrl + V</kbd> to paste an image</p>
                                </div>
                                <img id="image_preview" src="" class="img-fluid rounded d-none hp-image-preview">
                            </div>
                        </div>

                        <div class="col-12">
                            <label for="picture_link" class="form-label small hp-form-label">Or Image URL Link (Optional)</label>
                            <input type="text" class="form-control rounded-3" id="picture_link" name="picture_link" placeholder="https://example.com/image.jpg">
                        </div>

                        <div class="col-12">
                            <label for="other_details" class="form-label small hp-form-label">Other Details</label>
                            <input type="text" class="form-control rounded-3" id="other_details" name="other_details">
                        </div>
                    </div>

                </div>
                
                <div class="modal-footer border-0 bg-light rounded-bottom-4 px-4 py-3 d-flex justify-content-end gap-2">
                    <button type="button" id="btnModalEdit" class="btn font-heading px-4 py-2 rounded-3 hp-btn-edit">Edit Product</button>
                    <button type="submit" id="btnModalSubmit" class="btn font-heading px-4 py-2 rounded-3 text-white hp-btn-submit">Save Changes</button>
                </div>
            </form>

        </div>
    </div>
</div>