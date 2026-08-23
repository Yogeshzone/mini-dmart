// =========================================================
// ADMIN DASHBOARD
// =========================================================

async function loadAdminDashboard() {

    try {

        const dashboard =
            await apiRequest("/admin/dashboard");

        const totalProducts =
            document.getElementById("totalProducts");

        const totalOrders =
            document.getElementById("totalOrders");

        const totalExchanges =
            document.getElementById("totalExchanges");

        const totalUsers =
            document.getElementById("totalUsers");

        const totalAuditLogs =
            document.getElementById("totalAuditLogs");


        if (totalProducts) {
            totalProducts.textContent =
                dashboard.totalProducts;
        }

        if (totalOrders) {
            totalOrders.textContent =
                dashboard.totalOrders;
        }

        if (totalExchanges) {
            totalExchanges.textContent =
                dashboard.totalExchanges;
        }

        if (totalUsers) {
            totalUsers.textContent =
                dashboard.totalUsers;
        }

        if (totalAuditLogs) {
            totalAuditLogs.textContent =
                dashboard.totalAuditLogs;
        }

    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );

        const errorElement =
            document.getElementById(
                "dashboardError"
            );

        if (errorElement) {

            errorElement.textContent =
                error.message;
        }
    }
}


// =========================================================
// LOAD PRODUCTS
// =========================================================

async function loadAdminProducts() {

    const tableBody =
        document.getElementById(
            "productTableBody"
        );

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="7">
                Loading products...
            </td>
        </tr>
    `;


    try {

        const products =
            await apiRequest("/products");


        displayAdminProducts(products);

    } catch (error) {

        console.error(
            "Failed to load products:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="color: red;">

                    Failed to load products:
                    ${error.message}

                </td>
            </tr>
        `;
    }
}


// =========================================================
// DISPLAY PRODUCTS
// =========================================================

function displayAdminProducts(products) {

    const tableBody =
        document.getElementById(
            "productTableBody"
        );


    tableBody.innerHTML = "";


    if (!products || products.length === 0) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="7">
                    No products found.
                </td>

            </tr>
        `;

        return;
    }


    products.forEach(product => {

        const row =
            document.createElement("tr");


        const status =
            product.active
                ? "Active"
                : "Inactive";


        row.innerHTML = `

            <td>
                ${product.id}
            </td>

            <td>

                <div class="product-name-cell">

                    <strong>
                        ${product.name}
                    </strong>

                    <small>
                        ${product.description || ""}
                    </small>

                </div>

            </td>

            <td>
                ${product.categoryName || product.categoryId}
            </td>

            <td>
                ₹${product.price}
            </td>

            <td>
                ${product.stockQuantity}
            </td>

            <td>

                <span class="
                    ${product.active
                        ? "status-active"
                        : "status-inactive"}
                ">

                    ${status}

                </span>

            </td>

            <td>

            <div class="table-actions">

                <button
                    class="edit-btn"
                    onclick="
                        editProduct(${product.id})
                    ">

                    Edit

                </button>

                <button
                    class="stock-btn"
                    onclick="
                        updateProductStock(${product.id}, '${product.name}', ${product.stockQuantity})
                    ">

                    Stock

                </button>

                <button
                    class="delete-btn"
                    onclick="
                        deleteProduct(${product.id})
                    ">

                    Delete

                </button>

            </div>

            </td>
        `;


        tableBody.appendChild(row);

    });
}


// =========================================================
// OPEN CREATE PRODUCT MODAL
// =========================================================

function openCreateProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );

    const title =
        document.getElementById(
            "productModalTitle"
        );

    const submitButton =
        document.getElementById(
            "productSubmitButton"
        );


    document.getElementById(
        "productForm"
    ).reset();


    document.getElementById(
        "productId"
    ).value = "";


    document.getElementById(
        "productActive"
    ).checked = true;


    title.textContent =
        "Add Product";


    submitButton.textContent =
        "Create Product";


    modal.classList.remove("hidden");
}


// =========================================================
// CLOSE PRODUCT MODAL
// =========================================================

function closeProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    modal.classList.add("hidden");


    document.getElementById(
        "productForm"
    ).reset();


    document.getElementById(
        "productId"
    ).value = "";
}


// =========================================================
// CREATE / UPDATE PRODUCT
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "productForm"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const productId =
                    document.getElementById(
                        "productId"
                    ).value;


                const request = {

                    name:
                        document.getElementById(
                            "productName"
                        ).value.trim(),

                    description:
                        document.getElementById(
                            "productDescription"
                        ).value.trim(),

                    price:
                        Number(
                            document.getElementById(
                                "productPrice"
                            ).value
                        ),

                    stockQuantity:
                        Number(
                            document.getElementById(
                                "productStock"
                            ).value
                        ),

                    imageUrl:
                        document.getElementById(
                            "productImage"
                        ).value.trim(),

                    categoryId:
                        Number(
                            document.getElementById(
                                "productCategory"
                            ).value
                        ),

                    active:
                        document.getElementById(
                            "productActive"
                        ).checked
                };


                try {

                    // =========================
                    // UPDATE
                    // =========================

                    if (productId) {

                        await apiRequest(
                            `/products/${productId}`,
                            {
                                method: "PUT",

                                body:
                                    JSON.stringify(request)
                            }
                        );


                        alert(
                            "Product updated successfully!"
                        );

                    }

                    // =========================
                    // CREATE
                    // =========================

                    else {

                        await apiRequest(
                            "/products",
                            {
                                method: "POST",

                                body:
                                    JSON.stringify(request)
                            }
                        );


                        alert(
                            "Product created successfully!"
                        );
                    }


                    closeProductModal();


                    await loadAdminProducts();


                } catch (error) {

                    console.error(
                        "Product save error:",
                        error
                    );


                    alert(
                        error.message
                    );
                }

            }
        );

    }
);


// =========================================================
// EDIT PRODUCT
// =========================================================

async function editProduct(productId) {

    try {

        const product =
            await apiRequest(
                `/products/${productId}`
            );


        document.getElementById(
            "productId"
        ).value =
            product.id;


        document.getElementById(
            "productName"
        ).value =
            product.name || "";


        document.getElementById(
            "productDescription"
        ).value =
            product.description || "";


        document.getElementById(
            "productPrice"
        ).value =
            product.price;


        document.getElementById(
            "productStock"
        ).value =
            product.stockQuantity;


        document.getElementById(
            "productImage"
        ).value =
            product.imageUrl || "";


        document.getElementById(
            "productActive"
        ).checked =
            product.active;


        // Load categories and select
        // the product's current category

        await loadProductCategories(
            product.categoryId
        );


        document.getElementById(
            "productModalTitle"
        ).textContent =
            "Edit Product";


        document.getElementById(
            "productSubmitButton"
        ).textContent =
            "Update Product";


        document.getElementById(
            "productModal"
        ).classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Edit product error:",
            error
        );


        alert(
            error.message
        );
    }
}


// =========================================================
// DELETE PRODUCT
// =========================================================

async function deleteProduct(productId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/products/${productId}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Product deleted successfully!"
        );


        await loadAdminProducts();


    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );


        alert(
            error.message
        );
    }
}

// =========================================================
// UPDATE PRODUCT STOCK
// =========================================================

async function updateProductStock(
    productId,
    productName,
    currentStock
) {

    const quantityInput =
        prompt(
            `Product: ${productName}\n` +
            `Current stock: ${currentStock}\n\n` +
            `Enter stock change:\n` +
            `Example: 5 to add 5\n` +
            `Example: -5 to remove 5`,
            "1"
        );


    // User clicked Cancel
    if (quantityInput === null) {
        return;
    }


    const quantity =
        Number(quantityInput);


    // Validate number
    if (!Number.isInteger(quantity)) {

        alert(
            "Please enter a valid whole number."
        );

        return;
    }


    // Don't allow zero
    if (quantity === 0) {

        alert(
            "Stock change cannot be zero."
        );

        return;
    }


    // Prevent stock from becoming negative
    if (currentStock + quantity < 0) {

        alert(
            `Stock cannot become negative.\n\n` +
            `Current stock: ${currentStock}\n` +
            `Requested change: ${quantity}`
        );

        return;
    }


    try {

        const updatedProduct =
            await apiRequest(
                `/products/${productId}/stock?quantity=${quantity}`,
                {
                    method: "PATCH"
                }
            );


        alert(
            `Stock updated successfully!\n\n` +
            `Product: ${updatedProduct.name}\n` +
            `Old stock: ${currentStock}\n` +
            `New stock: ${updatedProduct.stockQuantity}`
        );


        await loadAdminProducts();


    } catch (error) {

        console.error(
            "Stock update error:",
            error
        );


        alert(
            error.message
        );
    }
}

// =========================================================
// ADMIN ORDERS
// =========================================================

async function loadAdminOrders() {

    const tableBody =
        document.getElementById(
            "ordersTableBody"
        );

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="8">
                Loading orders...
            </td>
        </tr>
    `;


    try {

        const orders =
            await apiRequest(
                "/orders/admin"
            );


        displayAdminOrders(orders);

    } catch (error) {

        console.error(
            "Failed to load orders:",
            error
        );


        tableBody.innerHTML = `
            <tr>

                <td colspan="8"
                    style="color:red;">

                    Failed to load orders:
                    ${error.message}

                </td>

            </tr>
        `;
    }
}


