document.getElementById("launch-btn").addEventListener("click", function () {
    Swal.fire({
        title: "Preparing to Launch Mission...",
        text: "Please wait...",
        icon: "info",
        timer: 3000,
        showConfirmButton: false
    }).then(() => {
        // Open new terminal window after popup closes
        window.location.href = "demo.html";
    });
});
