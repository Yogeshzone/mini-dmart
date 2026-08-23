// =========================================================
// PAYMENTS PAGE
// =========================================================


// =========================================================
// LOAD MY PAYMENTS
// =========================================================

async function loadPayments() {

    const container =
        document.getElementById(
            "paymentsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="payments-loading">

            <div class="payment-spinner"></div>

            <p>
                Loading your payments...
            </p>

        </div>

    `;


    try {

        const payments =
            await apiRequest(
                "/payments"
            );


        displayPayments(
            payments
        );


    } catch (error) {

        console.error(
            "Failed to load payments:",
            error
        );


        container.innerHTML = `

            <div class="payments-error">

                <div class="error-icon">
                    ⚠️
                </div>

                <h3>
                    Failed to Load Payments
                </h3>

                <p>
                    ${escapeHtml(error.message)}
                </p>

                <button
                    onclick="loadPayments()"
                    class="retry-payment-btn">

                    Try Again

                </button>

            </div>

        `;

    }

}


// =========================================================
// DISPLAY PAYMENTS
// =========================================================

function displayPayments(
    payments
) {

    const container =
        document.getElementById(
            "paymentsContainer"
        );


    updatePaymentStatistics(
        payments
    );


    if (
        !payments ||
        payments.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-payments">

                <div class="empty-payment-icon">
                    💳
                </div>

                <h2>
                    No Payments Yet
                </h2>

                <p>
                    You don't have any payment transactions yet.
                </p>

                <a
                    href="orders.html"
                    class="view-orders-btn">

                    View My Orders

                </a>

            </div>

        `;

        return;
    }


    container.innerHTML =
        payments.map(
            payment =>
                createPaymentCard(
                    payment
                )
        ).join("");

}


// =========================================================
// CREATE PAYMENT CARD
// =========================================================

function createPaymentCard(
    payment
) {

    const statusClass =
        getPaymentStatusClass(
            payment.status
        );


    const statusText =
        formatPaymentStatus(
            payment.status
        );


    return `

        <article class="payment-card">


            <!-- PAYMENT HEADER -->

            <div class="payment-card-header">

                <div class="payment-order-info">

                    <div class="payment-icon">
                        💳
                    </div>

                    <div>

                        <span class="payment-label">
                            Order
                        </span>

                        <h3>
                            ${escapeHtml(
                                payment.orderNumber ||
                                `#${payment.orderId}`
                            )}
                        </h3>

                    </div>

                </div>


                <span
                    class="payment-status ${statusClass}">

                    ${statusText}

                </span>

            </div>



            <!-- PAYMENT DETAILS -->

            <div class="payment-details">


                <div class="payment-detail">

                    <span>
                        Transaction ID
                    </span>

                    <strong>
                        ${escapeHtml(
                            payment.transactionId || "-"
                        )}
                    </strong>

                </div>


                <div class="payment-detail">

                    <span>
                        Amount
                    </span>

                    <strong class="payment-amount">

                        ₹${formatAmount(
                            payment.amount
                        )}

                    </strong>

                </div>


                <div class="payment-detail">

                    <span>
                        Payment Date
                    </span>

                    <strong>
                        ${formatDate(
                            payment.createdAt
                        )}
                    </strong>

                </div>


                <div class="payment-detail">

                    <span>
                        Last Updated
                    </span>

                    <strong>
                        ${formatDate(
                            payment.updatedAt
                        )}
                    </strong>

                </div>

            </div>



            <!-- STATUS MESSAGE -->

            <div class="payment-status-message ${statusClass}">

                ${getStatusMessage(
                    payment.status
                )}

            </div>



            <!-- ACTIONS -->

            <div class="payment-card-actions">

                <button
                    class="view-order-payment-btn"
                    onclick="viewOrder(
                        ${payment.orderId}
                    )">

                    📦 View Order

                </button>

            </div>


        </article>

    `;

}


// =========================================================
// UPDATE PAYMENT STATISTICS
// =========================================================

function updatePaymentStatistics(
    payments
) {

    const totalPayments =
        payments
            ? payments.length
            : 0;


    const successfulPayments =
        payments
            ? payments.filter(
                payment =>
                    payment.status === "SUCCESS"
            ).length
            : 0;


    const pendingPayments =
        payments
            ? payments.filter(
                payment =>
                    payment.status === "PENDING"
            ).length
            : 0;


    const totalPaid =
        payments
            ? payments
                .filter(
                    payment =>
                        payment.status === "SUCCESS"
                )
                .reduce(
                    (
                        total,
                        payment
                    ) =>
                        total +
                        Number(
                            payment.amount || 0
                        ),
                    0
                )
            : 0;


    const totalElement =
        document.getElementById(
            "totalPayments"
        );


    const successfulElement =
        document.getElementById(
            "successfulPayments"
        );


    const pendingElement =
        document.getElementById(
            "pendingPayments"
        );


    const totalPaidElement =
        document.getElementById(
            "totalPaid"
        );


    if (totalElement) {

        totalElement.textContent =
            totalPayments;

    }


    if (successfulElement) {

        successfulElement.textContent =
            successfulPayments;

    }


    if (pendingElement) {

        pendingElement.textContent =
            pendingPayments;

    }


    if (totalPaidElement) {

        totalPaidElement.textContent =
            `₹${formatAmount(
                totalPaid
            )}`;

    }

}


// =========================================================
// PAYMENT STATUS CLASS
// =========================================================

function getPaymentStatusClass(
    status
) {

    switch (status) {

        case "SUCCESS":
            return "payment-success";

        case "FAILED":
            return "payment-failed";

        case "REFUNDED":
            return "payment-refunded";

        case "PENDING":
            return "payment-pending";

        default:
            return "payment-unknown";
    }

}


// =========================================================
// FORMAT PAYMENT STATUS
// =========================================================

function formatPaymentStatus(
    status
) {

    if (!status) {
        return "Unknown";
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
// STATUS MESSAGE
// =========================================================

function getStatusMessage(
    status
) {

    switch (status) {

        case "SUCCESS":

            return `
                <span>
                    ✓ Payment completed successfully.
                </span>
            `;


        case "PENDING":

            return `
                <span>
                    ⏳ Payment is currently pending.
                </span>
            `;


        case "FAILED":

            return `
                <span>
                    ✕ This payment was unsuccessful.
                </span>
            `;


        case "REFUNDED":

            return `
                <span>
                    ↩ Payment amount has been refunded.
                </span>
            `;


        default:

            return `
                <span>
                    Payment status unavailable.
                </span>
            `;

    }

}


// =========================================================
// VIEW ORDER
// =========================================================

function viewOrder(
    orderId
) {

    window.location.href =
        `order-details.html?id=${orderId}`;

}


// =========================================================
// FORMAT AMOUNT
// =========================================================

function formatAmount(
    amount
) {

    const number =
        Number(amount || 0);


    return number.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
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


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


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


// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPayments();

    }
);