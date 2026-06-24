// ==========================================
// CONFIGURATION DE LA CONNEXION SUPABASE
// ==========================================
// Remplacer 'VOTRE_SUPABASE_ANON_KEY' par la clé réelle disponible dans vos paramètres Supabase
const SUPABASE_URL = 'https://cfbvjzplodrkcqlutzeu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CWKNaKEFx4OrplkUb3HhxQ_QMhMYJmZ';

let supabaseClient = null;

// Initialisation sécurisée du client Supabase
if (typeof supabase !== 'undefined' && SUPABASE_ANON_KEY !== 'VOTRE_SUPABASE_ANON_KEY' && SUPABASE_ANON_KEY.trim() !== '') {
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase connecté avec succès.");
    } catch (err) {
        console.error("Erreur d'initialisation de Supabase:", err);
    }
} else {
    console.warn("Supabase n'est pas initialisé (Clé Anon non fournie). Mode démo hors-ligne activé avec les données par défaut.");
}

// ==========================================
// BASE DE DONNÉES LOCALES (FALLBACK DÉMO)
// ==========================================
const fallbackProducts = [
    {
        id: 1,
        nom: 'T-shirt teranga noir',
        description: 'T-shirt premium qui représente le Sénégal dans un univers streetwear.',
        prix: 5000,
        image_face: 'https://cfbvjzplodrkcqlutzeu.supabase.co/storage/v1/object/public/produit/tshirt%20teranga%20%20noir%20face%20.png',
        image_dos: 'https://cfbvjzplodrkcqlutzeu.supabase.co/storage/v1/object/public/produit/tshirt%20teranga%20noir%20dos%20.png',
        couleurs: ['Noir'],
        tailles: ['S', 'M', 'L', 'XL']
    },
    {
        id: 2,
        nom: 'T-shirt Streetwear Blanc',
        description: 'T-shirt premium qui représente le Sénégal dans un univers streetwear.',
        prix: 5000,
        image_face: 'https://cfbvjzplodrkcqlutzeu.supabase.co/storage/v1/object/public/produit/tshirt%20teranga%20pink%20face%20%20%20.png',
        image_dos: null,
        couleurs: ['Blanc'],
        tailles: ['S', 'M', 'L', 'XL']
    },
    {
        id: 3,
        nom: 'Pantalon baggy teranga Noir',
        description: 'Pantalon baggy coupe moderne qui représente le Sénégal dans un univers streetwear.',
        prix: 7500,
        image_face: 'https://cfbvjzplodrkcqlutzeu.supabase.co/storage/v1/object/public/produit/baggy%20teranga%20black%20.png',
        image_dos: null,
        couleurs: ['Noir'],
        tailles: ['S', 'M', 'L', 'XL']
    },
    {
        id: 4,
        nom: 'Pull DKRBBY White',
        description: 'Pull confortable qui représente le Sénégal dans un univers streetwear.',
        prix: 11000,
        image_face: 'https://cfbvjzplodrkcqlutzeu.supabase.co/storage/v1/object/public/produit/pull%20DKRBBY%20white.png',
        image_dos: null,
        couleurs: ['Blanc'],
        tailles: ['S', 'M', 'L', 'XL']
    },
    {
        id: 5,
        nom: 'Pull Oversize Noir',
        description: 'Pull confortable qui représente le Sénégal dans un univers streetwear.',
        prix: 11000,
        image_face: 'https://cfbvjzplodrkcqlutzeu.supabase.co/storage/v1/object/public/produit/sweet%20capuche%20teranga%20black.png',
        image_dos: null,
        couleurs: ['Noir'],
        tailles: ['S', 'M', 'L', 'XL']
    }
];

// ==========================================
// ÉTAT DE L'APPLICATION
// ==========================================
let products = [];
let selectedProduct = null;
let selectedColor = '';
let selectedSize = '';
let cartItems = [];
let selectedPaymentMethod = 'carte';

