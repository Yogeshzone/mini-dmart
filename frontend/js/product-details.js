// =========================================================
// GET PRODUCT ID FROM URL
// =========================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const productId =
    urlParams.get("id");


// =========================================================
// LOAD PRODUCT DETAILS
// =========================================================

async function loadProductDetails() {

    const container =
        document.getElementById(
            "productDetails"
        );


    if (!productId) {

        container.innerHTML = `

            <div class="error-message">

                <h2>
                    Product Not Found
                </h2>

                <p>
                    No product ID was provided.
                </p>

                <a href="../index.html">
                    Back to Products
                </a>

            </div>

        `;

        return;
    }


    try {

        const product =
            await apiRequest(
                `/products/${productId}`
            );


        displayProduct(
            product
        );


        await loadProductReviews();


    } catch (error) {

        console.error(
            "Failed to load product:",
            error
        );


        container.innerHTML = `

            <div class="error-message">

                <h2>
                    Failed to Load Product
                </h2>

                <p>
                    ${error.message}
                </p>

                <a href="../index.html">
                    Back to Products
                </a>

            </div>

        `;
    }
}


// =========================================================
// DISPLAY PRODUCT
// =========================================================

function displayProduct(product) {

    const container =
        document.getElementById(
            "productDetails"
        );


    container.innerHTML = `

        <div class="product-details-card">

            <div class="product-image-section">

                ${
                    product.imageUrl
                    ?
                    `
                    <img
                        src="${product.imageUrl}"
                        alt="${product.name}"
                        class="product-details-image"
                    >
                    `
                    :
                    `
                    <div class="no-product-image">
                        📦
                    </div>
                    `
                }

            </div>


            <div class="product-details-info">

                <h1>
                    ${product.name}
                </h1>


                <p class="product-description">

                    ${product.description || "No description available."}

                </p>


                <div class="product-price">

                    ₹${product.price}

                </div>


                <div class="product-stock">

                    ${
                        product.stockQuantity > 0
                        ?
                        `
                        <span class="stock-available">
                            ✓ In Stock
                        </span>

                        <span>
                            ${product.stockQuantity}
                            available
                        </span>
                        `
                        :
                        `
                        <span class="stock-unavailable">
                            Out of Stock
                        </span>
                        `
                    }

                </div>


                ${
                    product.stockQuantity > 0
                    ?
                    `
                    <button
                        class="add-to-cart-btn"
                        onclick="addProductToCart(${product.id})">

                        🛒 Add to Cart

                    </button>
                    `
                    :
                    ""
                }

            </div>

        </div>

    `;
}


// =========================================================
// ADD PRODUCT TO CART
// =========================================================

async function addProductToCart(
    productId
) {

    try {

        /*
         * NOTE:
         * This assumes your cart API uses:
         * POST /cart/items
         *
         * If your existing cart API uses a
         * different endpoint, we'll adjust it.
         */

        await apiRequest(
            "/cart/items",
            {
                method: "POST",

                body: JSON.stringify({

                    productId:
                        productId,

                    quantity:
                        1

                })
            }
        );


        alert(
            "Product added to cart successfully!"
        );


    } catch (error) {

        console.error(
            "Add to cart error:",
            error
        );


        alert(
            error.message
        );
    }
}


// =========================================================
// LOAD PRODUCT REVIEWS
// =========================================================

async function loadProductReviews() {

    const container =
        document.getElementById(
            "reviewsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <p>
            Loading reviews...
        </p>

    `;


    try {

        const reviews =
            await apiRequest(
                `/reviews/product/${productId}`
            );


        displayProductReviews(
            reviews
        );


    } catch (error) {

        console.error(
            "Failed to load reviews:",
            error
        );


        container.innerHTML = `

            <div class="error-message">

                <p>
                    Failed to load reviews:
                    ${error.message}
                </p>

            </div>

        `;
    }
}


// =========================================================
// DISPLAY PRODUCT REVIEWS
// =========================================================

function displayProductReviews(
    reviews
) {

    const container =
        document.getElementById(
            "reviewsContainer"
        );


    container.innerHTML = "";


    if (
        !reviews ||
        reviews.length === 0
    ) {

        container.innerHTML = `

            <div class="no-reviews">

                <p>
                    No approved reviews yet.
                </p>

                <p>
                    Be the first customer to review this product!
                </p>

            </div>

        `;

        return;
    }


    reviews.forEach(review => {

        const reviewCard =
            document.createElement(
                "div"
            );


        reviewCard.className =
            "review-card";


        reviewCard.innerHTML = `

            <div class="review-header">

                <div>

                    <strong>
                        ${review.userName || "Customer"}
                    </strong>

                    <div class="review-rating">

                        ${getStars(
                            review.rating
                        )}

                    </div>

                </div>


                <small>

                    ${formatReviewDate(
                        review.createdAt
                    )}

                </small>

            </div>


            ${
                review.comment
                ?
                `
                <p class="review-comment">

                    ${review.comment}

                </p>
                `
                :
                `
                <p class="review-comment">

                    No comment provided.

                </p>
                `
            }

        `;


        container.appendChild(
            reviewCard
        );

    });
}


// =========================================================
// SUBMIT REVIEW
// =========================================================

async function submitReview(
    event
) {

    event.preventDefault();


    const rating =
        document.getElementById(
            "rating"
        ).value;


    const comment =
        document.getElementById(
            "comment"
        ).value.trim();


    const message =
        document.getElementById(
            "reviewMessage"
        );


    if (!rating) {

        message.textContent =
            "Please select a rating.";

        message.style.color =
            "red";

        return;
    }


    try {

        const review =
            await apiRequest(
                "/reviews",
                {
                    method: "POST",

                    body: JSON.stringify({

                        productId:
                            Number(productId),

                        rating:
                            Number(rating),

                        comment:
                            comment

                    })
                }
            );


        message.textContent =
            "Review submitted successfully. It is waiting for admin approval.";

        message.style.color =
            "green";


        document.getElementById(
            "reviewForm"
        ).reset();


    } catch (error) {

        console.error(
            "Review submission error:",
            error
        );


        message.textContent =
            error.message;

        message.style.color =
            "red";
    }
}


// =========================================================
// GET STARS
// =========================================================

function getStars(
    rating
) {

    let stars = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        if (i <= rating) {

            stars += "⭐";

        } else {

            stars += "☆";

        }
    }


    return stars;
}


// =========================================================
// FORMAT REVIEW DATE
// =========================================================

function formatReviewDate(
    dateTime
) {

    if (!dateTime) {
        return "-";
    }


    return new Date(
        dateTime
    ).toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// =========================================================
// SUBMIT FORM
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const reviewForm =
            document.getElementById(
                "reviewForm"
            );


        if (reviewForm) {

            reviewForm.addEventListener(
                "submit",
                submitReview
            );

        }


        loadProductDetails();

    }
);