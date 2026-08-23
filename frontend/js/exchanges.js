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


        const form =
            document.getElementById(
                "exchangeForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                submitExchange
            );

        }


        loadExchanges();

    }
);


// =========================================================
// LOAD MY EXCHANGES
// =========================================================

async function loadExchanges() {

    const exchangeList =
        document.getElementById(
            "exchangeList"
        );


    if (!exchangeList) {
        return;
    }


    exchangeList.innerHTML = `

        <div class="exchange-loading">

            <div class="loading-spinner"></div>

            <p>
                Loading exchange requests...
            </p>

        </div>

    `;


    try {

        const exchanges =
            await apiRequest(
                "/exchanges"
            );


        displayExchanges(
            exchanges
        );


    } catch (error) {

        console.error(
            "Failed to load exchanges:",
            error
        );


        exchangeList.innerHTML = `

            <div class="exchange-error">

                <strong>
                    Unable to load exchange requests
                </strong>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>


                <button
                    onclick="loadExchanges()">

                    Try Again

                </button>

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

    const exchangeList =
        document.getElementById(
            "exchangeList"
        );


    if (
        !exchanges ||
        exchanges.length === 0
    ) {

        exchangeList.innerHTML = `

            <div class="empty-exchanges">

                <div class="empty-exchange-icon">
                    🔄
                </div>

                <h3>
                    No Exchange Requests
                </h3>

                <p>
                    You don't have any exchange requests yet.
                </p>

                <a href="orders.html">

                    View My Orders →

                </a>

            </div>

        `;

        return;
    }


    exchangeList.innerHTML = "";


    exchanges.forEach(
        exchange => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "exchange-card";


            card.innerHTML = `

                <div class="exchange-card-header">

                    <div>

                        <h3>
                            Exchange #${exchange.id}
                        </h3>

                        <p>
                            Requested on
                            ${formatDate(
                                exchange.requestedAt
                            )}
                        </p>

                    </div>


                    <span
                        class="exchange-status
                        ${getStatusClass(
                            exchange.status
                        )}">

                        ${formatStatus(
                            exchange.status
                        )}

                    </span>

                </div>



                <div class="exchange-details">


                    <div class="exchange-detail">

                        <span>
                            Order Item
                        </span>

                        <strong>
                            #${exchange.orderItemId}
                        </strong>

                    </div>



                    <div class="exchange-detail">

                        <span>
                            Replacement Product
                        </span>

                        <strong>
                            #${exchange.replacementProductId}
                        </strong>

                    </div>



                    <div class="exchange-detail">

                        <span>
                            Quantity
                        </span>

                        <strong>
                            ${exchange.quantity}
                        </strong>

                    </div>



                    <div class="exchange-detail">

                        <span>
                            Status
                        </span>

                        <strong>
                            ${formatStatus(
                                exchange.status
                            )}
                        </strong>

                    </div>

                </div>



                <div class="exchange-reason">

                    <strong>
                        Reason
                    </strong>

                    <p>
                        ${escapeHtml(
                            exchange.reason
                        )}
                    </p>

                </div>



                ${
                    exchange.staffRemarks
                    ?
                    `

                    <div class="exchange-remarks">

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

                    <div class="exchange-processed">

                        Processed on
                        ${formatDate(
                            exchange.processedAt
                        )}

                    </div>

                    `
                    :
                    ""
                }

            `;


            exchangeList.appendChild(
                card
            );

        }
    );
}


// =========================================================
// SUBMIT EXCHANGE
// =========================================================

async function submitExchange(
    event
) {

    event.preventDefault();


    const orderItemId =
        Number(
            document.getElementById(
                "orderItemId"
            ).value
        );


    const replacementProductId =
        Number(
            document.getElementById(
                "replacementProductId"
            ).value
        );


    const reason =
        document.getElementById(
            "reason"
        ).value.trim();


    if (!orderItemId) {

        showExchangeMessage(
            "Please enter a valid Order Item ID.",
            true
        );

        return;
    }


    if (!replacementProductId) {

        showExchangeMessage(
            "Please enter a valid Replacement Product ID.",
            true
        );

        return;
    }


    if (!reason) {

        showExchangeMessage(
            "Please enter an exchange reason.",
            true
        );

        return;
    }


    if (reason.length > 1000) {

        showExchangeMessage(
            "Exchange reason cannot exceed 1000 characters.",
            true
        );

        return;
    }


    const button =
        document.querySelector(
            ".submit-exchange-btn"
        );


    button.disabled = true;

    button.innerHTML =
        "Submitting...";


    try {

        const exchange =
            await apiRequest(
                "/exchanges",
                {
                    method: "POST",

                    body: JSON.stringify({

                        orderItemId:
                            orderItemId,

                        replacementProductId:
                            replacementProductId,

                        reason:
                            reason

                    })
                }
            );


        showExchangeMessage(
            "Exchange request submitted successfully.",
            false
        );


        document
            .getElementById(
                "exchangeForm"
            )
            .reset();


        await loadExchanges();


    } catch (error) {

        console.error(
            "Exchange request error:",
            error
        );


        showExchangeMessage(
            error.message,
            true
        );

    } finally {

        button.disabled =
            false;

        button.innerHTML = `
            Request Exchange
            <span>→</span>
        `;
    }
}


// =========================================================
// MESSAGE
// =========================================================

function showExchangeMessage(
    message,
    isError
) {

    const element =
        document.getElementById(
            "exchangeMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        isError
            ? "exchange-message error"
            : "exchange-message success";
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
// FORMAT DATE
// =========================================================

function formatDate(
    dateString
) {

    if (!dateString) {
        return "-";
    }


    return new Date(
        dateString
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