export default async function handler(request, response) {
    if (request.method !== "POST") {
        return response.status(405).json({
            success: false,
            message: "Method not allowed."
        });
    }

    try {
        const { email, amount } = request.body || {};

        if (!email || !amount) {
            return response.status(400).json({
                success: false,
                message: "Email and amount are required."
            });
        }

        const amountInKobo = Number(amount);

        if (!Number.isInteger(amountInKobo) || amountInKobo <= 0) {
            return response.status(400).json({
                success: false,
                message: "Invalid payment amount."
            });
        }

        if (!process.env.PAYSTACK_SECRET_KEY) {
            return response.status(500).json({
                success: false,
                message: "Paystack secret key is not configured."
            });
        }

        const paystackResponse = await fetch(
            "https://api.paystack.co/transaction/initialize",
            {
                method: "POST",
                headers: {
                    Authorization:
                        `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    amount: String(amountInKobo),
                    callback_url:
                        `${request.headers["x-forwarded-proto"] || "https"}://${request.headers.host}/payment-success.html`
                })
            }
        );

        const paystackData = await paystackResponse.json();

        return response
            .status(paystackResponse.ok ? 200 : 400)
            .json(paystackData);

    } catch (error) {
        console.error("Payment initialization error:", error);

        return response.status(500).json({
            success: false,
            message: error.message || "Payment initialization failed."
        });
    }
}