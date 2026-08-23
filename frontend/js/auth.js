// =========================================================
// AUTHENTICATION
// =========================================================


// =========================================================
// LOGIN
// =========================================================

async function login(email, password) {

    const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.message || "Login failed"
        );

    }


    // Store JWT
    localStorage.setItem(
        "token",
        data.token
    );


    // Store logged-in user
    localStorage.setItem(
        "user",
        JSON.stringify(data.user)
    );


    return data;
}



// =========================================================
// LOGOUT
// =========================================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");


    /*
     * Always go to the root login page.
     *
     * This works whether logout() is called from:
     *
     * index.html
     * pages/orders.html
     * pages/cart.html
     * admin/dashboard.html
     */

    window.location.href =
        getRootPath() + "login.html";
}



// =========================================================
// GET ROOT PATH
// =========================================================

function getRootPath() {

    const path =
        window.location.pathname;


    /*
     * If we are inside /pages/
     */

    if (path.includes("/pages/")) {

        return "../";

    }


    /*
     * If we are inside /admin/
     */

    if (path.includes("/admin/")) {

        return "../";

    }


    /*
     * If we are already at root
     */

    return "./";
}



// =========================================================
// GET CURRENT USER
// =========================================================

function getCurrentUser() {

    const user =
        localStorage.getItem("user");


    if (!user) {

        return null;

    }


    try {

        return JSON.parse(user);

    } catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

        return null;

    }
}



// =========================================================
// GET TOKEN
// =========================================================

function getToken() {

    return localStorage.getItem("token");

}



// =========================================================
// CHECK LOGIN
// =========================================================

function isLoggedIn() {

    return !!getToken();

}



// =========================================================
// CHECK ROLE
// =========================================================

function hasRole(role) {

    const user =
        getCurrentUser();


    return !!(
        user &&
        user.roles &&
        user.roles.includes(role)
    );

}



// =========================================================
// REQUIRE LOGIN
// =========================================================

function requireLogin() {

    if (!isLoggedIn()) {

        const currentPage =
            window.location.pathname +
            window.location.search;


        sessionStorage.setItem(
            "redirectAfterLogin",
            currentPage
        );


        window.location.href =
            getRootPath() + "login.html";


        return false;

    }


    return true;

}



// =========================================================
// REQUIRE ADMIN
// =========================================================

function requireAdmin() {

    if (!isLoggedIn()) {

        window.location.href =
            getRootPath() + "login.html";

        return false;

    }


    if (!hasRole("ADMIN")) {

        alert(
            "You are not authorized to access this page."
        );


        window.location.href =
            getRootPath() + "index.html";


        return false;

    }


    return true;

}



// =========================================================
// ROLE-BASED REDIRECT AFTER LOGIN
// =========================================================

function redirectUserByRole() {

    const user =
        getCurrentUser();


    if (!user || !user.roles) {

        window.location.href =
            getRootPath() + "login.html";

        return;

    }


    /*
     * ADMIN
     */

    if (user.roles.includes("ADMIN")) {

        window.location.href =
            getRootPath() +
            "admin/dashboard.html";

        return;

    }


    /*
     * CUSTOMER
     */

    const redirectPage =
        sessionStorage.getItem(
            "redirectAfterLogin"
        );


    if (redirectPage) {

        sessionStorage.removeItem(
            "redirectAfterLogin"
        );


        /*
         * Prevent redirecting back to login
         */

        if (!redirectPage.includes("login.html")) {

            window.location.href =
                redirectPage;

            return;

        }

    }


    window.location.href =
        getRootPath() +
        "index.html";

}

// =========================================================
// OPEN PROFILE BASED ON USER ROLE
// =========================================================

function openProfile() {

    const user = getCurrentUser();

    if (!user || !user.roles) {

        window.location.href =
            getRootPath() + "login.html";

        return;
    }


    // ADMIN
    if (user.roles.includes("ADMIN")) {

        window.location.href =
            getRootPath() + "admin/profile.html";

        return;
    }


    // CUSTOMER
    window.location.href =
        getRootPath() + "pages/profile.html";
}

// =========================================================
// UPDATE HEADER AUTH STATE
// =========================================================

function updateHeaderAuthState() {

    const logoutButton =
        document.getElementById("headerLogoutBtn");

    if (!logoutButton) {
        return;
    }

    if (isLoggedIn()) {

        logoutButton.style.display = "inline-flex";

    } else {

        logoutButton.style.display = "none";
    }
}