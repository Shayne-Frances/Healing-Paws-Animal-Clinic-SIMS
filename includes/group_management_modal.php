<div class="modal fade" id="groupManagementModal" tabindex="-1" aria-labelledby="groupManagementModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered hp-modal-custom">
        <div class="modal-content">
            <div class="modal-header hp-modal-header-dark">
                <h5 class="modal-title" id="groupManagementModalLabel">📁 Manage Group Folder</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="manage_group_id">
                
                <div class="mb-3">
                    <label for="manage_group_name" class="form-label hp-form-label">Folder Display Name</label>
                    <input type="text" class="form-control" id="manage_group_name" placeholder="E.g., Cleansers, Moisturizers...">
                </div>
                
                <div class="mb-3">
                    <label class="form-label hp-form-label">Linked Directory Items</label>
                    <div class="hp-modal-pills-scroll border rounded p-2 d-flex flex-wrap gap-2" id="groupPillsTargetContainer" style="background-color: #f8fafc; min-height: 50px;">
                        </div>
                </div>
                
                <hr class="my-4">
                
                <div class="mb-2">
                    <label for="modalGroupProductSearch" class="form-label hp-form-label">Add New Item to Folder</label>
                    <div class="position-relative">
                        <input type="text" class="form-control" id="modalGroupProductSearch" placeholder="Type name, brand, or SKU..." autocomplete="off">
                        <div class="position-absolute w-100 bg-white border rounded shadow-lg mt-1 d-none" id="modalGroupProductSearchResults" style="max-height: 180px; overflow-y: auto; z-index: 1060;">
                            </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn hp-btn-dark-blue" id="btnSaveGroupStructuralModifications">Save Changes</button>
            </div>
        </div>
    </div>
</div>