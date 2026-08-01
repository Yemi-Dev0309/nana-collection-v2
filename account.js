import { auth, database } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const accountName = document.getElementById("account-name");
const accountEmail = document.getElementById("account-email");
const accountLogoutBtn = document.getElementById("accountLogoutBtn");

onAuthStateChanged(auth, async function (user) {
    if (user) {
        const customerName =
    user.displayName || user.email.split("@")[0];

accountName.textContent = customerName;
accountEmail.textContent = user.email;

const welcomeName = document.getElementById("welcome-name");
const profileInitial = document.getElementById("profile-initial");

if (welcomeName) {
    welcomeName.textContent = customerName;
}

if (profileInitial) {
    profileInitial.textContent =
        customerName.charAt(0).toUpperCase();
}

const ordersContainer =
    document.getElementById("orders-container");

if (ordersContainer) {

    const ordersSnapshot =
        await get(
            ref(database, "orders/" + user.uid)
        );

    if (!ordersSnapshot.exists()) {

        ordersContainer.innerHTML =
            "<p>You haven't placed any orders yet.</p>";

    } else {

        const orders =
            Object.values(ordersSnapshot.val()).reverse();

        ordersContainer.innerHTML = "";

        orders.forEach(function (order) {

            const orderCard =
                document.createElement("div");

           orderCard.innerHTML = `
<hr>

<h3>Order #${order.orderNumber || order.id}</h3>

<p><strong>Status:</strong> ${order.status}</p>

<p><strong>Total:</strong> ₦${Number(order.total).toLocaleString()}</p>

<p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>

${order.status === "Pending" ? `
<button
    type="button"
    class="cancel-order-btn"
    data-order-id="${order.id}">
    Cancel Order
</button>
` : ""}
`;

            ordersContainer.appendChild(orderCard);

        });

    }

}
    } else {
        alert("Please log in to view your account.");
        window.location.href = "login.html";
    }
});

accountLogoutBtn.addEventListener("click", async function () {
    try {
        await signOut(auth);

        alert("You have logged out successfully.");

        window.location.href = "login.html";
    } catch (error) {
        console.error(error);
        alert("Logout failed. Please try again.");
    }
});

document.addEventListener("click", async function (event) {

    if (!event.target.classList.contains("cancel-order-btn")) return;

    const confirmCancel = confirm("Are you sure you want to cancel this order?");

    if (!confirmCancel) return;

    const orderId = event.target.dataset.orderId;

    const user = auth.currentUser;

    if (!user) return;

    try {

        await update(
            ref(database, `orders/${user.uid}/${orderId}`),
            {
                status: "Cancelled"
            }
        );

        alert("Order cancelled successfully.");

        location.reload();

    } catch (error) {

        console.error(error);

        alert("Could not cancel the order.");

    }

});

