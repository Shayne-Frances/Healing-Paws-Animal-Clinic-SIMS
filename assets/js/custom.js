document.addEventListener('DOMContentLoaded', function () {
    // --- INITIALIZATION & CORE VARIABLES ---
    const productModalElement = document.getElementById('productModal');
    const productModal = new bootstrap.Modal(productModalElement);
    
    const form = document.getElementById('mainProductForm');
    const modalTitle = document.getElementById('productModalLabel');
    const btnEdit = document.getElementById('btnModalEdit');
    const btnSubmit = document.getElementById('btnModalSubmit');
    const inputs = form.querySelectorAll('input, select');

    const pasteZone = document.getElementById('image_paste_zone');
    const fileInput = document.getElementById('image_file');
    const imgPreview = document.getElementById('image_preview');
    const zonePrompt = document.getElementById('paste_zone_prompt');

    const searchBar = document.getElementById('productSearchBar');
    const sortOptions = document.querySelectorAll('[data-sort]');
    const catOptions = document.querySelectorAll('.hp-cat-option');
    const catFilterBtn = document.getElementById('categoryFilterBtn');
    const gridContainer = document.getElementById('productGridContainer');
    const toggleGroupsBtn = document.getElementById('toggleGroupsBtn'); 

    const modePills = document.querySelectorAll('.hp-pill');
    const bodyEl = document.body;

    const btnToggleLog = document.getElementById('toggleSalesLogBtn');
    const btnCloseLog = document.getElementById('closeSalesLogBtn');
    
    const btnBulkDelete = document.getElementById('btnBulkDelete');
    const btnBulkGroup = document.getElementById('btnBulkGroup');

    let currentSearch = '';
    let currentSort = 'name'; 
    let currentCategory = ''; 
    let searchDebounceTimer;

    // --- DECUPLED CUSTOM EVENTS LISTENER ---
    // Listens for structural changes made inside separate group manager scripts
    document.addEventListener('products-updated', fetchFilteredProducts);

    // --- IMAGE PASTE & PREVIEW ENGINE ---
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

    pasteZone.addEventListener('paste', function (event) {
        if (fileInput.hasAttribute('disabled')) return; 

        const clipboardItems = event.clipboardData.items;
        for (let i = 0; i < clipboardItems.length; i++) {
            if (clipboardItems[i].type.indexOf('image') !== -1) {
                const imageBlob = clipboardItems[i].getAsFile();
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(imageBlob);
                fileInput.files = dataTransfer.files;
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

    // --- POPULATE AND CONFIG MODAL FIELDS ---
    function prepareModalContext(triggerButton) {
        resetImageZone();
        
        if (triggerButton.id === 'btnAddNewProduct') {
            modalTitle.textContent = '➕ Add New Product';
            form.action = 'actions/main_table/add_product.php';
            form.reset();
            
            form.classList.add('hp-edit-mode');
            zonePrompt.classList.remove('d-none'); 
            
            inputs.forEach(input => input.removeAttribute('disabled'));
            fileInput.removeAttribute('disabled');
            btnEdit.classList.add('d-none');
            btnSubmit.classList.remove('d-none');
            btnSubmit.textContent = 'Add Product';
        } else {
            modalTitle.textContent = '🧴 View Product Details';
            form.action = 'actions/main_table/update_product.php';
            form.classList.remove('hp-edit-mode');
            
            zonePrompt.classList.add('d-none'); 
            
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
            
            const currentPic = triggerButton.getAttribute('data-picture');
            if (currentPic) {
                imgPreview.src = currentPic;
                imgPreview.classList.remove('d-none');
            } else {
                imgPreview.classList.add('d-none');
            }

            inputs.forEach(input => input.setAttribute('disabled', 'true'));
            fileInput.setAttribute('disabled', 'true');
            btnEdit.classList.remove('d-none');
            btnSubmit.classList.add('d-none');
        }
    }

    document.getElementById('btnAddNewProduct')?.addEventListener('click', function() {
        prepareModalContext(this);
    });

    btnEdit.addEventListener('click', function () {
        form.classList.add('hp-edit-mode');
        if (imgPreview.classList.contains('d-none') || !imgPreview.src) {
            zonePrompt.classList.remove('d-none');
        }
        inputs.forEach(input => input.removeAttribute('disabled'));
        fileInput.removeAttribute('disabled');
        modalTitle.textContent = '✏️ Edit Product Details';
        btnEdit.classList.add('d-none');
        btnSubmit.classList.remove('d-none');
        btnSubmit.textContent = 'Save Changes';
    });

    // --- INTERACTIVE GRID CLICK COORDINATOR ---
    gridContainer.addEventListener('click', function (e) {
        const card = e.target.closest('.hp-product-card') || e.target.closest('.hp-group-card');
        if (!card) return;

        if (bodyEl.classList.contains('hp-mode-view')) {
            if (card.classList.contains('hp-product-card')) {
                prepareModalContext(card);
                productModal.show();
            }
            // Note: Group view actions (expand / modal) are completely managed in js/group_manager.js
        } 
        else if (bodyEl.classList.contains('hp-mode-edit')) {
            const checkbox = card.querySelector('.hp-product-checkbox');
            if (checkbox && e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
            updateBulkActionButtons();
        }
    });

    // --- BULK SELECTION ACTIONS CONTROL ---
    function updateBulkActionButtons() {
        const checkedBoxes = document.querySelectorAll('.hp-product-checkbox:checked');
        const checkedCount = checkedBoxes.length;

        if (!btnBulkDelete || !btnBulkGroup) return;

        // Safety verification check: Verify if any selected element belongs to a Group card
        let groupSelected = false;
        checkedBoxes.forEach(cb => {
            if (cb.closest('.hp-group-card')) {
                groupSelected = true;
            }
        });

        if (checkedCount === 1) {
            btnBulkDelete.classList.remove('d-none');
            btnBulkGroup.classList.add('d-none');
        } else if (checkedCount >= 2) {
            btnBulkDelete.classList.remove('d-none');
            
            // If any selected card is a group card, hide group folder action immediately
            if (groupSelected) {
                btnBulkGroup.classList.add('d-none');
            } else {
                btnBulkGroup.classList.remove('d-none');
            }
        } else {
            btnBulkDelete.classList.add('d-none');
            btnBulkGroup.classList.add('d-none');
        }
    }

    gridContainer.addEventListener('change', function(e) {
        if (e.target.classList.contains('hp-product-checkbox')) {
            updateBulkActionButtons();
        }
    });

    // --- SERVER PROCESSING WORKERS ---
    btnBulkDelete?.addEventListener('click', function() {
        const checkedBoxes = document.querySelectorAll('.hp-product-checkbox:checked');
        const selectedProductIds = [];
        const selectedGroupIds = [];

        checkedBoxes.forEach(cb => {
            const pCard = cb.closest('.hp-product-card');
            const gCard = cb.closest('.hp-group-card');
            if (pCard) selectedProductIds.push(pCard.getAttribute('data-id'));
            if (gCard) selectedGroupIds.push(gCard.getAttribute('data-group-id'));
        });

        if (selectedProductIds.length === 0 && selectedGroupIds.length === 0) return;

        const totalItemsCount = selectedProductIds.length + selectedGroupIds.length;

        if (confirm(`Are you sure you want to delete the ${totalItemsCount} selected card(s)/group(s)?`)) {
            fetch('actions/main_table/delete_selected_elements.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    product_ids: selectedProductIds,
                    group_ids: selectedGroupIds
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    fetchFilteredProducts();
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(err => console.error('Deletion framework communication failure:', err));
        }
    });

    btnBulkGroup?.addEventListener('click', function() {
        const checkedBoxes = document.querySelectorAll('.hp-product-checkbox:checked');
        const selectedIds = Array.from(checkedBoxes).map(cb => cb.closest('.hp-product-card').getAttribute('data-id'));

        if (selectedIds.length < 2) return;

        fetch('actions/main_table/group_products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_ids: selectedIds })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                fetchFilteredProducts();
            } else {
                alert('Grouping error: ' + data.error);
            }
        })
        .catch(err => console.error('Grouping worker communication failure:', err));
    });

    // --- SYSTEM MODE SWITCHER ---
    modePills.forEach(pill => {
        pill.addEventListener('click', function() {
            modePills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            const selectedMode = this.getAttribute('data-mode');
            bodyEl.classList.remove('hp-mode-view', 'hp-mode-sale', 'hp-mode-edit');

            if (selectedMode === 'sale') {
                bodyEl.classList.add('hp-mode-sale');
            } else if (selectedMode === 'edit') {
                bodyEl.classList.add('hp-mode-edit');
            } else {
                bodyEl.classList.add('hp-mode-view');
            }

            if (selectedMode !== 'edit') {
                document.querySelectorAll('.hp-product-checkbox').forEach(cb => cb.checked = false);
                updateBulkActionButtons();
            }
        });
    });

    // --- SALES LOG SIDE PANEL CONTROLS ---
    btnToggleLog.addEventListener('click', () => {
        bodyEl.classList.toggle('hp-panel-open');
    });

    btnCloseLog.addEventListener('click', () => {
        bodyEl.classList.remove('hp-panel-open');
    });

    // --- SEARCH, FILTER, AND SORT ENGINE ---
    function fetchFilteredProducts() {
        const showGroups = toggleGroupsBtn ? toggleGroupsBtn.checked : true;
        const url = `actions/main_table/search_sort_products.php?search=${encodeURIComponent(currentSearch)}&sort=${encodeURIComponent(currentSort)}&category=${encodeURIComponent(currentCategory)}&show_groups=${showGroups}`;
        
        fetch(url)
            .then(response => response.text())
            .then(htmlContent => {
                gridContainer.innerHTML = htmlContent;
                updateBulkActionButtons();
            })
            .catch(err => console.error('Error filtering products:', err));
    }

    if (toggleGroupsBtn) {
        toggleGroupsBtn.addEventListener('change', fetchFilteredProducts);
    }

    searchBar.addEventListener('input', function() {
        currentSearch = this.value;
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            fetchFilteredProducts();
        }, 300);
    });

    sortOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            currentSort = this.getAttribute('data-sort');
            fetchFilteredProducts();
        });
    });

    catOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            currentCategory = this.getAttribute('data-category');
            catFilterBtn.textContent = this.textContent;
            fetchFilteredProducts();
        });
    });
});