exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                message: "Method not allowed."
            })
        };
    }

    try {
        const { reference, expectedAmount } =
            JSON.parse(event.body || "{}");

        const amountToConfirm = Number(expectedAmount);

        if (!reference) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: "Payment reference is required."
                })
            };
        }

        if (
            !Number.isInteger(amountToConfirm) ||
            amountToConfirm < 100
        ) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: "Expected payment amount is invalid."
                })
            };
        }

        if (!process.env.PAYSTACK_SECRET_KEY) {
            throw new Error(
                "PAYSTACK_SECRET_KEY is missing from Netlify."
            );
        }

        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
            {
                method: "GET",
                headers: {
                    Authorization:
                        `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.status || !data.data) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message:
                        data.message ||
                        "Unable to verify this payment."
                })
            };
        }

        const paymentSuccessful =
            data.data.status === "success";

        const correctAmount =
            Number(data.data.amount) === amountToConfirm;

        const correctCurrency =
            data.data.currency === "NGN";

        if (
            !paymentSuccessful ||
            !correctAmount ||
            !correctCurrency
        ) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message:
                        "Payment was not completed or the amount does not match."
                })
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: true,
                message: "Payment verified successfully.",
                payment: {
                    reference: data.data.reference,
                    amount: data.data.amount,
                    currency: data.data.currency,
                    status: data.data.status,
                    paidAt: data.data.paid_at,
                    customerEmail:
                        data.data.customer?.email || ""
                }
            })
        };
    } catch (error) {
        console.error("Payment verification error:", error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                message:
                    "Payment verification failed. Please try again."
            })
        };
    }
};