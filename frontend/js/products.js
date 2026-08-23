// =========================================================
// MINI DMART - PRODUCTS
// =========================================================


// =========================================================
// LOAD ALL PRODUCTS
// =========================================================

async function loadProducts() {

    const container =
        document.getElementById("productContainer");


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="product-loading">

            <div class="loading-spinner"></div>

            <p>
                Loading products...
            </p>

        </div>

    `;


    try {

        const products =
            await apiRequest("/products");


        displayProducts(products);


    } catch (error) {

        console.error(
            "Failed to load products:",
            error
        );


        container.innerHTML = `

            <div class="products-error">

                <div class="products-error-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load products
                </h3>

                <p>
                    Please check your connection and try again.
                </p>

                <button
                    class="retry-products-btn"
                    onclick="loadProducts()">

                    Try Again

                </button>

            </div>

        `;

    }

}



// =========================================================
// DISPLAY PRODUCTS
// =========================================================

function displayProducts(products) {

    const container =
        document.getElementById(
            "productContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !products ||
        products.length === 0
    ) {

        container.innerHTML = `

            <div class="no-products">

                <div class="no-products-icon">
                    🛒
                </div>

                <h3>
                    No products available
                </h3>

                <p>
                    New products will be added soon.
                </p>

            </div>

        `;

        return;
    }


    products.forEach(product => {

        const productCard =
            document.createElement("article");


        productCard.className =
            "product-card";


        const isOutOfStock =
            !product.stockQuantity ||
            product.stockQuantity <= 0;


        const imageUrl =
            product.imageUrl &&
            product.imageUrl.trim()
                ? product.imageUrl
                : "https://via.placeholder.com/300x220?text=No+Image";


        const description =
            product.description &&
            product.description.trim()
                ? product.description
                : "Quality everyday essential";


        // =====================================================
        // STOCK TEXT
        // =====================================================

        let stockText = "";
        let stockClass = "";


        if (isOutOfStock) {

            stockText =
                "Out of stock";

            stockClass =
                "out-of-stock";

        } else if (
            product.stockQuantity <= 5
        ) {

            stockText =
                `Only ${product.stockQuantity} left`;

            stockClass =
                "low-stock";

        } else {

            stockText =
                "In stock";

            stockClass =
                "in-stock";

        }


        // =====================================================
        // PRODUCT CARD HTML
        // =====================================================

        productCard.innerHTML = `

            <!-- PRODUCT IMAGE -->

            <div class="product-image-wrapper">

                ${
                    isOutOfStock
                    ?
                    `
                    <span class="product-stock-badge out">
                        Out of Stock
                    </span>
                    `
                    :
                    `
                    <span class="product-stock-badge">
                        Fresh
                    </span>
                    `
                }


                <img
                    src="${imageUrl}"
                    alt="${product.name}"
                    class="product-image"
                    onerror="this.src='https://via.placeholder.com/300x220?text=No+Image'"
                >

            </div>


            <!-- PRODUCT INFORMATION -->

            <div class="product-info">


                <h3
                    class="product-name"
                    title="${product.name}">

                    ${product.name}

                </h3>


                <p
                    class="product-description"
                    title="${description}">

                    ${description}

                </p>


                <!-- PRICE -->

                <div class="product-price-row">

                    <span class="product-price">

                        ₹${product.price}

                    </span>

                </div>


                <!-- STOCK -->

                <div class="product-stock-row">

                    <span class="stock-dot ${stockClass}">
                    </span>

                    <span class="${stockClass}">
                        ${stockText}
                    </span>

                </div>


                <!-- ACTIONS -->

                <div class="product-actions">


                    <button
                        class="add-cart-btn"
                        onclick="addToCart(${product.id})"
                        ${isOutOfStock ? "disabled" : ""}>

                        ${
                            isOutOfStock
                            ? "Out of Stock"
                            : "ADD"
                        }

                    </button>


                    <button
                        class="view-details-btn"
                        onclick="viewProductDetails(${product.id})">

                        View Details

                    </button>


                </div>


            </div>

        `;


        container.appendChild(
            productCard
        );

    });

}



// =========================================================
// SEARCH PRODUCTS
// =========================================================

async function searchProducts() {

    const searchInput =
        document.getElementById(
            "productSearch"
        );


    if (!searchInput) {
        return;
    }


    const searchTerm =
        searchInput.value.trim();


    // If search is empty, load everything

    if (!searchTerm) {

        loadProducts();

        return;

    }


    const container =
        document.getElementById(
            "productContainer"
        );


    container.innerHTML = `

        <div class="product-loading">

            <div class="loading-spinner"></div>

            <p>
                Searching products...
            </p>

        </div>

    `;


    try {

        const products =
            await apiRequest(
                `/products/search?name=${encodeURIComponent(searchTerm)}`
            );


        displayProducts(products);


    } catch (error) {

        console.error(
            "Product search failed:",
            error
        );


        container.innerHTML = `

            <div class="products-error">

                <div class="products-error-icon">
                    ⚠️
                </div>

                <h3>
                    Search failed
                </h3>

                <p>
                    ${error.message}
                </p>

                <button
                    class="retry-products-btn"
                    onclick="loadProducts()">

                    Show All Products

                </button>

            </div>

        `;

    }

}



// =========================================================
// SEARCH INPUT EVENT
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const searchInput =
            document.getElementById(
                "productSearch"
            );


        if (!searchInput) {
            return;
        }


        let searchTimeout;


        searchInput.addEventListener(
            "input",
            function () {

                clearTimeout(
                    searchTimeout
                );


                searchTimeout =
                    setTimeout(
                        searchProducts,
                        400
                    );

            }
        );

    }
);



// =========================================================
// VIEW PRODUCT DETAILS
// =========================================================

function viewProductDetails(
    productId
) {

    window.location.href =
        `pages/product-details.html?id=${productId}`;

}