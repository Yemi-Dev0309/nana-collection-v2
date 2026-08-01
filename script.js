import { database, auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    ref,
    set,
    push,
    get,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
if (window.location.pathname.includes("admin.html")) {

    onAuthStateChanged(auth, (user) => {

        const adminEmail = "aishatbalogun44@gmail.com";

        if (!user) {
            showToast("Please log in as an administrator.");
            window.location.href = "login.html";
            return;
        }

        console.log("Logged in user:", user.email);
console.log("Admin email:", adminEmail);

        if (user.email.toLowerCase() !== adminEmail) {
            showToast("Access denied. You are not an administrator.");
            window.location.href = "index.html";
            return;
        }

        console.log("Administrator access approved.");

    });

}
// Load saved cart from the browser
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Select the cart counter
const cartCounter = document.getElementById("cart-count");

// Show the saved cart number when the page opens
if (cartCounter) {
    cartCounter.textContent = cart.length;
}


// Add products to the cart
// This works for both normal products and products added from the admin page
document.addEventListener("click", function (event) {
    const button = event.target.closest(".add-to-cart");

    if (!button || button.disabled) {
        return;
    }

    const productCard = button.closest(".product-card");

    if (!productCard) {
        return;
    }

    const productTitle = productCard.querySelector("h3, h2");   
    const productPrice = productCard.querySelector(".price");
    const productImage = productCard.querySelector("img");

    if (!productTitle || !productPrice) {
        return;
    }

    const name = productTitle.textContent.trim();
    const priceText = productPrice.textContent.trim();
    const image = productImage ? productImage.src : "";

    let selectedSize = "";
let selectedColor = "";

if (
    button.classList.contains(
        "product-details-add-cart"
    )
) {
    const sizeSelect =
        document.getElementById(
            "selected-size"
        );

    const colorSelect =
        document.getElementById(
            "selected-color"
        );

    selectedSize =
        sizeSelect
            ? sizeSelect.value
            : "";

    selectedColor =
        colorSelect
            ? colorSelect.value
            : "";

    if (!selectedSize) {
        showToast(
            "Please select a size."
        );

        return;
    }

    if (!selectedColor) {
        showToast(
            "Please select a colour."
        );

        return;
    }
}

    const priceMatch = priceText.match(/[\d,]+/);

    const price = priceMatch
        ? Number(priceMatch[0].replaceAll(",", ""))
        : 0;

    cart.push({
        name: name,
        price: price,
        image: image,
        quantity: 1,
        size: selectedSize,
        color: selectedColor
    });

    localStorage.setItem("cart", JSON.stringify(cart));

    if (cartCounter) {
        cartCounter.textContent = cart.length;
    }

    showToast(name + " has been added to your cart.");
});


// Change the main Abaya image
function changeAbayaImage(imagePath) {
    const abayaImage = document.getElementById("abaya-image");

    if (abayaImage) {
        abayaImage.src = imagePath;
    }
}


// Change the main Jalab image
function changeJalabImage(imagePath) {
    const jalabImage = document.getElementById("jalab-image");

    if (jalabImage) {
        jalabImage.src = imagePath;
    }
}


// Change the main Cap image
function changeCapImage(imagePath) {
    const capImage = document.getElementById("cap-image");

    if (capImage) {
        capImage.src = imagePath;
    }
}


// Search and filter products together
let selectedCategory = "all";

function applyProductFilters() {
    const searchBox =
        document.getElementById("product-search");

    const searchText =
        searchBox
            ? searchBox.value.trim().toLowerCase()
            : "";

    const productCards =
        document.querySelectorAll(
            ".products-container .product-card"
        );

    productCards.forEach(function (productCard) {
        const productName =
            productCard.querySelector("h3")
                ?.textContent
                .trim()
                .toLowerCase() || "";

        const description =
            productCard.querySelector("p")
                ?.textContent
                .trim()
                .toLowerCase() || "";

        const productCategory =
            productCard.dataset.category || "";

        const matchesCategory =
            selectedCategory === "all" ||
            productCategory === selectedCategory;

        const matchesSearch =
            productName.includes(searchText) ||
            description.includes(searchText) ||
            productCategory.includes(searchText);

        productCard.style.display =
            matchesCategory && matchesSearch
                ? ""
                : "none";
    });
}

const filterButtons =
    document.querySelectorAll(".filter-btn");

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        selectedCategory =
            button.dataset.category || "all";

        applyProductFilters();
    });
});

const searchBox =
    document.getElementById("product-search");

if (searchBox) {
    searchBox.addEventListener(
        "input",
        applyProductFilters
    );

}

// Display saved products on cart.html
const cartContainer =
    document.getElementById("cart-items");

const totalPriceElement =
    document.getElementById("total-price");

if (cartContainer && totalPriceElement) {
    let total = 0;

    const itemCount =
        document.getElementById("item-count");

    if (itemCount) {
        itemCount.textContent =
            "Items: " + cart.length;
    }

    if (cart.length === 0) {
        cartContainer.innerHTML =
            "<p>Your cart is empty.</p>";
    } else {
        cart.forEach(function (item, index) {
            const cartItem =
                document.createElement("div");

            cartItem.classList.add("cart-item");

            const quantity = item.quantity || 1;

            cartItem.innerHTML = `
                <div class="cart-product">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                        class="cart-product-image"
                    >

                    <div class="cart-product-details">

                        <h3>${item.name}</h3>

                        <p>
                            ₦${item.price.toLocaleString()}
                        </p>

                        <p>
    <strong>Size:</strong>
    ${item.size || "Not selected"}
</p>

<p>
    <strong>Colour:</strong>
    ${item.color || "Not selected"}
</p>

                        <div class="quantity-controls">

                            <button
                                class="decrease-quantity"
                                data-index="${index}"
                            >
                                −
                            </button>

                            <span>
                                ${quantity}
                            </span>

                            <button
                                class="increase-quantity"
                                data-index="${index}"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    <button
                        class="remove-item"
                        data-index="${index}"
                    >
                        Remove
                    </button>

                </div>
            `;

            cartContainer.appendChild(cartItem);

            total =
                total + item.price * quantity;
        });
    }

    totalPriceElement.textContent =
        "Total: ₦" + total.toLocaleString();
}


