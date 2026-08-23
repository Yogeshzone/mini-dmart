// =========================================================
// CHECKOUT
// =========================================================

let cartData = null;
let selectedPickupSlotId = null;


// =========================================================
// LOAD CART
// =========================================================

async function loadCheckoutCart() {

    const container =
        document.getElementById(
            "checkoutSummary"
        );

    try {

        cartData =
            await apiRequest(
                "/cart"
            );

        displayCheckoutSummary(
            cartData
        );

    } catch (error) {

        console.error(
            "Failed to load cart:",
            error
        );

        container.innerHTML = `

            <div class="error-message">

                <h3>
                    Unable to load cart
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;
    }
}


// =========================================================
// DISPLAY CART SUMMARY
// =========================================================

function displayCheckoutSummary(cart) {

    const container =
        document.getElementById(
            "checkoutSummary"
        );


    if (
        !cart ||
        !cart.items ||
        cart.items.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-cart">

                <h3>
                    Your cart is empty
                </h3>

                <a href="../index.html">
                    Continue Shopping
                </a>

            </div>

        `;

        document.getElementById(
            "placeOrderButton"
        ).disabled = true;

        return;
    }


    let itemsHTML = "";


    cart.items.forEach(item => {

        itemsHTML += `

            <div class="checkout-item">

                <div>

                    <strong>
                        ${item.productName}
                    </strong>

                    <p>
                        ₹${item.unitPrice}
                        ×
                        ${item.quantity}
                    </p>

                </div>

                <strong>
                    ₹${item.subtotal}
                </strong>

            </div>

        `;

    });


    container.innerHTML = `

        <div class="checkout-items">

            ${itemsHTML}

        </div>


        <hr>


        <div class="summary-row">

            <span>
                Total Items
            </span>

            <strong>
                ${cart.totalItems}
            </strong>

        </div>


        <div class="summary-row">

            <span>
                Subtotal
            </span>

            <strong>
                ₹${cart.subtotal}
            </strong>

        </div>


        <div class="summary-row">

            <span>
                Delivery Charge
            </span>

            <strong id="deliveryCharge">
                ₹50
            </strong>

        </div>


        <hr>


        <div class="summary-row total-row">

            <strong>
                Total
            </strong>

            <strong id="checkoutTotal">
                ₹${Number(cart.subtotal) + 50}
            </strong>

        </div>

    `;
}


// =========================================================
// FULFILLMENT CHANGE
// =========================================================

function handleFulfillmentChange() {

    const selected =
        document.querySelector(
            'input[name="fulfillmentType"]:checked'
        ).value;


    const deliverySection =
        document.getElementById(
            "deliverySection"
        );

    const pickupSection =
        document.getElementById(
            "pickupSection"
        );


    if (
        selected ===
        "HOME_DELIVERY"
    ) {

        deliverySection.style.display =
            "block";

        pickupSection.style.display =
            "none";

        selectedPickupSlotId = null;

        updateCheckoutTotal(
            true
        );

    } else {

        deliverySection.style.display =
            "none";

        pickupSection.style.display =
            "block";

        updateCheckoutTotal(
            false
        );
    }
}


// =========================================================
// UPDATE TOTAL
// =========================================================

function updateCheckoutTotal(
    isHomeDelivery
) {

    if (!cartData) {
        return;
    }


    const deliveryCharge =
        isHomeDelivery
            ? 50
            : 0;


    const total =
        Number(cartData.subtotal)
        +
        deliveryCharge;


    const chargeElement =
        document.getElementById(
            "deliveryCharge"
        );

    const totalElement =
        document.getElementById(
            "checkoutTotal"
        );


    if (chargeElement) {

        chargeElement.innerText =
            `₹${deliveryCharge}`;
    }


    if (totalElement) {

        totalElement.innerText =
            `₹${total}`;
    }
}


// =========================================================
// LOAD PICKUP SLOTS
// =========================================================