// ==========================================
// RENDER & NAVIGATION (SPA)
// ==========================================
function showView(viewId) {
    const views = document.querySelectorAll('.app-view');
    views.forEach(view => {
        if (view.id === viewId) {
            view.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            view.classList.remove('active');
        }
    });
}

// Formater les prix en FCFA
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

// Chargement des articles (Supabase ou Fallback)
async function fetchProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    try {
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('produits')
                .select('*')
                .order('id', { ascending: true });
                
            if (error) throw error;
            products = data;
            console.log("Données chargées depuis Supabase :", products);
        } else {
            products = fallbackProducts;
            console.log("Utilisation des données locales hors-ligne.");
        }
        renderCatalog();
    } catch (err) {
        console.error("Erreur de récupération des données :", err);
        products = fallbackProducts;
        renderCatalog();
    }
}

// Affichage du catalogue
function renderCatalog() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="error-msg">Aucun article disponible pour le moment.</p>';
        return;
    }
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.addEventListener('click', () => openProductDetail(product));
        
        // Utilisation de l'image de face par défaut (nettoyage des espaces éventuels)
        const imgSrc = (product.image_face && typeof product.image_face === 'string') ? product.image_face.trim() : 'https://via.placeholder.com/400x500?text=Indisponible';
        
        card.innerHTML = `
            <div class="product-img-wrapper">
                <img src="${imgSrc}" alt="${product.nom}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.nom}</h3>
                <span class="product-price">${formatPrice(product.prix)}</span>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// Fiche Produit : Ouverture et Configuration
function openProductDetail(product) {
    selectedProduct = product;
    
    // Initialiser les choix par défaut
    selectedColor = product.couleurs && product.couleurs.length > 0 ? product.couleurs[0] : '';
    selectedSize = product.tailles && product.tailles.length > 0 ? product.tailles[0] : '';
    let selectedQuantity = 1;
    
    const container = document.getElementById('productDetailContainer');
    container.innerHTML = '';
    
    const imageFace = (product.image_face && typeof product.image_face === 'string') ? product.image_face.trim() : 'https://via.placeholder.com/400x500?text=Face';
    const imageDos = (product.image_dos && typeof product.image_dos === 'string') ? product.image_dos.trim() : null;
    
    // Générer la galerie d'images
    let galleryHtml = `
        <div class="product-gallery">
            <div class="main-image-container">
                <img src="${imageFace}" id="detailMainImg" alt="${product.nom}">
            </div>
    `;
    
    // Afficher les contrôleurs Face/Dos uniquement si l'image dos existe
    if (imageDos) {
        galleryHtml += `
            <div class="gallery-views-control">
                <button class="btn-gallery-view active" id="btnViewFace">FACE</button>
                <button class="btn-gallery-view" id="btnViewDos">DOS</button>
            </div>
        `;
    }
    galleryHtml += `</div>`;
    
    // Générer les sélecteurs de couleur
    let colorsHtml = '';
    if (product.couleurs && product.couleurs.length > 0) {
        colorsHtml = `
            <div class="selector-group">
                <span class="selector-label">Couleur</span>
                <div class="options-row">
                    ${product.couleurs.map((color, index) => `
                        <div class="color-option ${index === 0 ? 'active' : ''}" data-color="${color}">
                            <span class="color-dot"></span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Générer les sélecteurs de taille
    let sizesHtml = '';
    if (product.tailles && product.tailles.length > 0) {
        sizesHtml = `
            <div class="selector-group">
                <span class="selector-label">Taille</span>
                <div class="options-row">
                    ${product.tailles.map((size, index) => `
                        <button class="size-btn ${index === 0 ? 'active' : ''}" data-size="${size}">${size}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    const infoHtml = `
        <div class="product-detail-info">
            <h1 class="detail-name">${product.nom}</h1>
            <span class="detail-price">${formatPrice(product.prix)}</span>
            <p class="detail-description">${product.description || 'Représente le Sénégal dans un univers streetwear.'}</p>
            
            ${colorsHtml}
            ${sizesHtml}
            
            <div class="selector-group">
                <span class="selector-label">Quantité</span>
                <div class="detail-quantity-selector">
                    <button class="qty-btn" id="btnDecreaseQty">-</button>
                    <span id="displayQty">1</span>
                    <button class="qty-btn" id="btnIncreaseQty">+</button>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button class="btn-buy-now" id="btnAddToCart" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); flex: 1;">
                    <i class="fa-solid fa-plus"></i> AJOUTER AU PANIER
                </button>
                <button class="btn-buy-now" id="btnGoToCheckout" style="flex: 1;">
                    <i class="fa-solid fa-cart-shopping"></i> COMMANDER
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = galleryHtml + infoHtml;
    
    // Attacher les écouteurs pour la galerie
    if (imageDos) {
        const btnViewFace = document.getElementById('btnViewFace');
        const btnViewDos = document.getElementById('btnViewDos');
        const mainImg = document.getElementById('detailMainImg');
        
        btnViewFace.addEventListener('click', () => {
            mainImg.src = imageFace;
            btnViewFace.classList.add('active');
            btnViewDos.classList.remove('active');
        });
        
        btnViewDos.addEventListener('click', () => {
            mainImg.src = imageDos;
            btnViewDos.classList.add('active');
            btnViewFace.classList.remove('active');
        });
    }
    
    // Attacher les sélecteurs de couleur
    const colorOptions = container.querySelectorAll('.color-option');
    colorOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            colorOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            selectedColor = opt.getAttribute('data-color');
        });
    });
    
    // Attacher les sélecteurs de taille
    const sizeBtns = container.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = btn.getAttribute('data-size');
        });
    });
    
    // Attacher la sélection de quantité
    const btnDecreaseQty = document.getElementById('btnDecreaseQty');
    const btnIncreaseQty = document.getElementById('btnIncreaseQty');
    const displayQty = document.getElementById('displayQty');
    
    if (btnDecreaseQty && btnIncreaseQty && displayQty) {
        btnDecreaseQty.addEventListener('click', () => {
            if (selectedQuantity > 1) {
                selectedQuantity--;
                displayQty.innerText = selectedQuantity;
            }
        });
        
        btnIncreaseQty.addEventListener('click', () => {
            selectedQuantity++;
            displayQty.innerText = selectedQuantity;
        });
    }
    
    // Bouton Ajouter au panier
    document.getElementById('btnAddToCart').addEventListener('click', () => {
        let existingItem = cartItems.find(item => item.product.id === selectedProduct.id && item.size === selectedSize && item.color === selectedColor);
        if (existingItem) {
            existingItem.quantity += selectedQuantity;
        } else {
            cartItems.push({
                product: selectedProduct,
                size: selectedSize,
                color: selectedColor,
                price: selectedProduct.prix,
                quantity: selectedQuantity
            });
        }
        
        // Update total items count in badge
        const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        document.getElementById('cartCount').innerText = totalItems;
        
        // Petite animation de feedback
        const btn = document.getElementById('btnAddToCart');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> AJOUTÉ !';
        btn.style.backgroundColor = 'var(--accent-green)';
        btn.style.color = '#fff';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = 'var(--bg-secondary)';
            btn.style.color = 'var(--text-primary)';
        }, 1500);
    });

    // Aller à la page de confirmation de paiement (Commande direct)
    document.getElementById('btnGoToCheckout').addEventListener('click', () => {
        // S'il clique sur commander directement, on ajoute le produit courant au panier si ce n'est pas déjà fait
        let existingItem = cartItems.find(item => item.product.id === selectedProduct.id && item.size === selectedSize && item.color === selectedColor);
        if (existingItem) {
            existingItem.quantity += selectedQuantity;
        } else {
            cartItems.push({
                product: selectedProduct,
                size: selectedSize,
                color: selectedColor,
                price: selectedProduct.prix,
                quantity: selectedQuantity
            });
        }
        
        const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        document.getElementById('cartCount').innerText = totalItems;
        openCheckout();
    });
    
    showView('view-product-detail');
}

