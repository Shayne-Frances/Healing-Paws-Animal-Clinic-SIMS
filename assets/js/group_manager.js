// js/group_manager.js
document.addEventListener('DOMContentLoaded', function () {
    const groupModalElement = document.getElementById('groupManagementModal');
    const groupModal = groupModalElement ? new bootstrap.Modal(groupModalElement) : null;
    const bodyEl = document.body;

    // Modal Specific Element Cache
    const inputGroupId = document.getElementById('manage_group_id');
    const inputGroupName = document.getElementById('manage_group_name');
    const pillsContainer = document.getElementById('groupPillsTargetContainer');
    const searchInput = document.getElementById('modalGroupProductSearch');
    const searchResults = document.getElementById('modalGroupProductSearchResults');
    const btnSaveGroup = document.getElementById('btnSaveGroupStructuralModifications');

    let searchDebounceTimer;

    // --- DELEGATE FOLDER INTERACTION ACTIONS ---
    document.addEventListener('click', function(e) {
        const groupCard = e.target.closest('.hp-group-card');
        if (!groupCard) return; 

        // If we are in Edit Mode, let the main checkbox script handle interactions instead
        if (bodyEl.classList.contains('hp-mode-edit')) return;
        
        // --- NEW GUARD: Fixes Click Overlap Bug ---
        // If the user specifically clicked a product card INSIDE the group, 
        // ignore the folder toggle and let custom.js open the product modal!
        if (e.target.closest('.hp-product-card')) return;

        const groupId = groupCard.getAttribute('data-group-id');
        const nestedContainer = document.getElementById(`nested-group-${groupId}`);
        const isExpanded = groupCard.getAttribute('data-expanded') === 'true';
        const groupTitle = groupCard.querySelector('.hp-group-title');

        // Check if clicking title text directly on an already expanded card to open the structural modal
        if (isExpanded && groupTitle && (e.target === groupTitle || groupTitle.contains(e.target))) {
            e.stopPropagation();
            if (groupModal) {
                launchGroupManagementConsole(groupId, groupTitle.textContent.trim());
            }
            return;
        }

        // Toggle Folder Open/Closed State
        if (nestedContainer) {
            if (isExpanded) {
                nestedContainer.classList.add('d-none');
                groupCard.setAttribute('data-expanded', 'false');
            } else {
                nestedContainer.classList.remove('d-none');
                groupCard.setAttribute('data-expanded', 'true');
            }
        }
    });

    // --- CONSOLE ENGINE LOADING ---
    function launchGroupManagementConsole(groupId, currentGroupName) {
        if (!inputGroupId || !inputGroupName || !pillsContainer || !searchInput || !searchResults) return;

        inputGroupId.value = groupId;
        inputGroupName.value = currentGroupName;
        searchInput.value = '';
        searchResults.classList.add('d-none');
        pillsContainer.innerHTML = '<div class="text-muted font-heading small py-2">Loading directory configurations...</div>';
        
        groupModal.show();
        fetchLinkedGroupItems(groupId);
    }

    function fetchLinkedGroupItems(groupId) {
        fetch(`actions/main_table/get_group_items.php?group_id=${groupId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderLinkedGroupPills(data.items);
                } else {
                    pillsContainer.innerHTML = `<div class="text-danger font-heading small">Load Error: ${data.error}</div>`;
                }
            })
            .catch(err => {
                console.error('Core configuration sync error:', err);
                pillsContainer.innerHTML = '<div class="text-danger font-heading small">Connection mapping timeout.</div>';
            });
    }

    function renderLinkedGroupPills(items) {
        if (items.length === 0) {
            pillsContainer.innerHTML = '<div class="text-muted font-heading small w-100 py-2">Empty Folder. No active items linked.</div>';
            return;
        }

        pillsContainer.innerHTML = '';
        items.forEach(item => {
            const pill = document.createElement('div');
            pill.className = 'hp-mini-product-pill d-flex align-items-center justify-content-between px-3 py-1.5 rounded-pill shadow-sm border bg-white';
            pill.style.minWidth = '45%';
            pill.innerHTML = `
                <span class="fw-bold truncate text-dark-blue me-2" style="font-size:0.85rem;">${item.brand_name}</span>
                <button type="button" class="btn-close ms-auto hp-remove-nested-item-btn" data-item-id="${item.product_id}" style="font-size:0.65rem; padding:0.25rem;"></button>
            `;
            pillsContainer.appendChild(pill);
        });
    }

    // --- SYSTEM DISCONNECTION (UNGROUP) EVENT ---
    if (pillsContainer) {
        pillsContainer.addEventListener('click', function(e) {
            const removeBtn = e.target.closest('.hp-remove-nested-item-btn');
            if (!removeBtn) return;

            const productId = removeBtn.getAttribute('data-item-id');
            const groupId = inputGroupId.value;

            if (confirm("Disconnect item layout map link from this container folder?")) {
                fetch('actions/main_table/remove_product_from_group.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ group_id: groupId, product_id: productId })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        removeBtn.closest('.hp-mini-product-pill').remove();
                        if (pillsContainer.children.length === 0) {
                            pillsContainer.innerHTML = '<div class="text-muted font-heading small w-100 py-2">Empty Folder. No active items linked.</div>';
                        }
                        // Dispatch Global custom event to notify primary controller grid
                        document.dispatchEvent(new CustomEvent('products-updated'));
                    } else {
                        alert('Unlink failure: ' + data.error);
                    }
                });
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
                    .catch(err => console.error('Unassigned item lookup failed:', err));
            }, 250);
        });
    }

    function renderSearchResults(items) {
        searchResults.innerHTML = '';
        items.forEach(item => {
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
                addItemToGroup(item.product_id);
            });
            searchResults.appendChild(row);
        });
        searchResults.classList.remove('d-none');
    }

    function addItemToGroup(productId) {
        const groupId = inputGroupId.value;

        fetch('actions/main_table/add_product_to_group.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ group_id: groupId, product_id: productId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                searchInput.value = '';
                searchResults.classList.add('d-none');
                fetchLinkedGroupItems(groupId);
                document.dispatchEvent(new CustomEvent('products-updated'));
            } else {
                alert('Assoc connection addition error: ' + data.error);
            }
        });
    }

    // --- SAVE RE-NAME METADATA ---
    if (btnSaveGroup) {
        btnSaveGroup.addEventListener('click', function() {
            const groupId = inputGroupId.value;
            const targetNameString = inputGroupName.value.trim();

            if (!targetNameString) return;

            fetch('actions/main_table/update_group_meta.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ group_id: groupId, group_name: targetNameString })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    if (groupModal) groupModal.hide();
                    document.dispatchEvent(new CustomEvent('products-updated'));
                } else {
                    alert('Meta modification rejection error: ' + data.error);
                }
            });
        });
    }

    // Hide search results if user clicks away
    document.addEventListener('click', function(e) {
        if (searchResults && !searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.classList.add('d-none');
        }
    });
});