// Remove, increase and decrease cart items
if (cartContainer) {
    cartContainer.addEventListener(
        "click",
        function (event) {
            const button = event.target.closest("button");

            if (!button) {
                return;
            }

            const itemIndex =
                Number(button.dataset.index);

            if (
                button.classList.contains(
                    "remove-item"
                )
            ) {
                cart.splice(itemIndex, 1);

                localStorage.setItem(
                    "cart",
                    JSON.stringify(cart)
                );

                location.reload();
            }

            if (
                button.classList.contains(
                    "increase-quantity"
                )
            ) {
                cart[itemIndex].quantity =
                    (cart[itemIndex].quantity || 1) + 1;

                localStorage.setItem(
                    "cart",
                    JSON.stringify(cart)
                );

                location.reload();
            }

            if (
                button.classList.contains(
                    "decrease-quantity"
                )
            ) {
                const currentQuantity =
                    cart[itemIndex].quantity || 1;

                if (currentQuantity > 1) {
                    cart[itemIndex].quantity =
                        currentQuantity - 1;

                    localStorage.setItem(
                        "cart",
                        JSON.stringify(cart)
                    );

                    location.reload();
                }
            }
        }
    );
}

// WhatsApp checkout button on cart.html
const checkoutButton =
    document.getElementById("checkout-btn");

if (checkoutButton) {
    checkoutButton.addEventListener(
        "click",
       async function () {
            if (cart.length === 0) {
                showToast("Your cart is empty.");
                return;
            }

            const customerNameInput =
                document.getElementById(
                    "customer-name"
                );

            const customerPhoneInput =
                document.getElementById(
                    "customer-phone"
                );

            const customerAddressInput =
                document.getElementById(
                    "customer-address"
                );

            const customerName =
                customerNameInput
                    ? customerNameInput.value.trim()
                    : "";

            const customerPhone =
                customerPhoneInput
                    ? customerPhoneInput.value.trim()
                    : "";

            const customerAddress =
                customerAddressInput
                    ? customerAddressInput.value.trim()
                    : "";

            if (
                !customerName ||
                !customerPhone ||
                !customerAddress
            ) {
                showToast(
                    "Please fill in your name, phone number and delivery address."
                );

                return;
            }

            let total = 0;

            const messageLines = [
                "Hello Nana Collection,",
                "",
                "Customer Name: " + customerName,
                "Phone Number: " + customerPhone,
                "Delivery Address: " + customerAddress,
                "",
                "I want to order:",
                ""
            ];

            cart.forEach(function (item, index) {
                const quantity =
                    item.quantity || 1;

                const subtotal =
                    item.price * quantity;

                total = total + subtotal;

               messageLines.push(
    (index + 1) +
    ". " +
    item.name +
    " × " +
    quantity +
    " — ₦" +
    subtotal.toLocaleString()
);

messageLines.push(
    "   Size: " +
    (item.size || "Not selected")
);

messageLines.push(
    "   Colour: " +
    (item.color || "Not selected")
);

messageLines.push("");
            });

            messageLines.push("");
            messageLines.push(
                "Total: ₦" +
                total.toLocaleString()
            );
            messageLines.push("");
            messageLines.push("Thank you.");

            const message =
                messageLines.join("\n");

            const encodedMessage =
                encodeURIComponent(message);

                const currentUser = auth.currentUser;

if (!currentUser) {
    showToast("Please log in before placing your order.");
    window.location.href = "login.html";
    return;
}

const orderReference =
    push(ref(database, "orders/" + currentUser.uid));

    const shortOrderNumber =
    "NC-" +
    Date.now()
        .toString()
        .slice(-6);

const orderData = {
    id: orderReference.key,
    orderNumber: shortOrderNumber,
    customerId: currentUser.uid,
    customerName: customerName,
    customerEmail: currentUser.email,
    customerPhone: customerPhone,
    deliveryAddress: customerAddress,
    items: cart,
    total: total,
    status: "Pending",
    createdAt: new Date().toISOString()
};

await set(orderReference, orderData);

            window.open(
                "https://wa.me/2347041594349?text=" +
                    encodedMessage,
                "_blank"
            );
        }
    );
}

// ==========================
// PAYSTACK ONLINE PAYMENT
// ==========================

const paystackButton =
    document.getElementById("paystack-btn");

if (paystackButton) {
    paystackButton.addEventListener(
        "click",
        async function () {
            const currentUser = auth.currentUser;

            if (!currentUser) {
                showToast(
                    "Please log in before making payment.",
                    "warning"
                );

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);

                return;
            }

            if (cart.length === 0) {
                showToast(
                    "Your cart is empty.",
                    "warning"
                );

                return;
            }

            const customerNameInput =
                document.getElementById(
                    "customer-name"
                );

            const customerPhoneInput =
                document.getElementById(
                    "customer-phone"
                );

            const customerAddressInput =
                document.getElementById(
                    "customer-address"
                );

            const customerName =
                customerNameInput
                    ? customerNameInput.value.trim()
                    : "";

            const customerPhone =
                customerPhoneInput
                    ? customerPhoneInput.value.trim()
                    : "";

            const customerAddress =
                customerAddressInput
                    ? customerAddressInput.value.trim()
                    : "";

            if (
                !customerName ||
                !customerPhone ||
                !customerAddress
            ) {
                showToast(
                    "Please complete all customer details.",
                    "warning"
                );

                return;
            }

            const paymentTotal =
                cart.reduce(
                    function (sum, item) {
                        const price =
                            Number(item.price || 0);

                        const quantity =
                            Number(item.quantity || 1);

                        return sum + price * quantity;
                    },
                    0
                );

            if (paymentTotal <= 0) {
                showToast(
                    "The payment total is invalid.",
                    "error"
                );

                return;
            }

            const amountKobo =
                Math.round(paymentTotal * 100);

            const shortOrderNumber =
                "NC-" +
                Date.now()
                    .toString()
                    .slice(-6);

            const pendingPaystackOrder = {
                orderNumber: shortOrderNumber,
                customerId: currentUser.uid,
                customerName: customerName,
                customerEmail: currentUser.email,
                customerPhone: customerPhone,
                deliveryAddress: customerAddress,
                items: cart,
                total: paymentTotal,
                amountKobo: amountKobo,
                orderStatus: "Pending",
                paymentStatus: "Pending",
                paymentMethod: "Paystack",
                createdAt: new Date().toISOString()
            };

            localStorage.setItem(
                "pendingPaystackOrder",
                JSON.stringify(
                    pendingPaystackOrder
                )
            );

            paystackButton.disabled = true;
            paystackButton.textContent =
                "Preparing Payment...";

            try {
                const response = await fetch(
                    "/api/initialize-payment",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            email: currentUser.email,
                            amount: amountKobo
                        })
                    }
                );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success ||
                    !data.authorization_url
                ) {
                    throw new Error(
                        data.message ||
                        "Unable to initialize payment."
                    );
                }

                window.location.href =
                    data.authorization_url;

            } catch (error) {
                console.error(
                    "Paystack initialization failed:",
                    error
                );

                localStorage.removeItem(
                    "pendingPaystackOrder"
                );

                showToast(
                    error.message ||
                    "Payment could not be started.",
                    "error"
                );

                paystackButton.disabled = false;
                paystackButton.textContent =
                    "Pay Online with Paystack";
            }
        }
    );
}

