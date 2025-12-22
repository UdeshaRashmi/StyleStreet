// =====================
// MOBILE NAVBAR TOGGLE
// =====================
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".navlinks");

if(menuToggle){
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}

// =====================
// ADD TO CART BUTTON ANIMATION
// =====================
const cartButtons = document.querySelectorAll(".product-card button");

cartButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        btn.textContent = "Added!";
        btn.style.backgroundColor = "#28a745"; // green for added
        setTimeout(() => {
            btn.textContent = "Add to Cart";
            btn.style.backgroundColor = "";
        }, 1200);
    });
});

// =====================
// NEWSLETTER FORM ALERT
// =====================
const newsletterForm = document.querySelector(".newsletter form");

if(newsletterForm){
    newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector("input").value.trim();
        if(email){
            alert(`Thank you for subscribing with: ${email}`);
            newsletterForm.reset();
        } else {
            alert("Please enter a valid email.");
        }
    });
}
