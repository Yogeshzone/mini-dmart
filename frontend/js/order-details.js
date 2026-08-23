// =========================================================
// GET ORDER ID FROM URL
// =========================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const orderId =
    urlParams.get("id");


// =========================================================
// LOAD ORDER DETAILS
// =========================================================

async function loadOrderDetails() {

    const container =
        document.getElementById(
            "orderDetails"
        );


    if (!orderId) {

        container.innerHTML = `

            <div class="error-message">

                <h2>
                    Order Not Found
                </h2>

                <p>
                    No order ID was provided.
                </p>

                <button
                    onclick="goBackToOrders()">

                    Back to Orders

                </button>

            </div>

        `;

        return;
    }


    try {

        const order =
            await apiRequest(
                `/orders/${orderId}`
            );


        displayOrderDetails(
            order
        );


    } catch (error) {

        console.error(
            "Failed to load order:",
            error
        );


        container.innerHTML = `

            <div class="error-message">

                <h2>
                    Failed to Load Order
                </h2>

                <p>
                    ${error.message}
                </p>

                <button
                    onclick="goBackToOrders()">

                    Back to Orders

                </button>

            </div>

        `;
    }
}


// =========================================================
// DISPLAY ORDER
// =========================================================

function displayOrderDetails(order) {

    const container =
        document.getElementById(
            "orderDetails"
        );


    let itemsHTML = "";


    // =====================================================
    // ORDER ITEMS
    // =====================================================

    if (
        order.items &&
        order.items.length > 0
    ) {

        order.items.forEach(item => {

            let returnButton = "";


            // =================================================
            // RETURN IS ALLOWED ONLY AFTER ORDER COMPLETION
            // =================================================

            if (
                order.status === "DELIVERED" ||
                order.status === "PICKED_UP"
            ) {

                returnButton = `

                    <button
                        class="return-order-btn"
                        onclick="
                            requestReturn(
                                ${item.id}
                            )
                        ">

                        ↩️ Request Return

                    </button>

                `;
            }


            itemsHTML += `

                <div class="order-item">

                    <div class="item-info">

                        <h3>
                            ${item.productName}
                        </h3>

                        <p>
                            Quantity:
                            ${item.quantity}
                        </p>

                    </div>


                    <div class="item-price">

                        <p>
                            ₹${item.unitPrice}
                            ×
                            ${item.quantity}
                        </p>

                        <strong>
                            ₹${item.subtotal}
                        </strong>


                        ${returnButton}

                    </div>

                </div>

            `;

        });

    } else {

        itemsHTML = `

            <p>
                No items found.
            </p>

        `;
    }


    // =====================================================
    // FULFILLMENT
    // =====================================================

    let fulfillmentHTML = "";


    if (
        order.fulfillmentType ===
        "HOME_DELIVERY"
    ) {

        fulfillmentHTML = `

            <div class="detail-row">

                <strong>
                    Fulfillment
                </strong>

                <span>
                    Home Delivery
                </span>

            </div>


            <div class="detail-row">

                <strong>
                    Delivery Address
                </strong>

                <span>
                    ${order.deliveryAddress || "-"}
                </span>

            </div>

        `;

    } else {

        fulfillmentHTML = `

            <div class="detail-row">

                <strong>
                    Fulfillment
                </strong>

                <span>
                    Store Pickup
                </span>

            </div>


            <div class="detail-row">

                <strong>
                    Pickup Date
                </strong>

                <span>
                    ${order.pickupDate || "-"}
                </span>

            </div>


            <div class="detail-row">

                <strong>
                    Pickup Time
                </strong>

                <span>

                    ${
                        order.pickupStartTime || "-"
                    }

                    -

                    ${
                        order.pickupEndTime || "-"
                    }

                </span>

            </div>

        `;
    }


    // =====================================================
    // ORDER DETAILS HTML
    // =====================================================

    container.innerHTML = `

        <!-- ORDER HEADER -->

        <div class="order-details-card">

            <div class="order-details-header">

                <div>

                    <h2>
                        ${order.orderNumber}
                    </h2>

                    <p>
                        Order #${order.id}
                    </p>

                </div>


                <span
                    class="order-status
                    ${getStatusClass(order.status)}">

                    ${formatStatus(order.status)}

                </span>

            </div>


            <!-- ORDER INFORMATION -->

            <div class="order-information">

                <h2>
                    Order Information
                </h2>


                <div class="detail-row">

                    <strong>
                        Order Number
                    </strong>

                    <span>
                        ${order.orderNumber}
                    </span>

                </div>


                <div class="detail-row">

                    <strong>
                        Status
                    </strong>

                    <span>
                        ${formatStatus(order.status)}
                    </span>

                </div>


                ${fulfillmentHTML}


                <div class="detail-row">

                    <strong>
                        Ordered On
                    </strong>

                    <span>
                        ${formatDate(order.createdAt)}
                    </span>

                </div>

            </div>


            <!-- ITEMS -->

            <div class="order-items">

                <h2>
                    Order Items
                </h2>

                ${itemsHTML}

            </div>


            <!-- PRICE SUMMARY -->

            <div class="order-summary">

                <h2>
                    Price Summary
                </h2>


                <div class="summary-row">

                    <span>
                        Subtotal
                    </span>

                    <span>
                        ₹${order.subtotal}
                    </span>

                </div>


                <div class="summary-row">

                    <span>
                        Delivery Charge
                    </span>

                    <span>
                        ₹${order.deliveryCharge}
                    </span>

                </div>


                <hr>


                <div class="summary-row total-row">

                    <strong>
                        Total Amount
                    </strong>

                    <strong>
                        ₹${order.totalAmount}
                    </strong>

                </div>

            </div>


            <!-- ACTIONS -->

            <div class="order-actions">

                ${
                    canCancelOrder(order.status)
                    ?

                    `
                    <button
                        class="cancel-order-btn"
                        onclick="cancelOrder()">

                        Cancel Order

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
// REQUEST RETURN
// =========================================================

async function requestReturn(orderItemId) {

    const reason =
        prompt(
            "Enter the reason for return:"
        );


    // User clicked Cancel

    if (reason === null) {
        return;
    }


    // Validate reason

    if (!reason.trim()) {

        alert(
            "Return reason is required."
        );

        return;
    }


    try {

        await apiRequest(
            "/returns",
            {
                method: "POST",

                body: JSON.stringify({

                    orderItemId:
                        orderItemId,

                    reason:
                        reason.trim()

                })
            }
        );


        alert(
            "Return request submitted successfully!"
        );


        // Reload order details

        await loadOrderDetails();


    } catch (error) {

        console.error(
            "Return request error:",
            error
        );


        alert(
            error.message
        );
    }
}


// =========================================================
// CANCEL ORDER
// =========================================================

async function cancelOrder() {

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


        await loadOrderDetails();


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
// CANCEL CHECK
// =========================================================

function canCancelOrder(status) {

    return (
        status === "PENDING" ||
        status === "CONFIRMED"
    );
}


// =========================================================
// FORMAT STATUS
// =========================================================

function formatStatus(status) {

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
// STATUS CLASS
// =========================================================

function getStatusClass(status) {

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


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(dateTime) {

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
// BACK TO ORDERS
// =========================================================

function goBackToOrders() {

    window.location.href =
        "orders.html";
}


// =========================================================
// LOAD ON PAGE OPEN
// =========================================================

loadOrderDetails();