// Add a new product from admin.html using Cloudinary
const addProductButton =
    document.getElementById("add-product-btn");

if (addProductButton) {
    addProductButton.addEventListener(
        "click",
        async function () {
            const productNameInput =
                document.getElementById("product-name");

            const productPriceInput =
                document.getElementById("product-price");

            const productCategoryInput =
                document.getElementById("product-category");

            const productStockInput =
                document.getElementById("product-stock");

            const productImageInput =
                document.getElementById("product-image");

            const productDescriptionInput =
                document.getElementById(
                    "product-description"
                );

            const productSizesInput =
                document.getElementById("product-sizes");

            const productColorsInput =
                document.getElementById("product-colors");

            if (
                !productNameInput ||
                !productPriceInput ||
                !productCategoryInput ||
                !productStockInput ||
                !productImageInput ||
                !productDescriptionInput ||
                !productSizesInput ||
                !productColorsInput
            ) {
                showToast(
                    "Some product form fields are missing."
                );

                return;
            }

            const productName =
                productNameInput.value.trim();

            const productPrice =
                productPriceInput.value.trim();

            const productCategory =
                productCategoryInput.value.trim();

            const productStock =
                productStockInput.value.trim();

            const productDescription =
                productDescriptionInput.value.trim();

            const productSizes =
                productSizesInput.value.trim();

            const productColors =
                productColorsInput.value.trim();

            const imageFiles =
                Array.from(productImageInput.files);

            if (
                productName === "" ||
                productPrice === "" ||
                productCategory === "" ||
                productStock === "" ||
                imageFiles.length === 0
            ) {
                showToast(
                    "Please complete all the product details."
                );

                return;
            }

            if (imageFiles.length > 4) {
                showToast(
                    "Please select no more than four images."
                );

                return;
            }

            if (
                Number(productPrice) <= 0 ||
                Number.isNaN(Number(productPrice))
            ) {
                showToast(
                    "Please enter a valid product price."
                );

                return;
            }

            if (
                Number(productStock) < 0 ||
                Number.isNaN(Number(productStock))
            ) {
                showToast(
                    "Please enter a valid stock number."
                );

                return;
            }

            const invalidImage =
                imageFiles.some(function (file) {
                    return !file.type.startsWith("image/");
                });

            if (invalidImage) {
                showToast("Please select image files only.");
                return;
            }

            const imageTooLarge =
                imageFiles.some(function (file) {
                    return file.size > 5000000;
                });

            if (imageTooLarge) {
                showToast(
                    "Each image must be below 5 MB."
                );

                return;
            }

            const cloudName = "fcxqdo2r";
            const uploadPreset = "fahcmgc8";

            addProductButton.disabled = true;
            addProductButton.textContent =
                "Uploading images...";

            try {
                const uploadedImageUrls = [];

                for (const imageFile of imageFiles) {
                    const formData = new FormData();

                    formData.append(
                        "file",
                        imageFile
                    );

                    formData.append(
                        "upload_preset",
                        uploadPreset
                    );

                    const uploadResponse =
                        await fetch(
                            "https://api.cloudinary.com/v1_1/" +
                                cloudName +
                                "/image/upload",
                            {
                                method: "POST",
                                body: formData
                            }
                        );

                    if (!uploadResponse.ok) {
                        const errorDetails =
                            await uploadResponse.json();

                        throw new Error(
                            errorDetails.error?.message ||
                            "An image could not be uploaded."
                        );
                    }

                    const uploadedImage =
                        await uploadResponse.json();

                    uploadedImageUrls.push(
                        uploadedImage.secure_url
                    );
                }

                const newProduct = {
                    name: productName,
                    price: Number(productPrice),
                    category: productCategory,
                    stock: Number(productStock),
                    image: uploadedImageUrls[0],
                    images: uploadedImageUrls,
                    description: productDescription,
                    sizes: productSizes,
                    colors: productColors
                };


                const newProductReference =
    push(ref(database, "products"));

const productWithId = {
    ...newProduct,
    id: newProductReference.key
};

await set(
    newProductReference,
    productWithId
);

                showToast(
                    "Product and images uploaded successfully!"
                );

                productNameInput.value = "";
                productPriceInput.value = "";
                productCategoryInput.value = "";
                productStockInput.value = "";
                productImageInput.value = "";
                productDescriptionInput.value = "";
                productSizesInput.value = "";
                productColorsInput.value = "";

                location.reload();
            } catch (error) {
                console.error(error);

                showToast(
                    "Upload failed: " +
                    error.message
                );
            } finally {
                addProductButton.disabled = false;
                addProductButton.textContent =
                    "Add Product";
            }
        }
    );
}


// Display saved admin products on the homepage
const productsContainer =
    document.querySelector(".products-container");

    function showProductSkeletons() {
    if (!productsContainer) return;

    productsContainer.innerHTML = Array.from({ length: 8 })
        .map(() => `
            <div class="skeleton-card">
                <div class="skeleton-image"></div>
                <div class="skeleton-text long"></div>
                <div class="skeleton-text medium"></div>
                <div class="skeleton-text short"></div>
            </div>
        `)
        .join("");
}

showProductSkeletons();

