import './style.css'
import { DatabaseService } from './database.service';


async function initializeApp () {
	const db = new DatabaseService();

	await db.initDatabase();
	await db.loadInitialData?.();
	console.log("Database initialized successfully");

	const products = await db.getAllProducts();

	const cardsHtml = products
		.map(
			(product) => `
      <div class="dessert_card" data-id="${product.id}">
 <div class="subsection1">
      <img src="${product.imageUrl}" alt="${product.name}" />
       <p class="stock">${product.stock}</p>
            <button>Add to Cart</button>
        </div>
        <div class="subsection2">
            <h2>${product.name}</h2>
            <p>${product.category}</p>
            <p class="price">${product.price.toFixed(2)}</p>
            </div>
           
        </div>
    `
		)
		.join("");

	document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
        <div class="container">
        <div class="dessert_cards">
        <h1>Desserts</h1>
                ${cardsHtml}
            </div>
            <div class="cart">
            <h2>Your Cart (<!-- Quantity -->)</h2>
                
                Your added items will appear here
                <div class="cart_items"></div>
                <div class="total">
                    <p>order Total </p>
                    <p class="amount">$<!-- Total amount --></p>
                </div>
                <div class="carbon_neutral">
                    <p>this is a carbon neutral delivery</p>
                    </div>
                <div class="checkout_section">
                    <button class="checkout">Confirm Order</button>
                </div>
            </div>
        </div>
        </div>
    `;
	// Add event listener for the "Add to Cart" buttons
	document.querySelectorAll(".dessert_card button").forEach((button) => {
		button.addEventListener("click", (event) => {
			event.stopPropagation(); // Prevent the card click event from firing
			console.log("Add to Cart button clicked");
			// Get the dessert card details
			const card = (button as HTMLElement).closest(".dessert_card");
			if (!card) return;

			const name = card.querySelector("h2")?.textContent || "dessert";
			const category = card.querySelector("p")?.textContent || "category";
			const price = parseFloat(
				card.querySelector(".price")?.textContent || "0"
			);
			// Add the item to the cart
			const cartItemsContainer = document.querySelector(".cart_items");
			let itemElement: HTMLDivElement | null = null;
			if (cartItemsContainer) {
				itemElement = document.createElement("div");
				itemElement.className = "item";
				itemElement.innerHTML = `
        <h3>${name}</h3>
        <p> ${category}</p>
        <p class="price">$${price.toFixed(2)}</p>
        
        <button class="remove">Remove</button>
      `;
				cartItemsContainer.appendChild(itemElement);
			}
			// Add event listener for the remove button
			if (itemElement) {
				const removeButton = itemElement.querySelector(".remove");
				if (removeButton) {
					//position the item back to the other desserts
					removeButton.addEventListener("click", (event) => {
						event.stopPropagation(); // Prevent the item click event from firing
						console.log("Remove button clicked");
						// Remove the item from the cart
						itemElement!.remove();
						// Optionally, update the cart total here

						const totalAmountElement = document.querySelector(".total .amount");
						if (totalAmountElement) {
							let totalAmount = 0;
							document.querySelectorAll(".cart_items .item").forEach((item) => {
								const price = parseFloat(
									item.querySelector(".price")?.textContent || "0"
								);
								totalAmount += price;
							});
							totalAmountElement.textContent = `$${totalAmount.toFixed(2)}`;
						}
					});
				}
			}
		});
	});
	// Add event listener for the checkout button
	document.querySelector(".checkout")?.addEventListener("click", () => {
		const cartItems = document.querySelectorAll(".cart_items .item");
		if (cartItems.length === 0) {
			alert("Your cart is empty!");
			return;
		}

		let totalAmount = 0;
		cartItems.forEach((item) => {
			const price = parseFloat(
				item.querySelector(".price")?.textContent || "0"
			);
			totalAmount += price;
		});

		alert(`Order confirmed! Total amount: $${totalAmount.toFixed(2)}`);
   

	});
  // Update the total amount display

}
// Start the application
initializeApp().catch(console.error);

//DISPLAY ALL MY DESSERTS
// Add event listeners to the dessert cards
document.querySelectorAll('.dessert_card').forEach(card => {
  card.addEventListener('click', () => {
    const name = card.querySelector('h2')?.textContent || 'Dessert';
    const category = card.querySelector('p')?.textContent || 'Category';
    const price = parseFloat(card.querySelector('.price')?.textContent || '0');
    const imageUrl = card.querySelector('img')?.getAttribute('src') || '';
    const stock = parseInt(card.querySelector('.stock')?.textContent || '0');

    console.log(`Selected Dessert: ${name}, Category: ${category}, Price: $${price}, Image: ${imageUrl}, Stock: ${stock}`);
  });
});



// Add event listener for the "Add to Cart" buttons
document.querySelectorAll(".dessert_card button").forEach((button) => {
	button.addEventListener("click", (event) => {
		event.stopPropagation(); // Prevent the card click event from firing
		console.log("Add to Cart button clicked");
		// Get the dessert card details
		const card = (button as HTMLElement).closest(".dessert_card");
		if (!card) return;

		const name = card.querySelector("h2")?.textContent || "dessert";
		const category = card.querySelector("p")?.textContent || "category";
		const price = parseFloat(card.querySelector(".price")?.textContent || "0");
		// Add the item to the cart
		const cartItemsContainer = document.querySelector(".cart_items");
		if (cartItemsContainer) {
			const itemElement = document.createElement("div");
			itemElement.className = "item";
			itemElement.innerHTML = `
        <h3>${name}</h3>
        <p>Category: ${category}</p>
        <p class="price">$${price.toFixed(2)}</p>
        
        <button class="remove">Remove</button>
      `;
			cartItemsContainer.appendChild(itemElement);
		}
	});
});



