// Global variables
let currentTab = 0;
let items = [];
let invoiceData = {
    userName: '',
    vendorName: '',
    invoiceDate: '',
    invoiceNumber: '',
    businessAddress: '',
    vendorAddress: '',
    contactNumber: '',
    gstNumber: '',
    discountType: 'none',
    discountValue: 0,
    signature: null,
    template: 'modern'
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateInvoicePreview();
});

// Initialize the application
function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    
    // Generate a random invoice number
    document.getElementById('invoiceNumber').value = 'INV-' + Math.floor(1000 + Math.random() * 9000);
    
    // Initialize counters
    animateCounter('invoicesCount', 50000, 2000);
    
    // Add first item row with pre-filled values
    addItemRow();
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// Setup all event listeners
function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Mobile menu toggle
    document.getElementById('mobileMenuToggle').addEventListener('click', toggleMobileMenu);
    
    // Tab navigation
    document.getElementById('prevTabBtn').addEventListener('click', prevTab);
    document.getElementById('nextTabBtn').addEventListener('click', nextTab);
    
    // Template selection
    document.querySelectorAll('.select-template').forEach(btn => {
        btn.addEventListener('click', function() {
            selectTemplate(this.dataset.template);
        });
    });
    
    // Template preview selector
    document.getElementById('templateSelect').addEventListener('change', function() {
        selectTemplate(this.value);
    });
    
    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', addItemRow);
    
    // Form inputs for real-time updates
    document.querySelectorAll('#business-tab input, #business-tab textarea').forEach(input => {
        input.addEventListener('input', updateInvoicePreview);
    });
    
    // Generate PDF
    document.getElementById('generatePdfBtn').addEventListener('click', generatePDF);
    
    // Share buttons
    document.getElementById('shareWhatsappBtn').addEventListener('click', shareViaWhatsApp);
    document.getElementById('shareEmailBtn').addEventListener('click', shareViaEmail);
    
    // Industry links
    document.querySelectorAll('.industry-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const industry = this.dataset.industry;
            showIndustryMessage(industry);
        });
    });
    
    // Modal controls
    setupModalControls();
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    // Auth switches
    document.getElementById('switchToSignup').addEventListener('click', function(e) {
        e.preventDefault();
        switchAuthModal('signup');
    });
    
    document.getElementById('switchToLogin').addEventListener('click', function(e) {
        e.preventDefault();
        switchAuthModal('login');
    });
    
    document.getElementById('forgotPassword').addEventListener('click', function(e) {
        e.preventDefault();
        switchAuthModal('forgotPassword');
    });
    
    // OTP input handling
    setupOTPInputs();
    
    // Add event listeners for existing items
    setTimeout(() => {
        document.querySelectorAll('.item-row').forEach(row => {
            setupItemRowListeners(row);
        });
    }, 100);
}