if (productsContainer) {
    const productsSnapshot =
    await get(ref(database, "products"));

let adminProducts =
    productsSnapshot.exists()
        ? Object.values(productsSnapshot.val())
        : [];

    productsContainer.innerHTML = "";

    adminProducts.forEach(function (product, index) {
        const productCard =
            document.createElement("div");

        productCard.classList.add(
            "product-card"
        );

        productCard.setAttribute(
            "data-category",
            String(product.category || "")
                .toLowerCase()
        );

        productCard.setAttribute(
    "data-price",
    Number(product.price || 0)
);

productCard.setAttribute(
    "data-name",
    String(product.name || "")
        .toLowerCase()
);

        const stockNumber =
            Number(product.stock || 0);

        productCard.innerHTML = `
            <span class="badge">
                NEW
            </span>

            <a href="product-details.html?id=${product.id}">
    <img
        src="${product.image}"
        alt="${product.name}"
        class="main-product-image"
    >
</a>

            <h3>
    <a
        href="product-details.html?id=${product.id}"
        class="product-details-link"
    >
        ${product.name}
    </a>
</h3>

            <p>
                ${product.description || ""}
            </p>

            <p class="price">
                ₦${Number(product.price || 0).toLocaleString()}
            </p>

            <p class="stock">
                ${
                    stockNumber > 0
                        ? "In Stock: " + stockNumber
                        : "Out of Stock"
                }
            </p>

            <button
    type="button"
    class="wishlist-btn"
    data-index="${index}"
>
    ♡ Add to Wishlist
</button>

            <button
                class="add-to-cart"
                ${
                    stockNumber <= 0
                        ? "disabled"
                        : ""
                }
            >
                ${
                    stockNumber > 0
                        ? "Add to Cart"
                        : "Out of Stock"
                }
            </button>
        `;

        productsContainer.appendChild(
            productCard
        );

        setTimeout(() => {
    productCard.classList.add("show");
}, index * 120);
    });

const productSort =
    document.getElementById("product-sort");

if (productSort) {
    productSort.addEventListener("change", function () {
        const sortValue = productSort.value;

        const productCards =
            Array.from(
                productsContainer.querySelectorAll(".product-card")
            );

        productCards.sort((cardA, cardB) => {
            const priceA =
                Number(cardA.getAttribute("data-price")) || 0;

            const priceB =
                Number(cardB.getAttribute("data-price")) || 0;

            const nameA =
                cardA.getAttribute("data-name") || "";

            const nameB =
                cardB.getAttribute("data-name") || "";

            if (sortValue === "price-low") {
                return priceA - priceB;
            }

            if (sortValue === "price-high") {
                return priceB - priceA;
            }

            if (sortValue === "name-az") {
                return nameA.localeCompare(nameB);
            }

            if (sortValue === "name-za") {
                return nameB.localeCompare(nameA);
            }

            return 0;
        });

        productCards.forEach((card) => {
            productsContainer.appendChild(card);
        });
    });
}

}

// Display saved products on admin.html
const adminProductsList =
    document.getElementById(
        "admin-products-list"
    );

if (adminProductsList) {
    const productsSnapshot =
    await get(ref(database, "products"));

const adminProducts =
    productsSnapshot.exists()
        ? Object.values(productsSnapshot.val())
        : [];

    if (adminProducts.length === 0) {
        adminProductsList.innerHTML =
            "<p>No products have been added yet.</p>";
    } else {
        adminProducts.forEach(
            function (product, index) {
                const productDiv =
                    document.createElement(
                        "div"
                    );

                productDiv.classList.add(
                    "admin-product-card"
                );

                productDiv.innerHTML = `
                    <hr>

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        width="120"
                    >

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        ₦${Number(
                            product.price || 0
                        ).toLocaleString()}
                    </p>

                    <p>
                        Category:
                        ${product.category || ""}
                    </p>

                    <p>
                        Stock:
                        ${Number(
                            product.stock || 0
                        )}
                    </p>

                    <p>
                        ${
                            product.description ||
                            ""
                        }
                    </p>

                    <button
                        type="button"
                        onclick="editProduct(${index})"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        onclick="deleteProduct(${index})"
                    >
                        Delete
                    </button>
                `;

                adminProductsList.appendChild(
                    productDiv
                );
            }
        );
    }
}

// ===========================
// DISPLAY CUSTOMER ORDERS
// ===========================

const adminOrdersList =
    document.getElementById("admin-orders-list");

if (adminOrdersList) {
    try {
        const ordersSnapshot =
            await get(ref(database, "orders"));

        if (!ordersSnapshot.exists()) {
            adminOrdersList.innerHTML =
                "<p>No customer orders yet.</p>";
        } else {
            const customerOrders =
                ordersSnapshot.val();

            const allOrders = [];

            Object.entries(customerOrders).forEach(
                function ([customerId, orders]) {
                    Object.values(orders).forEach(
                        function (order) {
                            allOrders.push({
                                ...order,
                                customerId: customerId
                            });
                        }
                    );
                }
            );

            allOrders.sort(function (a, b) {
                return new Date(b.createdAt) -
                    new Date(a.createdAt);
            });

            adminOrdersList.innerHTML = "";

            allOrders.forEach(function (order) {
                const orderCard =
                    document.createElement("div");

                orderCard.classList.add(
                    "admin-order-card"
                );

                orderCard.innerHTML = `
                    <hr>

                    <h3>Order #${order.orderNumber || order.id}</h3>
                    </h3>

                    <p>
                        <strong>Customer:</strong>
                        ${order.customerName || ""}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${order.customerEmail || ""}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${order.customerPhone || ""}
                    </p>

                    <p>
                        <strong>Address:</strong>
                        ${order.deliveryAddress || ""}
                    </p>

                    <p>
                        <strong>Total:</strong>
                        ₦${Number(
                            order.total || 0
                        ).toLocaleString()}
                    </p>

                   <p>
    <strong>Status:</strong>
</p>

<select id="status-${order.id}">
    <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
    <option value="Processing" ${order.status === "Processing" ? "selected" : ""}>Processing</option>
    <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
    <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
    <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
</select>

<button
    onclick="updateOrderStatus('${order.customerId}', '${order.id}')">
    Update Status
</button>

<button
    style="background:red;color:white;margin-top:10px;"
    onclick="deleteOrder('${order.customerId}', '${order.id}')">
    Delete Order
</button>

                    <p>
                        <strong>Date:</strong>
                        ${new Date(
                            order.createdAt
                        ).toLocaleString()}
                    </p>
                `;

                adminOrdersList.appendChild(
                    orderCard
                );
            });
        }
    } catch (error) {
        console.error(error);

        adminOrdersList.innerHTML =
            "<p>Customer orders could not be loaded.</p>";
    }
}

