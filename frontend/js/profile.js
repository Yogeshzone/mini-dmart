// =========================================================
// LOAD MY PROFILE
// =========================================================

async function loadProfile() {

    const message =
        document.getElementById(
            "profileMessage"
        );

    if (message) {

        message.textContent = "";

    }


    try {

        const profile =
            await apiRequest(
                "/users/profile"
            );


        displayProfile(profile);


    } catch (error) {

        console.error(
            "Failed to load profile:",
            error
        );


        if (message) {

            message.textContent =
                error.message;

            message.className =
                "profile-message error";

        }

    }
}


// =========================================================
// DISPLAY PROFILE
// =========================================================

function displayProfile(profile) {

    // Header information

    document.getElementById(
        "profileName"
    ).textContent =
        profile.fullName || "-";


    document.getElementById(
        "profileEmail"
    ).textContent =
        profile.email || "-";


    // Editable fields

    document.getElementById(
        "fullName"
    ).value =
        profile.fullName || "";


    document.getElementById(
        "email"
    ).value =
        profile.email || "";


    document.getElementById(
        "phone"
    ).value =
        profile.phone || "";


    document.getElementById(
        "address"
    ).value =
        profile.address || "";


    // Account information

    document.getElementById(
        "roles"
    ).textContent =
        formatRoles(profile.roles);


    document.getElementById(
        "accountStatus"
    ).textContent =
        profile.enabled
            ? "Active"
            : "Disabled";


    document.getElementById(
        "createdAt"
    ).textContent =
        formatDate(profile.createdAt);
}


// =========================================================
// UPDATE PROFILE
// =========================================================

async function updateProfile(event) {

    event.preventDefault();


    const fullName =
        document.getElementById(
            "fullName"
        ).value.trim();


    const phone =
        document.getElementById(
            "phone"
        ).value.trim();


    const address =
        document.getElementById(
            "address"
        ).value.trim();


    const message =
        document.getElementById(
            "profileMessage"
        );


    // Client-side validation

    if (
        fullName.length < 2 ||
        fullName.length > 100
    ) {

        showProfileMessage(
            "Full name must be between 2 and 100 characters.",
            true
        );

        return;
    }


    if (
        phone &&
        !/^[6-9][0-9]{9}$/.test(phone)
    ) {

        showProfileMessage(
            "Please provide a valid 10-digit Indian phone number.",
            true
        );

        return;
    }


    if (address.length > 500) {

        showProfileMessage(
            "Address cannot exceed 500 characters.",
            true
        );

        return;
    }


    try {

        const updatedProfile =
            await apiRequest(
                "/users/profile",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        fullName:
                            fullName,

                        phone:
                            phone || null,

                        address:
                            address

                    })
                }
            );


        displayProfile(
            updatedProfile
        );


        showProfileMessage(
            "Profile updated successfully.",
            false
        );


    } catch (error) {

        console.error(
            "Update profile error:",
            error
        );


        showProfileMessage(
            error.message,
            true
        );
    }
}


// =========================================================
// PROFILE MESSAGE
// =========================================================

function showProfileMessage(
    message,
    isError
) {

    const element =
        document.getElementById(
            "profileMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        isError
            ? "profile-message error"
            : "profile-message success";
}


// =========================================================
// FORMAT ROLES
// =========================================================

function formatRoles(roles) {

    if (
        !roles ||
        roles.length === 0
    ) {

        return "-";
    }


    if (Array.isArray(roles)) {

        return roles.join(", ");
    }


    return Object.values(
        roles
    ).join(", ");
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
// FORM SUBMIT
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "profileForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                updateProfile
            );

        }

    }
);