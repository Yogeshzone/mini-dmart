// =========================================================
// LOAD MY RETURNS
// =========================================================

async function loadMyReturns() {

    const container =
        document.getElementById(
            "returnsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="returns-loading">

            <div class="loading-spinner"></div>

            <p>
                Loading your return requests...
            </p>

        </div>

    `;


    try {

        const returns =
            await apiRequest(
                "/returns"
            );


        displayReturns(
            returns
        );


    } catch (error) {

        console.error(
            "Failed to load returns:",
            error
        );


        container.innerHTML = `

            <div class="returns-error">

                <div>
                    ⚠️
                </div>

                <h3>
                    Unable to load returns
                </h3>

                <p>
                    ${error.message}
                </p>

                <button
                    onclick="loadMyReturns()">

                    Try Again

                </button>

            </div>

        `;
    }
}


// =========================================================
// DISPLAY RETURNS
// =========================================================

function displayReturns(returns) {

    const container =
        document.getElementById(
            "returnsContainer"
        );


    updateReturnSummary(
        returns
    );


    if (
        !returns ||
        returns.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-returns">

                <div class="empty-returns-icon">
                    ↩️
                </div>

                <h2>
                    No Return Requests
                </h2>

                <p>
                    You don't have any return requests yet.
                </p>

                <a href="orders.html"
                   class="primary-btn">

                    View My Orders

                </a>

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    returns.forEach(
        returnRequest => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "return-card";


            card.innerHTML = `

                <div class="return-card-header">

                    <div>

                        <span class="return-label">
                            Return Request
                        </span>

                        <h3>
                            #${returnRequest.id}
                        </h3>

                    </div>


                    <span
                        class="return-status
                        ${getReturnStatusClass(
                            returnRequest.status
                        )}">

                        ${formatReturnStatus(
                            returnRequest.status
                        )}

                    </span>

                </div>


                <div class="return-card-body">


                    <div class="return-detail">

                        <span>
                            Order Item
                        </span>

                        <strong>
                            #${returnRequest.orderItemId}
                        </strong>

                    </div>


                    <div class="return-detail">

                        <span>
                            Requested On
                        </span>

                        <strong>
                            ${formatReturnDate(
                                returnRequest.requestedAt
                            )}
                        </strong>

                    </div>


                    <div class="return-detail">

                        <span>
                            Processed On
                        </span>

                        <strong>
                            ${formatReturnDate(
                                returnRequest.processedAt
                            )}
                        </strong>

                    </div>


                    <div class="return-reason">

                        <span>
                            Reason
                        </span>

                        <p>
                            ${returnRequest.reason || "-"}
                        </p>

                    </div>


                    ${
                        returnRequest.staffRemarks
                        ?
                        `
                        <div class="staff-remarks">

                            <span>
                                Staff Remarks
                            </span>

                            <p>
                                ${returnRequest.staffRemarks}
                            </p>

                        </div>
                        `
                        :
                        ""
                    }

                </div>


                <div class="return-card-footer">

                    ${
                        getReturnStatusMessage(
                            returnRequest.status
                        )
                    }

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );
}


// =========================================================
// UPDATE SUMMARY
// =========================================================

function updateReturnSummary(
    returns
) {

    const total =
        returns
            ? returns.length
            : 0;


    const pending =
        returns
            ?
            returns.filter(
                item =>
                    item.status ===
                    "REQUESTED"
            ).length
            :
            0;


    const completed =
        returns
            ?
            returns.filter(
                item =>
                    item.status ===
                    "COMPLETED"
            ).length
            :
            0;


    const totalElement =
        document.getElementById(
            "totalReturns"
        );


    const pendingElement =
        document.getElementById(
            "pendingReturns"
        );


    const completedElement =
        document.getElementById(
            "completedReturns"
        );


    if (totalElement) {

        totalElement.textContent =
            total;
    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;
    }


    if (completedElement) {

        completedElement.textContent =
            completed;
    }
}


// =========================================================
// FORMAT STATUS
// =========================================================

function formatReturnStatus(
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
// STATUS CSS CLASS
// =========================================================

function getReturnStatusClass(
    status
) {

    switch (status) {

        case "REQUESTED":
            return "return-requested";

        case "APPROVED":
            return "return-approved";

        case "REJECTED":
            return "return-rejected";

        case "COMPLETED":
            return "return-completed";

        default:
            return "";
    }
}


// =========================================================
// STATUS MESSAGE
// =========================================================

function getReturnStatusMessage(
    status
) {

    switch (status) {

        case "REQUESTED":

            return `
                <span>
                    ⏳ Your return request is being reviewed.
                </span>
            `;


        case "APPROVED":

            return `
                <span>
                    ✓ Your return request has been approved.
                </span>
            `;


        case "REJECTED":

            return `
                <span>
                    ✕ Your return request was rejected.
                </span>
            `;


        case "COMPLETED":

            return `
                <span>
                    ✓ Your return has been completed.
                </span>
            `;


        default:

            return `
                <span>
                    Return status updated.
                </span>
            `;
    }
}


// =========================================================
// FORMAT DATE
// =========================================================

function formatReturnDate(
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
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadMyReturns();

    }
);