// Delete a product from admin.html using Firebase
window.deleteProduct = async function (index) {
    try {
        const productsSnapshot =
            await get(ref(database, "products"));

        const adminProducts =
            productsSnapshot.exists()
                ? Object.values(productsSnapshot.val())
                : [];

        const product = adminProducts[index];

        if (!product || !product.id) {
            showToast("Product not found.");
            return;
        }

        const confirmed = confirm(
            "Are you sure you want to delete " +
            product.name +
            "?"
        );

        if (!confirmed) {
            return;
        }

        await remove(
            ref(database, "products/" + product.id)
        );

        showToast("Product deleted successfully.");

        location.reload();
    } catch (error) {
        console.error(error);

        showToast(
            "Product deletion failed: " +
            error.message
        );
    }
};



// Edit a product from admin.html using Firebase
window.editProduct = async function (index) {
    try {
        const productsSnapshot =
            await get(ref(database, "products"));

        const adminProducts =
            productsSnapshot.exists()
                ? Object.values(productsSnapshot.val())
                : [];

        const product = adminProducts[index];

        if (!product || !product.id) {
            showToast("Product not found.");
            return;
        }

        const newName = prompt(
            "Edit product name:",
            product.name || ""
        );

        if (newName === null) return;

        const newPrice = prompt(
            "Edit product price:",
            product.price || 0
        );

        if (newPrice === null) return;

        const newCategory = prompt(
            "Edit product category:",
            product.category || ""
        );

        if (newCategory === null) return;

        const newStock = prompt(
            "Edit product stock:",
            product.stock ?? 0
        );

        if (newStock === null) return;

        const newDescription = prompt(
            "Edit product description:",
            product.description || ""
        );

        if (newDescription === null) return;

        const newSizes = prompt(
            "Edit available sizes:",
            product.sizes || ""
        );

        if (newSizes === null) return;

        const newColors = prompt(
            "Edit available colours:",
            product.colors || ""
        );

        if (newColors === null) return;

        if (
            newName.trim() === "" ||
            newCategory.trim() === ""
        ) {
            showToast(
                "Product name and category cannot be empty."
            );
            return;
        }

        if (
            Number(newPrice) <= 0 ||
            Number.isNaN(Number(newPrice))
        ) {
            showToast("Please enter a valid price.");
            return;
        }

        if (
            Number(newStock) < 0 ||
            Number.isNaN(Number(newStock))
        ) {
            showToast("Please enter a valid stock number.");
            return;
        }

        await update(
            ref(database, "products/" + product.id),
            {
                name: newName.trim(),
                price: Number(newPrice),
                category: newCategory.trim(),
                stock: Number(newStock),
                description: newDescription.trim(),
                sizes: newSizes.trim(),
                colors: newColors.trim()
            }
        );

        showToast("Product updated successfully!");

        location.reload();
    } catch (error) {
        console.error(error);

        showToast(
            "Product update failed: " +
            error.message
        );
    }
};


// Show selected product image before adding it
const productImageInput =
    document.getElementById("product-image");

const imagePreview =
    document.getElementById("image-preview");

if (productImageInput && imagePreview) {
    productImageInput.addEventListener(
        "change",
        function () {
            const selectedImage =
                productImageInput.files[0];

            if (!selectedImage) {
                imagePreview.src = "";
                imagePreview.style.display =
                    "none";

                return;
            }

            const imageReader =
                new FileReader();

            imageReader.addEventListener(
                "load",
                function () {
                    imagePreview.src =
                        imageReader.result;

                    imagePreview.style.display =
                        "block";
                }
            );

            imageReader.readAsDataURL(
                selectedImage
            );
        }
    );
}


// Update dashboard statistics on admin.html
async function updateDashboardStats() {
    const productsSnapshot =
    await get(ref(database, "products"));

const adminProducts =
    productsSnapshot.exists()
        ? Object.values(productsSnapshot.val())
        : [];

    const totalProductsElement =
        document.getElementById(
            "total-products"
        );

    const totalCategoriesElement =
        document.getElementById(
            "total-categories"
        );

    const totalValueElement =
        document.getElementById(
            "total-value"
        );

    const categories =
        adminProducts
            .map(function (product) {
                return String(
                    product.category || ""
                )
                    .trim()
                    .toLowerCase();
            })
            .filter(function (category) {
                return category !== "";
            });

    const uniqueCategories =
        [...new Set(categories)];

    const totalValue =
        adminProducts.reduce(
            function (total, product) {
                const productPrice =
                    Number(product.price || 0);

                const productStock =
                    Number(product.stock || 0);

                return (
                    total +
                    productPrice * productStock
                );
            },
            0
        );

    if (totalProductsElement) {
        totalProductsElement.textContent =
            adminProducts.length;
    }

    if (totalCategoriesElement) {
        totalCategoriesElement.textContent =
            uniqueCategories.length;
    }

    if (totalValueElement) {
        totalValueElement.textContent =
            "₦" +
            totalValue.toLocaleString();
    }
}

updateDashboardStats();


// Search products on admin.html
const adminProductSearch =
    document.getElementById(
        "admin-product-search"
    );

if (adminProductSearch) {
    adminProductSearch.addEventListener(
        "input",
        function () {
            const searchText =
                adminProductSearch.value
                    .trim()
                    .toLowerCase();

            const savedProductCards =
                document.querySelectorAll(
                    "#admin-products-list .admin-product-card"
                );

            savedProductCards.forEach(
                function (card) {
                    const productTitle =
                        card.querySelector("h3");

                    if (!productTitle) {
                        return;
                    }

                    const productName =
                        productTitle.textContent
                            .trim()
                            .toLowerCase();

                    if (
                        productName.includes(
                            searchText
                        )
                    ) {
                        card.style.display =
                            "block";
                    } else {
                        card.style.display =
                            "none";
                    }
                }
            );
        }
    );
}

// ===========================
// ADMIN LOGIN
// ===========================



// ===========================
// PRODUCT DETAILS PAGE
// ===========================

const productDetailsContainer =
    document.getElementById(
        "product-details-container"
    );

