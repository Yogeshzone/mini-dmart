// =========================================================
// CUSTOMER ORDERS
// =========================================================

async function loadMyOrders() {

    const container =
        document.getElementById(
            "ordersContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <p>
            Loading orders...
        </p>
    `;

    try {

        const orders =
            await apiRequest(
                "/orders"
            );

        displayOrders(orders);

    } catch (error) {

        console.error(
            "Failed to load orders:",
            error
        );

        container.innerHTML = `

            <div class="error-message">

                <h3>
                    Failed to load orders
                </h3>

                <p>
                    ${error.message}
                </p>

                <button
                    onclick="loadMyOrders()">

                    Try Again

                </button>

            </div>

        `;
    }
}


// =========================================================
// DISPLAY ORDERS
// =========================================================

function displayOrders(orders) {

    const container =
        document.getElementById(
            "ordersContainer"
        );

    container.innerHTML = "";

    if (
        !orders ||
        orders.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-orders">

                <h2>
                    No Orders Yet
                </h2>

                <p>
                    You haven't placed any orders yet.
                </p>

                <a href="../index.html">

                    Start Shopping

                </a>

            </div>

        `;

        return;
    }


    orders.forEach(order => {

        const orderCard =
            document.createElement("div");

        orderCard.className =
            "order-card";


        orderCard.innerHTML = `

            <div class="order-card-header">

                <div>

                    <h2>
                        ${order.orderNumber}
                    </h2>

                    <p>
                        Order #${order.id}
                    </p>

                </div>


                <span
                    class="order-status ${getStatusClass(order.status)}">

                    ${formatStatus(order.status)}

                </span>

            </div>


            <div class="order-card-body">

                <div class="order-info">

                    <strong>
                        Fulfillment
                    </strong>

                    <span>
                        ${formatFulfillment(
                            order.fulfillmentType
                        )}
                    </span>

                </div>


                <div class="order-info">

                    <strong>
                        Items
                    </strong>

                    <span>
                        ${getTotalQuantity(
                            order.items
                        )}
                    </span>

                </div>


                <div class="order-info">

                    <strong>
                        Total
                    </strong>

                    <span>
                        ₹${order.totalAmount}
                    </span>

                </div>


                <div class="order-info">

                    <strong>
                        Ordered On
                    </strong>

                    <span>
                        ${formatDate(
                            order.createdAt
                        )}
                    </span>

                </div>

            </div>


            <!-- PAYMENT STATUS -->

            <div
                class="order-payment-section"
                id="payment-section-${order.id}">

                <strong>
                    Payment
                </strong>

                <span>
                    Checking payment...
                </span>

            </div>


            <!-- ACTIONS -->

            <div class="order-card-actions">

                <button
                    class="view-order-btn"
                    onclick="viewOrderDetails(${order.id})">

                    View Details

                </button>


                ${
                    canCancelOrder(order.status)
                    ?
                    `
                    <button
                        class="cancel-order-btn"
                        onclick="cancelMyOrder(${order.id})">

                        Cancel Order

                    </button>
                    `
                    :
                    ""
                }

            </div>

        `;


        container.appendChild(
            orderCard
        );


        // Load payment information
        loadOrderPayment(
            order.id
        );

    });
}


// =========================================================
// LOAD PAYMENT FOR ORDER
// =========================================================

async function loadOrderPayment(orderId) {

    const paymentSection =
        document.getElementById(
            `payment-section-${orderId}`
        );

    if (!paymentSection) {
        return;
    }


    try {

        const payment =
            await apiRequest(
                `/payments/order/${orderId}`
            );


        displayPaymentStatus(
            orderId,
            payment
        );


    } catch (error) {

        // Payment does not exist yet
        displayPaymentNotCreated(
            orderId
        );
    }
}


// =========================================================
// DISPLAY PAYMENT STATUS
// =========================================================

