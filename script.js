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

// Text-to-Speech Setup
let speechSynthesis = window.speechSynthesis;
let isSpeaking = false;

// Initialize Text-to-Speech
function initTextToSpeech() {
    if (!speechSynthesis) {
        console.log("Text-to-speech not supported in this browser.");
        return;
    }
    
    speechSynthesis.onvoiceschanged = function() {
        console.log("Voices loaded:", speechSynthesis.getVoices().length);
    };
}

// Speak text function
function speakText(text) {
    if (!speechSynthesis || isSpeaking) return;
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    const voices = speechSynthesis.getVoices();
    const hindiVoice = voices.find(voice => 
        voice.lang.includes('hi') || voice.lang.includes('en-IN')
    );
    const englishVoice = voices.find(voice => 
        voice.lang.includes('en')
    );
    
    utterance.voice = hindiVoice || englishVoice || voices[0];
    
    utterance.onstart = function() {
        isSpeaking = true;
    };
    
    utterance.onend = function() {
        isSpeaking = false;
    };
    
    utterance.onerror = function(event) {
        console.error('Speech synthesis error:', event);
        isSpeaking = false;
    };
    
    speechSynthesis.speak(utterance);
}

// Advanced AI Assistant with Hindi-English Support
let recognition;
let isListening = false;
let isAssistantActive = true;
let assistantGreeted = false;

// Initialize AI Assistant
function initAIAssistant() {
    setTimeout(() => {
        if (!assistantGreeted && isAssistantActive) {
            autoGreet();
        }
    }, 3000);
    
    setupAssistantTriggers();
}

// Auto Greet Function
function autoGreet() {
    const greetings = [
        "Hello! I'm your SparkInvoice AI assistant. Main aapki invoice banane mein madad kar sakta hoon!",
        "Namaste! Main SparkInvoice AI assistant hoon. Aap invoices, templates, GST calculations ke bare mein pooch sakte hain!",
        "Hi there! I can help you create professional invoices. Mujhse Hindi ya English mein baat kar sakte hain!"
    ];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    addChatMessage(randomGreeting, 'bot');
    assistantGreeted = true;
}

// Setup interaction triggers
function setupAssistantTriggers() {
    const formInputs = document.querySelectorAll('#business-tab input, #business-tab textarea');
    let formInteractionCount = 0;
    
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            formInteractionCount++;
            if (formInteractionCount === 2 && !assistantGreeted) {
                addChatMessage("Main dekha aap invoice form fill kar rahe hain! Kya aapko koi help chahiye?", 'bot');
                assistantGreeted = true;
            }
        });
    });
    
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            setTimeout(() => {
                addChatMessage("Aapne template select kiya! Kya aapko kisi specific template ke bare mein jaanna hai?", 'bot');
            }, 1000);
        });
    });
}

// Enhanced Voice Recognition with Hindi support
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'hi-IN';
        
        recognition.onstart = function() {
            isListening = true;
            document.getElementById('chatbotVoice').classList.add('listening');
            addChatMessage("🎤 Main sun raha hoon... ab bolna shuru karein!", 'bot');
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chatbotInput').value = transcript;
            isListening = false;
            document.getElementById('chatbotVoice').classList.remove('listening');
            
            setTimeout(() => {
                sendChatMessage();
            }, 500);
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            isListening = false;
            document.getElementById('chatbotVoice').classList.remove('listening');
            
            if (event.error === 'not-allowed') {
                addChatMessage("❌ Microphone permission nahi mili. Browser settings mein jaake microphone allow karein.", 'bot');
            } else {
                addChatMessage("❌ Voice recognition mein problem aa rahi hai. Aap type kar ke pooch sakte hain.", 'bot');
            }
        };

        recognition.onend = function() {
            isListening = false;
            document.getElementById('chatbotVoice').classList.remove('listening');
        };
    } else {
        addChatMessage("❌ Voice recognition aapke browser mein support nahi karta. Aap type kar ke pooch sakte hain!", 'bot');
    }
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateInvoicePreview();
    initSpeechRecognition();
    initTextToSpeech(); // ✅ YEH NAYA LINE ADD KARO
    initAIAssistant();
});

// Initialize the application
function initializeApp() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    document.getElementById('invoiceNumber').value = 'INV-' + Math.floor(1000 + Math.random() * 9000);
    animateCounter('invoicesCount', 50000, 2000);
    addItemRow();
}