if (productDetailsContainer) {
    const pageParameters =
        new URLSearchParams(
            window.location.search
        );

   const productId =
    pageParameters.get("id");

const productSnapshot =
    await get(
        ref(database, "products/" + productId)
    );

const selectedProduct =
    productSnapshot.exists()
        ? productSnapshot.val()
        : null;

        if (selectedProduct) {
    let recentlyViewed =
        JSON.parse(
            localStorage.getItem("recentlyViewed")
        ) || [];

    recentlyViewed =
        recentlyViewed.filter(
            product => product.id !== productId
        );

    recentlyViewed.unshift({
        ...selectedProduct,
        id: productId
    });

    recentlyViewed =
        recentlyViewed.slice(0, 4);

    localStorage.setItem(
        "recentlyViewed",
        JSON.stringify(recentlyViewed)
    );
}

    if (!selectedProduct) {
        productDetailsContainer.innerHTML = `
            <div class="product-not-found">
                <h2>Product not found</h2>

                <p>
                    This product may have been removed
                    or the link is incorrect.
                </p>

                <a href="index.html">
                    Return to Store
                </a>
            </div>
        `;
    } else {
        const productStock =
            Number(
                selectedProduct.stock || 0
            );

        productDetailsContainer.innerHTML = `
            <div
                class="product-details-content product-card"
                data-category="${String(
                    selectedProduct.category || ""
                ).toLowerCase()}"
            >
               <div class="product-gallery">

    <div
         class="main-image-wrapper"
         id="zoom-container"
   >

    <button
        type="button"
        class="gallery-arrow gallery-prev"
        onclick="changeGalleryImage(-1)"
    >
        ❮
    </button>

    <img
        src="${selectedProduct.image}"
        alt="${selectedProduct.name}"
        class="product-details-image"
        id="product-main-image"
    >

    <button
        type="button"
        class="gallery-arrow gallery-next"
        onclick="changeGalleryImage(1)"
    >
        ❯
    </button>

</div>
    <div class="product-thumbnails">
        ${
            (
                selectedProduct.images ||
                [selectedProduct.image]
            )
                .map(function (image) {
                    return `
                        <img
                            src="${image}"
                            alt="${selectedProduct.name}"
                            class="product-thumbnail"
                            onclick="changeProductImage('${image}', this)"
                        >
                    `;
                })
                .join("")
        }
    </div>

</div>

                <div class="product-details-info">
                    <h2>
                        ${selectedProduct.name}
                    </h2>

                    <p class="product-details-description">
                        ${
                            selectedProduct.description ||
                            "No description available."
                        }
                    </p>

                    <p class="product-details-price price">
                        ₦${Number(
                            selectedProduct.price || 0
                        ).toLocaleString()}
                    </p>

                    <p class="product-details-stock">
                        ${
                            productStock > 0
                                ? "In Stock: " +
                                  productStock
                                : "Out of Stock"
                        }
                    </p>

                  <div class="product-options">

    <label for="selected-size">
        Choose Size
    </label>

    <select id="selected-size">
        <option value="">
            Select a size
        </option>

        ${
            String(
                selectedProduct.sizes || ""
            )
                .split(",")
                .map(function (size) {
                    const cleanSize =
                        size.trim();

                    if (cleanSize === "") {
                        return "";
                    }

                    return `
                        <option value="${cleanSize}">
                            ${cleanSize}
                        </option>
                    `;
                })
                .join("")
        }
    </select>


    <label for="selected-color">
        Choose Colour
    </label>

    <select id="selected-color">
        <option value="">
            Select a colour
        </option>

        ${
            String(
                selectedProduct.colors || ""
            )
                .split(",")
                .map(function (color) {
                    const cleanColor =
                        color.trim();

                    if (cleanColor === "") {
                        return "";
                    }

                    return `
                        <option value="${cleanColor}">
                            ${cleanColor}
                        </option>
                    `;
                })
                .join("")
        }
    </select>

</div>

                    <button
                        type="button"
                        class="add-to-cart product-details-add-cart"
                        ${
                            productStock <= 0
                                ? "disabled"
                                : ""
                        }
                    >
                        ${
                            productStock > 0
                                ? "Add to Cart"
                                : "Out of Stock"
                        }
                    </button>
               </div>

            </div>

            <section class="related-products-section">
                <h2>Related Products</h2>

                <div
                    id="related-products"
                    class="products-container">
                </div>
            </section>
        `;
}

// ==========================
// RELATED PRODUCTS
// ==========================

const relatedProductsContainer = document.getElementById("related-products");
  
if (relatedProductsContainer && selectedProduct) {
    const productsSnapshot = await get(ref(database, "products"));

    if (productsSnapshot.exists()) {
        const allProducts = Object.entries(productsSnapshot.val()).map(
            ([firebaseid, product]) => ({
                ...product,
                id: firebaseid
            })
        );

        const relatedProducts = allProducts
            .filter(product =>
                product.id !== productId &&
                String(product.category || "")
                     .trim() 
                     .toLowerCase() ===
                String(selectedProduct.category || "")
                .trim()
                .toLowerCase()
            )
            .slice(0, 4);

        if (relatedProducts.length > 0) {
            relatedProductsContainer.innerHTML = relatedProducts
                .map(product => `
                    <div class="product-card">
                        <a href="product-details.html?id=${product.id}">
                            <img src="${product.image}" alt="${product.name}">
                        </a>

                        <h3>${product.name}</h3>

                        <p class="price">
                            ₦${Number(product.price || 0).toLocaleString()}
                        </p>

                        <a href="product-details.html?id=${product.id}" class="view-product-link">
                            View Product
                        </a>
                    </div>
                `)
                .join("");
        } else {
            relatedProductsContainer.innerHTML =
                "<p>No related products found.</p>";
        }

    }

}

}

// ==========================
// RECENTLY VIEWED PRODUCTS
// ==========================

const recentlyViewedContainer =
    document.getElementById("recently-viewed-products");

if (recentlyViewedContainer) {

    const recentlyViewed =
        JSON.parse(
            localStorage.getItem("recentlyViewed")
        ) || [];

    if (recentlyViewed.length > 0) {

        recentlyViewedContainer.innerHTML =
            recentlyViewed.map(product => `
                <div class="product-card">

                    <img
                        src="${product.images?.[0] || product.image}"
                        alt="${product.name}">

                    <h3>${product.name}</h3>

                    <p class="price">
                        ₦${Number(product.price).toLocaleString()}
                    </p>

                    <a
                        href="product-details.html?id=${product.id}"
                        class="view-product-link">
                        View Product
                    </a>

                </div>
            `).join("");

    }

}

