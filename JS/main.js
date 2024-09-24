class Auth {
  constructor() {
    // Load user data from localStorage
    this.email = localStorage.getItem('email') || '';
    this.password = localStorage.getItem('password') || '';
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.currentPage = window.location.pathname;

    this.initialize();
  }

  initialize() {
    // Check login status and handle page redirection
    if (this.isLoggedIn) {
      this.redirectIfLoggedIn();
    } else {
      this.handleForms();
      this.redirectIfNotLoggedIn();
    }

    this.setupLogoutButton();
  }

  redirectIfLoggedIn() {
    // Redirect to homepage if logged in and on the index or signup pages
    if (this.currentPage.includes('index.html') || this.currentPage.includes('signup.html')) {
      window.location.href = './homepage.html';
    }
  }

  redirectIfNotLoggedIn() {
    // Redirect to login page if not logged in and on restricted pages
    if (this.currentPage.includes('homepage.html') || this.currentPage.includes('cart.html')) {
      window.location.href = './index.html'; 
    }
  }

  handleForms() {
    // Setup signup or login forms based on the current page
    if (this.currentPage.includes('signup.html')) {
      this.setupSignupForm();
    } else if (this.currentPage.includes('index.html')) {
      this.setupLoginForm();
    }
  }

  setupSignupForm() {
    // Handle signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        this.signup();
      });
    }
  }

  setupLoginForm() {
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        this.login();
      });
    }
  }

  signup() {
    // Save signup data to localStorage and redirect
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
    localStorage.setItem('isLoggedIn', 'true');

    this.showMessage('Signup successful! Redirecting to homepage...');

    setTimeout(() => {
      window.location.href = './homepage.html';
    }, 2000);
  }

  login() {
    // Verify login credentials and redirect if valid
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email === this.email && password === this.password) {
      localStorage.setItem('isLoggedIn', 'true');
      this.showMessage('Login successful! Redirecting to homepage...');

      setTimeout(() => {
        window.location.href = './homepage.html';
      }, 2000);
    } else {
      this.showMessage('Invalid email or password', 'error');
    }
  }

  showMessage(message, type = 'success') {
    // Display a message (success or error)
    const messageElement = document.createElement('p');
    messageElement.innerText = message;

    const classes = type === 'success' ? ['text-green-500'] : ['text-red-500'];
    messageElement.classList.add(...classes, 'text-center', 'mb-4');

    const form = this.currentPage.includes('signup.html')
      ? document.getElementById('signupForm')
      : document.getElementById('loginForm');

    if (form) {
      form.parentNode.insertBefore(messageElement, form);
    }
  }

  setupLogoutButton() {
    // Handle logout button click
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        this.logout();
      });
    }
  }

  logout() {
    // Clear user data and redirect to login page
    localStorage.removeItem('email');
    localStorage.removeItem('password');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('cart');

    window.location.href = './index.html';
  }
}

class Cart {
  constructor() {
    // Load cart data from localStorage and convert prices to numbers
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
    this.items = this.items.map(item => ({
      ...item,
      price: parseFloat(item.price)
    }));

    this.initializeCart();
  }

  initializeCart() {
    // Setup cart buttons and display
    this.setupAddToCartButtons();
    this.updateCartDisplay();
  }

  setupAddToCartButtons() {
    // Add event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price'));
        const imageSrc = button.getAttribute('data-src');
        this.addToCart(name, price, imageSrc);
      });
    });
  }

  setupShowNotification() {
    // Display a notification when a product is added to the cart
    const notification = document.getElementById('notification');
    const showNotification = (message) => {
      notification.innerHTML = message;
      notification.classList.add('show');
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    };
    showNotification('Your product added to cart');
  }

  addToCart(name, price, imageSrc) {
    // Add item to cart or increase quantity if it exists
    const existingItem = this.items.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({ name, price, imageSrc, quantity: 1 });
    }
    this.saveCart();
    this.updateCartDisplay();
    this.setupShowNotification();
  }

  removeFromCart(index) {
    // Remove item from cart by index
    this.items.splice(index, 1);
    this.saveCart();
    this.updateCartDisplay();
  }

  updateQuantity(index, quantity) {
    // Update item quantity and refresh cart display
    this.items[index].quantity = parseInt(quantity, 10) || 1;
    this.saveCart();
    this.updateCartDisplay();
  }

  saveCart() {
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  updateCartDisplay() {
    // Update the cart display with current items and total price
    const cartContent = document.getElementById('cart-content');
    const itemCount = document.getElementById('item-count');
    const summaryItemCount = document.getElementById('summary-item-count');
    const totalPrice = document.getElementById('total-price');

    if (cartContent) {
        cartContent.innerHTML = '';
        let total = 0;

        this.items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            cartContent.innerHTML += `
                <div class="flex items-center hover:bg-gray-100 -mx-8 px-6 py-5">
                    <div class="flex w-2/5">
                        <div class="w-20">
                            <img class="h-24" src="${item.imageSrc}" alt="${item.name}">
                        </div>
                        <div class="flex flex-col justify-between ml-4 flex-grow">
                            <span class="font-bold text-sm">${item.name}</span>
                            <a href="#" class="font-semibold hover:text-red-500 text-gray-500 text-xs" onclick="event.preventDefault(); cart.removeFromCart(${index})">Remove</a>
                        </div>
                    </div>
                    <div class="flex justify-center w-1/5">
                        <input class="mx-2 border text-center w-8" type="number" value="${item.quantity}" min="1" onchange="cart.updateQuantity(${index}, this.value)">
                    </div>
                    <div class="text-center w-1/5">
                        <span class="block font-semibold text-sm text-gray-400">Price</span>
                        <span class="block font-semibold text-sm">$${item.price.toFixed(2)}</span>
                    </div>
                    <div class="text-center w-1/5">
                        <span class="block font-semibold text-sm text-gray-400">Total Price</span>
                        <span class="block font-semibold text-sm">$${itemTotal.toFixed(2)}</span>
                    </div>
                </div>
            `;
        });

        if (itemCount) itemCount.innerHTML = `${this.items.length} Items`;
        if (summaryItemCount) summaryItemCount.innerHTML = this.items.length;
        if (totalPrice) totalPrice.innerHTML = `$${total.toFixed(2)}`;
    }
  }
}

// Instantiate Auth and Cart classes
new Auth();
window.cart = new Cart();