// Setup all event listeners
function setupEventListeners() {
    document.getElementById('mobileMenuToggle').addEventListener('click', toggleMobileMenu);
    document.getElementById('prevTabBtn').addEventListener('click', prevTab);
    document.getElementById('nextTabBtn').addEventListener('click', nextTab);
    
    document.querySelectorAll('.select-template').forEach(btn => {
        btn.addEventListener('click', function() {
            selectTemplate(this.dataset.template);
        });
    });
    
    document.getElementById('templateSelect').addEventListener('change', function() {
        selectTemplate(this.value);
    });
    
    document.getElementById('addItemBtn').addEventListener('click', addItemRow);
    
    document.querySelectorAll('#business-tab input, #business-tab textarea').forEach(input => {
        input.addEventListener('input', updateInvoicePreview);
    });
    
    document.getElementById('generatePdfBtn').addEventListener('click', generatePDF);
    document.getElementById('shareWhatsappBtn').addEventListener('click', shareViaWhatsApp);
    document.getElementById('shareEmailBtn').addEventListener('click', shareViaEmail);
    
    document.querySelectorAll('.industry-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const industry = this.dataset.industry;
            showIndustryMessage(industry);
        });
    });
    
    setupModalControls();
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
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
    
    setupOTPInputs();
    
    document.getElementById('chatbotToggle').addEventListener('click', toggleChatbot);
    document.getElementById('chatbotClose').addEventListener('click', toggleChatbot);
    document.getElementById('chatbotSend').addEventListener('click', sendChatMessage);
    document.getElementById('chatbotVoice').addEventListener('click', toggleVoiceInput);
    document.getElementById('chatbotInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendChatMessage();
    });
    
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const item = this.parentElement;
            item.classList.toggle('active');
        });
    });
}

// Speaker control
let isSoundEnabled = true;

document.getElementById('chatbotSpeaker').addEventListener('click', function() {
    isSoundEnabled = !isSoundEnabled;
    const icon = this.querySelector('i');
    
    if (isSoundEnabled) {
        icon.className = 'fas fa-volume-up';
        addChatMessage("🔊 Sound enabled! Main ab bolkar jawab doonga.", 'bot');
    } else {
        icon.className = 'fas fa-volume-mute';
        speechSynthesis.cancel();
        addChatMessage("🔇 Sound disabled! Main type karke jawab doonga.", 'bot');
    }
});

// Setup modal controls
function setupModalControls() {
    document.getElementById('signupBtn').addEventListener('click', () => {
        const switchToLogin = document.getElementById('switchToLogin');
        if (switchToLogin) {
            openModal('loginModal');
        } else {
            openModal('signupModal');
        }
    });
    document.getElementById('loginModalClose').addEventListener('click', () => closeModal('loginModal'));
    document.getElementById('signupModalClose').addEventListener('click', () => closeModal('signupModal'));
    document.getElementById('otpModalClose').addEventListener('click', () => closeModal('otpModal'));
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
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
    
    itemRow.querySelector('.remove-item').addEventListener('click', function() {
        itemRow.remove();
        updateInvoicePreview();
    });
    
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
    document.getElementById('templateSelect').value = template;
    
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
    
    const dateObj = new Date(invoiceDate);
    const formattedDate = invoiceDate ? dateObj.toLocaleDateString('en-IN') : 'Date';
    
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
    
    document.getElementById('summary-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('summary-tax').textContent = `₹${totalTax.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `₹${grandTotal.toFixed(2)}`;
    
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
    
    document.getElementById('summary-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('summary-tax').textContent = `₹${totalTax.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `₹${grandTotal.toFixed(2)}`;
}

// Generate PDF - Single A4 Page (Fitted)
function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    const invoiceElement = document.getElementById('invoicePreview');
    
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
        
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (imgHeight > pageHeight - 20) {
            const scaleFactor = (pageHeight - 20) / imgHeight;
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth * scaleFactor, imgHeight * scaleFactor);
        } else {
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        }
        
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
        canvas.toBlob(function(blob) {
            const businessName = document.getElementById('userName').value || 'Your Business';
            const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
            const grandTotal = document.getElementById('summary-total').textContent;
            
            const message = `Invoice ${invoiceNumber} from ${businessName}\nTotal Amount: ${grandTotal}`;
            
            if (navigator.share) {
                const file = new File([blob], "invoice.png", { type: "image/png" });
                navigator.share({
                    files: [file],
                    text: message,
                    title: `Invoice ${invoiceNumber}`
                }).catch(() => {
                    downloadAndAlert(blob, message);
                });
            } else {
                downloadAndAlert(blob, message);
            }
        });
    });
}