// ===========================
// WISHLIST
// ===========================

let wishlist =
    JSON.parse(
        localStorage.getItem("wishlist")
    ) || [];

document.addEventListener(
    "click",
   async function (event) {
        const wishlistButton =
            event.target.closest(
                ".wishlist-btn"
            );

        if (!wishlistButton) {
            return;
        }

        const productIndex =
            Number(
                wishlistButton.dataset.index
            );

       const productsSnapshot =
    await get(ref(database, "products"));

const adminProducts =
    productsSnapshot.exists()
        ? Object.values(productsSnapshot.val())
        : [];
        const selectedProduct =
            adminProducts[productIndex];

        if (!selectedProduct) {
            return;
        }

        const alreadySaved =
            wishlist.some(
                function (product) {
                    return (
                        product.name ===
                        selectedProduct.name
                    );
                }
            );

        if (alreadySaved) {
            showToast(
                selectedProduct.name +
                    " is already in your wishlist."
            );

            return;
        }

        wishlist.push(selectedProduct);

        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
        );

        wishlistButton.textContent =
            "♥ Saved";

        showToast(
            selectedProduct.name +
                " has been added to your wishlist."
        );
    }
);

// ===========================
// DISPLAY WISHLIST PAGE
// ===========================

const wishlistContainer =
    document.getElementById(
        "wishlist-container"
    );

if (wishlistContainer) {
    let savedWishlist =
        JSON.parse(
            localStorage.getItem(
                "wishlist"
            )
        ) || [];

    if (savedWishlist.length === 0) {
        wishlistContainer.innerHTML = `
            <div class="empty-wishlist">
                <h2>Your wishlist is empty</h2>

                <p>
                    Products you save will appear here.
                </p>

                <a href="index.html">
                    Continue Shopping
                </a>
            </div>
        `;
    } else {
        wishlistContainer.innerHTML = "";

        savedWishlist.forEach(
            function (product, index) {
                const wishlistCard =
                    document.createElement(
                        "div"
                    );

                wishlistCard.classList.add(
                    "wishlist-card"
                );

                wishlistCard.innerHTML = `
                    <img
                        src="${product.image}"
                        alt="${product.name}"
                    >

                    <h3>
                        ${product.name}
                    </h3>

                    <p class="price">
                        ₦${Number(
                            product.price || 0
                        ).toLocaleString()}
                    </p>

                    <a
                       href="product-details.html?id=${product.id}"
                        class="view-product-link"
                    >
                        View Product
                    </a>

                    <button
                        type="button"
                        class="wishlist-add-cart"
                        data-index="${index}"
                    >
                        Add to Cart
                    </button>

                    <button
                        type="button"
                        class="remove-wishlist"
                        data-index="${index}"
                    >
                        Remove
                    </button>
                `;

                wishlistContainer.appendChild(
                    wishlistCard
                );
            }
        );
    }
}


// Find the product inside adminProducts
function findProductIndex(product) {
    const adminProducts =
        JSON.parse(
            localStorage.getItem(
                "adminProducts"
            )
        ) || [];

    return adminProducts.findIndex(
        function (savedProduct) {
            return (
                savedProduct.name ===
                product.name
            );
        }
    );
}


// Remove a product from the wishlist
document.addEventListener(
    "click",
    function (event) {
        const removeButton =
            event.target.closest(
                ".remove-wishlist"
            );

        if (!removeButton) {
            return;
        }

        const productIndex =
            Number(
                removeButton.dataset.index
            );

        let savedWishlist =
            JSON.parse(
                localStorage.getItem(
                    "wishlist"
                )
            ) || [];

        savedWishlist.splice(
            productIndex,
            1
        );

        localStorage.setItem(
            "wishlist",
            JSON.stringify(savedWishlist)
        );

        location.reload();
    }
);


// Add a wishlist product to the cart
document.addEventListener(
    "click",
    function (event) {
        const addCartButton =
            event.target.closest(
                ".wishlist-add-cart"
            );

        if (!addCartButton) {
            return;
        }

        const productIndex =
            Number(
                addCartButton.dataset.index
            );

        const savedWishlist =
            JSON.parse(
                localStorage.getItem(
                    "wishlist"
                )
            ) || [];

        const selectedProduct =
            savedWishlist[productIndex];

        if (!selectedProduct) {
            return;
        }

        cart.push({
            name: selectedProduct.name,
            price: Number(
                selectedProduct.price || 0
            ),
            image:
                selectedProduct.image || "",
            quantity: 1
        });

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

        if (cartCounter) {
            cartCounter.textContent =
                cart.length;
        }

        showToast(
            selectedProduct.name +
                " has been added to your cart."
        );
    }
);

window.changeProductImage = function (
    imagePath,
    clickedThumbnail
) {
    const mainImage =
        document.getElementById("product-main-image");

    if (!mainImage) {
        return;
    }

    mainImage.src = imagePath;

    const thumbnails =
        document.querySelectorAll(".product-thumbnail");

    thumbnails.forEach(function (thumbnail) {
        thumbnail.classList.remove("active-thumbnail");
    });

    if (clickedThumbnail) {
        clickedThumbnail.classList.add("active-thumbnail");

        currentGalleryIndex =
            Array.from(thumbnails).indexOf(clickedThumbnail);
    }
};

let currentGalleryIndex = 0;

window.changeGalleryImage = function (direction) {
    const mainImage =
        document.getElementById(
            "product-main-image"
        );

         const thumbnails =
        document.querySelectorAll(
            ".product-thumbnail"
        );

    if (
        !mainImage ||
        thumbnails.length === 0
    ) {
        return;
    }

    currentGalleryIndex =
        currentGalleryIndex + direction;

    if (
        currentGalleryIndex <
        0
    ) {
        currentGalleryIndex =
            thumbnails.length - 1;
    }

    if (
        currentGalleryIndex >=
        thumbnails.length
    ) {
        currentGalleryIndex = 0;
    }

    mainImage.src =
        thumbnails[
            currentGalleryIndex
        ].src;
};

        const zoomContainer =
    document.getElementById("zoom-container");

const zoomImage =
    document.getElementById("product-main-image");

