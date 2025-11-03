document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const body = document.body;
    const cartIcon = document.querySelector('.icon-cart');
    const closeBtn = document.querySelector('.cartTab .close');
    const listCart = document.querySelector('.listCart');
    const cartBadge = document.querySelector('.icon-cart span');
    const addCartButtons = document.querySelectorAll('.addcart');

    // Toggle cart display when clicking the cart icon
    cartIcon.addEventListener('click', () => {
      body.classList.toggle('showCart');
    });

    // Close cart when clicking the CLOSE button
    closeBtn.addEventListener('click', () => {
      body.classList.remove('showCart');
    });

    // Update the cart badge with the total number of items
    function updateCartBadge() {
      let totalItems = 0;
      const cartItems = listCart.querySelectorAll('.item');
      cartItems.forEach((item) => {
        const quantityEl = item.querySelector('.quantity span:nth-child(2)');
        const quantity = parseInt(quantityEl.textContent);
        totalItems += quantity;
      });
      cartBadge.textContent = totalItems;
    }

    // Event delegation for quantity controls (plus/minus) in the cart
    listCart.addEventListener('click', (e) => {
      const target = e.target;
      if (target.classList.contains('plus') || target.classList.contains('minus')) {
        const itemDiv = target.closest('.item');
        const quantitySpan = itemDiv.querySelector('.quantity span:nth-child(2)');
        let quantity = parseInt(quantitySpan.textContent);
        const totalPriceEl = itemDiv.querySelector('.totalPrice');
        // Retrieve the base price stored as a data attribute (set when the item is created)
        const basePrice = parseFloat(itemDiv.getAttribute('data-base-price')) || 0;

        if (target.classList.contains('plus')) {
          quantity++;
        } else if (target.classList.contains('minus')) {
          quantity--;
        }

        if (quantity < 1) {
          // Remove the item if quantity is less than 1
          itemDiv.remove();
        } else {
          quantitySpan.textContent = quantity;
          totalPriceEl.textContent = basePrice * quantity;
        }
        updateCartBadge();
      }
    });

    // M-Pesa Checkout event listener
    document.getElementById("mpesa-checkout").addEventListener("click", () => {
      let phoneNumber = prompt("Enter your M-Pesa number:");
      
      if (!phoneNumber || phoneNumber.length < 10) {
          alert("Please enter a valid phone number!");
          return;
      }
  
      let totalAmount = calculateTotal(); // Function to get cart total
  
      fetch("http://127.0.0.1:5000/mpesa-stk", {  // Updated to port 5000
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneNumber, amount: totalAmount })
      })
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => console.log("Success:", data))
      .catch(error => console.error("Error:", error));
    });
  
    // Function to calculate total cart price
    function calculateTotal() {
      let total = 0;
      document.querySelectorAll(".totalPrice").forEach(item => {
        total += parseInt(item.textContent);
      });
      return total;
    }
  
    // Add to Cart functionality for each product button
    addCartButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const productItem = this.closest('.item');
        const productImg = productItem.querySelector('img').src;
        const productName = productItem.querySelector('h2').textContent;
        const productPriceText = productItem.querySelector('.price').textContent;
        // Extract numeric value from the price text (e.g., "KSHS.3500" → 3500)
        const productPrice = parseFloat(productPriceText.replace(/[^\d\.]/g, '')) || 0;
  
        // Check if the product is already in the cart by matching its name
        let existingItem = Array.from(listCart.querySelectorAll('.item')).find(
          (item) => item.querySelector('.name').textContent === productName
        );
  
        if (existingItem) {
          // If found, increase quantity and update the total price
          const quantitySpan = existingItem.querySelector('.quantity span:nth-child(2)');
          let quantity = parseInt(quantitySpan.textContent);
          quantity++;
          quantitySpan.textContent = quantity;
          const totalPriceEl = existingItem.querySelector('.totalPrice');
          totalPriceEl.textContent = productPrice * quantity;
        } else {
          // Otherwise, create a new cart item
          const cartItem = document.createElement('div');
          cartItem.classList.add('item');
          // Store the base price as a data attribute so we can use it later for calculations
          cartItem.setAttribute('data-base-price', productPrice);
          cartItem.innerHTML = `
            <img src="${productImg}" alt="${productName}">
            <div class="name">${productName}</div>
            <div class="totalPrice">${productPrice}</div>
            <div class="quantity">
                <span class="minus">≤</span>
                <span>1</span>
                <span class="plus">></span>
            </div>
          `;
          listCart.appendChild(cartItem);
        }
        updateCartBadge();
      });
    });
});