// ==========================================
// PANIER D'ACHAT
// ==========================================
function renderCart() {
    const cartContent = document.getElementById('cartContent');
    
    if (cartItems.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-cart-arrow-down"></i>
                <p class="cart-empty-text">Votre panier est tristement vide.</p>
                <button class="btn-continue-shopping" onclick="showView('view-catalog')">Découvrir nos pièces</button>
            </div>
        `;
        showView('view-cart');
        return;
    }

    let itemsHtml = '<div class="cart-items">';
    let total = 0;
    let totalItems = 0;

    cartItems.forEach((item, index) => {
        total += item.price * item.quantity;
        totalItems += item.quantity;
        const imageFace = (item.product.image_face && typeof item.product.image_face === 'string') ? item.product.image_face.trim() : 'https://via.placeholder.com/400x500?text=Produit';
        
        itemsHtml += `
            <div class="cart-item">
                <img src="${imageFace}" alt="${item.product.nom}" class="cart-item-img">
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.product.nom}</h3>
                    <p class="cart-item-options">Taille : <strong>${item.size}</strong> | Couleur : <strong>${item.color}</strong></p>
                    <span class="cart-item-price">${formatPrice(item.price)}</span>
                    <div class="cart-item-quantity">
                        <button onclick="updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
    itemsHtml += '</div>';

    const summaryHtml = `
        <div class="cart-summary">
            <h3 class="cart-summary-title">Résumé de la commande</h3>
            <div class="cart-summary-row">
                <span>Articles (${totalItems})</span>
                <span>${formatPrice(total)}</span>
            </div>
            <div class="cart-summary-row">
                <span>Livraison</span>
                <span style="color: var(--accent-green);">Gratuite</span>
            </div>
            <div class="cart-summary-total">
                <span>Total</span>
                <span>${formatPrice(total)}</span>
            </div>
            <button class="btn-checkout" onclick="openCheckout()">PASSER À LA CAISSE</button>
            <button class="btn-continue-shopping" style="width: 100%; margin-top: 1rem;" onclick="showView('view-catalog')">Continuer les achats</button>
        </div>
    `;

    cartContent.innerHTML = `
        <div class="cart-grid">
            ${itemsHtml}
            ${summaryHtml}
        </div>
    `;
    
    showView('view-cart');
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cartCount').innerText = totalItems;
    renderCart(); // Re-render
}