// =========================================================
// DISPLAY ADMIN ORDERS
// =========================================================

function displayAdminOrders(orders) {

    const tableBody =
        document.getElementById(
            "ordersTableBody"
        );


    tableBody.innerHTML = "";


    if (!orders || orders.length === 0) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="8">
                    No orders found.
                </td>

            </tr>
        `;

        return;
    }


    orders.forEach(order => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                #${order.id}
            </td>

            <td>
                ${order.orderNumber || "-"}
            </td>

            <td>
                ${order.userId || "-"}
            </td>

            <td>
                ${order.fulfillmentType || "-"}
            </td>

            <td>
                ₹${order.totalAmount || 0}
            </td>

            <td>

                <span class="order-status">

                    ${order.status || "-"}

                </span>

            </td>

            <td>
                ${formatOrderDate(order.createdAt)}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="
                        updateAdminOrderStatus(
                            ${order.id},
                            '${order.status}'
                        )
                    ">

                    Update Status

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });
}


// =========================================================
// FORMAT ORDER DATE
// =========================================================

function formatOrderDate(date) {

    if (!date) {
        return "-";
    }


    return new Date(date)
        .toLocaleString();
}

// =========================================================
// UPDATE ADMIN ORDER STATUS
// =========================================================

async function updateAdminOrderStatus(
    orderId,
    currentStatus
) {

    // Get valid next statuses
    const validStatuses =
        getValidNextOrderStatuses(currentStatus);


    // No valid transitions
    if (validStatuses.length === 0) {

        alert(
            `Order #${orderId} is already in its final status: ${currentStatus}`
        );

        return;
    }


    // Build options
    const options =
        validStatuses
            .map(
                (status, index) =>
                    `${index + 1}. ${status}`
            )
            .join("\n");


    const selection =
        prompt(
            `Order #${orderId}\n\n` +
            `Current status: ${currentStatus}\n\n` +
            `Select the new status:\n\n` +
            options
        );


    // Cancel
    if (selection === null) {
        return;
    }


    const selectedNumber =
        Number(selection);


    // Validate selection
    if (
        !Number.isInteger(selectedNumber) ||
        selectedNumber < 1 ||
        selectedNumber > validStatuses.length
    ) {

        alert(
            "Invalid status selection."
        );

        return;
    }


    const newStatus =
        validStatuses[selectedNumber - 1];


    try {

        await apiRequest(
            `/orders/${orderId}/status`,
            {
                method: "PUT",

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );


        alert(
            `Order #${orderId} status updated successfully!\n\n` +
            `${currentStatus} → ${newStatus}`
        );


        await loadAdminOrders();


    } catch (error) {

        console.error(
            "Order status update error:",
            error
        );


        alert(
            error.message
        );
    }
}

// =========================================================
// GET VALID NEXT ORDER STATUSES
// =========================================================

function getValidNextOrderStatuses(
    currentStatus
) {

    switch (currentStatus) {

        case "PENDING":

            return [
                "CONFIRMED",
                "CANCELLED"
            ];


        case "CONFIRMED":

            return [
                "PREPARING",
                "CANCELLED"
            ];


        case "PREPARING":

            return [
                "READY_FOR_PICKUP",
                "OUT_FOR_DELIVERY"
            ];


        case "READY_FOR_PICKUP":

            return [
                "PICKED_UP"
            ];


        case "OUT_FOR_DELIVERY":

            return [
                "DELIVERED"
            ];


        case "DELIVERED":
        case "PICKED_UP":
        case "CANCELLED":

            return [];


        default:

            return [];
    }
}

// =========================================================
// ADMIN EXCHANGES
// =========================================================

async function loadAdminExchanges() {

    const tableBody =
        document.getElementById(
            "exchangesTableBody"
        );

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="8">
                Loading exchange requests...
            </td>
        </tr>
    `;


    try {

        const exchanges =
            await apiRequest(
                "/exchanges/admin"
            );


        displayAdminExchanges(exchanges);

    } catch (error) {

        console.error(
            "Failed to load exchanges:",
            error
        );


        tableBody.innerHTML = `
            <tr>

                <td colspan="8"
                    style="color:red;">

                    Failed to load exchanges:
                    ${error.message}

                </td>

            </tr>
        `;
    }
}


// =========================================================
// DISPLAY EXCHANGES
// =========================================================

function displayAdminExchanges(exchanges) {

    const tableBody =
        document.getElementById(
            "exchangesTableBody"
        );


    tableBody.innerHTML = "";


    if (!exchanges || exchanges.length === 0) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="8">
                    No exchange requests found.
                </td>

            </tr>
        `;

        return;
    }


    exchanges.forEach(exchange => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                #${exchange.id}
            </td>

            <td>
                #${exchange.orderItemId}
            </td>

            <td>
                Product #${exchange.replacementProductId}
            </td>

            <td>
                ${exchange.quantity || 0}
            </td>

            <td>
                ${exchange.reason || "-"}
            </td>

            <td>

                <span class="order-status">

                    ${exchange.status || "-"}

                </span>

            </td>

            <td>
                ${formatOrderDate(exchange.requestedAt)}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="
                        updateAdminExchangeStatus(
                            ${exchange.id},
                            '${exchange.status}'
                        )
                    ">

                    Update Status

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });
}


