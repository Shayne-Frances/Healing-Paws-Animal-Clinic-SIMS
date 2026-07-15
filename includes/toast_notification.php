<div class="toast-container position-fixed top-0 start-50 translate-middle-x p-3" style="z-index: 1055; margin-top: 20px;">
    <div id="clinicToast" class="toast align-items-center text-bg-light border-0 shadow-lg rounded-4" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex p-1">
            <div class="toast-body d-flex align-items-center fw-bold fs-6">
                <span class="me-2 fs-4" id="toastIcon">🏥</span>
                <span id="toastMessage">Notification message here.</span>
            </div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
</div>

<script>
// Reusable function to call from any JS file
function showToast(message, type = 'warning') {
    const toastEl = document.getElementById('clinicToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    toastMessage.textContent = message;
    
    if (type === 'warning') {
        toastIcon.textContent = '⚠️';
        toastEl.classList.add('border-danger', 'border-start', 'border-5');
    } else if (type === 'success') {
        toastIcon.textContent = '✅';
        toastEl.classList.add('border-success', 'border-start', 'border-5');
    }
    
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}
</script>