async function loadPickupSlots() {

    const date =
        document.getElementById(
            "pickupDate"
        ).value;


    const container =
        document.getElementById(
            "pickupSlotsContainer"
        );


    selectedPickupSlotId = null;


    if (!date) {

        container.innerHTML = `

            <p>
                Select a date to see available pickup slots.
            </p>

        `;

        return;
    }


    container.innerHTML = `

        <p>
            Loading pickup slots...
        </p>

    `;


    try {

        const slots =
            await apiRequest(
                `/pickup-slots?date=${date}`
            );


        displayPickupSlots(
            slots
        );


    } catch (error) {

        console.error(
            "Failed to load pickup slots:",
            error
        );


        container.innerHTML = `

            <div class="error-message">

                <p>
                    ${error.message}
                </p>

            </div>

        `;
    }
}


// =========================================================
// DISPLAY PICKUP SLOTS
// =========================================================

function displayPickupSlots(slots) {

    const container =
        document.getElementById(
            "pickupSlotsContainer"
        );


    container.innerHTML = "";


    if (
        !slots ||
        slots.length === 0
    ) {

        container.innerHTML = `

            <p>
                No pickup slots available for this date.
            </p>

        `;

        return;
    }


    slots.forEach(slot => {

        const available =
            slot.availableCapacity > 0 &&
            slot.active;


        const slotElement =
            document.createElement(
                "div"
            );


        slotElement.className =
            "pickup-slot";


        slotElement.innerHTML = `

            <label>

                <input
                    type="radio"
                    name="pickupSlot"
                    value="${slot.id}"
                    ${available ? "" : "disabled"}
                    onchange="selectPickupSlot(${slot.id})">

                <strong>

                    ${slot.startTime}
                    -
                    ${slot.endTime}

                </strong>

                <span>

                    ${
                        available
                            ? `${slot.availableCapacity} slots available`
                            : "Full"

                    }

                </span>

            </label>

        `;


        container.appendChild(
            slotElement
        );

    });
}


// =========================================================
// SELECT PICKUP SLOT
// =========================================================

function selectPickupSlot(
    slotId
) {

    selectedPickupSlotId =
        slotId;
}


// =========================================================
// PLACE ORDER
// =========================================================

async function placeOrder() {

    const errorContainer =
        document.getElementById(
            "checkoutError"
        );


    errorContainer.style.display =
        "none";


    const fulfillmentType =
        document.querySelector(
            'input[name="fulfillmentType"]:checked'
        ).value;


    let request = null;


    // -----------------------------------------------------
    // HOME DELIVERY
    // -----------------------------------------------------

    if (
        fulfillmentType ===
        "HOME_DELIVERY"
    ) {

        const address =
            document.getElementById(
                "deliveryAddress"
            ).value.trim();


        if (!address) {

            showCheckoutError(
                "Please enter your delivery address."
            );

            return;
        }


        request = {

            fulfillmentType:
                "HOME_DELIVERY",

            deliveryAddress:
                address

        };

    }


    // -----------------------------------------------------
    // STORE PICKUP
    // -----------------------------------------------------

    else {

        if (!selectedPickupSlotId) {

            showCheckoutError(
                "Please select a pickup slot."
            );

            return;
        }


        request = {

            fulfillmentType:
                "STORE_PICKUP",

            pickupSlotId:
                selectedPickupSlotId

        };

    }


    const button =
        document.getElementById(
            "placeOrderButton"
        );


    button.disabled = true;

    button.innerText =
        "Placing Order...";


    try {

        const order =
            await apiRequest(
                "/orders",
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


        alert(
            `Order ${order.orderNumber} placed successfully!`
        );


        window.location.href =
            `order-details.html?id=${order.id}`;


    } catch (error) {

        console.error(
            "Place order error:",
            error
        );


        showCheckoutError(
            error.message
        );


        button.disabled =
            false;

        button.innerText =
            "Place Order";
    }
}


// =========================================================
// SHOW ERROR
// =========================================================

function showCheckoutError(message) {

    const container =
        document.getElementById("checkoutError");

    if (!container) {
        return;
    }

    const messageElement =
        container.querySelector("p");

    if (messageElement) {
        messageElement.textContent = message;
    }

    container.style.display = "flex";
}


// =========================================================
// INITIALIZE
// =========================================================

loadCheckoutCart();