// Setup modal controls
function setupModalControls() {
    // Login modal
    document.getElementById('loginBtn').addEventListener('click', () => openModal('loginModal'));
    document.getElementById('loginModalClose').addEventListener('click', () => closeModal('loginModal'));
    
    // Signup modal
    document.getElementById('signupBtn').addEventListener('click', () => openModal('signupModal'));
    document.getElementById('signupModalClose').addEventListener('click', () => closeModal('signupModal'));
    
    // OTP modal
    document.getElementById('otpModalClose').addEventListener('click', () => closeModal('otpModal'));
    
    // Forgot password modal
    document.getElementById('forgotPasswordModalClose').addEventListener('click', () => closeModal('forgotPasswordModal'));
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

// Theme toggle function
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('themeToggle').querySelector('i');
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Tab navigation functions - FIXED
function nextTab() {
    console.log('Next tab clicked, current tab:', currentTab);
    
    if (validateCurrentTab()) {
        const tabs = document.querySelectorAll('.tab-content');
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabs[currentTab].classList.remove('active');
        tabButtons[currentTab].classList.remove('active');
        
        currentTab++;
        
        tabs[currentTab].classList.add('active');
        tabButtons[currentTab].classList.add('active');
        
        updateTabButtons();
        
        if (currentTab === 2) {
            calculateTotals();
        }
        
        console.log('Moved to tab:', currentTab);
    }
}

function prevTab() {
    const tabs = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabs[currentTab].classList.remove('active');
    tabButtons[currentTab].classList.remove('active');
    
    currentTab--;
    
    tabs[currentTab].classList.add('active');
    tabButtons[currentTab].classList.add('active');
    
    updateTabButtons();
}

function updateTabButtons() {
    const prevBtn = document.getElementById('prevTabBtn');
    const nextBtn = document.getElementById('nextTabBtn');
    const generateBtn = document.getElementById('generatePdfBtn');
    
    prevBtn.disabled = currentTab === 0;
    
    if (currentTab === 2) {
        nextBtn.style.display = 'none';
        generateBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        generateBtn.style.display = 'none';
    }
}

// Validation function - COMPLETELY FIXED
function validateCurrentTab() {
    console.log('Validating tab:', currentTab);
    
    if (currentTab === 0) {
        const userName = document.getElementById('userName').value;
        const vendorName = document.getElementById('vendorName').value;
        
        console.log('Business validation - User:', userName, 'Vendor:', vendorName);
        
        if (!userName || !vendorName) {
            showNotification('Please fill in both Business Name and Customer Name', 'error');
            return false;
        }
        return true;
        
    } else if (currentTab === 1) {
        const itemRows = document.querySelectorAll('.item-row');
        console.log('Items validation - Total items:', itemRows.length);
        
        // Check if at least one item exists
        if (itemRows.length === 0) {
            showNotification('Please add at least one item', 'error');
            return false;
        }
        
        // Check if all items have basic details
        let hasValidItem = false;
        itemRows.forEach((row, index) => {
            const desc = row.querySelector('.item-desc').value;
            const qty = row.querySelector('.item-qty').value;
            const price = row.querySelector('.item-price').value;
            
            console.log(`Item ${index}:`, { desc, qty, price });
            
            if (desc && qty && price) {
                hasValidItem = true;
            }
        });
        
        if (!hasValidItem) {
            showNotification('Please fill in description, quantity and price for at least one item', 'error');
            return false;
        }
        
        return true;
    }
    
    return true;
}

// Item management functions - COMPLETELY FIXED
function addItemRow() {
    const itemsList = document.getElementById('itemsList');
    const itemCount = itemsList.querySelectorAll('.item-row').length + 1;
    
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.innerHTML = `
        <input type="text" placeholder="Item description" class="item-desc" value="Product ${itemCount}">
        <input type="number" placeholder="Qty" class="item-qty" value="1" min="1">
        <input type="number" placeholder="Price" class="item-price" value="100" min="0" step="0.01">
        <input type="number" placeholder="Tax %" class="item-tax" value="18" min="0" max="100">
        <button class="remove-item" type="button"><i class="fas fa-times"></i></button>
    `;
    
    itemsList.appendChild(itemRow);
    setupItemRowListeners(itemRow);
    updateInvoicePreview();
    
    showNotification('Item added successfully!', 'success');
    console.log('Item added, total items:', itemsList.querySelectorAll('.item-row').length);
}

function setupItemRowListeners(row) {
    // Remove button
    const removeBtn = row.querySelector('.remove-item');
    removeBtn.addEventListener('click', function() {
        row.remove();
        updateInvoicePreview();
        showNotification('Item removed successfully!', 'info');
    });
    
    // Input events
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', updateInvoicePreview);
    });
}

// Remove item event listener - FIXED
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
        e.preventDefault();
        const removeBtn = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
        const itemRow = removeBtn.closest('.item-row');
        
        if (itemRow && itemRow.parentNode) {
            itemRow.remove();
            updateInvoicePreview();
            showNotification('Item removed successfully!', 'info');
        }
    }
});

// Input events for items - FIXED
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('item-desc') || 
        e.target.classList.contains('item-qty') || 
        e.target.classList.contains('item-price') || 
        e.target.classList.contains('item-tax')) {
        updateInvoicePreview();
    }
});

// Template selection
function selectTemplate(template) {
    // Update template selector
    document.getElementById('templateSelect').value = template;
    
    // Update template cards
    document.querySelectorAll('.template-card').forEach(card => {
        if (card.dataset.template === template) {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        } else {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'var(--shadow)';
        }
    });
    
    invoiceData.template = template;
    updateInvoicePreview();
}

