document.addEventListener('DOMContentLoaded', function () {
    // --- CACHE MODAL AND FORM ELEMENTS ---
    const groupModalElement = document.getElementById('groupManagementModal');
    let groupModal = null;

    // Initialize Bootstrap modal safely if it exists on the page
    if (groupModalElement) {
        groupModal = new bootstrap.Modal(groupModalElement);
    }
    
    const inputGroupId = document.getElementById('manage_group_id');
    const inputGroupName = document.getElementById('manage_group_name');
    const pillsContainer = document.getElementById('groupPillsTargetContainer');
    const btnSaveGroup = document.getElementById('btnSaveGroupStructuralModifications');

    // --- 1. GLOBAL CLICK DELEGATION (Fixes AJAX Wipeout Issue) ---
    document.addEventListener('click', function(e) {
        // Find if the clicked element is inside a group card
        const groupCard = e.target.closest('.hp-group-card');
        if (!groupCard) return; 

        const groupId = groupCard.getAttribute('data-group-id');
        const nestedContainer = document.getElementById(`nested-group-${groupId}`);
        const isExpanded = groupCard.getAttribute('data-expanded') === 'true';
        const groupNameTextNode = groupCard.querySelector('.hp-group-title');

        // STAGE 2 CLICK CHECK: If already expanded, and user clicks the Title directly -> Open Management Console
        if (isExpanded && groupNameTextNode && (e.target === groupNameTextNode || groupNameTextNode.contains(e.target))) {
            e.stopPropagation();
            if (groupModal) {
                launchGroupManagementConsole(groupId, groupNameTextNode.textContent.trim());
            } else {
                console.warn('Group management modal element was not found in the DOM.');
            }
            return;
        }

        // STAGE 1 CLICK EXEC: Toggle nested product drawer open/close
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

    // --- 2. SHOW GROUPS TOGGLE LISTENER ---
    const toggleGroupsBtn = document.getElementById('toggleGroupsBtn');
    if (toggleGroupsBtn) {
        toggleGroupsBtn.addEventListener('change', function() {
            triggerGridRefresh();
        });
    }

    // --- Helper function to trigger a data reload on your main product grid ---
    function triggerGridRefresh() {
        if (typeof window.fetchFilteredProducts === 'function') {
            window.fetchFilteredProducts();
        } else {
            const searchBar = document.getElementById('productSearchBar');
            if (searchBar) {
                searchBar.dispatchEvent(new Event('input'));
            }
        }
    }

    // --- 3. POPUP DATA RECOVERY POPULATOR DRIVERS ---
    function launchGroupManagementConsole(groupId, currentGroupName) {
        if (!inputGroupId || !inputGroupName || !pillsContainer) return;

        inputGroupId.value = groupId;
        inputGroupName.value = currentGroupName;
        pillsContainer.innerHTML = '<div class="text-muted font-heading small py-2">Loading linked directory items...</div>';
        
        groupModal.show();

        // Query server to fetch current products mapped inside this group folder
        fetch(`actions/main_table/get_group_items.php?group_id=${groupId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderLinkedGroupPills(data.items);
                } else {
                    pillsContainer.innerHTML = `<div class="text-danger font-heading small">Failed to load: ${data.error}</div>`;
                }
            })
            .catch(err => {
                console.error('Critical database communication framework failure:', err);
                pillsContainer.innerHTML = '<div class="text-danger font-heading small">Connection error.</div>';
            });
    }

    // Render inner badges inside modal
    function renderLinkedGroupPills(items) {
        if (!pillsContainer) return;

        if (items.length === 0) {
            pillsContainer.innerHTML = '<div class="text-muted font-heading small py-2">No active elements attached here.</div>';
            return;
        }

        pillsContainer.innerHTML = '';
        items.forEach(item => {
            const pill = document.createElement('div');
            pill.className = 'hp-mini-product-pill d-flex align-items-center justify-content-between px-3 py-1.5 rounded-pill shadow-sm mb-1';
            pill.style.minWidth = '45%';
            pill.innerHTML = `
                <span class="fw-bold truncate me-2">${item.brand_name}</span>
                <button type="button" class="btn-close ms-auto hp-remove-nested-item-btn" data-item-id="${item.product_id}" style="font-size:0.65rem; padding:0.25rem;"></button>
            `;
            pillsContainer.appendChild(pill);
        });
    }

    // --- 4. PILL REMOVAL EVENT DELEGATORS ---
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
                            pillsContainer.innerHTML = '<div class="text-muted font-heading small py-2">No active elements attached here.</div>';
                        }
                        triggerGridRefresh();
                    } else {
                        alert('Process action failure: ' + data.error);
                    }
                });
            }
        });
    }

    // --- 5. MASTER SUBMIT TRIGGER CONTROLLER ---
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
                    triggerGridRefresh();
                } else {
                    alert('Meta modification rejection error: ' + data.error);
                }
            });
        });
    }
});