if (zoomContainer && zoomImage) {
    zoomContainer.addEventListener(
        "mousemove",
        function (event) {
            const rectangle =
                zoomContainer.getBoundingClientRect();

            const x =
                event.clientX - rectangle.left;

            const y =
                event.clientY - rectangle.top;

            const xPercentage =
                (x / rectangle.width) * 100;

            const yPercentage =
                (y / rectangle.height) * 100;

            zoomImage.style.transformOrigin =
                xPercentage + "% " +
                yPercentage + "%";

            zoomImage.style.transform =
                "scale(1.8)";
        }
    );

    zoomContainer.addEventListener(
        "mouseleave",
        function () {
            zoomImage.style.transform =
                "scale(1)";

            zoomImage.style.transformOrigin =
                "center center";
        }
    );
}

window.updateOrderStatus = async function (customerId, orderId) {

    const statusSelect =
        document.getElementById(`status-${orderId}`);

    const newStatus = statusSelect.value;

    try {

        await update(
            ref(database, `orders/${customerId}/${orderId}`),
            {
                status: newStatus
            }
        );

        showToast("Order status updated successfully!");

        location.reload();

    } catch (error) {

        console.error(error);

        showToast("Could not update order status.");

    }

};

window.deleteOrder = async function (customerId, orderId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        await remove(
            ref(database, `orders/${customerId}/${orderId}`)
        );

        showToast("Order deleted successfully!");

        location.reload();

    } catch (error) {

        console.error(error);

        showToast("Unable to delete order.");

    }

};

// =========================
// NANA COLLECTION V2 MENU
// =========================

const menuButton = document.getElementById("menuButton");
const closeMenuButton = document.getElementById("closeMenuButton");
const mobileMenu = document.getElementById("mobileMenu");
const menuOverlay = document.getElementById("menuOverlay");

function openMobileMenu() {
    mobileMenu.classList.add("active");
    menuOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
    mobileMenu.classList.remove("active");
    menuOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

if (menuButton) {
    menuButton.addEventListener("click", openMobileMenu);
}

if (closeMenuButton) {
    closeMenuButton.addEventListener("click", closeMobileMenu);
}

if (menuOverlay) {
    menuOverlay.addEventListener("click", closeMobileMenu);
}

document.querySelectorAll(".mobile-navigation a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
});

// =========================
// COLLECTION SCROLL ANIMATION
// =========================

const collectionCards = document.querySelectorAll(".collection-card");

const collectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    },
    {
        threshold: 0.2
    }
);

collectionCards.forEach((card) => {
    collectionObserver.observe(card);
});

// ==========================
// PRODUCT REVIEWS
// ==========================

const submitReviewButton =
    document.getElementById("submit-review-btn");

const reviewRating =
    document.getElementById("review-rating");

const reviewText =
    document.getElementById("review-text");

const reviewsList =
    document.getElementById("reviews-list");

    if (
    submitReviewButton &&
    reviewRating &&
    reviewText &&
    reviewsList
) {

    submitReviewButton.addEventListener(
        "click",
        async () => {

            const currentUser = auth.currentUser;

if (!currentUser) {
    showToast("Please log in before submitting a review.");
    window.location.href = "login.html";
    return;
}

const ratingValue =
    Number(reviewRating.value);

const reviewMessage =
    reviewText.value.trim();

if (!ratingValue) {
    showToast("Please select a rating.");
    return;
}

if (reviewMessage === "") {
    showToast("Please write your review.");
    return;
}

const pageParameters =
    new URLSearchParams(
        window.location.search
    );

const reviewedProductId =
    pageParameters.get("id");

if (!reviewedProductId) {
    showToast("Product could not be identified.");
    return;
}

const reviewReference =
    push(
        ref(
            database,
            "reviews/" + reviewedProductId
        )
    );

const reviewData = {
    id: reviewReference.key,
    productId: reviewedProductId,
    customerId: currentUser.uid,
    customerEmail: currentUser.email,
    customerName:
        currentUser.displayName ||
        currentUser.email.split("@")[0],
    rating: ratingValue,
    review: reviewMessage,
    createdAt: new Date().toISOString()
};

await set(
    reviewReference,
    reviewData
);

showToast("Your review has been submitted!");

reviewRating.value = "";
reviewText.value = "";

setTimeout(() => {
    location.reload();
}, 1800);

        }
    );

}

// ==========================
// LOAD PRODUCT REVIEWS
// ==========================

const reviewsContainer =
    document.getElementById("reviews-list");

if (reviewsContainer) {
    const reviewPageParameters =
        new URLSearchParams(
            window.location.search
        );

    const currentProductId =
        reviewPageParameters.get("id");

    if (currentProductId) {
        const reviewsSnapshot =
            await get(
                ref(
                    database,
                    "reviews/" + currentProductId
                )
            );

        if (reviewsSnapshot.exists()) {
            const productReviews =
                Object.values(
                    reviewsSnapshot.val()
                );

            productReviews.sort(
                function (a, b) {
                    return (
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                    );
                }
            );

            reviewsContainer.innerHTML =
                productReviews
                    .map(function (review) {
                        return `
                            <div class="review-card">

                                <div class="review-stars">
                                    ${"★".repeat(
                                        Number(review.rating || 0)
                                    )}
                                    ${"☆".repeat(
                                        5 - Number(review.rating || 0)
                                    )}
                                </div>

                                <p class="review-name">
                                    ${review.customerName || "Customer"}
                                </p>

                                <p>
                                    ${review.review || ""}
                                </p>

                                <p class="review-date">
                                    ${new Date(
                                        review.createdAt
                                    ).toLocaleDateString()}
                                </p>

                            </div>
                        `;
                    })
                    .join("");
        } else {
            reviewsContainer.innerHTML =
                "<p>No reviews yet.</p>";
        }
    }
}

function hidePageLoader() {
    const loader = document.getElementById("page-loader");

    if (!loader) return;

    setTimeout(() => {
        loader.classList.add("hide");
    }, 1200);
}

if (document.readyState === "complete") {
    hidePageLoader();
} else {
    window.addEventListener("load", hidePageLoader);
}

// ===========================
// TOAST NOTIFICATIONS
// ===========================

function showToast(message, type = "success") {
    let container =
        document.getElementById("toast-container");

    // Automatically create the container
    // when the current page does not have one.
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}