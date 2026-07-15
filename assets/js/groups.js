document.addEventListener('DOMContentLoaded', function () {
    // --- COMPONENT REGISTER LABELS & ENGINE CACHE DOM TARGETS ---
    const gridContainer = document.getElementById('productGridContainer');
    const groupModalElement = document.getElementById('groupManagementModal');
    
    // Avoid execution errors if modal code block context isn't parsed onto active view viewport layers
    if (!groupModalElement || !gridContainer) return;
    
    const groupModal = new bootstrap.Modal(groupModalElement);
    const bodyEl = document.body;
    
    const groupForm = document.getElementById('groupManagementForm');
    const inputGroupId = document.getElementById('manage_group_id');
    const inputGroupName = document.getElementById('manage_group_name');
    const pillsContainer = document.getElementById('groupPillsTargetContainer');
    const btnSaveGroup = document.getElementById('btnSaveGroupStructuralModifications');

    // --- COORD ENGINE FOR HIERARCHICAL DUAL STAGE CLICKS ---
    gridContainer.addEventListener('click', function(e) {
        // Intercept target trace markers
        const groupCard = e.target.closest('.hp-group-card');
        if (!groupCard) return; // Pass command validation directly downstream if it's a standard product element execution layout path

        const groupId = groupCard.getAttribute('data-group-id');
        const nestedContainer = document.getElementById(`nested-group-${groupId}`);
        const isExpanded = groupCard.getAttribute('data-expanded') === 'true';
        const groupNameTextNode = groupCard.querySelector('.hp-group-title');

        // STAGE 2 CLICK CHECK: If already expanded, and clicking the Group Name title specifically -> Fire popup loader
        if (isExpanded && (e.target === groupNameTextNode || groupNameTextNode.contains(e.target))) {
            e.stopPropagation();
            launchGroupManagementConsole(groupId, groupNameTextNode.textContent.trim());
            return;
        }

        // STAGE 1 CLICK EXEC: Toggle drawer display layouts safely open/close
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

    // --- POPUP DATA RECOVERY POPULATOR DRIVERS ---
    function launchGroupManagementConsole(groupId, currentGroupName) {
        inputGroupId.value = groupId;
        inputGroupName.value = currentGroupName;
        pillsContainer.innerHTML = '<div class="text-muted font-heading small py-2">Loading linked directory items...</div>';
        
        groupModal.show();

        // Query server worker to fetch current child components linked inside group map frames
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
                console.error('Critical systems retrieval communication framework down:', err);
                pillsContainer.innerHTML = '<div class="text-danger font-heading small">Connection error.</div>';
            });
    }

    // Generate rounded sub-element pill configurations inside group control management panel container
    function renderLinkedGroupPills(items) {
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

    // --- PILL REMOVAL INTERNAL HOOK DELEGATORS ---
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
                    // Instantly trigger re-query updates without closing modal frame wrappers
                    removeBtn.closest('.hp-mini-product-pill').remove();
                    if (pillsContainer.children.length === 0) {
                        pillsContainer.innerHTML = '<div class="text-muted font-heading small py-2">No active elements attached here.</div>';
                    }
                    // Fire global event interface hook logic driver loop updates back inside master table content views
                    if (typeof window.fetchFilteredProducts === 'function') {
                        window.fetchFilteredProducts();
                    } else if (document.getElementById('productSearchBar')) {
                        // Quality of life workaround backup trigger
                        document.getElementById('productSearchBar').dispatchEvent(new Event('input'));
                    }
                } else {
                    alert('Process action failure: ' + data.error);
                }
            });
        }
    });

    // --- MASTER SUBMIT TRIGGER CONTROLLER ---
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
                groupModal.hide();
                // Call search updating logic from core js grid engine mapping functions
                if (document.getElementById('productSearchBar')) {
                    document.getElementById('productSearchBar').dispatchEvent(new Event('input'));
                }
            } else {
                alert('Meta modification rejection error: ' + data.error);
            }
        });
    });
});