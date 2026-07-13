document.addEventListener('DOMContentLoaded', function () {
    const productModal = document.getElementById('productModal');
    const form = document.getElementById('mainProductForm');
    const modalTitle = document.getElementById('productModalLabel');
    const btnEdit = document.getElementById('btnModalEdit');
    const btnSubmit = document.getElementById('btnModalSubmit');
    const inputs = form.querySelectorAll('input, select');

    // Clipboard Elements
    const pasteZone = document.getElementById('image_paste_zone');
    const fileInput = document.getElementById('image_file');
    const imgPreview = document.getElementById('image_preview');
    const zonePrompt = document.getElementById('paste_zone_prompt');

    // Handle manual clicking to upload an image file
    pasteZone.addEventListener('click', () => {
        if (!fileInput.hasAttribute('disabled')) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            displayPreview(this.files[0]);
        }
    });

    // Magic Copy/Paste Listener Engine
    pasteZone.addEventListener('paste', function (event) {
        if (fileInput.hasAttribute('disabled')) return; // Blocks editing in View Mode

        const clipboardItems = event.clipboardData.items;
        for (let i = 0; i < clipboardItems.length; i++) {
            if (clipboardItems[i].type.indexOf('image') !== -1) {
                const imageBlob = clipboardItems[i].getAsFile();
                
                // 1. Force the file seamlessly into our hidden file input element 
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(imageBlob);
                fileInput.files = dataTransfer.files;

                // 2. Fire up the layout preview render
                displayPreview(imageBlob);
                event.preventDefault();
                break;
            }
        }
    });

    function displayPreview(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imgPreview.src = e.target.result;
            imgPreview.classList.remove('d-none');
            zonePrompt.classList.add('d-none');
        };
        reader.readAsDataURL(file);
    }

    function resetImageZone() {
        fileInput.value = "";
        imgPreview.src = "";
        imgPreview.classList.add('d-none');
        zonePrompt.classList.remove('d-none');
    }

    // Modal State Logic Integration
    productModal.addEventListener('show.bs.modal', function (event) {
        const triggerButton = event.relatedTarget;
        resetImageZone();
        
        if (triggerButton.id === 'btnAddNewProduct') {
            modalTitle.textContent = '➕ Add New Product';
            form.action = 'actions/main_table/add_product.php';
            form.reset();
            
            inputs.forEach(input => input.removeAttribute('disabled'));
            fileInput.removeAttribute('disabled');
            btnEdit.classList.add('d-none');
            btnSubmit.classList.remove('d-none');
            btnSubmit.textContent = 'Add Product';
        } else {
            modalTitle.textContent = '🧴 View Product Details';
            form.action = 'actions/main_table/update_product.php';
            
            document.getElementById('product_id').value = triggerButton.getAttribute('data-id');
            document.getElementById('brand_name').value = triggerButton.getAttribute('data-brand');
            document.getElementById('generic_name').value = triggerButton.getAttribute('data-generic');
            document.getElementById('category_id').value = triggerButton.getAttribute('data-category');
            document.getElementById('size_volume').value = triggerButton.getAttribute('data-size');
            document.getElementById('unit_price').value = triggerButton.getAttribute('data-price');
            document.getElementById('stock_quantity').value = triggerButton.getAttribute('data-stock');
            document.getElementById('reorder_level').value = triggerButton.getAttribute('data-reorder');
            document.getElementById('picture_link').value = triggerButton.getAttribute('data-picture');
            document.getElementById('other_details').value = triggerButton.getAttribute('data-details');
            
            // Handle image display if existing item has one
            const currentPic = triggerButton.getAttribute('data-picture');
            if (currentPic) {
                imgPreview.src = currentPic;
                imgPreview.classList.remove('d-none');
                zonePrompt.classList.add('d-none');
            }

            inputs.forEach(input => input.setAttribute('disabled', 'true'));
            fileInput.setAttribute('disabled', 'true');
            btnEdit.classList.remove('d-none');
            btnSubmit.classList.add('d-none');
        }
    });

    btnEdit.addEventListener('click', function () {
        inputs.forEach(input => input.removeAttribute('disabled'));
        fileInput.removeAttribute('disabled');
        modalTitle.textContent = '✏️ Edit Product Details';
        btnEdit.classList.add('d-none');
        btnSubmit.classList.remove('d-none');
        btnSubmit.textContent = 'Save Changes';
    });
});