// =========================================================
// UPDATE EXCHANGE STATUS
// =========================================================

async function updateAdminExchangeStatus(
    exchangeId,
    currentStatus
) {

    const validStatuses =
        getValidNextExchangeStatuses(
            currentStatus
        );


    // No valid transitions
    if (validStatuses.length === 0) {

        alert(
            `Exchange #${exchangeId} is already in its final status: ${currentStatus}`
        );

        return;
    }


    const options =
        validStatuses
            .map(
                (status, index) =>
                    `${index + 1}. ${status}`
            )
            .join("\n");


    const selection =
        prompt(
            `Exchange #${exchangeId}\n\n` +
            `Current status: ${currentStatus}\n\n` +
            `Select the new status:\n\n` +
            options
        );


    if (selection === null) {
        return;
    }


    const selectedNumber =
        Number(selection);


    if (
        !Number.isInteger(selectedNumber) ||
        selectedNumber < 1 ||
        selectedNumber > validStatuses.length
    ) {

        alert(
            "Invalid status selection."
        );

        return;
    }


    const newStatus =
        validStatuses[
            selectedNumber - 1
        ];


    // Ask for staff remarks
    const staffRemarks =
        prompt(
            `Enter staff remarks for exchange #${exchangeId}:`,
            ""
        );


    if (staffRemarks === null) {
        return;
    }


    try {

        await apiRequest(
            `/exchanges/${exchangeId}/status`,
            {
                method: "PUT",

                body: JSON.stringify({

                    status: newStatus,

                    staffRemarks:
                        staffRemarks.trim()

                })
            }
        );


        alert(
            `Exchange #${exchangeId} updated successfully!\n\n` +
            `${currentStatus} → ${newStatus}`
        );


        await loadAdminExchanges();


    } catch (error) {

        console.error(
            "Exchange status update error:",
            error
        );


        alert(
            error.message
        );
    }
}


// =========================================================
// VALID EXCHANGE STATUS TRANSITIONS
// =========================================================

function getValidNextExchangeStatuses(
    currentStatus
) {

    switch (currentStatus) {

        case "REQUESTED":

            return [
                "APPROVED",
                "REJECTED"
            ];


        case "APPROVED":

            return [
                "COMPLETED"
            ];


        case "REJECTED":
        case "COMPLETED":

            return [];


        default:

            return [];
    }
}

// =========================================================
// ADMIN AUDIT LOGS
// =========================================================

let auditCurrentPage = 0;

const auditPageSize = 20;


// =========================================================
// LOAD AUDIT LOGS
// =========================================================

