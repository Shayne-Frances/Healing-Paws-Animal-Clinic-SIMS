// assets/js/group_manager.js

document.addEventListener('DOMContentLoaded', function () {
    // --- DOM ELEMENT CACHE ---
    const groupModalElement = document.getElementById('groupManagementModal');
    const groupModal = groupModalElement ? new bootstrap.Modal(groupModalElement) : null;
    const bodyEl = document.body;

    // --- MODAL SPECIFIC ELEMENT CACHE ---
    const inputGroupId = document.getElementById('manage_group_id');
    const inputGroupName = document.getElementById('manage_group_name');
    const pillsContainer = document.getElementById('groupPillsTargetContainer');
    const searchInput = document.getElementById('modalGroupProductSearch');
    const searchResults = document.getElementById('modalGroupProductSearchResults');
    const btnSaveGroup = document.getElementById('btnSaveGroupStructuralModifications');

    // --- LOCAL STATE MANAGEMENT ---
    // Keeps track of added/removed products without writing to DB instantly
    let currentGroupItems = [];
    let searchDebounceTimer;

    // --- EVENT DELEGATION: FOLDER INTERACTIONS ---
    document.addEventListener('click', function(e) {
        const groupCard = e.target.closest('.hp-group-card');
        if (!groupCard) return; 

        const isArrowClick = e.target.closest('.hp-dropdown-arrow');
        const bodyEl = document.body;

        // Block modal opening in Edit Mode OR Sale Mode
        const isEditMode = bodyEl.classList.contains('hp-mode-edit');
        const isSaleMode = bodyEl.classList.contains('hp-mode-sale');

        if ((isEditMode || isSaleMode) && !isArrowClick) {
            // Let the Sale Mode handler process this click instead of opening modals
            return;
        }
        
        if (e.target.closest('.hp-product-card')) return;

        const groupId = groupCard.getAttribute('data-group-id');
        const nestedContainer = document.getElementById(`nested-group-${groupId}`);
        const isExpanded = groupCard.getAttribute('data-expanded') === 'true';
        
        const cardHeader = e.target.closest('.card-body');
        if (!cardHeader) return;

        // Handle Expand/Collapse Arrow Click (Allowed in all modes)
        if (isArrowClick) {
            e.stopPropagation();
            if (nestedContainer) {
                if (isExpanded) {
                    nestedContainer.classList.add('d-none');
                    groupCard.setAttribute('data-expanded', 'false');
                } else {
                    nestedContainer.classList.remove('d-none');
                    groupCard.setAttribute('data-expanded', 'true');
                }
            }
            return;
        }

        // Standard logic for non-edit, non-sale modes
        if (isExpanded) {
            e.stopPropagation();
            const titleText = groupCard.getAttribute('data-group-name') || 'Group';
            if (groupModal) {
                launchGroupManagementConsole(groupId, titleText);
            }
        } else {
            if (nestedContainer) {
                nestedContainer.classList.remove('d-none');
                groupCard.setAttribute('data-expanded', 'true');
            }
        }
    });

    // --- CONSOLE ENGINE LOADING ---
    function launchGroupManagementConsole(groupId, currentGroupName) {
        if (!inputGroupId || !inputGroupName || !pillsContainer || !searchInput || !searchResults) return;

        // Reset and populate modal fields
        inputGroupId.value = groupId;
        inputGroupName.value = currentGroupName;
        searchInput.value = '';
        searchResults.classList.add('d-none');
        pillsContainer.innerHTML = '<div class="text-muted font-heading small py-2 text-center w-100">Loading configurations...</div>';
        
        groupModal.show();
        fetchLinkedGroupItems(groupId);
    }

    // Fetch existing mappings from the database
    function fetchLinkedGroupItems(groupId) {
        fetch(`actions/main_table/get_group_items.php?group_id=${groupId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    currentGroupItems = data.items;
                    renderLinkedGroupPills(currentGroupItems);
                } else {
                    pillsContainer.innerHTML = `<div class="text-danger font-heading small">Load Error: ${data.error}</div>`;
                }
            })
            .catch(err => {
                console.error(err);
                pillsContainer.innerHTML = '<div class="text-danger font-heading small">Connection mapping timeout.</div>';
            });
    }

    // --- RENDER DRAFT PILLS WITH TRANSITION SUPPORT ---
    function renderLinkedGroupPills(items, animateProductId = null) {
        if (items.length === 0) {
            pillsContainer.innerHTML = '<div class="text-muted font-heading small w-100 py-3 text-center">Empty Folder. No active items linked.</div>';
            return;
        }

        pillsContainer.innerHTML = '';
        items.forEach(item => {
            const pill = document.createElement('div');
            pill.className = 'hp-mini-product-pill d-flex align-items-center justify-content-between px-3 py-1.5 rounded-pill shadow-sm border bg-white';
            pill.style.minWidth = '45%';
            
            // Base Transition Styling (Bouncy entry animation)
            pill.style.transition = 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'; 
            
            // Initial animation state for newly added items
            if (animateProductId && String(item.product_id) === String(animateProductId)) {
                pill.style.opacity = '0';
                pill.style.transform = 'scale(0.4) translateY(-10px)';
            }

            pill.innerHTML = `
                <span class="fw-bold truncate text-dark-blue me-2" style="font-size:0.85rem;">${item.brand_name}</span>
                <button type="button" class="btn-close ms-auto hp-remove-nested-item-btn" data-item-id="${item.product_id}" style="font-size:0.65rem; padding:0.25rem;"></button>
            `;
            pillsContainer.appendChild(pill);

            // Trigger visual pop entry effect on next frame
            if (animateProductId && String(item.product_id) === String(animateProductId)) {
                setTimeout(() => {
                    pill.style.opacity = '1';
                    pill.style.transform = 'scale(1) translateY(0)';
                }, 50);
            }
        });
    }

    // --- FRONT-END DISCONNECTION (UNGROUP) ANIMATION ---
    if (pillsContainer) {
        pillsContainer.addEventListener('click', function(e) {
            const removeBtn = e.target.closest('.hp-remove-nested-item-btn');
            if (!removeBtn) return;

            const productId = removeBtn.getAttribute('data-item-id');
            const pillElement = removeBtn.closest('.hp-mini-product-pill');

            if (pillElement) {
                // Drop and fade-out transition
                pillElement.style.transition = 'opacity 0.35s cubic-bezier(0.4, 0, 1, 1), transform 0.35s cubic-bezier(0.4, 0, 1, 1)';
                pillElement.style.transform = 'translateY(25px) scale(0.8)';
                pillElement.style.opacity = '0';

                // Wait for animation completion, then update local state
                setTimeout(() => {
                    currentGroupItems = currentGroupItems.filter(item => String(item.product_id) !== String(productId));
                    renderLinkedGroupPills(currentGroupItems);
                }, 300);
            }
        });
    }

    // --- SEARCH UNASSIGNED PRODUCTS ENGINE ---
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            const groupId = inputGroupId.value;

            clearTimeout(searchDebounceTimer);
            if (query.length < 2) {
                searchResults.classList.add('d-none');
                return;
            }

            searchDebounceTimer = setTimeout(() => {
                fetch(`actions/main_table/search_unassigned_products.php?search=${encodeURIComponent(query)}&group_id=${groupId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.items.length > 0) {
                            renderSearchResults(data.items);
                        } else {
                            searchResults.innerHTML = '<div class="p-2 text-muted small">No unassigned items found</div>';
                            searchResults.classList.remove('d-none');
                        }
                    })
                    .catch(err => console.error('Lookup failed:', err));
            }, 250);
        });
    }

    function renderSearchResults(items) {
        searchResults.innerHTML = '';
        
        // Safety Check: Filter out items already temporarily added in this modal session
        const filteredItems = items.filter(item => 
            !currentGroupItems.some(curr => String(curr.product_id) === String(item.product_id))
        );

        if (filteredItems.length === 0) {
            searchResults.innerHTML = '<div class="p-2 text-muted small">No unassigned items found</div>';
            searchResults.classList.remove('d-none');
            return;
        }

        filteredItems.forEach(item => {
            const row = document.createElement('div');
            row.className = 'p-2 border-bottom hp-search-result-row d-flex justify-content-between align-items-center';
            row.style.cursor = 'pointer';
            row.innerHTML = `
                <div>
                    <div class="fw-bold text-dark-blue small">${item.brand_name}</div>
                    <div class="text-muted extra-small" style="font-size:0.75rem;">${item.generic_name || 'Generic Item'}</div>
                </div>
                <span class="badge bg-success" style="font-size:0.65rem;">+ Add</span>
            `;
            
            row.addEventListener('click', () => {
                addItemToGroup(item);
            });
            searchResults.appendChild(row);
        });
        searchResults.classList.remove('d-none');
    }

    // Temporarily add a product to the draft array state
    function addItemToGroup(item) {
        if (currentGroupItems.some(curr => String(curr.product_id) === String(item.product_id))) {
            return;
        }

        currentGroupItems.push({
            product_id: item.product_id,
            brand_name: item.brand_name,
            generic_name: item.generic_name || ''
        });

        // Re-render and visually bounce the newly added item in
        renderLinkedGroupPills(currentGroupItems, item.product_id);

        // Reset search field
        searchInput.value = '';
        searchResults.classList.add('d-none');
    }

    // --- BATCH SAVE ACTIONS (DATABASE SAVING TIMING) ---
    if (btnSaveGroup) {
        btnSaveGroup.addEventListener('click', function(e) { // Fixed: added parameter 'e' here
            e.preventDefault();
            
            const groupId = inputGroupId.value;
            const targetNameString = inputGroupName.value.trim();

            if (!targetNameString) {
                alert('Please provide a folder display name.');
                return;
            }

            // Map out only the product IDs from the temporary state array
            const productIds = currentGroupItems.map(item => item.product_id);

            btnSaveGroup.disabled = true;
            btnSaveGroup.textContent = 'Saving Changes...';

            fetch('actions/main_table/update_group.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    group_id: groupId, 
                    group_name: targetNameString,
                    product_ids: productIds 
                })
            })
            .then(res => res.json())
            .then(data => {
                btnSaveGroup.disabled = false;
                btnSaveGroup.textContent = 'Save Changes';
                
                if (data.success) {
                    if (groupModal) groupModal.hide();
                    
                    const activeCard = document.body.querySelector(`.hp-group-card[data-group-id="${groupId}"]`);
                    if (activeCard) {
                        const titleEl = activeCard.querySelector('.hp-group-title');
                        if (titleEl) {
                            titleEl.textContent = targetNameString; 
                        }
                        // Keep data attribute synced with the new text to prevent reverting on next click
                        activeCard.setAttribute('data-group-name', targetNameString);
                    }
                    
                    // Dispatch change event to trigger UI refresh listeners safely
                    document.dispatchEvent(new CustomEvent('products-updated'));
                } else {
                    alert('Save failure: ' + data.error);
                }
            })
            .catch(err => {
                btnSaveGroup.disabled = false;
                btnSaveGroup.textContent = 'Save Changes';
                console.error(err);
                alert('Connection failure updating group configurations.');
            });
        });
    }

    // --- EXTERNAL UI BEHAVIOR ---
    // Hide search results dropdown when clicking outside of it
    document.addEventListener('click', function(e) {
        if (searchResults && !searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.classList.add('d-none');
        }
    });
});