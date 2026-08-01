import { auth, database } from "./firebase.js";

import {
    ref,
    set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const paymentMessage =
    document.getElementById("payment-message");

const paymentDetails =
    document.getElementById("payment-details");

let verificationStarted = false;

async function verifyPayment(currentUser) {
    const urlParameters =
        new URLSearchParams(window.location.search);

    const reference =
        urlParameters.get("reference") ||
        urlParameters.get("trxref");

        const formattedReference = reference
    ? reference
        .toUpperCase()
        .match(/.{1,4}/g)
        ?.join("-")
    : "";

    let pendingOrder = null;

    try {
        pendingOrder = JSON.parse(
            localStorage.getItem("pendingPaystackOrder")
        );
    } catch (error) {
        pendingOrder = null;
    }

    if (!reference) {
        paymentMessage.textContent =
            "We could not find the payment reference.";

        paymentDetails.innerHTML = `
            <p class="payment-error">
                Please return to your cart and try again.
            </p>
        `;

        return;
    }

    if (!pendingOrder || !pendingOrder.amountKobo) {
        paymentMessage.textContent =
            "Your pending order information could not be found.";

        paymentDetails.innerHTML = `
            <p class="payment-error">
                Please contact Nana Collection with this reference:
                <strong>${formattedReference}</strong>
            </p>
        `;

        return;
    }

    try {
        const response = await fetch(
            "/api/verify-payments",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reference: reference,
                    expectedAmount:
                        Number(pendingOrder.amountKobo)
                })
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Your payment could not be verified."
            );
        }

        const safeReference =
            String(result.payment.reference)
                .replace(/[.#$[\]/]/g, "_");

                const formattedVerifiedReference =
    String(result.payment.reference || reference)
        .toUpperCase()
        .match(/.{1,4}/g)
        ?.join("-") || "";

        const orderReference = ref(
            database,
            "orders/" +
                currentUser.uid +
                "/" +
                safeReference
        );

        const orderData = {
            id: safeReference,
            orderNumber:
                pendingOrder.orderNumber || safeReference,

            customerId: currentUser.uid,

            customerName:
                pendingOrder.customerName || "Customer",

            customerEmail:
                currentUser.email ||
                pendingOrder.customerEmail ||
                "",

            customerPhone:
                pendingOrder.customerPhone || "",

            deliveryAddress:
                pendingOrder.deliveryAddress || "",

            items: pendingOrder.items || [],

            total: Number(pendingOrder.total || 0),

            status: "Paid",
            paymentStatus: "Paid",
            paymentMethod: "Paystack",

            paymentReference:
                formattedVerifiedReference,

            paidAt:
                result.payment.paidAt ||
                new Date().toISOString(),

            createdAt:
                pendingOrder.createdAt ||
                new Date().toISOString()
        };

        await set(orderReference, orderData);

        const amountPaid =
            Number(result.payment.amount) / 100;

        paymentMessage.textContent =
            "Your payment has been verified and your order has been received.";

        paymentDetails.innerHTML = `
            <div class="verified-payment-details">
                <p>
                    <span>Order number</span>
                    <strong>${orderData.orderNumber}</strong>
                </p>

                <p>
                    <span>Reference</span>
                    <strong>${formattedVerifiedReference}</strong>
                </p>

                <p>
                    <span>Amount paid</span>
                    <strong>
                        ₦${amountPaid.toLocaleString()}
                    </strong>
                </p>

                <p>
                    <span>Payment status</span>
                    <strong>Paid</strong>
                </p>

                <p>
                    <span>Email</span>
                    <strong>
                        ${orderData.customerEmail}
                    </strong>
                </p>
            </div>
        `;

        localStorage.setItem(
            "lastCompletedOrder",
            JSON.stringify(orderData)
        );

        localStorage.removeItem("cart");
        localStorage.removeItem("pendingPaystackOrder");

    } catch (error) {
        console.error(
            "Payment verification failed:",
            error
        );

        paymentMessage.textContent =
            "We could not confirm your payment yet.";

        paymentDetails.innerHTML = `
            <p class="payment-error">
                ${error.message}
            </p>

            <p class="payment-reference">
                Payment reference:
                <strong>${formattedReference}</strong>
            </p>
        `;
    }
}

onAuthStateChanged(auth, function (currentUser) {
    if (verificationStarted) {
        return;
    }

    verificationStarted = true;

    if (!currentUser) {
        paymentMessage.textContent =
            "Please log in to complete your order.";

        paymentDetails.innerHTML = `
            <p class="payment-error">
                Your payment reference is safe.
                Log in with the account used during checkout.
            </p>

            <a href="login.html" class="continue-shopping-btn">
                Log In
            </a>
        `;

        return;
    }

    verifyPayment(currentUser);
});

