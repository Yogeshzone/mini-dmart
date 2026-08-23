// =========================================================
// REVIEWS
// =========================================================


// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!isLoggedIn()) {

            window.location.href =
                "../login.html";

            return;
        }


        loadReviews();


        const form =
            document.getElementById(
                "reviewForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                submitReview
            );
        }

    }
);



// =========================================================
// LOAD MY REVIEWS
// =========================================================

async function loadReviews() {

    const container =
        document.getElementById(
            "reviewsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="reviews-loading">

            <div class="loading-spinner"></div>

            <p>
                Loading your reviews...
            </p>

        </div>

    `;


    try {

        const reviews =
            await apiRequest(
                "/reviews/my"
            );


        displayReviews(
            reviews
        );


    } catch (error) {

        console.error(
            "Failed to load reviews:",
            error
        );


        container.innerHTML = `

            <div class="review-error">

                <h3>
                    Unable to Load Reviews
                </h3>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>


                <button
                    onclick="loadReviews()">

                    Try Again

                </button>

            </div>

        `;

    }
}



// =========================================================
// DISPLAY REVIEWS
// =========================================================

function displayReviews(
    reviews
) {

    const container =
        document.getElementById(
            "reviewsContainer"
        );


    const countElement =
        document.getElementById(
            "reviewCount"
        );


    if (
        !reviews ||
        reviews.length === 0
    ) {

        if (countElement) {

            countElement.textContent =
                "0 Reviews";
        }


        container.innerHTML = `

            <div class="empty-reviews">

                <div class="empty-review-icon">
                    ⭐
                </div>

                <h3>
                    No Reviews Yet
                </h3>

                <p>
                    You haven't submitted any product reviews yet.
                </p>

            </div>

        `;

        return;
    }


    if (countElement) {

        countElement.textContent =
            `${reviews.length} ${
                reviews.length === 1
                    ? "Review"
                    : "Reviews"
            }`;

    }


    container.innerHTML =
        reviews
            .map(
                review =>
                    createReviewCard(
                        review
                    )
            )
            .join("");
}



// =========================================================
// CREATE REVIEW CARD
// =========================================================

function createReviewCard(
    review
) {

    const stars =
        createStars(
            review.rating
        );


    const statusClass =
        getStatusClass(
            review.status
        );


    const statusText =
        formatStatus(
            review.status
        );


    return `

        <article class="review-card">


            <!-- TOP -->

            <div class="review-card-top">


                <div class="review-product">

                    <div class="product-review-icon">
                        🛒
                    </div>


                    <div>

                        <h3>
                            ${escapeHtml(
                                review.productName ||
                                "Product"
                            )}
                        </h3>

                        <p>
                            Product ID:
                            #${review.productId}
                        </p>

                    </div>

                </div>


                <span
                    class="review-status ${statusClass}">

                    ${statusText}

                </span>

            </div>



            <!-- RATING -->

            <div class="review-rating">

                <span class="stars">
                    ${stars}
                </span>

                <strong>
                    ${review.rating}/5
                </strong>

            </div>



            <!-- COMMENT -->

            <div class="review-comment">

                ${
                    review.comment
                        ?
                        `
                        <p>
                            "${escapeHtml(
                                review.comment
                            )}"
                        </p>
                        `
                        :
                        `
                        <p class="no-comment">
                            No comment provided.
                        </p>
                        `
                }

            </div>



            <!-- FOOTER -->

            <div class="review-card-footer">

                <span>

                    Submitted:
                    ${formatDate(
                        review.createdAt
                    )}

                </span>


                ${
                    review.updatedAt &&
                    review.updatedAt !==
                        review.createdAt
                        ?
                        `
                        <span>

                            Updated:
                            ${formatDate(
                                review.updatedAt
                            )}

                        </span>
                        `
                        :
                        ""
                }

            </div>


        </article>

    `;
}



// =========================================================
// SUBMIT REVIEW
// =========================================================

async function submitReview(
    event
) {

    event.preventDefault();


    const productId =
        Number(
            document.getElementById(
                "productId"
            ).value
        );


    const ratingElement =
        document.querySelector(
            'input[name="rating"]:checked'
        );


    const comment =
        document.getElementById(
            "reviewComment"
        ).value.trim();


    const message =
        document.getElementById(
            "reviewMessage"
        );


    const button =
        document.getElementById(
            "submitReviewBtn"
        );


    // =====================================================
    // VALIDATION
    // =====================================================

    if (!productId || productId <= 0) {

        showReviewMessage(
            "Please enter a valid product ID.",
            true
        );

        return;
    }


    if (!ratingElement) {

        showReviewMessage(
            "Please select a rating.",
            true
        );

        return;
    }


    const rating =
        Number(
            ratingElement.value
        );


    if (
        rating < 1 ||
        rating > 5
    ) {

        showReviewMessage(
            "Rating must be between 1 and 5.",
            true
        );

        return;
    }


    if (comment.length > 1000) {

        showReviewMessage(
            "Comment cannot exceed 1000 characters.",
            true
        );

        return;
    }



    // =====================================================
    // DISABLE BUTTON
    // =====================================================

    button.disabled = true;

    button.textContent =
        "Submitting...";


    if (message) {

        message.textContent = "";

        message.className =
            "review-message";
    }



    // =====================================================
    // CREATE REQUEST
    // =====================================================

    const request = {

        productId:
            productId,

        rating:
            rating,

        comment:
            comment || null

    };


    try {

        await apiRequest(
            "/reviews",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        request
                    )
            }
        );


        showReviewMessage(
            "Review submitted successfully. It is now pending approval.",
            false
        );


        document
            .getElementById(
                "reviewForm"
            )
            .reset();


        // Keep 5 stars selected

        const fiveStar =
            document.querySelector(
                'input[name="rating"][value="5"]'
            );


        if (fiveStar) {

            fiveStar.checked = true;
        }


        await loadReviews();


    } catch (error) {

        console.error(
            "Submit review error:",
            error
        );


        showReviewMessage(
            error.message,
            true
        );

    } finally {

        button.disabled = false;

        button.textContent =
            "⭐ Submit Review";

    }
}



// =========================================================
// SHOW MESSAGE
// =========================================================

function showReviewMessage(
    message,
    isError
) {

    const element =
        document.getElementById(
            "reviewMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        isError
            ? "review-message error"
            : "review-message success";
}



// =========================================================
// CREATE STARS
// =========================================================

function createStars(
    rating
) {

    let stars = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        stars +=
            i <= rating
                ? "★"
                : "☆";

    }


    return stars;
}



// =========================================================
// STATUS CLASS
// =========================================================

function getStatusClass(
    status
) {

    switch (status) {

        case "PENDING":
            return "status-pending";

        case "APPROVED":
            return "status-approved";

        case "REJECTED":
            return "status-rejected";

        default:
            return "";

    }
}



// =========================================================
// FORMAT STATUS
// =========================================================

function formatStatus(
    status
) {

    if (!status) {
        return "-";
    }


    return status
        .replaceAll(
            "_",
            " "
        )
        .toLowerCase()
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );
}



// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(
    dateTime
) {

    if (!dateTime) {
        return "-";
    }


    const date =
        new Date(
            dateTime
        );


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}



// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}