async function loadAuditLogs() {

    const tableBody =
        document.getElementById(
            "auditLogsTableBody"
        );

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="7">
                Loading audit logs...
            </td>
        </tr>
    `;


    try {

        const response =
            await apiRequest(
                `/audit-logs?page=${auditCurrentPage}&size=${auditPageSize}`
            );


        displayAuditLogs(response);


    } catch (error) {

        console.error(
            "Failed to load audit logs:",
            error
        );


        tableBody.innerHTML = `
            <tr>

                <td colspan="7"
                    style="color:red;">

                    Failed to load audit logs:
                    ${error.message}

                </td>

            </tr>
        `;
    }
}


// =========================================================
// DISPLAY AUDIT LOGS
// =========================================================

function displayAuditLogs(response) {

    const tableBody =
        document.getElementById(
            "auditLogsTableBody"
        );


    tableBody.innerHTML = "";


    const logs =
        response.content || [];


    if (logs.length === 0) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="7">
                    No audit logs found.
                </td>

            </tr>
        `;

        updateAuditPagination(response);

        return;
    }


    logs.forEach(log => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                #${log.id}
            </td>

            <td>
                <strong>
                    ${log.action || "-"}
                </strong>
            </td>

            <td>
                ${log.entityType || "-"}
            </td>

            <td>
                ${log.entityId ?? "-"}
            </td>

            <td>
                ${log.userId ?? "-"}
            </td>

            <td>
                ${log.details || "-"}
            </td>

            <td>
                ${formatOrderDate(log.createdAt)}
            </td>

        `;


        tableBody.appendChild(row);

    });


    updateAuditPagination(response);
}


// =========================================================
// UPDATE PAGINATION
// =========================================================

function updateAuditPagination(response) {

    const pageInfo =
        document.getElementById(
            "auditPageInfo"
        );

    const previousButton =
        document.getElementById(
            "previousPageBtn"
        );

    const nextButton =
        document.getElementById(
            "nextPageBtn"
        );


    if (!pageInfo) {
        return;
    }


    const currentPage =
        response.number ?? auditCurrentPage;


    const totalPages =
        response.totalPages ?? 1;


    pageInfo.textContent =
        `Page ${currentPage + 1} of ${totalPages}`;


    previousButton.disabled =
        currentPage <= 0;


    nextButton.disabled =
        currentPage >= totalPages - 1;
}


// =========================================================
// PREVIOUS PAGE
// =========================================================

function previousAuditPage() {

    if (auditCurrentPage <= 0) {
        return;
    }


    auditCurrentPage--;

    loadAuditLogs();
}


// =========================================================
// NEXT PAGE
// =========================================================

async function nextAuditPage() {

    auditCurrentPage++;

    await loadAuditLogs();
}

// =========================================================
// PICKUP SLOTS
// =========================================================

async function loadPickupSlots() {

    const tableBody =
        document.getElementById(
            "pickupSlotsTableBody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="8">
                Loading pickup slots...
            </td>
        </tr>
    `;

    try {

        /*
         * Load slots for a reasonable date range.
         *
         * We use today's date through 30 days ahead.
         */

        const today =
            new Date();

        const startDate =
            formatDateForApi(today);

        const endDateValue =
            new Date();

        endDateValue.setDate(
            endDateValue.getDate() + 30
        );

        const endDate =
            formatDateForApi(
                endDateValue
            );

        const slots =
            await apiRequest(
                `/pickup-slots/range?startDate=${startDate}&endDate=${endDate}`
            );

        displayPickupSlots(slots);

    } catch (error) {

        console.error(
            "Failed to load pickup slots:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="8"
                    class="error-message">

                    Failed to load pickup slots:
                    ${error.message}

                </td>
            </tr>
        `;
    }
}


// =========================================================
// DISPLAY PICKUP SLOTS
// =========================================================

function displayPickupSlots(slots) {

    const tableBody =
        document.getElementById(
            "pickupSlotsTableBody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    if (!slots ||
        slots.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    No pickup slots found.
                </td>
            </tr>
        `;

        return;
    }

    slots.forEach(slot => {

        const row =
            document.createElement(
                "tr"
            );

        row.innerHTML = `

            <td>
                #${slot.id}
            </td>

            <td>
                ${slot.slotDate || "-"}
            </td>

            <td>
                ${slot.startTime || "-"}
            </td>

            <td>
                ${slot.endTime || "-"}
            </td>

            <td>
                ${slot.capacity ?? 0}
            </td>

            <td>
                ${slot.bookedCount ?? 0}
            </td>

            <td>
                ${slot.availableCapacity ?? 0}
            </td>

            <td>

                <span class="${
                    slot.active
                        ? "active-status"
                        : "inactive-status"
                }">

                    ${
                        slot.active
                            ? "Active"
                            : "Inactive"
                    }

                </span>

            </td>

        `;

        tableBody.appendChild(row);

    });
}


// =========================================================
// CREATE PICKUP SLOT
// =========================================================

async function createPickupSlot(
    event
) {

    event.preventDefault();

    const slotDate =
        document.getElementById(
            "slotDate"
        ).value;

    const startTime =
        document.getElementById(
            "startTime"
        ).value;

    const endTime =
        document.getElementById(
            "endTime"
        ).value;

    const capacity =
        Number(
            document.getElementById(
                "capacity"
            ).value
        );


    if (!slotDate ||
        !startTime ||
        !endTime ||
        !capacity) {

        alert(
            "Please fill all fields."
        );

        return;
    }


    if (startTime >= endTime) {

        alert(
            "End time must be after start time."
        );

        return;
    }


    if (capacity <= 0) {

        alert(
            "Capacity must be greater than zero."
        );

        return;
    }


    const request = {

        slotDate:
            slotDate,

        startTime:
            startTime,

        endTime:
            endTime,

        capacity:
            capacity

    };


    try {

        const createdSlot =
            await apiRequest(
                "/pickup-slots",
                {
                    method: "POST",

                    body:
                        JSON.stringify(
                            request
                        )
                }
            );


        alert(
            `Pickup slot created successfully!\n\n` +
            `Date: ${createdSlot.slotDate}\n` +
            `Time: ${createdSlot.startTime} - ${createdSlot.endTime}`
        );


        document.getElementById(
            "pickupSlotForm"
        ).reset();


        await loadPickupSlots();


    } catch (error) {

        console.error(
            "Create pickup slot error:",
            error
        );

        alert(
            error.message
        );
    }
}


// =========================================================
// FORMAT DATE FOR API
// =========================================================

function formatDateForApi(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// =========================================================
// ADMIN RETURNS
// =========================================================

async function loadAdminReturns() {

    const tableBody =
        document.getElementById(
            "returnsTableBody"
        );

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="8">
                Loading return requests...
            </td>
        </tr>
    `;


    try {

        const returns =
            await apiRequest(
                "/returns/admin"
            );


        displayAdminReturns(returns);

    } catch (error) {

        console.error(
            "Failed to load returns:",
            error
        );


        tableBody.innerHTML = `
            <tr>

                <td colspan="8"
                    style="color:red;">

                    Failed to load returns:
                    ${error.message}

                </td>

            </tr>
        `;
    }
}


// =========================================================
// DISPLAY RETURNS
// =========================================================

function displayAdminReturns(returns) {

    const tableBody =
        document.getElementById(
            "returnsTableBody"
        );


    tableBody.innerHTML = "";


    if (!returns || returns.length === 0) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="8">
                    No return requests found.
                </td>

            </tr>
        `;

        return;
    }


    returns.forEach(returnRequest => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                #${returnRequest.id}
            </td>

            <td>
                #${returnRequest.orderItemId}
            </td>

            <td>
                ${returnRequest.reason || "-"}
            </td>

            <td>

                <span class="order-status">

                    ${returnRequest.status || "-"}

                </span>

            </td>

            <td>
                ${formatOrderDate(
                    returnRequest.requestedAt
                )}
            </td>

            <td>
                ${formatOrderDate(
                    returnRequest.processedAt
                )}
            </td>

            <td>
                ${returnRequest.staffRemarks || "-"}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="
                        updateAdminReturnStatus(
                            ${returnRequest.id},
                            '${returnRequest.status}'
                        )
                    ">

                    Update Status

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });
}


// =========================================================
// UPDATE RETURN STATUS
// =========================================================

async function updateAdminReturnStatus(
    returnId,
    currentStatus
) {

    const validStatuses =
        getValidNextReturnStatuses(
            currentStatus
        );


    // No valid transitions

    if (validStatuses.length === 0) {

        alert(
            `Return #${returnId} is already in its final status: ${currentStatus}`
        );

        return;
    }


    // Build options

    const options =
        validStatuses
            .map(
                (status, index) =>
                    `${index + 1}. ${status}`
            )
            .join("\n");


    const selection =
        prompt(
            `Return #${returnId}\n\n` +
            `Current status: ${currentStatus}\n\n` +
            `Select the new status:\n\n` +
            options
        );


    if (selection === null) {
        return;
    }


    const selectedNumber =
        Number(selection);


    if (
        !Number.isInteger(selectedNumber) ||
        selectedNumber < 1 ||
        selectedNumber > validStatuses.length
    ) {

        alert(
            "Invalid status selection."
        );

        return;
    }


    const newStatus =
        validStatuses[
            selectedNumber - 1
        ];


    // Ask for staff remarks

    const staffRemarks =
        prompt(
            `Enter staff remarks for return #${returnId}:`,
            ""
        );


    if (staffRemarks === null) {
        return;
    }


    try {

        await apiRequest(
            `/returns/${returnId}/status`,
            {
                method: "PUT",

                body: JSON.stringify({

                    status: newStatus,

                    staffRemarks:
                        staffRemarks.trim()

                })
            }
        );


        alert(
            `Return #${returnId} updated successfully!\n\n` +
            `${currentStatus} → ${newStatus}`
        );


        await loadAdminReturns();


    } catch (error) {

        console.error(
            "Return status update error:",
            error
        );


        alert(
            error.message
        );
    }
}


// =========================================================
// VALID RETURN STATUS TRANSITIONS
// =========================================================

function getValidNextReturnStatuses(
    currentStatus
) {

    switch (currentStatus) {

        case "REQUESTED":

            return [
                "APPROVED",
                "REJECTED"
            ];


        case "APPROVED":

            return [
                "COMPLETED"
            ];


        case "REJECTED":
        case "COMPLETED":

            return [];


        default:

            return [];
    }
}

// =========================================================
// REQUEST RETURN
// =========================================================

