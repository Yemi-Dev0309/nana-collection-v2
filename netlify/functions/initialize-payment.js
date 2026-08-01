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
        const { email, amount } = JSON.parse(event.body || "{}");

        const paymentAmount = Number(amount);

        if (!email || !email.includes("@")) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: "A valid email address is required."
                })
            };
        }

        if (!Number.isInteger(paymentAmount) || paymentAmount < 100) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: "The payment amount is invalid."
                })
            };
        }

        if (!process.env.PAYSTACK_SECRET_KEY) {
            throw new Error(
                "PAYSTACK_SECRET_KEY is missing from Netlify."
            );
        }

        const siteUrl =
            process.env.URL ||
            event.headers.origin ||
            "http://localhost:5500";

        const callbackUrl =
            `${siteUrl}/payment-success.html`;

        const response = await fetch(
            "https://api.paystack.co/transaction/initialize",
            {
                method: "POST",
                headers: {
                    Authorization:
                        `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.trim(),
                    amount: paymentAmount,
                    currency: "NGN",
                    callback_url: callbackUrl,
                    metadata: {
                        source: "Nana Collection Website"
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.status) {
            return {
                statusCode: response.status || 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message:
                        data.message ||
                        "Paystack could not initialize payment."
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
                authorization_url:
                    data.data.authorization_url,
                access_code:
                    data.data.access_code,
                reference:
                    data.data.reference
            })
        };
    } catch (error) {
        console.error(
            "Payment initialization error:",
            error
        );

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                message:
                    "Unable to initialize payment. Please try again."
            })
        };
    }
};