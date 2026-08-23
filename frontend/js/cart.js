// =========================================================
// ADD TO CART
// =========================================================

async function addToCart(productId) {

    try {

        await apiRequest(
            "/cart/items",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    productId: productId,

                    quantity: 1

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
// LOAD CART
// =========================================================

async function loadCart() {

    const container =
        document.getElementById(
            "cartItems"
        );


    if (!container) {
        return;
    }


    // Loading state

    container.innerHTML = `

        <div class="cart-loading">

            <div class="loading-spinner"></div>

            <p>
                Loading your cart...
            </p>

        </div>

    `;


    try {

        const cart =
            await apiRequest(
                "/cart"
            );


        console.log(
            "Cart response:",
            cart
        );


        displayCart(
            cart
        );


    } catch (error) {

        console.error(
            "Failed to load cart:",
            error
        );


        container.innerHTML = `

            <div class="cart-error">

                <div class="cart-error-icon">
                    ⚠️
                </div>

                <h3>
                    Failed to load cart
                </h3>

                <p>
                    ${error.message}
                </p>

                <button
                    type="button"
                    class="primary-btn"
                    onclick="loadCart()">

                    Try Again

                </button>

            </div>

        `;
    }
}



// =========================================================
// DISPLAY CART
// =========================================================

function displayCart(cart) {

    const container =
        document.getElementById(
            "cartItems"
        );


    const emptyCart =
        document.getElementById(
            "emptyCart"
        );


    const checkoutButton =
        document.getElementById(
            "checkoutButton"
        );


    const cartSubtotal =
        document.getElementById(
            "cartSubtotal"
        );


    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    if (!container) {
        return;
    }


    // =====================================================
    // EMPTY CART
    // =====================================================

    if (
        !cart ||
        !cart.items ||
        cart.items.length === 0
    ) {

        container.innerHTML = "";


        if (emptyCart) {

            emptyCart.style.display =
                "block";

        }


        if (checkoutButton) {

            checkoutButton.disabled =
                true;

        }


        if (cartSubtotal) {

            cartSubtotal.textContent =
                "₹0";

        }


        if (cartTotal) {

            cartTotal.textContent =
                "₹0";

        }


        return;
    }


    // =====================================================
    // CART HAS ITEMS
    // =====================================================

    if (emptyCart) {

        emptyCart.style.display =
            "none";

    }


    if (checkoutButton) {

        checkoutButton.disabled =
            false;

    }


    // =====================================================
    // BUILD CART ITEMS
    // =====================================================

    let itemsHTML = "";


    cart.items.forEach(
        item => {

            itemsHTML += `

                <div class="cart-item">


                    <!-- IMAGE -->

                    <img
                        src="${item.imageUrl || ""}"
                        alt="${item.productName}"
                    >


                    <!-- INFORMATION -->

                    <div class="cart-item-info">

                        <h3>
                            ${item.productName}
                        </h3>


                        <p>
                            Unit Price:
                            ₹${item.unitPrice}
                        </p>


                        <!-- QUANTITY -->

                        <div class="quantity-controls">


                            <button
                                type="button"
                                onclick="decreaseQuantity(
                                    ${item.productId},
                                    ${item.quantity}
                                )">

                                −

                            </button>


                            <span>
                                ${item.quantity}
                            </span>


                            <button
                                type="button"
                                onclick="increaseQuantity(
                                    ${item.productId},
                                    ${item.quantity},
                                    ${item.availableStock}
                                )">

                                +

                            </button>


                        </div>


                        <!-- SUBTOTAL -->

                        <p>

                            Subtotal:

                            <strong>
                                ₹${item.subtotal}
                            </strong>

                        </p>


                        <!-- STOCK -->

                        <p class="stock">

                            Available Stock:
                            ${item.availableStock}

                        </p>


                        <!-- REMOVE -->

                        <button
                            type="button"
                            class="remove-btn"
                            onclick="removeCartItem(
                                ${item.productId}
                            )">

                            Remove

                        </button>


                    </div>

                </div>

            `;
        }
    );


    container.innerHTML =
        itemsHTML;


    // =====================================================
    // UPDATE SUMMARY
    // =====================================================

    if (cartSubtotal) {

        cartSubtotal.textContent =
            `₹${cart.subtotal}`;

    }


    if (cartTotal) {

        cartTotal.textContent =
            `₹${cart.subtotal}`;

    }

}



// =========================================================
// INCREASE QUANTITY
// =========================================================

async function increaseQuantity(
    productId,
    currentQuantity,
    availableStock
) {

    if (
        currentQuantity >=
        availableStock
    ) {

        alert(
            "Cannot add more. Stock limit reached."
        );

        return;
    }


    const newQuantity =
        currentQuantity + 1;


    await updateCartQuantity(
        productId,
        newQuantity
    );

}



// =========================================================
// DECREASE QUANTITY
// =========================================================

async function decreaseQuantity(
    productId,
    currentQuantity
) {

    if (
        currentQuantity <= 1
    ) {

        await removeCartItem(
            productId
        );

        return;
    }


    const newQuantity =
        currentQuantity - 1;


    await updateCartQuantity(
        productId,
        newQuantity
    );

}



// =========================================================
// UPDATE CART QUANTITY
// =========================================================

async function updateCartQuantity(
    productId,
    quantity
) {

    try {

        await apiRequest(
            `/cart/items/${productId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    quantity:
                        quantity

                })
            }
        );


        await loadCart();


    } catch (error) {

        console.error(
            "Update cart error:",
            error
        );


        alert(
            error.message
        );
    }

}



// =========================================================
// REMOVE CART ITEM
// =========================================================

async function removeCartItem(
    productId
) {

    const confirmed =
        confirm(
            "Are you sure you want to remove this product?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/cart/items/${productId}`,
            {
                method: "DELETE"
            }
        );


        await loadCart();


    } catch (error) {

        console.error(
            "Remove cart item error:",
            error
        );


        alert(
            error.message
        );
    }

}



// =========================================================
// CLEAR CART
// =========================================================

async function clearCart() {

    const confirmed =
        confirm(
            "Are you sure you want to clear your cart?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            "/cart",
            {
                method: "DELETE"
            }
        );


        await loadCart();


    } catch (error) {

        console.error(
            "Clear cart error:",
            error
        );


        alert(
            error.message
        );
    }

}



// =========================================================
// GO TO CHECKOUT
// =========================================================

function goToCheckout() {

    window.location.href =
        "checkout.html";

}



// =========================================================
// INITIALIZE CART PAGE
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Cart page initialized"
        );


        const checkoutButton =
            document.getElementById(
                "checkoutButton"
            );


        // Connect checkout button

        if (checkoutButton) {

            checkoutButton.addEventListener(
                "click",
                function () {

                    goToCheckout();

                }
            );

        }


        // Load cart

        loadCart();

    }
);