async function requestReturn(orderItemId) {

    const reason =
        prompt(
            "Enter the reason for return:"
        );


    if (reason === null) {
        return;
    }


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
// ADMIN RETURNS
// =========================================================

async function loadAdminReturns() {

    const tableBody =
        document.getElementById(
            "returnsTableBody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="8">
                Loading return requests...
            </td>
        </tr>
    `;

    try {

        const returns =
            await apiRequest(
                "/returns/admin"
            );

        displayAdminReturns(returns);

    } catch (error) {

        console.error(
            "Failed to load returns:",
            error
        );

        tableBody.innerHTML = `
            <tr>

                <td colspan="8"
                    style="color:red;">

                    Failed to load returns:
                    ${error.message}

                </td>

            </tr>
        `;
    }
}


// =========================================================
// DISPLAY RETURNS
// =========================================================

function displayAdminReturns(returns) {

    const tableBody =
        document.getElementById(
            "returnsTableBody"
        );

    tableBody.innerHTML = "";

    if (!returns || returns.length === 0) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="8">
                    No return requests found.
                </td>

            </tr>
        `;

        return;
    }


    returns.forEach(returnRequest => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                #${returnRequest.id}
            </td>

            <td>
                #${returnRequest.orderItemId}
            </td>

            <td>
                ${returnRequest.reason || "-"}
            </td>

            <td>

                <span class="order-status">

                    ${returnRequest.status || "-"}

                </span>

            </td>

            <td>
                ${formatOrderDate(
                    returnRequest.requestedAt
                )}
            </td>

            <td>
                ${formatOrderDate(
                    returnRequest.processedAt
                )}
            </td>

            <td>
                ${returnRequest.staffRemarks || "-"}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="
                        updateAdminReturnStatus(
                            ${returnRequest.id},
                            '${returnRequest.status}'
                        )
                    ">

                    Update Status

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });
}


// =========================================================
// UPDATE RETURN STATUS
// =========================================================

async function updateAdminReturnStatus(
    returnId,
    currentStatus
) {

    const validStatuses =
        getValidNextReturnStatuses(
            currentStatus
        );


    if (validStatuses.length === 0) {

        alert(
            `Return #${returnId} is already in its final status: ${currentStatus}`
        );

        return;
    }


    const options =
        validStatuses
            .map(
                (status, index) =>
                    `${index + 1}. ${status}`
            )
            .join("\n");


    const selection =
        prompt(
            `Return #${returnId}\n\n` +
            `Current status: ${currentStatus}\n\n` +
            `Select the new status:\n\n` +
            options
        );


    if (selection === null) {
        return;
    }


    const selectedNumber =
        Number(selection);


    if (
        !Number.isInteger(selectedNumber) ||
        selectedNumber < 1 ||
        selectedNumber > validStatuses.length
    ) {

        alert(
            "Invalid status selection."
        );

        return;
    }


    const newStatus =
        validStatuses[
            selectedNumber - 1
        ];


    const staffRemarks =
        prompt(
            `Enter staff remarks for return #${returnId}:`,
            ""
        );


    if (staffRemarks === null) {
        return;
    }


    try {

        await apiRequest(
            `/returns/${returnId}/status`,
            {
                method: "PUT",

                body: JSON.stringify({

                    status:
                        newStatus,

                    staffRemarks:
                        staffRemarks.trim()

                })
            }
        );


        alert(
            `Return #${returnId} updated successfully!\n\n` +
            `${currentStatus} → ${newStatus}`
        );


        await loadAdminReturns();


    } catch (error) {

        console.error(
            "Return status update error:",
            error
        );


        alert(
            error.message
        );
    }
}


// =========================================================
// VALID RETURN STATUS TRANSITIONS
// =========================================================

function getValidNextReturnStatuses(
    currentStatus
) {

    switch (currentStatus) {

        case "REQUESTED":

            return [
                "APPROVED",
                "REJECTED"
            ];


        case "APPROVED":

            return [
                "COMPLETED"
            ];


        case "REJECTED":
        case "COMPLETED":

            return [];


        default:

            return [];
    }
}

// =========================================================
// ADMIN PAYMENTS
// =========================================================

async function loadAdminPayments() {

    const tableBody =
        document.getElementById(
            "paymentsTableBody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="7">
                Loading payments...
            </td>
        </tr>
    `;

    try {

        const payments =
            await apiRequest(
                "/payments/admin"
            );

        displayAdminPayments(
            payments
        );

    } catch (error) {

        console.error(
            "Failed to load payments:",
            error
        );

        tableBody.innerHTML = `
            <tr>

                <td colspan="7"
                    style="color:red;">

                    Failed to load payments:
                    ${error.message}

                </td>

            </tr>
        `;
    }
}


// =========================================================
// DISPLAY ADMIN PAYMENTS
// =========================================================

function displayAdminPayments(
    payments
) {

    const tableBody =
        document.getElementById(
            "paymentsTableBody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    if (
        !payments ||
        payments.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="7">
                    No payments found.
                </td>

            </tr>
        `;

        return;
    }


    payments.forEach(payment => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                #${payment.id}
            </td>

            <td>
                ${payment.orderNumber || "-"}
                <br>
                <small>
                    Order #${payment.orderId}
                </small>
            </td>

            <td>
                ${payment.transactionId || "-"}
            </td>

            <td>
                ₹${payment.amount || 0}
            </td>

            <td>

                <span class="order-status">

                    ${formatPaymentStatus(
                        payment.status
                    )}

                </span>

            </td>

            <td>
                ${formatOrderDate(
                    payment.createdAt
                )}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="
                        updateAdminPaymentStatus(
                            ${payment.id},
                            '${payment.status}'
                        )
                    ">

                    Update Status

                </button>

            </td>

        `;

        tableBody.appendChild(row);

    });
}


// =========================================================
// UPDATE PAYMENT STATUS
// =========================================================

async function updateAdminPaymentStatus(
    paymentId,
    currentStatus
) {

    const validStatuses =
        getValidNextPaymentStatuses(
            currentStatus
        );


    if (
        validStatuses.length === 0
    ) {

        alert(
            `Payment #${paymentId} is already in its final status: ${currentStatus}`
        );

        return;
    }


    const options =
        validStatuses
            .map(
                (status, index) =>
                    `${index + 1}. ${status}`
            )
            .join("\n");


    const selection =
        prompt(
            `Payment #${paymentId}\n\n` +

            `Current status: ${currentStatus}\n\n` +

            `Select the new status:\n\n` +

            options
        );


    if (selection === null) {
        return;
    }


    const selectedNumber =
        Number(selection);


    if (
        !Number.isInteger(
            selectedNumber
        ) ||
        selectedNumber < 1 ||
        selectedNumber >
            validStatuses.length
    ) {

        alert(
            "Invalid status selection."
        );

        return;
    }


    const newStatus =
        validStatuses[
            selectedNumber - 1
        ];


    try {

        await apiRequest(
            `/payments/${paymentId}/status?status=${newStatus}`,
            {
                method: "PUT"
            }
        );


        alert(
            `Payment #${paymentId} updated successfully!\n\n` +
            `${currentStatus} → ${newStatus}`
        );


        await loadAdminPayments();


    } catch (error) {

        console.error(
            "Payment status update error:",
            error
        );


        alert(
            error.message
        );
    }
}


