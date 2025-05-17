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
	  <div class="stock_section hidden">
		   <button class="increase"> + </button>
                <p class="stock"> 1 </p>
		   <button class="decrease"> - </button>
	    </div>
		<div class="addItem"> 
		  <button>Add to Cart</button>
		</div>
            
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
  <div>
  <h1>Desserts</h1>
        <div class="container">
        <div class="dessert_cards">
                ${cardsHtml}
            </div>
            <div class="cart">
            <h2>Your Cart (<!-- Quantity -->)</h2>
                
                Your added items will appear here
                <div class="cart_items"></div>
                <div class="total">
                    <p>order Total </p>
                    <p class="amount"> $ </p>
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
        </div>
    `;
	// Add event listener for the "Add to Cart" buttons
	document
		.querySelectorAll(".addItem button")
		.forEach((button) => {
			button.addEventListener("click", (event) => {
				event.stopPropagation(); // Prevent the card click event from firing
				console.log("Add to Cart button clicked");
				// Get the dessert card details
				const card = (button as HTMLElement).closest(".dessert_card");
				if (!card) return;

				// Hide Add to Cart, show stock controls
				toggleAddToCartAndStock(card as HTMLElement, false);
				// Optionally, set stock to 1 if needed
				const stockElement = card.querySelector(".stock");
				if (stockElement) stockElement.textContent = "1";

				const name = card.querySelector("h2")?.textContent || "dessert";
				
				const priceText = card.querySelector(".price")?.textContent || "0";
				const price = parseFloat(priceText.replace("$", ""));
				// Add the item to the cart
				const cartItemsContainer = document.querySelector(".cart_items");
				let itemElement: HTMLDivElement | null = null;
				if (cartItemsContainer) {
					itemElement = document.createElement("div");
					itemElement.className = "item";
					itemElement.innerHTML = `
					<h3>${name}</h3>
					<p class="price" data-unit-price="${price}">$${price.toFixed(2)}</p>
					<p class="cart-stock">Qty: <span>${
						stockElement ? stockElement.textContent : "1"
					}</span></p>
					<button class="remove">Remove</button>
				  `;
					cartItemsContainer.appendChild(itemElement);
					updateTotalAmount();
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

							updateTotalAmount();
							toggleAddToCartAndStock(card as HTMLElement, true);
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
			const priceText = item.querySelector(".price")?.textContent || "0";
			const price = parseFloat(priceText.replace("$", ""));
			totalAmount += price;
		});
		// display the total amount and item name in a modal
		const itemNames = Array.from(cartItems)
			.map((item) => item.querySelector("h3")?.textContent || "")
			.join(", ");
		alert(`Order confirmed! Total amount: $${totalAmount.toFixed(2)}\nYour desserts: ${itemNames}`);

		// Optionally, you can clear the cart after confirmation
		document.querySelector(".cart_items")!.innerHTML = ""; // Clear cart items
		document.querySelector(".total .amount")!.textContent = "$0.00"; // Reset total amount
		// reset the stock numbers in the dessert cards
		document.querySelectorAll('.dessert_card .stock').forEach(stockElement => {
			(stockElement as HTMLElement).textContent = '1'; // Reset stock to 1
		}
		);

		//reset the Add to Cart buttons
		document.querySelectorAll('.dessert_card .addItem').forEach(addItemDiv => {
			(addItemDiv as HTMLElement).classList.remove('hidden'); // Show Add to Cart buttons
		});
		document.querySelectorAll('.dessert_card .stock_section').forEach(stockSection => {
			(stockSection as HTMLElement).classList.add('hidden'); // Hide stock controls
		});

		// alert(`Order confirmed! Total amount: $${totalAmount.toFixed(2)}`);
   

	});
   //update the stock number by incrementing or decsrementing the stock number
   document.querySelectorAll('.increase').forEach(button => {
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        const card = (button as HTMLElement).closest('.dessert_card');
        if (!card) return;
        const stockElement = card.querySelector('.stock');
        if (stockElement) {
            let stock = parseInt(stockElement.textContent || '1', 10);
            stock++;
            stockElement.textContent = stock.toString();

            // Update cart item if it exists
            const name = card.querySelector("h2")?.textContent || "";
            const cartItem = Array.from(document.querySelectorAll('.cart_items .item')).find(item =>
                item.querySelector('h3')?.textContent === name
            );
            if (cartItem) {
                const cartStock = cartItem.querySelector('.cart-stock span');
                const priceElement = cartItem.querySelector('.price');
                const unitPrice = parseFloat(priceElement?.getAttribute('data-unit-price') || '0');
                if (cartStock && priceElement) {
                    cartStock.textContent = stock.toString();
                    priceElement.textContent = `$${(unitPrice * stock).toFixed(2)}`;
                }
                updateTotalAmount();
            }
        }
    });
	}
);

document.querySelectorAll(".decrease").forEach((button) => {
	button.addEventListener("click", (event) => {
		event.stopPropagation();
		const card = (button as HTMLElement).closest(".dessert_card");
		if (!card) return;
		const stockElement = card.querySelector(".stock");
		if (stockElement) {
			let stock = parseInt(stockElement.textContent || "1", 10);
			if (stock > 1) {
				stock--;
				stockElement.textContent = stock.toString();

				// Update cart item if it exists
				const name = card.querySelector("h2")?.textContent || "";
				const cartItem = Array.from(
					document.querySelectorAll(".cart_items .item")
				).find((item) => item.querySelector("h3")?.textContent === name);
				if (cartItem) {
					const cartStock = cartItem.querySelector(".cart-stock span");
					const priceElement = cartItem.querySelector(".price");
					const unitPrice = parseFloat(
						priceElement?.getAttribute("data-unit-price") || "0"
					);
					if (cartStock && priceElement) {
						cartStock.textContent = stock.toString();
						priceElement.textContent = `$${(unitPrice * stock).toFixed(2)}`;
					}
					updateTotalAmount();
				}
			} else if (stock === 1) {
				// Remove from cart if stock goes to 0
				stockElement.textContent = "0";
				toggleAddToCartAndStock(card as HTMLElement, true);

				const name = card.querySelector("h2")?.textContent || "";
				const cartItem = Array.from(
					document.querySelectorAll(".cart_items .item")
				).find((item) => item.querySelector("h3")?.textContent === name);
				if (cartItem) {
					cartItem.remove();
					updateTotalAmount();
				}
			}
		}
	});
});
//apply the stock number effect to cart items
document.addEventListener('change', async (e)=> {
	const target = e.target as HTMLInputElement;
	if (target.classList.contains('stock')) {
		const card = target.closest('.dessert_card');
		if (card) {
			const stock = parseInt(target.textContent || '0', 10);
			const addButton = card.querySelector('button');
			if (addButton) {
				addButton.disabled = stock <= 0; // Disable button if stock is 0 or less
			}
		}
	}
	
})


}
// Start the application
initializeApp().catch(console.error);

function updateTotalAmount() {
	const totalAmountElement = document.querySelector(".total .amount");
	if (totalAmountElement) {
		let totalAmount = 0;
		document.querySelectorAll(".cart_items .item").forEach((item) => {
			const priceText = item.querySelector(".price")?.textContent || "0";
			const price = parseFloat(priceText.replace("$", ""));
			totalAmount += price;
		});
		totalAmountElement.textContent = `$${totalAmount.toFixed(2)}`;
	}
}
function toggleAddToCartAndStock(card: HTMLElement, showAddToCart: boolean) {
	const addToCartDiv = card.querySelector(".addItem");
	const stockSection = card.querySelector(".stock_section");
	if (addToCartDiv && stockSection) {
		addToCartDiv.classList.toggle("hidden", !showAddToCart);
		stockSection.classList.toggle("hidden", showAddToCart);
	}
}

