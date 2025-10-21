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
    
    // Add first item row
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
    
    // Payment buttons
    document.getElementById('confirmPaymentBtn').addEventListener('click', processPayment);
    document.getElementById('cancelPaymentBtn').addEventListener('click', closePaymentModal);
    
    // Chatbot
    document.getElementById('chatbotToggle').addEventListener('click', toggleChatbot);
    document.getElementById('chatbotClose').addEventListener('click', toggleChatbot);
    document.getElementById('chatbotSend').addEventListener('click', sendChatMessage);
    document.getElementById('chatbotInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendChatMessage();
    });
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
    
    // Payment modal
    document.getElementById('paymentModalClose').addEventListener('click', closePaymentModal);
    
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

// Tab navigation functions
function nextTab() {
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

function validateCurrentTab() {
    if (currentTab === 0) {
        const userName = document.getElementById('userName').value;
        const vendorName = document.getElementById('vendorName').value;
        
        if (!userName || !vendorName) {
            showNotification('Please fill in both Business Name and Customer Name', 'error');
            return false;
        }
    } else if (currentTab === 1) {
        const itemRows = document.querySelectorAll('.item-row');
        
        if (itemRows.length === 0) {
            showNotification('Please add at least one item', 'error');
            return false;
        }
        
        let hasValidItem = false;
        itemRows.forEach(row => {
            const desc = row.querySelector('.item-desc').value;
            const qty = row.querySelector('.item-qty').value;
            const price = row.querySelector('.item-price').value;
            
            if (desc && qty && price) {
                hasValidItem = true;
            }
        });
        
        if (!hasValidItem) {
            showNotification('Please fill in description, quantity and price for at least one item', 'error');
            return false;
        }
    }
    
    return true;
}

// Item management functions
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
        <button class="remove-item"><i class="fas fa-times"></i></button>
    `;
    
    itemsList.appendChild(itemRow);
    
    // Add event listener to remove button
    itemRow.querySelector('.remove-item').addEventListener('click', function() {
        itemRow.remove();
        updateInvoicePreview();
    });
    
    // Add event listeners to inputs for real-time update
    const inputs = itemRow.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', updateInvoicePreview);
    });
    
    updateInvoicePreview();
    
}

// Add event listeners to existing remove buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
        e.preventDefault();
        const removeBtn = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
        const itemRow = removeBtn.closest('.item-row');
        
        if (itemRow && itemRow.parentNode) {
            itemRow.remove();
            updateInvoicePreview();
            
        }
    }
});

// Add event listeners to existing inputs for real-time update
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
            card.style.boxShadow = '0 15px 30px rgba(0, 247, 255, 0.2), var(--neon-glow)';
            card.style.transform = 'translateY(-5px)';
        } else {
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            card.style.transform = 'translateY(0)';
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
    
    // Update payment amount
    document.getElementById('paymentAmount').textContent = `₹${grandTotal.toFixed(2)}`;
    
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
// Generate PDF - Single A4 Page (Fitted)
function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    const invoiceElement = document.getElementById('invoicePreview');
    
    // Auto-adjust scale based on content height
    const contentHeight = invoiceElement.scrollHeight;
    const scale = contentHeight > 1000 ? 0.6 : 0.8;
    
    html2canvas(invoiceElement, {
        scale: scale,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Fit image to single page
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (imgHeight > pageHeight - 20) {
            const scaleFactor = (pageHeight - 20) / imgHeight;
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth * scaleFactor, imgHeight * scaleFactor);
        } else {
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        }
        
        // Save PDF
        const fileName = `invoice-${document.getElementById('invoiceNumber').value || '001'}.pdf`;
        pdf.save(fileName);
    }).catch(error => {
        console.error('Error generating PDF:', error);
    });
}

// Share as Image - Works on both mobile & laptop
function shareViaWhatsApp() {
    const invoiceElement = document.getElementById('invoicePreview');
    
    html2canvas(invoiceElement, {
        scale: 0.7,
        useCORS: true,
        logging: false
    }).then(canvas => {
        // Convert to image
        canvas.toBlob(function(blob) {
            const businessName = document.getElementById('userName').value || 'Your Business';
            const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
            const grandTotal = document.getElementById('summary-total').textContent;
            
            const message = `Invoice ${invoiceNumber} from ${businessName}\nTotal Amount: ${grandTotal}`;
            
            // For Mobile - Web Share API
            if (navigator.share) {
                const file = new File([blob], "invoice.png", { type: "image/png" });
                navigator.share({
                    files: [file],
                    text: message,
                    title: `Invoice ${invoiceNumber}`
                }).catch(() => {
                    // Fallback if share fails
                    downloadAndAlert(blob, message);
                });
            } 
            // For Laptop - Download with WhatsApp instructions
            else {
                downloadAndAlert(blob, message);
            }
        });
    });
}

function downloadAndAlert(blob, message) {
    // Download image
    const link = document.createElement('a');
    link.download = 'invoice.png';
    link.href = URL.createObjectURL(blob);
    link.click();
    
    // Show instructions
    setTimeout(() => {
        if(confirm('Invoice image downloaded! Open WhatsApp and send the downloaded image file. Click OK to open WhatsApp.')) {
            window.open(`https://web.whatsapp.com/`, '_blank');
        }
    }, 1000);
}

