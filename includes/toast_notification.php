<div class="toast-container position-fixed top-0 start-50 translate-middle-x p-3" style="z-index: 9999; margin-top: 20px;">
    <div id="clinicToast" class="toast align-items-center border-0 shadow-lg rounded-4" role="alert" aria-live="assertive" aria-atomic="true" style="min-width: 350px;">
        <div class="d-flex p-2">
            <div class="toast-body d-flex align-items-center fw-semibold fs-6 text-dark">
                <div class="me-3 fs-3 d-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm" style="width: 40px; height: 40px;" id="toastIconContainer">
                    <span id="toastIcon">🏥</span>
                </div>
                <div class="d-flex flex-column">
                    <span class="fw-bold text-uppercase tracking-wider small text-muted" id="toastHeader">Medical Alert</span>
                    <span id="toastMessage" style="font-size: 0.95rem;">Notification message here.</span>
                </div>
            </div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
</div>

<script>
function showToast(message, type = 'warning') {
    const toastEl = document.getElementById('clinicToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    const toastHeader = document.getElementById('toastHeader');
    const iconContainer = document.getElementById('toastIconContainer');
    
    // Reset background and border classes
    toastEl.className = "toast align-items-center border-0 shadow-lg rounded-4";
    iconContainer.className = "me-3 fs-3 d-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm";

    toastMessage.textContent = message;
    
    if (type === 'warning') {
        toastHeader.textContent = "Clinical Warning";
        toastHeader.style.color = "#dc3545"; // Soft red
        toastIcon.textContent = '🩺'; // Stethoscope
        toastEl.classList.add('bg-danger-subtle', 'border-start', 'border-danger', 'border-5');
        iconContainer.classList.add('text-danger');
    } else if (type === 'success') {
        toastHeader.textContent = "Operation Success";
        toastHeader.style.color = "#198754"; // Medical teal-green
        toastIcon.textContent = '💖'; // Healing heart
        toastEl.classList.add('bg-success-subtle', 'border-start', 'border-success', 'border-5');
        iconContainer.classList.add('text-success');
    }
    
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();
}
</script>