// =========================================================
// VALID PAYMENT STATUS TRANSITIONS
// =========================================================

function getValidNextPaymentStatuses(
    currentStatus
) {

    switch (currentStatus) {

        case "PENDING":

            return [
                "SUCCESS",
                "FAILED"
            ];


        case "SUCCESS":

            return [
                "REFUNDED"
            ];


        case "FAILED":
        case "REFUNDED":

            return [];


        default:

            return [];
    }
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
// ADMIN INVENTORY
// =========================================================

async function loadAdminInventory() {

    const tableBody =
        document.getElementById(
            "inventoryTableBody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="7">
                Loading inventory...
            </td>
        </tr>
    `;

    try {

        const inventory =
            await apiRequest(
                "/inventory"
            );

        displayAdminInventory(
            inventory
        );

    } catch (error) {

        console.error(
            "Failed to load inventory:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="color:red;">

                    Failed to load inventory:
                    ${error.message}

                </td>
            </tr>
        `;
    }
}


// =========================================================
// DISPLAY INVENTORY
// =========================================================

function displayAdminInventory(
    inventory
) {

    const tableBody =
        document.getElementById(
            "inventoryTableBody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    if (
        !inventory ||
        inventory.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="7">
                    No inventory found.
                </td>

            </tr>
        `;

        return;
    }


    inventory.forEach(item => {

        const row =
            document.createElement("tr");


        const stock =
            item.stockQuantity ?? 0;


        let stockLevel;


        if (stock <= 10) {

            stockLevel = `
                <span class="status-inactive">
                    LOW STOCK
                </span>
            `;

        } else {

            stockLevel = `
                <span class="status-active">
                    NORMAL
                </span>
            `;
        }


        row.innerHTML = `

            <td>
                #${item.productId}
            </td>

            <td>
                <strong>
                    ${item.productName || "-"}
                </strong>
            </td>

            <td>
                ${stock}
            </td>

            <td>

                <span class="
                    ${item.active
                        ? "status-active"
                        : "status-inactive"}
                ">

                    ${item.active
                        ? "Active"
                        : "Inactive"}

                </span>

            </td>

            <td>
                ${stockLevel}
            </td>

            <td>
                ${formatOrderDate(
                    item.updatedAt
                )}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="
                        updateInventoryStock(
                            ${item.productId},
                            '${escapeHtml(
                                item.productName || ""
                            )}',
                            ${stock}
                        )
                    ">

                    Update

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });
}


// =========================================================
// UPDATE INVENTORY STOCK
// =========================================================

async function updateInventoryStock(
    productId,
    productName,
    currentStock
) {

    const input =
        prompt(
            `Product: ${productName}\n\n` +
            `Current stock: ${currentStock}\n\n` +
            `Enter new stock quantity:`,
            currentStock
        );


    if (input === null) {
        return;
    }


    const newStock =
        Number(input);


    if (
        !Number.isInteger(newStock) ||
        newStock < 0
    ) {

        alert(
            "Please enter a valid stock quantity. Stock cannot be negative."
        );

        return;
    }


    try {

        const updatedInventory =
            await apiRequest(
                `/inventory/${productId}`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        stockQuantity:
                            newStock
                    })
                }
            );


        alert(
            `Inventory updated successfully!\n\n` +
            `Product: ${updatedInventory.productName}\n` +
            `Old stock: ${currentStock}\n` +
            `New stock: ${updatedInventory.stockQuantity}`
        );


        await loadAdminInventory();


    } catch (error) {

        console.error(
            "Inventory update error:",
            error
        );


        alert(
            error.message
        );
    }
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(
    value
) {

    return String(value)
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            "&quot;"
        );
}

// =========================================================
// ADMIN REVIEWS
// =========================================================

async function loadAdminReviews() {

    const tableBody =
        document.getElementById(
            "reviewsTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>

            <td colspan="8">
                Loading reviews...
            </td>

        </tr>
    `;


    try {

        const reviews =
            await apiRequest(
                "/reviews/admin"
            );


        displayAdminReviews(
            reviews
        );


    } catch (error) {

        console.error(
            "Failed to load reviews:",
            error
        );


        tableBody.innerHTML = `
            <tr>

                <td
                    colspan="8"
                    style="color:red;">

                    Failed to load reviews:
                    ${error.message}

                </td>

            </tr>
        `;
    }
}


// =========================================================
// DISPLAY ADMIN REVIEWS
// =========================================================

function displayAdminReviews(
    reviews
) {

    const tableBody =
        document.getElementById(
            "reviewsTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (
        !reviews ||
        reviews.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="8">

                    No reviews found.

                </td>

            </tr>
        `;

        return;
    }


    reviews.forEach(review => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <!-- ID -->

            <td>

                #${review.id}

            </td>


            <!-- PRODUCT -->

            <td>

                <strong>

                    ${review.productName || "-"}

                </strong>

                <br>

                <small>

                    Product #${review.productId || "-"}

                </small>

            </td>


            <!-- CUSTOMER -->

            <td>

                <strong>

                    ${review.userName || "Customer"}

                </strong>

                <br>

                <small>

                    User #${review.userId || "-"}

                </small>

            </td>


            <!-- RATING -->

            <td>

                <span class="review-admin-rating">

                    ${getAdminReviewStars(
                        review.rating
                    )}

                </span>

                <br>

                <small>

                    ${review.rating}/5

                </small>

            </td>


            <!-- COMMENT -->

            <td>

                ${review.comment || "-"}

            </td>


            <!-- STATUS -->

            <td>

                <span class="
                    ${getAdminReviewStatusClass(
                        review.status
                    )}
                ">

                    ${formatAdminReviewStatus(
                        review.status
                    )}

                </span>

            </td>


            <!-- CREATED -->

            <td>

                ${formatOrderDate(
                    review.createdAt
                )}

            </td>


            <!-- ACTION -->

            <td>

                ${
                    review.status === "PENDING"
                    ?

                    `
                    <div class="table-actions">

                        <button
                            class="edit-btn"
                            onclick="
                                updateAdminReviewStatus(
                                    ${review.id},
                                    'APPROVED'
                                )
                            ">

                            Approve

                        </button>


                        <button
                            class="delete-btn"
                            onclick="
                                updateAdminReviewStatus(
                                    ${review.id},
                                    'REJECTED'
                                )
                            ">

                            Reject

                        </button>

                    </div>
                    `

                    :

                    `
                    <span>
                        No Action
                    </span>
                    `
                }

            </td>

        `;


        tableBody.appendChild(
            row
        );

    });
}


// =========================================================
// UPDATE REVIEW STATUS
// =========================================================

async function updateAdminReviewStatus(
    reviewId,
    newStatus
) {

    const action =
        newStatus === "APPROVED"
            ? "approve"
            : "reject";


    const confirmed =
        confirm(
            `Are you sure you want to ${action} review #${reviewId}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/reviews/${reviewId}/status?status=${newStatus}`,
            {
                method: "PUT"
            }
        );


        alert(
            `Review #${reviewId} ${action}d successfully.`
        );


        await loadAdminReviews();


    } catch (error) {

        console.error(
            "Review status update error:",
            error
        );


        alert(
            error.message
        );
    }
}