function updateQuantity(index, delta) {
    cartItems[index].quantity += delta;
    if (cartItems[index].quantity < 1) {
        cartItems.splice(index, 1);
    }
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cartCount').innerText = totalItems;
    renderCart(); // Re-render
}

// Configuration de la page de Checkout
function openCheckout() {
    if (cartItems.length === 0) return;
    
    const summaryCard = document.getElementById('summaryCard');
    
    let summaryHtml = '';
    let total = 0;
    
    cartItems.forEach(item => {
        total += item.price * item.quantity;
        const imageFace = (item.product.image_face && typeof item.product.image_face === 'string') ? item.product.image_face.trim() : 'https://via.placeholder.com/400x500?text=Produit';
        
        summaryHtml += `
            <div class="summary-item">
                <img src="${imageFace}" alt="${item.product.nom}" class="summary-item-img">
                <div class="summary-item-details">
                    <h4 class="summary-item-name">${item.product.nom} x${item.quantity}</h4>
                    <p class="summary-item-meta">Taille : <strong>${item.size}</strong> | Couleur : <strong>${item.color}</strong></p>
                    <span class="summary-item-price">${formatPrice(item.price * item.quantity)}</span>
                </div>
            </div>
        `;
    });
    
    summaryHtml += `
        <div class="summary-row" style="margin-top: 1rem;">
            <span>Sous-total</span>
            <span>${formatPrice(total)}</span>
        </div>
        <div class="summary-row">
            <span>Livraison (Dakar)</span>
            <span style="color: var(--accent-green); font-weight: 500;">Gratuite</span>
        </div>
        
        <div class="summary-row summary-total">
            <span>Total à payer</span>
            <span class="total-price">${formatPrice(total)}</span>
        </div>
    `;
    
    summaryCard.innerHTML = summaryHtml;
    
    // Mettre à jour le bouton de validation du paiement
    document.getElementById('paymentAmount').innerText = formatPrice(total);
    
    // Réinitialiser le formulaire
    document.getElementById('checkoutForm').reset();

    // Réinitialiser le mode de paiement
    selectedPaymentMethod = 'carte';
    document.querySelectorAll('.payment-method-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector('.payment-method-option[data-method="carte"]').classList.add('active');
    document.querySelectorAll('.payment-fields').forEach(f => f.classList.remove('active'));
    document.getElementById('payment-fields-carte').classList.add('active');
    document.getElementById('paymentNotice').innerText = "Le paiement par carte bancaire est simulé pour ce projet.";
    
    showView('view-checkout');
}

// Helper pour attendre la validation du paiement externe
function openPaymentGateway(url) {
    return new Promise((resolve, reject) => {
        const paymentWindow = window.open(url, '_blank');
        
        const messageHandler = (event) => {
            if (event.data && event.data.type === 'PAYMENT_SUCCESS') {
                window.removeEventListener('message', messageHandler);
                clearInterval(checkClosed);
                resolve();
            }
        };
        
        window.addEventListener('message', messageHandler);
        
        const checkClosed = setInterval(() => {
            if (paymentWindow && paymentWindow.closed) {
                window.removeEventListener('message', messageHandler);
                clearInterval(checkClosed);
                // Si la fenêtre est fermée avant d'avoir reçu PAYMENT_SUCCESS
                // On peut rejeter la promesse, mais pour un proto on peut juste résoudre 
                // ou avertir l'utilisateur. Rejetons proprement :
                reject(new Error("L'onglet de paiement a été fermé avant validation."));
            }
        }, 1000);
    });
}

// Soumission de la commande (Enregistrement Supabase)
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    const btnPlaceOrder = document.getElementById('btnPlaceOrder');
    const clientNom = document.getElementById('clientNom').value.trim();
    const clientAdresse = document.getElementById('clientAdresse').value.trim();
    
    if (!clientNom || !clientAdresse) {
        alert("Veuillez remplir tous les champs obligatoires (Nom et Adresse).");
        return;
    }

    let paymentId = "Via site externe";
    if (selectedPaymentMethod === 'carte') {
        paymentId = "Simulé";
    }
    
    btnPlaceOrder.disabled = true;
    if (selectedPaymentMethod === 'wave') {
        btnPlaceOrder.innerText = "CONNEXION À WAVE...";
    } else if (selectedPaymentMethod === 'orange_money') {
        btnPlaceOrder.innerText = "CONNEXION À ORANGE MONEY...";
    } else if (selectedPaymentMethod === 'paypal') {
        btnPlaceOrder.innerText = "CONNEXION À PAYPAL...";
    } else {
        btnPlaceOrder.innerText = "TRAITEMENT DE LA COMMANDE...";
    }
    
    let totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderData = {
        nom_client: clientNom,
        adresse: clientAdresse,
        produits: cartItems, // Enregistrement du panier complet au lieu d'un seul ID
        montant_total: totalAmount,
        mode_paiement: selectedPaymentMethod,
        identifiant_paiement: paymentId
    };
    
    try {
        let orderId = '';
        let dateCommande = new Date().toLocaleString('fr-FR');
        
        if (selectedPaymentMethod === 'wave') {
            await openPaymentGateway(`wave-payment.html?amount=${totalAmount}&product=${encodeURIComponent('Commande TerangaStreet')}`);
        } else if (selectedPaymentMethod === 'orange_money') {
            await openPaymentGateway(`orange-payment.html?amount=${totalAmount}&product=${encodeURIComponent('Commande TerangaStreet')}`);
        } else if (selectedPaymentMethod === 'paypal') {
            await openPaymentGateway(`paypal-payment.html?amount=${totalAmount}&product=${encodeURIComponent('Commande TerangaStreet')}`);
        } else if (selectedPaymentMethod === 'carte') {
            await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        if (supabaseClient) {
            try {
                // Insertion réelle dans Supabase
                const { data, error } = await supabaseClient
                    .from('commandes')
                    .insert([orderData])
                    .select();
                    
                if (error) throw error;
                
                if (data && data.length > 0) {
                    orderId = `TS-${data[0].id.toString().padStart(5, '0')}`;
                    if (data[0].date_commande) {
                        dateCommande = new Date(data[0].date_commande).toLocaleString('fr-FR');
                    }
                } else {
                    orderId = `TS-${Math.floor(10000 + Math.random() * 90000)}`;
                }
            } catch (dbError) {
                console.warn("Échec d'enregistrement Supabase. Passage en mode simulation :", dbError);
                orderId = `TS-${Math.floor(10000 + Math.random() * 90000)} (Simulé)`;
            }
        } else {
            // Simulation hors-ligne classique
            orderId = `TS-${Math.floor(10000 + Math.random() * 90000)} (Simulé)`;
        }
        // Garder une copie des articles pour le reçu avant de vider le panier
        const purchasedItems = [...cartItems];
        const finalTotal = totalAmount;
        
        // Vider le panier
        cartItems = [];
        document.getElementById('cartCount').innerText = 0;
        
        // Afficher l'écran de succès
        renderSuccessPage(orderId, dateCommande, purchasedItems, finalTotal);
        
    } catch (err) {
        console.error("Erreur lors de la validation de la commande:", err);
        alert("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
        const btnPlaceOrder = document.getElementById('btnPlaceOrder');
        btnPlaceOrder.disabled = false;
        btnPlaceOrder.innerHTML = `CONFIRMER ET PAYER <span id="paymentAmount">${formatPrice(totalAmount)}</span>`;
    }
}

// Affichage de la page de confirmation de succès
function renderSuccessPage(orderId, dateString, items, total) {
    const successOrderDetails = document.getElementById('successOrderDetails');
    const successBarcodeNumber = document.getElementById('successBarcodeNumber');
    const btnWhatsAppTrack = document.getElementById('btnWhatsAppTrack');
    
    // Generate a simulated transaction reference
    const transactionRef = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
    
    successOrderDetails.innerHTML = `
        <div class="receipt-details-title">Récapitulatif de la transaction</div>
        <div class="receipt-row">
            <span>ID Transaction</span>
            <span><strong>${transactionRef}</strong></span>
        </div>
        <div class="receipt-row">
            <span>Réf. Commande</span>
            <span><strong>${orderId}</strong></span>
        </div>
        <div class="receipt-row">
            <span>Date</span>
            <span>${dateString}</span>
        </div>
        <div class="receipt-row">
            <span>Mode de paiement</span>
            <span style="text-transform: capitalize;">${selectedPaymentMethod.replace('_', ' ')} (Simulé)</span>
        </div>
        
        <div class="receipt-details-title" style="margin-top: 1.5rem;">Articles (${items.reduce((acc, i) => acc + i.quantity, 0)})</div>
        ${items.map(item => `
        <div class="receipt-row" style="font-size: 0.9rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 5px;">
            <div style="display:flex; flex-direction:column;">
                <span><strong>${item.product.nom} x${item.quantity}</strong></span>
                <span style="color:var(--text-secondary); font-size:0.8rem;">Taille: ${item.size} | ${item.color}</span>
            </div>
            <span>${formatPrice(item.price * item.quantity)}</span>
        </div>
        `).join('')}
        
        <div class="receipt-row highlight" style="margin-top: 10px;">
            <span>Montant Total</span>
            <span><strong>${formatPrice(total)}</strong></span>
        </div>
    `;
    
    // Set barcode
    if (successBarcodeNumber) {
        successBarcodeNumber.innerText = `${orderId}-PAYMENT`;
    }
    
    // Configure WhatsApp tracking link (fictional number for support)
    if (btnWhatsAppTrack) {
        const supportPhone = '221765306462'; // Dakar support number
        const messageText = `Salam! Je souhaite suivre ma commande TerangaStreet numéro *${orderId}*.\nMontant payé: *${formatPrice(total)}*.\nMerci de me tenir informé de l'expédition!`;
        btnWhatsAppTrack.href = `https://wa.me/${supportPhone}?text=${encodeURIComponent(messageText)}`;
    }
    
    showView('view-success');
    
    // Trigger confetti animation
    if (typeof confetti === 'function') {
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        function randomInRange(min, max) {
          return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { 
              particleCount, 
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
              colors: ['#00A859', '#FCD116', '#E21836', '#ffffff'] // Senegal flag colors
          }));
          confetti(Object.assign({}, defaults, { 
              particleCount, 
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
              colors: ['#00A859', '#FCD116', '#E21836', '#ffffff'] // Senegal flag colors
          }));
        }, 250);
    }
}

