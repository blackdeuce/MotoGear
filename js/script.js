
const API_BASE_URL = "";

const homePage = document.getElementById("homePage");
const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");

function showPage(page) {
    homePage.classList.add("hidden");
    loginPage.classList.add("hidden");
    registerPage.classList.add("hidden");

    if (page === "home") homePage.classList.remove("hidden");
    if (page === "login") loginPage.classList.remove("hidden");
    if (page === "register") registerPage.classList.remove("hidden");

    document.getElementById("loginMessage").textContent = "";
    document.getElementById("registerMessage").textContent = "";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Navigation
document.querySelectorAll("[data-page]").forEach((element) => {
    element.addEventListener("click", (event) => {
        event.preventDefault();
        showPage(element.dataset.page);
    });
});

// Display API messages
function showMessage(element, message, success = false) {
    element.textContent = message;
    element.style.color = success ? "#4ade80" : "#ff6b6b";
}

// API helper
async function apiRequest(endpoint, body) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

// REAL USER REGISTRATION
document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const message = document.getElementById("registerMessage");

    if (password.length < 8 || password.length > 72) {
        showMessage(message, "Password must be between 8 and 72 characters.");
        return;
    }

    button.disabled = true;
    button.textContent = "CREATING ACCOUNT...";

    try {
        const data = await apiRequest("/api/auth/register", {
            email,
            password
        });

        form.reset();
        showPage("login");

        document.getElementById("loginEmail").value = email;

        showMessage(
            document.getElementById("loginMessage"),
            data.message + " Please log in.",
            true
        );

    } catch (error) {
        showMessage(message, error.message);
    } finally {
        button.disabled = false;
        button.textContent = "CREATE ACCOUNT";
    }
});

// REAL USER LOGIN
document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");

    button.disabled = true;
    button.textContent = "LOGGING IN...";

    try {
        const data = await apiRequest("/api/auth/login", {
            email,
            password
        });

        // Store authentication token, never the password.
        sessionStorage.setItem("motogear_token", data.token);

        showMessage(
    message,
    `Welcome to MotoGear, ${data.user.email}! Login successful.`,
    true
);

form.reset();

// Redirect to accessories page
setTimeout(() => {
    window.location.href = "accessories.html";
}, 1000);

    } catch (error) {
        showMessage(message, error.message);
    } finally {
        button.disabled = false;
        button.textContent = "LOGIN";
    }
});