// Share via Email with Image
function shareViaEmail() {
    const invoiceElement = document.getElementById('invoicePreview');
    
    html2canvas(invoiceElement, {
        scale: 0.7,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        const businessName = document.getElementById('userName').value || 'Your Business';
        const customerName = document.getElementById('vendorName').value || 'Customer';
        const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
        const grandTotal = document.getElementById('summary-total').textContent;
        
        const subject = `Invoice ${invoiceNumber} from ${businessName}`;
        const body = `Dear ${customerName},\n\nPlease find your invoice ${invoiceNumber} below:\n\nTotal Amount: ${grandTotal}\n\nInvoice Image:\n${imgData}\n\nThank you for your business!\n\n${businessName}`;
        
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
    });
}

// Quick Image Share
function shareInvoiceImage() {
    const invoiceElement = document.getElementById('invoicePreview');
    
    html2canvas(invoiceElement, {
        scale: 0.7,
        useCORS: true,
        logging: false
    }).then(canvas => {
        canvas.toBlob(function(blob) {
            if (navigator.share) {
                const file = new File([blob], "invoice.png", { type: "image/png" });
                navigator.share({
                    files: [file],
                    title: 'Invoice',
                    text: 'Here is your invoice'
                });
            } else {
                const link = document.createElement('a');
                link.download = 'invoice.png';
                link.href = URL.createObjectURL(blob);
                link.click();
                alert('Invoice image downloaded. Please share it via WhatsApp or email.');
            }
        });
    });
}

// PWA Install Functionality
let deferredPrompt;

function showInstallPromotion() {
    if(document.getElementById('installPWAButton')) return;
    
    const installBtn = document.createElement('button');
    installBtn.id = 'installPWAButton';
    installBtn.innerHTML = '📱 Install SparkInvoice App';
    installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #00f7ff;
        color: black;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        font-size: 14px;
    `;
    document.body.appendChild(installBtn);
    
    installBtn.addEventListener('click', installPWA);
}

function installPWA() {
    if(deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User installed SparkInvoice');
                const btn = document.getElementById('installPWAButton');
                if(btn) btn.remove();
            }
            deferredPrompt = null;
        });
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA Install prompt available');
    showInstallPromotion();
});

window.addEventListener('load', function() {
    setTimeout(() => {
        if(!document.getElementById('installPWAButton')) {
            showInstallPromotion();
        }
    }, 3000);
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
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

// Payment functions
function openPaymentModal() {
    document.getElementById('paymentModal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

function processPayment() {
    showNotification('Payment processing would be integrated with Razorpay/Stripe in production', 'info');
    closePaymentModal();
}

// Chatbot functions
function toggleChatbot() {
    const panel = document.getElementById('chatbotPanel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
}

function sendChatMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (message) {
        // Add user message
        addChatMessage(message, 'user');
        input.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            const response = generateAIResponse(message);
            addChatMessage(response, 'bot');
        }, 1000);
    }
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('invoice') && lowerMessage.includes('create')) {
        return "I can help you create an invoice! Please fill in the business information, add items, and choose a template.";
    } else if (lowerMessage.includes('template') || lowerMessage.includes('design')) {
        return "We have 4 templates: Modern Professional, Classic Business, Premium Luxury, and Vibrant Colorful. Which one would you like to use?";
    } else if (lowerMessage.includes('gst') || lowerMessage.includes('tax')) {
        return "You can add GST percentage for each item in the invoice. The system will automatically calculate the tax amount.";
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
        return "We support multiple payment options: UPI, credit/debit cards, net banking, and digital wallets.";
    } else if (lowerMessage.includes('share') || lowerMessage.includes('whatsapp')) {
        return "You can share your invoice via WhatsApp, email, or download as PDF after generating it.";
    } else {
        return "I'm here to help you with invoices! You can ask me about creating invoices, templates, GST calculations, payments, or sharing options.";
    }
}

// Utility functions
function formatCurrency(amount) {
    return '₹' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
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

// FAQ functionality
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function() {
        const item = this.parentElement;
        item.classList.toggle('active');
    });
});

















// Mobile Menu Toggle
document.getElementById('mobileMenuToggle').addEventListener('click', function() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const navLinks = document.getElementById('navLinks');
    const mobileToggle = document.getElementById('mobileMenuToggle');
    
    if (!navLinks.contains(event.target) && !mobileToggle.contains(event.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});

// Handle touch events for mobile
document.addEventListener('touchstart', function(event) {
    // Add touch-specific handling if needed
});

// Prevent zoom on double tap (iOS)
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Fix viewport height for mobile
function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            const navLinks = document.getElementById('navLinks');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        }
    });
});

// Handle form input focus on mobile
document.querySelectorAll('input, textarea, select').forEach(element => {
    element.addEventListener('focus', function() {
        // Add specific mobile focus handling if needed
    });
});

// Load images efficiently for mobile
function loadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadImages();
    setViewportHeight();
    
    // Add loading state for better UX
    document.body.classList.add('loaded');
});