function downloadAndAlert(blob, message) {
    const link = document.createElement('a');
    link.download = 'invoice.png';
    link.href = URL.createObjectURL(blob);
    link.click();
    
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
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
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
    
    showNotification('Creating your account...', 'info');
    
    setTimeout(() => {
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
    closeModal('loginModal');
    closeModal('signupModal');
    
    if (to === 'signup') {
        openModal('signupModal');
    } else if (to === 'login') {
        openModal('loginModal');
    }
}

// OTP Functions
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            if (this.value.length === 1) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                } else {
                    this.blur();
                    if (isOTPComplete()) {
                        verifyOTP();
                    }
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace') {
                if (this.value.length === 0 && index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
    });
    
    document.querySelector('#otpModal .btn-primary').addEventListener('click', verifyOTP);
    
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
    
    showNotification('Verifying OTP...', 'info');
    
    setTimeout(() => {
        if (otp.startsWith('1')) {
            showNotification('Phone verified successfully!', 'success');
            closeModal('otpModal');
            resetOTPInputs();
            
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
    
    openModal('otpModal');
    
    const demoOTP = '123456';
    
    showNotification(`OTP sent to ${phoneNumber}. Demo OTP: ${demoOTP}`, 'info');
    
    setTimeout(() => {
        const otpInputs = document.querySelectorAll('.otp-input');
        const otpArray = demoOTP.split('');
        
        otpArray.forEach((digit, index) => {
            if (otpInputs[index]) {
                otpInputs[index].value = digit;
            }
        });
        
        if (otpInputs[5]) {
            otpInputs[5].focus();
        }
    }, 1000);
    
    return true;
}

// Enhanced Chat Functions
function toggleChatbot() {
    const panel = document.getElementById('chatbotPanel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
}

function toggleVoiceInput() {
    if (!recognition) {
        addChatMessage("Voice recognition is not supported in your browser.", 'bot');
        return;
    }
    
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (message) {
        addChatMessage(message, 'user');
        input.value = '';
        
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            const response = generateAIResponse(message);
            addChatMessage(response, 'bot');
            
            autoSuggestFollowUp(message);
        }, 1500);
    }
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Auto-speak bot messages
    if (sender === 'bot' && isSoundEnabled && !message.includes('typing...') && !message.includes('sun raha hoon')) {
        setTimeout(() => {
            speakText(message);
        }, 500);
    }
}

// Enhanced AI Response Generator
function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Hindi Responses
    if (lowerMessage.includes('hindi') || lowerMessage.includes('हिंदी')) {
        return "Bilkul! Main Hindi mein baat kar sakta hoon. Aap mujhse Hindi ya English dono mein baat kar sakte hain. Aapko kis cheez mein help chahiye?";
    }
    
    // Greeting Responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || 
        lowerMessage.includes('namaste') || lowerMessage.includes('नमस्ते')) {
        return "Namaste! 👋 Main SparkInvoice AI assistant hoon. Aap invoices, GST calculations, templates ke bare mein kuch bhi pooch sakte hain!";
    }
    
    // Invoice Creation
    if (lowerMessage.includes('invoice') && lowerMessage.includes('create') || 
        lowerMessage.includes('invoice') && lowerMessage.includes('banaye') ||
        lowerMessage.includes('बनाए')) {
        return "Main aapko invoice banane mein madad kar sakta hoon! Pehle business details fill karein, fir items add karein, aur last mein PDF generate karein. Kya aapko step-by-step guidance chahiye?";
    }
    
    // Template Questions
    if (lowerMessage.includes('template') || lowerMessage.includes('design') || 
        lowerMessage.includes('टेम्पलेट')) {
        return "Humare paas 4 professional templates hain:\n\n" +
               "📊 Modern Professional - Tech companies ke liye\n" +
               "🏢 Classic Business - Traditional businesses ke liye\n" +
               "💎 Premium Luxury - Premium brands ke liye\n" +
               "🎨 Vibrant Colorful - Creative businesses ke liye\n\n" +
               "Konsa template aapko pasand hai?";
    }
    
    // GST Questions
    if (lowerMessage.includes('gst') || lowerMessage.includes('tax') || 
        lowerMessage.includes('जीएसटी') || lowerMessage.includes('टैक्स')) {
        return "GST calculations automatic hote hain! Aap har item ke liye GST percentage daal sakte hain. System automatically tax calculate karega. Kya aapko GST rates ke bare mein jaanna hai?";
    }
    
    // Payment Questions
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || 
        lowerMessage.includes('भुगतान')) {
        return "Aap multiple payment options use kar sakte hain:\n\n" +
               "📱 UPI Payment\n" +
               "💳 Credit/Debit Card\n" +
               "🏦 Net Banking\n" +
               "👛 Digital Wallet\n\n" +
               "Konsa payment method aapko pasand hai?";
    }
    
    // Sharing Options
    if (lowerMessage.includes('share') || lowerMessage.includes('whatsapp') || 
        lowerMessage.includes('शेयर')) {
        return "Aap apna invoice multiple ways mein share kar sakte hain:\n\n" +
               "📤 WhatsApp pe bhejein\n" +
               "📧 Email karein\n" +
               "📄 PDF download karein\n" +
               "🖨️ Print karein\n\n" +
               "Konsa method aap use karna chahenge?";
    }
    
    // Help Questions
    if (lowerMessage.includes('help') || lowerMessage.includes('madad') || 
        lowerMessage.includes('सहायता')) {
        return "Main aapki kis cheez mein madad kar sakta hoon?\n\n" +
               "📝 Invoice Creation\n" +
               "🎨 Template Selection\n" +
               "💰 GST Calculations\n" +
               "📤 Sharing Options\n" +
               "💳 Payment Methods\n\n" +
               "Bataiye, aapko kya chahiye?";
    }
    
    // Price/Cost Questions
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || 
        lowerMessage.includes('कीमत') || lowerMessage.includes('मूल्य')) {
        return "SparkInvoice basic features COMPLETELY FREE hai! 🎉\n\n" +
               "Aap unlimited invoices bina kisi cost ke bana sakte hain. " +
               "Fir bhi hardware printers available hain starting ₹999 se.";
    }
    
    // Default Response
    const defaultResponses = [
        "Mujhe samjha nahi aaya. Kya aap fir se pooch sakte hain?",
        "Main aapki baat samjha nahi. Invoice, templates, GST ya payments ke bare mein poochiye!",
        "Sorry, I didn't understand. You can ask me about invoices, templates, GST, or payments!",
        "Aap kya jaanna chahte hain? Main invoices, templates, GST calculations mein help kar sakta hoon!"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Typing Indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <span>AI assistant typing...</span>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Auto-suggest follow-up questions
function autoSuggestFollowUp(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    const messagesContainer = document.getElementById('chatbotMessages');
    
    let suggestions = [];
    
    if (lowerMessage.includes('invoice') || lowerMessage.includes('बनाए')) {
        suggestions = [
            "Step-by-step invoice creation batayein?",
            "Konsa template best rahega?",
            "GST kaise add karein?"
        ];
    } else if (lowerMessage.includes('template') || lowerMessage.includes('टेम्पलेट')) {
        suggestions = [
            "Modern template dikhayein?",
            "Classic template ke features batayein?",
            "Premium template kaisa hai?"
        ];
    } else if (lowerMessage.includes('gst') || lowerMessage.includes('जीएसटी')) {
        suggestions = [
            "GST rates kya hain?",
            "Tax kaise calculate karein?",
            "GST number kahan add karein?"
        ];
    }
    
    if (suggestions.length > 0) {
        setTimeout(() => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = 'suggestion-box';
            suggestionDiv.innerHTML = `
                <p>Kya aap yeh jaanna chahenge?</p>
                <div class="suggestion-buttons">
                    ${suggestions.map(suggestion => 
                        `<button class="suggestion-btn" onclick="addChatMessage('${suggestion}', 'user'); setTimeout(() => sendChatMessage(), 500);">${suggestion}</button>`
                    ).join('')}
                </div>
            `;
            messagesContainer.appendChild(suggestionDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
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
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
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
    
    document.body.appendChild(notification);
    
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
            const navLinks = document.getElementById('navLinks');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        }
    });
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
    document.body.classList.add('loaded');
});