// Generate Invoice Preview
function updateInvoicePreview() {
    const template = document.getElementById('templateSelect').value;
    const businessName = document.getElementById('userName').value || 'Your Business Name';
    const businessAddress = document.getElementById('businessAddress').value || 'Business Address';
    const contactNumber = document.getElementById('contactNumber').value || 'Contact Number';
    const gstNumber = document.getElementById('gstNumber').value || 'GST Number';
    const customerName = document.getElementById('vendorName').value || 'Customer Name';
    const customerAddress = document.getElementById('vendorAddress').value || 'Customer Address';
    const invoiceDate = document.getElementById('invoiceDate').value;
    const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
    
    // Format date
    const dateObj = new Date(invoiceDate);
    const formattedDate = invoiceDate ? dateObj.toLocaleDateString('en-IN') : 'Date';
    
    // Calculate totals
    let subtotal = 0;
    let totalTax = 0;
    
    const itemRows = document.querySelectorAll('.item-row');
    const items = [];
    
    itemRows.forEach(row => {
        const desc = row.querySelector('.item-desc').value || 'Item';
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const tax = parseFloat(row.querySelector('.item-tax').value) || 0;
        
        const amount = qty * price;
        const taxAmount = amount * (tax / 100);
        
        subtotal += amount;
        totalTax += taxAmount;
        
        items.push({
            desc,
            qty,
            price,
            tax,
            amount,
            taxAmount
        });
    });
    
    const grandTotal = subtotal + totalTax;
    
    // Update summary
    document.getElementById('summary-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('summary-tax').textContent = `₹${totalTax.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `₹${grandTotal.toFixed(2)}`;
    
    // Generate preview HTML
    let previewHTML = `
        <div class="invoice-template ${template}-template">
            <div class="invoice-header">
                <div>
                    <div class="invoice-title">TAX INVOICE</div>
                    <div><strong>${businessName}</strong></div>
                    <div>${businessAddress}</div>
                    <div>${contactNumber}</div>
                    <div>GSTIN: ${gstNumber}</div>
                </div>
                <div class="invoice-meta">
                    <div class="invoice-number"><strong>${invoiceNumber}</strong></div>
                    <div class="invoice-date">Date: ${formattedDate}</div>
                </div>
            </div>
            
            <div class="invoice-addresses">
                <div class="address-box">
                    <h3>From:</h3>
                    <div><strong>${businessName}</strong></div>
                    <div>${businessAddress}</div>
                    <div>${contactNumber}</div>
                    <div>GSTIN: ${gstNumber}</div>
                </div>
                <div class="address-box">
                    <h3>Bill To:</h3>
                    <div><strong>${customerName}</strong></div>
                    <div>${customerAddress}</div>
                </div>
            </div>
            
            <table class="invoice-items">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Tax %</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    items.forEach(item => {
        previewHTML += `
            <tr>
                <td>${item.desc}</td>
                <td>${item.qty}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>${item.tax}%</td>
                <td>₹${(item.amount + item.taxAmount).toFixed(2)}</td>
            </tr>
        `;
    });
    
    previewHTML += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" style="text-align: right;"><strong>Subtotal:</strong></td>
                        <td><strong>₹${subtotal.toFixed(2)}</strong></td>
                    </tr>
                    <tr>
                        <td colspan="4" style="text-align: right;"><strong>Tax:</strong></td>
                        <td><strong>₹${totalTax.toFixed(2)}</strong></td>
                    </tr>
                    <tr>
                        <td colspan="4" style="text-align: right;"><strong>Grand Total:</strong></td>
                        <td><strong>₹${grandTotal.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="invoice-footer">
                <div class="terms-title">Terms & Conditions</div>
                <p>Payment is due within 15 days. Please make checks payable to ${businessName}.</p>
                
                <div class="signature-area">
                    <div>Authorized Signature</div>
                    <div>_________________________</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('invoicePreview').innerHTML = previewHTML;
}

// Calculate totals function
function calculateTotals() {
    let subtotal = 0;
    let totalTax = 0;
    
    const itemRows = document.querySelectorAll('.item-row');
    
    itemRows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const tax = parseFloat(row.querySelector('.item-tax').value) || 0;
        
        const amount = qty * price;
        const taxAmount = amount * (tax / 100);
        
        subtotal += amount;
        totalTax += taxAmount;
    });
    
    const grandTotal = subtotal + totalTax;
    
    // Update summary
    document.getElementById('summary-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('summary-tax').textContent = `₹${totalTax.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `₹${grandTotal.toFixed(2)}`;
}

// Generate PDF
function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    // Capture the invoice preview as an image
    html2canvas(document.getElementById('invoicePreview')).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190;
        const pageHeight = 280;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;
        
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Save the PDF
        pdf.save(`invoice-${document.getElementById('invoiceNumber').value || '001'}.pdf`);
        showNotification('PDF generated successfully!', 'success');
    }).catch(error => {
        console.error('Error generating PDF:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    });
}

// Sharing functions
function shareViaWhatsApp() {
    const businessName = document.getElementById('userName').value || 'Your Business';
    const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
    const grandTotal = document.getElementById('summary-total').textContent;
    
    const text = `Invoice ${invoiceNumber} from ${businessName} - Total Amount: ${grandTotal}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareViaEmail() {
    const businessName = document.getElementById('userName').value || 'Your Business';
    const customerName = document.getElementById('vendorName').value || 'Customer';
    const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
    const grandTotal = document.getElementById('summary-total').textContent;
    
    const subject = `Invoice ${invoiceNumber} from ${businessName}`;
    const body = `Dear ${customerName},\n\nPlease find attached invoice ${invoiceNumber}.\nTotal Amount: ${grandTotal}\n\nThank you for your business!\n\n${businessName}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
}

// Industry section interaction
function showIndustryMessage(industry) {
    const messages = {
        retail: "Perfect for retail shops! Create GST bills for your store with itemized products.",
        restaurant: "Ideal for restaurants! Generate food bills with tax calculations.",
        medical: "Medical store billing with medicine details and expiry dates.",
        services: "Service invoices for consultants, freelancers, and professionals."
    };
    
    showNotification(messages[industry] || "This industry is supported!", 'info');
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Basic validation
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    // Simulate login process
    showNotification('Logging in...', 'info');
    
    setTimeout(() => {
        showNotification('Login successful!', 'success');
        closeModal('loginModal');
        document.getElementById('loginForm').reset();
    }, 1500);
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Simulate signup process
    showNotification('Creating your account...', 'info');
    
    setTimeout(() => {
        // Send OTP for phone verification
        if (sendOTP(phone)) {
            closeModal('signupModal');
        }
    }, 1500);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function switchAuthModal(to) {
    // Close all auth modals
    closeModal('loginModal');
    closeModal('signupModal');
    closeModal('forgotPasswordModal');
    
    // Open the requested modal
    if (to === 'signup') {
        openModal('signupModal');
    } else if (to === 'login') {
        openModal('loginModal');
    } else if (to === 'forgotPassword') {
        openModal('forgotPasswordModal');
    }
}

// OTP Functions
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        // Auto focus next input
        input.addEventListener('input', function(e) {
            if (this.value.length === 1) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                } else {
                    this.blur();
                    // Auto verify if all inputs filled
                    if (isOTPComplete()) {
                        verifyOTP();
                    }
                }
            }
        });
        
        // Handle backspace
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace') {
                if (this.value.length === 0 && index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
    });
    
    // OTP verify button
    document.querySelector('#otpModal .btn-primary').addEventListener('click', verifyOTP);
    
    // Resend OTP
    document.querySelector('.otp-resend a').addEventListener('click', function(e) {
        e.preventDefault();
        const phone = document.getElementById('signupPhone').value;
        if (phone) {
            sendOTP(phone);
            showNotification('OTP sent again!', 'info');
        } else {
            showNotification('Please enter phone number first', 'error');
        }
    });
}