// ==========================================
// INITIALISATION DE LA PAGE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Charger les articles
    fetchProducts();
    
    // Événements de navigation
    document.getElementById('backToCatalog').addEventListener('click', () => showView('view-catalog'));
    document.getElementById('backToProduct').addEventListener('click', () => openProductDetail(selectedProduct));
    document.getElementById('btnReturnHome').addEventListener('click', () => {
        selectedProduct = null;
        showView('view-catalog');
    });
    
    document.getElementById('backFromCart').addEventListener('click', () => showView('view-catalog'));
    
    // Clic sur l'icône du panier (redirige vers le panier)
    document.getElementById('cartBtn').addEventListener('click', () => {
        renderCart();
    });
    
    // Défilement fluide vers le catalogue
    document.getElementById('scrollIndicator').addEventListener('click', () => {
        document.getElementById('productsAnchor').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Clic sur le logo (retour à l'accueil)
    document.getElementById('headerLogo').addEventListener('click', () => {
        showView('view-catalog');
    });
    
    // Formulaire de commande
    document.getElementById('checkoutForm').addEventListener('submit', handleOrderSubmit);
    
    // Téléchargement/Impression du reçu
    const btnPrintReceipt = document.getElementById('btnPrintReceipt');
    if (btnPrintReceipt) {
        btnPrintReceipt.addEventListener('click', () => {
            window.print();
        });
    }
    // Événements des méthodes de paiement
    const paymentOptions = document.querySelectorAll('.payment-method-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            selectedPaymentMethod = method;
            
            // Mettre à jour l'UI des boutons
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Afficher les champs correspondants
            document.querySelectorAll('.payment-fields').forEach(field => field.classList.remove('active'));
            document.getElementById('payment-fields-' + method).classList.add('active');

            // Mettre à jour la notice de paiement
            const notice = document.getElementById('paymentNotice');
            if (method === 'carte') {
                notice.innerText = "Le paiement par carte bancaire est simulé pour ce projet.";
            } else if (method === 'wave') {
                notice.innerText = "Un nouvel onglet s'ouvrira vers la page de paiement Wave.";
            } else if (method === 'orange_money') {
                notice.innerText = "Un nouvel onglet s'ouvrira vers la page de paiement Orange Money.";
            } else if (method === 'paypal') {
                notice.innerText = "Un nouvel onglet s'ouvrira vers la page de paiement PayPal.";
            }
        });
    });
});

// ==========================================
// EFFETS DE SCROLL ET PARALLAXE (HERO)
// ==========================================
window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    const heroImage = document.getElementById('heroImage');
    const heroContent = document.querySelector('.hero-content');
    
    if (heroImage && heroContent) {
        // Zoom progressif et décalage parallaxe de l'image de fond
        heroImage.style.transform = `scale(${1.05 + scrollPos * 0.0003}) translateY(${scrollPos * 0.12}px)`;
        // Estompage de l'image de fond
        heroImage.style.opacity = `${Math.max(0.1, 1 - scrollPos / 600)}`;
        
        // Estompage et décalage parallaxe du texte héroïque
        heroContent.style.transform = `translateY(${scrollPos * 0.2}px)`;
        heroContent.style.opacity = `${Math.max(0, 1 - scrollPos / 400)}`;
    }
});