// =========================================================
// REVIEW STARS
// =========================================================

function getAdminReviewStars(
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
// REVIEW STATUS CLASS
// =========================================================

function getAdminReviewStatusClass(
    status
) {

    switch (status) {

        case "PENDING":

            return "review-status-pending";


        case "APPROVED":

            return "review-status-approved";


        case "REJECTED":

            return "review-status-rejected";


        default:

            return "";
    }
}


// =========================================================
// FORMAT REVIEW STATUS
// =========================================================

function formatAdminReviewStatus(
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
// ADMIN CATEGORIES
// =========================================================

async function loadAdminCategories() {

    const tableBody =
        document.getElementById("categoriesTableBody");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="6">
                Loading categories...
            </td>
        </tr>
    `;

    try {

        const categories =
            await apiRequest("/categories");

        displayAdminCategories(categories);

    } catch (error) {

        console.error(
            "Failed to load categories:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="color:red;">
                    Failed to load categories:
                    ${error.message}
                </td>
            </tr>
        `;
    }
}


function displayAdminCategories(categories) {

    const tableBody =
        document.getElementById("categoriesTableBody");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    if (!categories || categories.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No categories found.
                </td>
            </tr>
        `;

        return;
    }

    categories.forEach(category => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${category.id}
            </td>

            <td>
                <strong>
                    ${category.name}
                </strong>
            </td>

            <td>
                ${category.description || "-"}
            </td>

            <td>
                <span class="${
                    category.active
                        ? "status-active"
                        : "status-inactive"
                }">
                    ${
                        category.active
                            ? "Active"
                            : "Inactive"
                    }
                </span>
            </td>

            <td>
                ${
                    category.createdAt
                        ? new Date(category.createdAt)
                            .toLocaleString()
                        : "-"
                }
            </td>

            <td>

                <div class="table-actions">

                    <button
                        class="edit-btn"
                        onclick="editCategory(${category.id})">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteCategory(${category.id})">
                        Delete
                    </button>

                </div>

            </td>
        `;

        tableBody.appendChild(row);
    });
}

// =========================================================
// ADMIN CATEGORIES
// =========================================================


// =========================================================
// LOAD CATEGORIES
// =========================================================

async function loadAdminCategories() {

    const tableBody =
        document.getElementById(
            "categoriesTableBody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="6">
                Loading categories...
            </td>
        </tr>
    `;

    try {

        const categories =
            await apiRequest(
                "/categories"
            );

        displayAdminCategories(
            categories
        );

    } catch (error) {

        console.error(
            "Failed to load categories:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="color:red;">

                    Failed to load categories:
                    ${error.message}

                </td>
            </tr>
        `;
    }
}


// =========================================================
// DISPLAY CATEGORIES
// =========================================================

function displayAdminCategories(
    categories
) {

    const tableBody =
        document.getElementById(
            "categoriesTableBody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";


    if (
        !categories ||
        categories.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No categories found.
                </td>
            </tr>
        `;

        return;
    }


    categories.forEach(category => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${category.id}
            </td>


            <td>

                <strong>
                    ${category.name}
                </strong>

            </td>


            <td>
                ${category.description || "-"}
            </td>


            <td>

                <span class="${
                    category.active
                        ? "status-active"
                        : "status-inactive"
                }">

                    ${
                        category.active
                            ? "Active"
                            : "Inactive"
                    }

                </span>

            </td>


            <td>

                ${
                    category.createdAt
                        ? formatAdminDate(
                            category.createdAt
                        )
                        : "-"
                }

            </td>


            <td>

                <div class="table-actions">

                    <button
                        type="button"
                        class="edit-btn"
                        onclick="editCategory(
                            ${category.id}
                        )">

                        Edit

                    </button>


                    <button
                        type="button"
                        class="delete-btn"
                        onclick="deleteCategory(
                            ${category.id}
                        )">

                        Delete

                    </button>

                </div>

            </td>

        `;


        tableBody.appendChild(row);

    });
}


// =========================================================
// LOAD CATEGORIES FOR PRODUCT FORM
// =========================================================

async function loadProductCategories(
    selectedCategoryId = null
) {

    const categorySelect =
        document.getElementById(
            "productCategory"
        );

    if (!categorySelect) {
        return;
    }

    categorySelect.innerHTML = `
        <option value="">
            Loading categories...
        </option>
    `;

    try {

        const categories =
            await apiRequest(
                "/categories"
            );

        categorySelect.innerHTML = `
            <option value="">
                Select Category
            </option>
        `;

        if (
            !categories ||
            categories.length === 0
        ) {

            categorySelect.innerHTML = `
                <option value="">
                    No categories available
                </option>
            `;

            return;
        }

        categories.forEach(category => {

            if (!category.active) {
                return;
            }

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category.id;

            option.textContent =
                category.name;

            if (
                selectedCategoryId !== null &&
                Number(category.id) ===
                Number(selectedCategoryId)
            ) {

                option.selected = true;
            }

            categorySelect.appendChild(
                option
            );

        });

    } catch (error) {

        console.error(
            "Failed to load product categories:",
            error
        );

        categorySelect.innerHTML = `
            <option value="">
                Failed to load categories
            </option>
        `;

        alert(
            "Failed to load categories: " +
            error.message
        );
    }
}

// =========================================================
// OPEN CREATE PRODUCT MODAL
// =========================================================

async function openCreateProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );

    const title =
        document.getElementById(
            "productModalTitle"
        );

    const submitButton =
        document.getElementById(
            "productSubmitButton"
        );

    document.getElementById(
        "productForm"
    ).reset();

    document.getElementById(
        "productId"
    ).value = "";

    document.getElementById(
        "productActive"
    ).checked = true;

    title.textContent =
        "Add Product";

    submitButton.textContent =
        "Create Product";

    // Load categories
    await loadProductCategories();

    modal.classList.remove(
        "hidden"
    );
}

// =========================================================
// OPEN CREATE CATEGORY MODAL
// =========================================================

function openCreateCategoryModal() {

    const modal =
        document.getElementById("categoryModal");

    const title =
        document.getElementById("categoryModalTitle");

    const submitButton =
        document.getElementById("categorySubmitButton");

    const form =
        document.getElementById("categoryForm");

    if (!modal || !title || !submitButton || !form) {
        console.error(
            "Category modal elements not found."
        );
        return;
    }

    // Reset form
    form.reset();

    // Clear hidden category ID
    document.getElementById(
        "categoryId"
    ).value = "";

    // Default active
    document.getElementById(
        "categoryActive"
    ).checked = true;

    // Modal text
    title.textContent =
        "Add Category";

    submitButton.textContent =
        "Create Category";

    // Show modal
    modal.classList.remove(
        "hidden"
    );
}
// =========================================================
// CLOSE CATEGORY MODAL
// =========================================================