function displayPaymentStatus(
    orderId,
    payment
) {

    const paymentSection =
        document.getElementById(
            `payment-section-${orderId}`
        );

    if (!paymentSection) {
        return;
    }


    let paymentClass =
        "payment-pending";


    if (payment.status === "SUCCESS") {

        paymentClass =
            "payment-success";

    } else if (
        payment.status === "FAILED"
    ) {

        paymentClass =
            "payment-failed";

    } else if (
        payment.status === "REFUNDED"
    ) {

        paymentClass =
            "payment-refunded";
    }


    paymentSection.innerHTML = `

        <div>

            <strong>
                Payment
            </strong>

            <span
                class="${paymentClass}">

                ${formatPaymentStatus(
                    payment.status
                )}

            </span>

        </div>


        <div>

            <small>
                Transaction:
                ${payment.transactionId}
            </small>

        </div>

    `;
}


// =========================================================
// DISPLAY PAYMENT NOT CREATED
// =========================================================

function displayPaymentNotCreated(
    orderId
) {

    const paymentSection =
        document.getElementById(
            `payment-section-${orderId}`
        );

    if (!paymentSection) {
        return;
    }


    paymentSection.innerHTML = `

        <div>

            <strong>
                Payment
            </strong>

            <span class="payment-not-created">

                Not Paid

            </span>

        </div>


        <button
            class="pay-now-btn"
            onclick="createPayment(${orderId})">

            💳 Pay Now

        </button>

    `;
}


// =========================================================
// CREATE PAYMENT
// =========================================================

async function createPayment(orderId) {

    const confirmed =
        confirm(
            `Do you want to make payment for Order #${orderId}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const payment =
            await apiRequest(
                "/payments",
                {
                    method: "POST",

                    body: JSON.stringify({

                        orderId:
                            orderId

                    })
                }
            );


        alert(
            "Payment created successfully!\n\n" +

            "Transaction ID: " +
            payment.transactionId +

            "\n\nAmount: ₹" +
            payment.amount +

            "\n\nStatus: " +
            payment.status
        );


        await loadOrderPayment(
            orderId
        );


    } catch (error) {

        console.error(
            "Create payment error:",
            error
        );


        alert(
            error.message
        );
    }
}


// =========================================================
// VIEW ORDER DETAILS
// =========================================================

function viewOrderDetails(
    orderId
) {

    window.location.href =
        `order-details.html?id=${orderId}`;
}


// =========================================================
// CANCEL ORDER
// =========================================================

async function cancelMyOrder(
    orderId
) {

    const confirmed =
        confirm(
            "Are you sure you want to cancel this order?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/orders/${orderId}/cancel`,
            {
                method: "PUT"
            }
        );


        alert(
            "Order cancelled successfully."
        );


        await loadMyOrders();


    } catch (error) {

        console.error(
            "Cancel order error:",
            error
        );


        alert(
            error.message
        );
    }
}


// =========================================================
// CHECK WHETHER ORDER CAN BE CANCELLED
// =========================================================

function canCancelOrder(
    status
) {

    return (
        status === "PENDING" ||
        status === "CONFIRMED"
    );
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
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );
}


// =========================================================
// FORMAT PAYMENT STATUS
// =========================================================

function formatPaymentStatus(
    status
) {

    if (!status) {
        return "-";
    }


    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );
}


// =========================================================
// FORMAT FULFILLMENT
// =========================================================

function formatFulfillment(
    fulfillmentType
) {

    if (
        fulfillmentType ===
        "HOME_DELIVERY"
    ) {

        return "Home Delivery";
    }


    if (
        fulfillmentType ===
        "STORE_PICKUP"
    ) {

        return "Store Pickup";
    }


    return fulfillmentType || "-";
}


// =========================================================
// GET TOTAL QUANTITY
// =========================================================

function getTotalQuantity(
    items
) {

    if (
        !items ||
        items.length === 0
    ) {

        return 0;
    }


    return items.reduce(
        (total, item) =>
            total + item.quantity,
        0
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
        new Date(dateTime);


    return date.toLocaleString(
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
// STATUS CSS CLASS
// =========================================================

function getStatusClass(
    status
) {

    switch (status) {

        case "PENDING":
            return "status-pending";

        case "CONFIRMED":
            return "status-confirmed";

        case "PREPARING":
            return "status-preparing";

        case "READY_FOR_PICKUP":
            return "status-ready";

        case "OUT_FOR_DELIVERY":
            return "status-delivery";

        case "PICKED_UP":
            return "status-picked";

        case "DELIVERED":
            return "status-delivered";

        case "CANCELLED":
            return "status-cancelled";

        default:
            return "";
    }
}