function isOTPComplete() {
    const otpInputs = document.querySelectorAll('.otp-input');
    for (let input of otpInputs) {
        if (!input.value) return false;
    }
    return true;
}

function getOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    let otp = '';
    otpInputs.forEach(input => {
        otp += input.value;
    });
    return otp;
}

function verifyOTP() {
    const otp = getOTP();
    
    if (otp.length !== 6) {
        showNotification('Please enter complete 6-digit OTP', 'error');
        return;
    }
    
    // Show loading
    showNotification('Verifying OTP...', 'info');
    
    // Simulate OTP verification
    setTimeout(() => {
        // For demo, any OTP starting with 1 is valid
        if (otp.startsWith('1')) {
            showNotification('Phone verified successfully!', 'success');
            closeModal('otpModal');
            resetOTPInputs();
            
            // Show success message
            setTimeout(() => {
                showNotification('Account created successfully! You can now login.', 'success');
            }, 1000);
        } else {
            showNotification('Invalid OTP. Please try again.', 'error');
            resetOTPInputs();
        }
    }, 2000);
}

function resetOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach(input => {
        input.value = '';
    });
    if (otpInputs[0]) {
        otpInputs[0].focus();
    }
}

function sendOTP(phoneNumber) {
    if (!phoneNumber) {
        showNotification('Please enter phone number', 'error');
        return false;
    }
    
    // Show OTP modal
    openModal('otpModal');
    
    // Generate random OTP (for demo)
    const demoOTP = '123456';
    
    showNotification(`OTP sent to ${phoneNumber}. Demo OTP: ${demoOTP}`, 'info');
    
    // Auto-fill demo OTP after a delay
    setTimeout(() => {
        const otpInputs = document.querySelectorAll('.otp-input');
        const otpArray = demoOTP.split('');
        
        otpArray.forEach((digit, index) => {
            if (otpInputs[index]) {
                otpInputs[index].value = digit;
            }
        });
        
        // Focus last input
        if (otpInputs[5]) {
            otpInputs[5].focus();
        }
    }, 1000);
    
    return true;
}

// Phone OTP Login
document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.querySelector('.fa-mobile-alt')) {
            // Phone OTP login
            const phone = prompt('Enter your phone number:');
            if (phone) {
                sendOTP(phone);
            }
        } else if (this.querySelector('.fa-google')) {
            // Google login
            showNotification('Google login would be integrated in production', 'info');
        }
    });
});

// Utility functions
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function animateCounter(elementId, target, duration) {
    const element = document.getElementById(elementId);
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString();
        }
    }, 16);
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    // Close on click
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);