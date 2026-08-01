export default async function handler(request, response) {
    if (request.method !== "POST") {
        return response.status(405).json({
            success: false,
            message: "Method not allowed."
        });
    }

    try {
        const { reference, expectedAmount } = request.body || {};

        if (!reference) {
            return response.status(400).json({
                success: false,
                message: "Payment reference is required."
            });
        }

        if (!process.env.PAYSTACK_SECRET_KEY) {
            return response.status(500).json({
                success: false,
                message: "Paystack secret key is not configured."
            });
        }

        const paystackResponse = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
            {
                method: "GET",
                headers: {
                    Authorization:
                        `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        const paystackData = await paystackResponse.json();

        if (!paystackResponse.ok || !paystackData.status) {
            return response.status(400).json({
                success: false,
                message:
                    paystackData.message ||
                    "Payment verification failed."
            });
        }

        const payment = paystackData.data;
        const expectedAmountInKobo = Number(expectedAmount);

        if (payment.status !== "success") {
            return response.status(400).json({
                success: false,
                message: "Payment was not successful."
            });
        }

        if (
            Number.isFinite(expectedAmountInKobo) &&
            expectedAmountInKobo > 0 &&
            Number(payment.amount) !== expectedAmountInKobo
        ) {
            return response.status(400).json({
                success: false,
                message: "Payment amount does not match the order total."
            });
        }

        return response.status(200).json({
            success: true,
            message: "Payment verified successfully.",
            payment: {
                reference: payment.reference,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                paidAt: payment.paid_at,
                customerEmail: payment.customer?.email || ""
            }
        });

    } catch (error) {
        console.error("Payment verification error:", error);

        return response.status(500).json({
            success: false,
            message:
                error.message ||
                "An error occurred while verifying payment."
        });
    }
}