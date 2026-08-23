// =========================================================
// MINI DMART - COMMON ADMIN SIDEBAR
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    const sidebarContainer =
        document.getElementById("adminSidebar");

    if (!sidebarContainer) {
        return;
    }

    sidebarContainer.innerHTML = `

        <aside class="sidebar">

            <div class="sidebar-logo">
                🛒 Mini DMart
            </div>

            <div class="admin-label">
                ADMIN PANEL
            </div>

            <nav class="sidebar-nav">

                <a href="dashboard.html"
                   data-page="dashboard.html">
                    📊 Dashboard
                </a>

                <a href="products.html"
                   data-page="products.html">
                    📦 Products
                </a>

                <a href="categories.html"
                   data-page="categories.html">
                    🗂️ Categories
                </a>

                <a href="users.html"
                   data-page="users.html">
                    👥 Users
                </a>

                <a href="orders.html"
                   data-page="orders.html">
                    🛍️ Orders
                </a>

                <a href="exchanges.html"
                   data-page="exchanges.html">
                    🔄 Exchanges
                </a>

                <a href="returns.html"
                   data-page="returns.html">
                    ↩️ Returns
                </a>

                <a href="reviews.html"
                   data-page="reviews.html">
                    ⭐ Reviews
                </a>

                <a href="audit-logs.html"
                   data-page="audit-logs.html">
                    📋 Audit Logs
                </a>

                <a href="pickup-slots.html"
                   data-page="pickup-slots.html">
                    🕐 Pickup Slots
                </a>

                <a href="payments.html"
                   data-page="payments.html">
                    💳 Payments
                </a>

                <a href="inventory.html"
                   data-page="inventory.html">
                    📦 Inventory
                </a>

            </nav>

            <button
                class="sidebar-logout"
                onclick="logout()">

                Logout

            </button>

        </aside>

    `;


    // =====================================================
    // SET ACTIVE PAGE AUTOMATICALLY
    // =====================================================

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    const links =
        sidebarContainer.querySelectorAll(
            ".sidebar-nav a"
        );


    links.forEach(function (link) {

        if (
            link.dataset.page === currentPage
        ) {

            link.classList.add("active");

        }

    });

});