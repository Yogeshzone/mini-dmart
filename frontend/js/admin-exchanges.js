// =========================================================
// ADMIN EXCHANGE MANAGEMENT
// =========================================================


document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!isLoggedIn()) {

            window.location.href =
                "../login.html";

            return;
        }


        if (!hasRole("ADMIN") &&
            !hasRole("MANAGER") &&
            !hasRole("STAFF")) {

            alert(
                "You are not authorized to access this page."
            );

            window.location.href =
                "../index.html";

            return;
        }


        loadAllExchanges();

    }
);


// =========================================================
// LOAD ALL EXCHANGES
// =========================================================

async function loadAllExchanges() {

    const container =
        document.getElementById(
            "exchangeList"
        );


    container.innerHTML = `

        <p class="loading">
            Loading exchange requests...
        </p>

    `;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/exchanges/admin`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${getToken()}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Failed to load exchanges"
            );
        }


        displayExchanges(data);


    } catch (error) {

        console.error(
            "Exchange loading error:",
            error
        );


        container.innerHTML = `

            <div class="error-message">

                ${escapeHtml(
                    error.message
                )}

            </div>

        `;
    }
}


// =========================================================
// DISPLAY EXCHANGES
// =========================================================

function displayExchanges(
    exchanges
) {

    const container =
        document.getElementById(
            "exchangeList"
        );


    if (!exchanges ||
        exchanges.length === 0) {

        container.innerHTML = `

            <div class="empty-message">

                <h2>
                    No Exchange Requests
                </h2>

                <p>
                    There are currently no exchange requests.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        exchanges.map(
            exchange => {

                return createExchangeCard(
                    exchange
                );

            }
        ).join("");
}


// =========================================================
// CREATE EXCHANGE CARD
// =========================================================

function createExchangeCard(
    exchange
) {

    const status =
        exchange.status;


    let actionButtons = "";


    // -----------------------------------------------------
    // REQUESTED
    // -----------------------------------------------------

    if (
        status === "REQUESTED"
    ) {

        actionButtons = `

            <button
                class="approve-btn"
                onclick="updateExchangeStatus(
                    ${exchange.id},
                    'APPROVED'
                )">

                ✓ Approve

            </button>


            <button
                class="reject-btn"
                onclick="rejectExchange(
                    ${exchange.id}
                )">

                ✕ Reject

            </button>

        `;
    }


    // -----------------------------------------------------
    // APPROVED
    // -----------------------------------------------------

    else if (
        status === "APPROVED"
    ) {

        actionButtons = `

            <button
                class="complete-btn"
                onclick="completeExchange(
                    ${exchange.id}
                )">

                ✓ Complete Exchange

            </button>

        `;
    }


    return `

        <div class="exchange-card">

            <div class="exchange-card-header">

                <div>

                    <h2>
                        Exchange #${exchange.id}
                    </h2>

                    <p>
                        Requested:
                        ${formatDate(
                            exchange.requestedAt
                        )}
                    </p>

                </div>


                <span
                    class="status
                    ${getStatusClass(status)}">

                    ${status}

                </span>

            </div>


            <div class="exchange-details">

                <div class="detail-box">

                    <span>
                        Order Item
                    </span>

                    <strong>
                        #${exchange.orderItemId}
                    </strong>

                </div>


                <div class="detail-box">

                    <span>
                        Replacement Product
                    </span>

                    <strong>
                        #${exchange.replacementProductId}
                    </strong>

                </div>


                <div class="detail-box">

                    <span>
                        Quantity
                    </span>

                    <strong>
                        ${exchange.quantity}
                    </strong>

                </div>


                <div class="detail-box">

                    <span>
                        Reason
                    </span>

                    <strong>
                        ${escapeHtml(
                            exchange.reason
                        )}
                    </strong>

                </div>

            </div>


            ${
                exchange.staffRemarks
                ?

                `

                <div class="staff-remarks">

                    <strong>
                        Staff Remarks
                    </strong>

                    <p>
                        ${escapeHtml(
                            exchange.staffRemarks
                        )}
                    </p>

                </div>

                `

                :

                ""
            }


            ${
                exchange.processedAt
                ?

                `

                <div class="processed-date">

                    Processed:
                    ${formatDate(
                        exchange.processedAt
                    )}

                </div>

                `

                :

                ""
            }


            ${
                actionButtons
                ?

                `

                <div class="exchange-actions">

                    ${actionButtons}

                </div>

                `

                :

                ""
            }

        </div>

    `;
}


// =========================================================
// APPROVE / COMPLETE
// =========================================================

async function updateExchangeStatus(
    exchangeId,
    status,
    remarks = ""
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/exchanges/${exchangeId}/status`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${getToken()}`
                    },

                    body:
                        JSON.stringify({

                            status:
                                status,

                            staffRemarks:
                                remarks

                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Failed to update exchange"
            );
        }


        alert(
            `Exchange ${status.toLowerCase()} successfully.`
        );


        loadAllExchanges();


    } catch (error) {

        console.error(error);

        alert(
            error.message
        );
    }
}


// =========================================================
// REJECT
// =========================================================

async function rejectExchange(
    exchangeId
) {

    const remarks =
        prompt(
            "Enter reason for rejecting this exchange:"
        );


    if (
        remarks === null
    ) {

        return;
    }


    if (
        remarks.trim() === ""
    ) {

        alert(
            "Please enter rejection remarks."
        );

        return;
    }


    await updateExchangeStatus(
        exchangeId,
        "REJECTED",
        remarks.trim()
    );
}


// =========================================================
// COMPLETE
// =========================================================

async function completeExchange(
    exchangeId
) {

    const confirmed =
        confirm(
            "Complete this exchange?\n\n" +
            "This will update product inventory."
        );


    if (!confirmed) {

        return;
    }


    const remarks =
        prompt(
            "Enter completion remarks (optional):"
        );


    if (
        remarks === null
    ) {

        return;
    }


    await updateExchangeStatus(
        exchangeId,
        "COMPLETED",
        remarks.trim()
    );
}


// =========================================================
// STATUS CLASS
// =========================================================

function getStatusClass(
    status
) {

    switch (status) {

        case "REQUESTED":
            return "status-requested";

        case "APPROVED":
            return "status-approved";

        case "REJECTED":
            return "status-rejected";

        case "COMPLETED":
            return "status-completed";

        default:
            return "";

    }
}


// =========================================================
// DATE
// =========================================================

function formatDate(
    value
) {

    if (!value) {

        return "-";
    }


    return new Date(
        value
    ).toLocaleString(
        "en-IN"
    );
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(
    value
) {

    if (!value) {

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