function closeCategoryModal() {

    const modal =
        document.getElementById(
            "categoryModal"
        );

    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );
}


// =========================================================
// EDIT CATEGORY
// =========================================================

async function editCategory(
    categoryId
) {

    try {

        const category =
            await apiRequest(
                `/categories/${categoryId}`
            );


        document.getElementById(
            "categoryId"
        ).value =
            category.id;


        document.getElementById(
            "categoryName"
        ).value =
            category.name || "";


        document.getElementById(
            "categoryDescription"
        ).value =
            category.description || "";


        document.getElementById(
            "categoryActive"
        ).checked =
            category.active;


        document.getElementById(
            "categoryModalTitle"
        ).textContent =
            "Edit Category";


        document.getElementById(
            "categorySubmitButton"
        ).textContent =
            "Update Category";


        document.getElementById(
            "categoryModal"
        ).classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Edit category error:",
            error
        );

        alert(
            error.message
        );
    }
}


// =========================================================
// SAVE CATEGORY
// CREATE / UPDATE
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "categoryForm"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const categoryId =
                    document.getElementById(
                        "categoryId"
                    ).value;


                const name =
                    document.getElementById(
                        "categoryName"
                    ).value.trim();


                const description =
                    document.getElementById(
                        "categoryDescription"
                    ).value.trim();


                const active =
                    document.getElementById(
                        "categoryActive"
                    ).checked;


                // Client-side validation

                if (name.length < 2) {

                    alert(
                        "Category name must be at least 2 characters."
                    );

                    return;
                }


                const request = {

                    name: name,

                    description:
                        description,

                    active: active

                };


                try {


                    // =========================
                    // UPDATE
                    // =========================

                    if (categoryId) {

                        await apiRequest(
                            `/categories/${categoryId}`,
                            {
                                method: "PUT",

                                body:
                                    JSON.stringify(
                                        request
                                    )
                            }
                        );


                        alert(
                            "Category updated successfully!"
                        );

                    }


                    // =========================
                    // CREATE
                    // =========================

                    else {

                        await apiRequest(
                            "/categories",
                            {
                                method: "POST",

                                body:
                                    JSON.stringify(
                                        request
                                    )
                            }
                        );


                        alert(
                            "Category created successfully!"
                        );
                    }


                    // Close modal

                    closeCategoryModal();


                    // Reload categories

                    await loadAdminCategories();


                } catch (error) {

                    console.error(
                        "Category save error:",
                        error
                    );


                    alert(
                        error.message
                    );
                }

            }
        );

    }
);


// =========================================================
// DELETE CATEGORY
// =========================================================

async function deleteCategory(
    categoryId
) {

    const confirmed =
        confirm(
            "Are you sure you want to deactivate this category?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/categories/${categoryId}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Category deleted successfully!"
        );


        await loadAdminCategories();


    } catch (error) {

        console.error(
            "Delete category error:",
            error
        );


        alert(
            error.message
        );
    }
}


// =========================================================
// FORMAT CATEGORY DATE
// =========================================================

function formatAdminDate(
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
// PRODUCT CATEGORY DROPDOWN
// =========================================================

async function loadProductCategories() {

    const categorySelect =
        document.getElementById("productCategory");

    if (!categorySelect) {
        return;
    }

    try {

        const categories =
            await apiRequest("/categories");

        categorySelect.innerHTML = `
            <option value="">
                Select Category
            </option>
        `;

        categories.forEach(category => {

            const option =
                document.createElement("option");

            option.value = category.id;

            option.textContent = category.name;

            categorySelect.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Failed to load categories:",
            error
        );

        categorySelect.innerHTML = `
            <option value="">
                Failed to load categories
            </option>
        `;
    }
}

// =========================================================
// ADMIN USERS
// =========================================================

async function loadAdminUsers() {

    const tableBody =
        document.getElementById(
            "usersTableBody"
        );

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="8">
                Loading users...
            </td>
        </tr>
    `;


    try {

        const users =
            await apiRequest(
                "/users/admin"
            );


        displayAdminUsers(users);


    } catch (error) {

        console.error(
            "Failed to load users:",
            error
        );


        tableBody.innerHTML = `
            <tr>

                <td colspan="7"
                    style="color: red;">

                    Failed to load users:
                    ${error.message}

                </td>

            </tr>
        `;
    }
}


// =========================================================
// DISPLAY ADMIN USERS
// =========================================================

function displayAdminUsers(users) {

    const tableBody =
        document.getElementById(
            "usersTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (!users || users.length === 0) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="7">

                    No users found.

                </td>

            </tr>
        `;

        return;
    }


    users.forEach(user => {

        const row =
            document.createElement("tr");


        // Get roles
        let roles = "-";


        if (user.roles) {

            if (Array.isArray(user.roles)) {

                roles =
                    user.roles.join(", ");

            } else {

                roles =
                    String(user.roles);
            }
        }


        // Status
        const status =
            user.enabled
                ? "Active"
                : "Inactive";


        const statusClass =
            user.enabled
                ? "status-active"
                : "status-inactive";


        row.innerHTML = `

            <td>
                ${user.id}
            </td>


            <td>

                <strong>
                    ${user.fullName || "-"}
                </strong>

            </td>


            <td>
                ${user.email || "-"}
            </td>


            <td>
                ${user.phone || "-"}
            </td>


            <td>
                ${roles}
            </td>


            <td>

                <span class="${statusClass}">

                    ${status}

                </span>

            </td>


            <td>
                ${formatUserDate(user.createdAt)}
            </td>

            <button
                class="${user.enabled ? "delete-btn" : "admin-primary-btn"}"
                onclick="updateUserStatus(${user.id}, ${!user.enabled})">

                ${user.enabled ? "Disable" : "Enable"}
            </button>

        `;


        tableBody.appendChild(row);

    });
}


// =========================================================
// FORMAT USER DATE
// =========================================================

function formatUserDate(date) {

    if (!date) {
        return "-";
    }


    return new Date(date)
        .toLocaleString(
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
// UPDATE USER STATUS
// =========================================================

async function updateUserStatus(userId, enabled) {

    const action =
        enabled ? "enable" : "disable";


    const confirmed =
        confirm(
            `Are you sure you want to ${action} this user?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/users/admin/${userId}/status?enabled=${enabled}`,
            {
                method: "PATCH"
            }
        );


        alert(
            enabled
                ? "User enabled successfully."
                : "User disabled successfully."
        );


        loadAdminUsers();


    } catch (error) {

        console.error(
            "Failed to update user status:",
            error
        );


        alert(
            error.message
        );
    }
}