// ===== FUNCIONALIDAD MÓVIL MEJORADA - VERSIÓN CORREGIDA =====
function initMobileFeatures() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav.primary');
    const overlay = document.querySelector('.mobile-overlay');
    
    // Solo inicializar si los elementos existen
    if (!mobileMenuToggle || !nav || !overlay) {
        console.warn('Elementos del menú móvil no encontrados');
        return;
    }

    function toggleMenu() {
        const isOpening = !nav.classList.contains('mobile-open');
        nav.classList.toggle('mobile-open');
        overlay.classList.toggle('mobile-open');
        document.body.style.overflow = isOpening ? 'hidden' : '';
        
        // Animación del botón hamburguesa
        const spans = mobileMenuToggle.querySelectorAll('span');
        if (isOpening) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }

    /*
    // [ELIMINADO] Las definiciones de toggleSubmenu y closeSubmenu locales
    // se han eliminado para usar la versión global y simplificada.
    */

    function closeMobileMenu() {
        nav.classList.remove('mobile-open');
        overlay.classList.remove('mobile-open');
        document.body.style.overflow = '';
        
        // Llama a la función global de cierre de submenú (ahora no-op para servicios)
        closeSubmenu(); 
        
        // Reset hamburguesa
        const spans = mobileMenuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }

    // Event Listeners
    mobileMenuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    overlay.addEventListener('click', closeMobileMenu);

    // Event delegation para el menú móvil
    nav.addEventListener('click', function(e) {
        const target = e.target;
        const isLink = target.classList.contains('link') || 
                                target.closest('.link') || 
                                target.classList.contains('submenu') || 
                                target.closest('.submenu');

        // [ELIMINADO] Se elimina la lógica especial de toggle para 'servicesToggle' en móvil. 
        // Ahora se trata como un enlace de navegación normal.
        
        // Si se hace clic en cualquier enlace, cerrar el menú móvil (incluye 'servicesToggle' ahora)
        if (isLink) {
            // Lógica simplificada: si se hace clic en cualquier enlace, cerrar el menú móvil
            setTimeout(closeMobileMenu, 300);
        }
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            if (nav.classList.contains('mobile-open')) {
                closeMobileMenu();
            }
        }
    });

    // Cerrar menú al cambiar tamaño de ventana (si se vuelve a desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && nav.classList.contains('mobile-open')) {
            closeMobileMenu();
        }
    });
}

// ====================================================================
// === AJUSTE CRÍTICO: CONEXIÓN AL BACKEND DE NODE.JS (PUERTO 3300) ===
// ====================================================================

// URL base de tu servidor Node.js
// El servidor Express.js está configurado en el puerto 3300
const API_BASE_URL = 'http://localhost:3300/api'; 


// Estado global de la aplicación
const AppState = {
    currentSectionId: null,
    isSubmenuOpen: false,
    currentCarouselIndex: 0
};

// Referencias DOM
const DOM = {
    sections: document.querySelectorAll('.section'),
    hero: document.querySelector('.hero'),
    topbar: document.querySelector('.topbar'),
    // servicesSubmenu ahora puede ser null si se elimina del HTML, pero DOM.servicesToggle permanece
    servicesToggle: document.getElementById('servicesToggle'),
    servicesSubmenu: document.getElementById('servicesSubmenu'), 
    quoteForm: document.getElementById('quoteForm'),
    quoteMsg: document.getElementById('quoteMsg'),
    resetBtn: document.getElementById('resetBtn'),
    sendQuoteBtn: document.getElementById('sendQuoteBtn'),
    btnText: document.getElementById('btnText'),
    btnLoading: document.getElementById('btnLoading'),
    quotePreview: document.getElementById('quotePreview'),
    quotePrice: document.getElementById('quotePrice'),
    quoteTime: document.getElementById('quoteTime'),
    quoteService: document.getElementById('quoteService'),
    quoteRoute: document.getElementById('quoteRoute'),
    usStateSelection: document.getElementById('usStateSelection'),
    usDestStateSelection: document.getElementById('usDestStateSelection'),
    carouselInner: document.querySelector('.carousel-inner'),
    carouselItems: document.querySelectorAll('.carousel-item'),
    carouselControls: document.querySelectorAll('.carousel-control'),
    carouselPrev: document.querySelector('.carousel-prev'),
    carouselNext: document.querySelector('.carousel-next'),
    // Elementos de Rastreo (Asegúrate de que estos IDs existan en tu HTML)
    // Coinciden con los IDs del index.html que funcionan con el nuevo sistema de rastreo
    trackButton: document.querySelector('#rastrear-btn'), 
    trackInput: document.querySelector('#codigo'),
    resultsContainer: document.querySelector('#tracking-results'),
    errorContainer: document.querySelector('#error-message')
};

// Tarifas base por servicio (en USD por kg)
const PRICING = {
    Marítimo: {
        base: 1.20,
        urgency: { normal: 0, express: 0.4, urgent: 0.8 },
        insurance: { no: 0, basic: 0.01, full: 0.02 }
    },
    Aéreo: {
        base: 3.50,
        urgency: { normal: 0, express: 1.0, urgent: 2.0 },
        insurance: { no: 0, basic: 0.01, full: 0.02 }
    }
};

// Tiempos de entrega estimados (en días)
const DELIVERY_TIMES = {
    Marítimo: { normal: "7-14 días", express: "5-7 días", urgent: "3-5 días" },
    Aéreo: { normal: "3-5 días", express: "2-3 días", urgent: "1-2 días" }
};

// Factores de distancia entre países (multiplicador de precio)
const DISTANCE_FACTORS = {
    "Guatemala-Guatemala": 1.0,
    "Guatemala-El Salvador": 1.2,
    "Guatemala-Honduras": 1.3,
    "Guatemala-Nicaragua": 1.5,
    "Guatemala-Costa Rica": 1.7,
    "Guatemala-Panamá": 2.0,
    "Estados Unidos-Guatemala": 2.5,
    "Estados Unidos-El Salvador": 2.6,
    "Estados Unidos-Honduras": 2.7,
    "Estados Unidos-Nicaragua": 2.8,
    "Estados Unidos-Costa Rica": 2.9,
    "Estados Unidos-Panamá": 3.0,
    "default": 1.5
};

// Factores adicionales para estados de USA
const USA_STATE_FACTORS = {
    "California": 1.0,
    "Texas": 1.1,
    "Florida": 1.2,
    "Nueva York": 1.3,
    "Illinois": 1.1,
    "Georgia": 1.1,
    "Arizona": 1.0,
    "Washington": 1.2,
    "default": 1.1
};

// ========== CONFIGURACIÓN PARA ENVÍO DE EMAILS ==========
const EMAIL_CONFIG = {
    // SERVICIO GRATUITO - Formspree (cambia por tu ID real)
    formspreeURL: 'https://formspree.io/f/mgvdnwld', // ← REEMPLAZA ESTO con tu ID de Formspree
    recipient: 'barillasm344@gmail.com'
};

// Funcionalidad del carrusel
function initCarousel() {
    if (!DOM.carouselInner) return;
    
    function updateCarousel() {
        DOM.carouselInner.style.transform = `translateX(-${AppState.currentCarouselIndex * 100}%)`;
        
        DOM.carouselControls.forEach((control, index) => {
            if (index === AppState.currentCarouselIndex) {
                control.classList.add('active');
            } else {
                control.classList.remove('active');
            }
        });
    }
    
    if (DOM.carouselPrev) {
        DOM.carouselPrev.addEventListener('click', function() {
            AppState.currentCarouselIndex = AppState.currentCarouselIndex > 0 ? 
                AppState.currentCarouselIndex - 1 : DOM.carouselItems.length - 1;
            updateCarousel();
        });
    }
    
    if (DOM.carouselNext) {
        DOM.carouselNext.addEventListener('click', function() {
            AppState.currentCarouselIndex = AppState.currentCarouselIndex < DOM.carouselItems.length - 1 ? 
                AppState.currentCarouselIndex + 1 : 0;
            updateCarousel();
        });
    }
    
    if (DOM.carouselControls) {
        DOM.carouselControls.forEach((control, index) => {
            control.addEventListener('click', function() {
                AppState.currentCarouselIndex = index;
                updateCarousel();
            });
        });
    }
    
    // Auto-avance del carrusel
    setInterval(function() {
        if (DOM.carouselItems && DOM.carouselItems.length > 0) {
            AppState.currentCarouselIndex = AppState.currentCarouselIndex < DOM.carouselItems.length - 1 ? 
                AppState.currentCarouselIndex + 1 : 0;
            updateCarousel();
        }
    }, 5000);
}

// Funcionalidad del acordeón de preguntas frecuentes
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isActive = this.classList.contains('active');
            
            // Cerrar todas las preguntas
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
            });
            
            // Abrir la pregunta clickeada si no estaba activa
            if (!isActive) {
                this.classList.add('active');
                if (answer) {
                    answer.classList.add('active');
                }
            }
        });
    });
}

// Mostrar/ocultar selección de estados para USA
function toggleStateSelection(selectElement, stateContainer) {
    if (selectElement && stateContainer) {
        if (selectElement.value === "Estados Unidos") {
            stateContainer.classList.add('show');
        } else {
            stateContainer.classList.remove('show');
        }
        calculateQuote();
    }
}

// Calcular factor de distancia entre dos países
function calculateDistanceFactor(origin, destination, originState = "", destState = "") {
    const key = `${origin}-${destination}`;
    
    let factor = DISTANCE_FACTORS[key] || DISTANCE_FACTORS.default;
    
    if (origin === "Estados Unidos" && originState) {
        factor *= (USA_STATE_FACTORS[originState] || USA_STATE_FACTORS.default);
    }
    
    if (destination === "Estados Unidos" && destState) {
        factor *= (USA_STATE_FACTORS[destState] || USA_STATE_FACTORS.default);
    }
    
    return factor;
}

// Calcular cotización en tiempo real
function calculateQuote() {
    if (!DOM.quotePreview) return;
    
    const serviceType = document.getElementById('q_type')?.value;
    const weight = parseFloat(document.getElementById('q_weight')?.value) || 0;
    const origin = document.getElementById('q_origin')?.value;
    const destination = document.getElementById('q_dest')?.value;
    const urgency = document.getElementById('q_urgency')?.value;
    const insurance = document.getElementById('q_insurance')?.value;
    const originState = document.getElementById('q_origin_state')?.value;
    const destState = document.getElementById('q_dest_state')?.value;
    
    if (!serviceType || weight <= 0 || !origin || !destination) {
        DOM.quotePreview.classList.remove('show');
        return;
    }
    
    const basePrice = PRICING[serviceType].base * weight;
    const distanceFactor = calculateDistanceFactor(origin, destination, originState, destState);
    let total = basePrice * distanceFactor;
    
    const urgencyMultiplier = PRICING[serviceType].urgency[urgency];
    total += basePrice * urgencyMultiplier;
    
    const insuranceRate = PRICING[serviceType].insurance[insurance];
    const declaredValue = 1000;
    total += declaredValue * insuranceRate;
    
    total *= 1.12;
    
    if (DOM.quotePrice) DOM.quotePrice.textContent = `$${total.toFixed(2)} USD`;
    if (DOM.quoteTime) DOM.quoteTime.textContent = DELIVERY_TIMES[serviceType][urgency];
    if (DOM.quoteService) DOM.quoteService.textContent = serviceType;
    
    let routeText = `${origin}`;
    if (origin === "Estados Unidos" && originState) {
        routeText += ` (${originState})`;
    }
    routeText += ` → ${destination}`;
    if (destination === "Estados Unidos" && destState) {
        routeText += ` (${destState})`;
    }
    if (DOM.quoteRoute) DOM.quoteRoute.textContent = routeText;
    
    DOM.quotePreview.classList.add('show');
}

// ========== SISTEMA DE ENVÍO DE EMAILS MEJORADO ==========
async function enviarCotizacionReal(datos) {
    try {
        // Preparar datos para el envío
        const formData = new FormData();
        formData.append('nombre', datos.name);
        formData.append('email', datos.email);
        formData.append('telefono', datos.phone);
        formData.append('origen', datos.origin + (datos.originState ? ` (${datos.originState})` : ''));
        formData.append('destino', datos.destination + (datos.destState ? ` (${datos.destState})` : ''));
        formData.append('servicio', datos.type);
        formData.append('peso', datos.weight);
        formData.append('urgencia', datos.urgency);
        formData.append('seguro', datos.insurance);
        formData.append('descripcion', datos.description);
        formData.append('cotizacion', datos.finalPrice);
        formData.append('fecha', new Date().toLocaleString('es-GT'));
        formData.append('_replyto', datos.email);
        formData.append('_subject', `Nueva Cotización GT CARGO - ${datos.name}`);
        
        // Enviar usando Formspree (SERVICIO GRATUITO)
        const response = await fetch(EMAIL_CONFIG.formspreeURL, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            return { success: true, message: '¡Cotización enviada exitosamente! Te contactaremos en 24 horas.' };
        } else {
            throw new Error('Error en el servidor');
        }
    } catch (error) {
        console.error('Error al enviar:', error);
        return { 
            success: false, 
            message: 'Error al enviar. Usando método alternativo...' 
        };
    }
}

// Función fallback para cuando falle el envío automático
function enviarCotizacionFallback(datos) {
    const to = 'barillasm344@gmail.com';
    const subject = encodeURIComponent(`COTIZACIÓN GT CARGO - ${datos.name}`);
    
    let body = `NUEVA SOLICITUD DE COTIZACIÓN - GT CARGO%0D%0A%0D%0A`;
    body += `📋 DATOS DEL CLIENTE:%0D%0A`;
    body += `• Nombre: ${datos.name}%0D%0A`;
    body += `• Correo: ${datos.email}%0D%0A`;
    body += `• Teléfono: ${datos.phone}%0D%0A%0D%0A`;
    body += `🚚 DATOS DEL ENVÍO:%0D%0A`;
    body += `• Origen: ${datos.origin}${datos.originState ? ` (${datos.originState})` : ''}%0D%0A`;
    body += `• Destino: ${datos.destination}${datos.destState ? ` (${datos.destState})` : ''}%0D%0A`;
    body += `• Servicio: ${datos.type}%0D%0A`;
    body += `• Peso: ${datos.weight} kg%0D%0A`;
    body += `• Urgencia: ${datos.urgency}%0D%0A`;
    body += `• Seguro: ${datos.insurance}%0D%0A`;
    body += `• Descripción: ${datos.description || 'No especificada'}%0D%0A%0D%0A`;
    body += `💰 COTIZACIÓN ESTIMADA: ${datos.finalPrice}%0D%0A%0D%0A`;
    body += `---%0D%0A`;
    body += `📧 IMPORTANTE: HAGA CLIC EN "ENVIAR" para enviar esta cotización%0D%0A`;
    body += `⏰ Tiempo de respuesta: 24 horas%0D%0A`;
    body += `📞 Contacto: barillasm344@gmail.com%0D%0A`;

    const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}`;
    
    return new Promise((resolve) => {
        if (confirm('📧 Se abrirá su cliente de email. PARA ENVIAR LA COTIZACIÓN:\n\n1. Revise el email generado\n2. HAGA CLIC EN "ENVIAR"\n3. Cierre la ventana cuando termine\n\n¿Continuar?')) {
            window.open(mailtoLink, '_blank');
            resolve({ 
                success: true, 
                message: '✅ ¡Solicitud preparada! Recuerde hacer clic en ENVIAR en su correo.' 
            });
        } else {
            resolve({ 
                success: false, 
                message: 'Puede contactarnos directamente: barillasm344@gmail.com' 
            });
        }
    });
}

// Manejar envío de formulario - VERSIÓN CORREGIDA
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!DOM.sendQuoteBtn || !DOM.btnText || !DOM.btnLoading) return;
    
    // Mostrar estado de carga
    DOM.btnText.textContent = 'Enviando...';
    DOM.btnLoading.style.display = 'inline-block';
    DOM.sendQuoteBtn.disabled = true;
    
    // Validar campos obligatorios
    const name = document.getElementById('q_name')?.value.trim();
    const email = document.getElementById('q_email')?.value.trim();
    const phone = document.getElementById('q_phone')?.value.trim();
    const origin = document.getElementById('q_origin')?.value;
    const destination = document.getElementById('q_dest')?.value;
    const type = document.getElementById('q_type')?.value;
    const weight = document.getElementById('q_weight')?.value;
    
    if (!name || !email || !phone || !origin || !destination || !type || !weight) {
        showMessage('Por favor complete todos los campos obligatorios.', 'error');
        resetButtonState();
        return;
    }
    
    // Calcular cotización final
    calculateQuote();
    const finalPrice = DOM.quotePrice ? DOM.quotePrice.textContent : '$0.00 USD';
    
    // Obtener todos los datos
    const urgency = document.getElementById('q_urgency')?.value;
    const insurance = document.getElementById('q_insurance')?.value;
    const description = document.getElementById('q_desc')?.value.trim();
    const originState = document.getElementById('q_origin_state')?.value;
    const destState = document.getElementById('q_dest_state')?.value;
    
    const datosCotizacion = {
        name: name,
        email: email,
        phone: phone,
        origin: origin,
        originState: originState,
        destination: destination,
        destState: destState,
        type: type,
        weight: weight,
        urgency: urgency,
        insurance: insurance,
        description: description,
        finalPrice: finalPrice
    };
    
    try {
        // Intentar envío automático primero
        let resultado = await enviarCotizacionReal(datosCotizacion);
        
        // Si falla el envío automático, usar fallback
        if (!resultado.success) {
            resultado = await enviarCotizacionFallback(datosCotizacion);
        }
        
        // Mostrar resultado al usuario
        showMessage(resultado.message, resultado.success ? 'success' : 'info');
        
        // Limpiar formulario si fue exitoso
        if (resultado.success && DOM.quoteForm) {
            DOM.quoteForm.reset();
            if (DOM.quotePreview) DOM.quotePreview.classList.remove('show');
            if (DOM.usStateSelection) DOM.usStateSelection.classList.remove('show');
            if (DOM.usDestStateSelection) DOM.usDestStateSelection.classList.remove('show');
        }
        
    } catch (error) {
        showMessage('Error inesperado. Por favor contáctenos directamente: barillasm344@gmail.com', 'error');
    } finally {
        resetButtonState();
    }
}

// Mostrar mensajes al usuario
function showMessage(text, type = 'info') {
    if (!DOM.quoteMsg) return;
    
    DOM.quoteMsg.textContent = text;
    DOM.quoteMsg.style.color = type === 'error' ? '#e74c3c' : 'var(--muted)';
    
    setTimeout(() => {
        if (DOM.quoteMsg) {
            DOM.quoteMsg.textContent = '';
        }
    }, type === 'error' ? 5000 : 8000);
}

// Restablecer estado del botón
function resetButtonState() {
    if (!DOM.btnText || !DOM.btnLoading || !DOM.sendQuoteBtn) return;
    
    DOM.btnText.textContent = 'Solicitar cotización formal';
    DOM.btnLoading.style.display = 'none';
    DOM.sendQuoteBtn.disabled = false;
}

// Utilidad: mostrar sección con transición
function showSectionById(id) {
    if (!id || AppState.currentSectionId === id) return;
    
    const target = document.querySelector(id);
    if (!target) return;

    const prev = AppState.currentSectionId ? document.querySelector(AppState.currentSectionId) : null;

    if (prev) {
        prev.classList.remove('visible');
        const onPrevTransitionEnd = function(e) {
            if (e.propertyName === 'opacity') {
                prev.classList.remove('active');
                prev.removeEventListener('transitionend', onPrevTransitionEnd);
            }
        };
        prev.addEventListener('transitionend', onPrevTransitionEnd);
    }

    if (DOM.hero) {
        if (id === '#inicio') {
            DOM.hero.setAttribute('aria-hidden', 'false');
        } else {
            DOM.hero.setAttribute('aria-hidden', 'true');
        }
    }

    target.classList.add('active');
    requestAnimationFrame(() => {
        target.classList.add('visible');
    });

    AppState.currentSectionId = id;
    updateActiveNavigation(id);
    // Llama a la función global.
    closeSubmenu();
}

// Actualizar navegación activa
function updateActiveNavigation(activeId) {
    document.querySelectorAll('nav.primary .link').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('[data-target]').forEach(a => {
        if (a.getAttribute('data-target') === activeId) a.classList.add('active');
    });
}

// [NUEVO / CORREGIDO] Definiciones globales de Submenú (centralizadas y simplificadas)
// Se definen globalmente para que showSectionById y closeMobileMenu puedan usarlas
// sin problemas, aunque el submenú ya no exista en el HTML.
function closeSubmenu() {
    if (DOM.servicesSubmenu) {
        DOM.servicesSubmenu.classList.remove('show');
        DOM.servicesSubmenu.setAttribute('aria-hidden', 'true');
    }
    if (DOM.servicesToggle) {
        DOM.servicesToggle.setAttribute('aria-expanded', 'false');
    }
    AppState.isSubmenuOpen = false;
}

function toggleSubmenu() {
    // Función obsoleta pero mantenida por compatibilidad.
    AppState.isSubmenuOpen = !AppState.isSubmenuOpen;
    
    if (AppState.isSubmenuOpen && DOM.servicesSubmenu && DOM.servicesToggle) {
        DOM.servicesSubmenu.classList.add('show');
        DOM.servicesSubmenu.setAttribute('aria-hidden', 'false');
        DOM.servicesToggle.setAttribute('aria-expanded', 'true');
    } else {
        closeSubmenu();
    }
}

// Inicializar secciones
function initSections() {
    if (!DOM.sections || DOM.sections.length === 0) return;
    
    DOM.sections.forEach(s => {
        s.classList.remove('active', 'visible');
    });
    showSectionById('#inicio');
}

// Manejar scroll para efectos visuales
function handleScroll() {
    if (!DOM.topbar) return;
    
    if (window.scrollY > 50) {
        DOM.topbar.classList.add('scrolled');
    } else {
        DOM.topbar.classList.remove('scrolled');
    }
}

// Inicializar eventos
function initEvents() {
    // Navegación por secciones
    document.querySelectorAll('[data-target]').forEach(el => {
        el.addEventListener('click', function(e) {
            const target = this.getAttribute('data-target');
            if (target) {
                e.preventDefault();
                showSectionById(target);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // [ELIMINADO] Lógica de submenú para servicesToggle y click fuera
    /*
    if (DOM.servicesToggle) {
        DOM.servicesToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSubmenu();
        });
    }

    document.addEventListener('click', function(e) {
        if (DOM.servicesToggle && DOM.servicesSubmenu) {
            if (!DOM.servicesToggle.contains(e.target) && !DOM.servicesSubmenu.contains(e.target)) {
                closeSubmenu();
            }
        }
    });

    if (DOM.servicesSubmenu) {
        DOM.servicesSubmenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('data-target');
                closeSubmenu();
                showSectionById(target);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }
    */

    // Formulario - calcular cotización en tiempo real
    const quoteInputs = ['q_type', 'q_weight', 'q_origin', 'q_dest', 'q_urgency', 'q_insurance', 'q_origin_state', 'q_dest_state'];
    quoteInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', calculateQuote);
        }
    });
    
    const weightInput = document.getElementById('q_weight');
    if (weightInput) {
        weightInput.addEventListener('input', calculateQuote);
    }

    // Mostrar/ocultar selección de estados para USA
    const originSelect = document.getElementById('q_origin');
    if (originSelect && DOM.usStateSelection) {
        originSelect.addEventListener('change', function() {
            toggleStateSelection(this, DOM.usStateSelection);
        });
    }
    
    const destSelect = document.getElementById('q_dest');
    if (destSelect && DOM.usDestStateSelection) {
        destSelect.addEventListener('change', function() {
            toggleStateSelection(this, DOM.usDestStateSelection);
        });
    }

    // Envío de formulario CORREGIDO
    if (DOM.quoteForm) {
        DOM.quoteForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (DOM.resetBtn) {
        DOM.resetBtn.addEventListener('click', function() {
            if (DOM.quoteForm) DOM.quoteForm.reset();
            if (DOM.quoteMsg) DOM.quoteMsg.textContent = '';
            if (DOM.quotePreview) DOM.quotePreview.classList.remove('show');
            if (DOM.usStateSelection) DOM.usStateSelection.classList.remove('show');
            if (DOM.usDestStateSelection) DOM.usDestStateSelection.classList.remove('show');
        });
    }

    // Scroll
    window.addEventListener('scroll', handleScroll);
}


// ===============================================================
// === SISTEMA DE RASTREO CONECTADO A MYSQL VIA NODE.JS API (CORREGIDO Y UNIFICADO) ===
// ===============================================================

class TrackingSystem {
    constructor() {
        this.initTrackingUI();
    }

    /**
     * Obtiene los datos de rastreo desde el endpoint de Node.js.
     * Ahora usa GET y el endpoint /api/envios/:id del backend que creamos.
     * @param {string} trackingCode - El código de rastreo a buscar (Id_cliente_web).
     * @returns {Promise<Object>} Datos del envío o un objeto con error.
     */
    async getShipment(trackingCode) {
        // Usamos el endpoint que configuramos en server.js
        const url = `${API_BASE_URL}/envios/${trackingCode}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (!response.ok) {
                // Status 404 (No encontrado) o 500 (Error interno)
                return { error: true, message: data.mensaje || 'Error desconocido del servidor.' };
            }
            
            // Si es exitoso, data contiene { cliente: 'GT1234', envios: [...] }
            return data; 

        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            return { error: true, message: 'Error de conexión. Asegúrese que el servidor Node.js está activo en el puerto 3300.' };
        }
    }

    initTrackingUI() {
        const trackingForm = document.getElementById('tracking-form');
        const codigoInput = DOM.trackInput;
        const resultsContainer = DOM.resultsContainer;
        const errorContainer = DOM.errorContainer;

        // Limpiar estilos iniciales
        if(errorContainer) errorContainer.style.display = 'none';
        if(resultsContainer) resultsContainer.style.display = 'none';
        
        if (!trackingForm || !codigoInput || !resultsContainer || !errorContainer) {
            console.warn('Elementos de la interfaz de rastreo no encontrados. Asegúrate de tener los IDs correctos.');
            return;
        }

        trackingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Aseguramos que se use mayúsculas para la búsqueda.
            const codigo = codigoInput.value.toUpperCase().trim(); 
            const rastrearBtn = document.getElementById('rastrear-btn');
            const originalText = rastrearBtn.innerHTML;

            errorContainer.style.display = 'none';
            resultsContainer.style.display = 'none';

            if (codigo.length < 5) {
                errorContainer.innerHTML = 'Ingrese un código de seguimiento válido (mín. 5 caracteres).';
                errorContainer.style.display = 'block';
                return;
            }

            // Muestra estado de carga
            rastrearBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
            rastrearBtn.disabled = true;

            // 1. Obtener datos del servidor Node.js/MySQL
            const data = await this.getShipment(codigo);
            
            // 2. Manejar la respuesta y actualizar la interfaz
            if (data.error) {
                // Para errores de conexión o 404, usamos el contenedor de error
                errorContainer.innerHTML = data.message;
                errorContainer.style.display = 'block';
            } else {
                // El backend devuelve un array de envíos (data.envios)
                resultsContainer.innerHTML = this.renderTrackingData(data.envios, codigo);
                resultsContainer.style.display = 'block';
            }
            
            // 3. Restaurar botón
            rastrearBtn.innerHTML = originalText;
            rastrearBtn.disabled = false;
        });
    }

    /**
     * Renderiza los datos devueltos por la API en formato HTML
     * @param {Array<Object>} envios - Array de objetos de envío del cliente.
     * @param {string} clienteID - ID del cliente para mostrar.
     */
    renderTrackingData(envios, clienteID) {
        if (!envios || envios.length === 0) {
            // Este caso debería ser manejado por getShipment (error 404), pero como fallback:
            return `<div class="tracking-message error">No se encontraron envíos para el ID ${clienteID}.</div>`;
        }
        
        // Tomamos el último registro como el estado actual (el más reciente)
        const ultimoEnvio = envios[envios.length - 1]; 
        
        // Formatear fecha a formato local
        const fecha = new Date(ultimoEnvio.Fecha_creacion).toLocaleString('es-GT', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // Mapeo simple de estado a clase (ejemplo)
        let statusClass = 'status-info';
        if (ultimoEnvio.Proceso_envio === 'Entregado') statusClass = 'status-success';
        else if (ultimoEnvio.Proceso_envio.includes('tránsito')) statusClass = 'status-warning';
        else if (ultimoEnvio.Proceso_envio === 'Recogido') statusClass = 'status-default';


        // La estructura usa clases de tu HTML (rastreo-resultado, detalle-group, etc.)
        return `
            <div class="rastreo-resultado show">
                <div class="rastreo-info">
                    <h2>ID de Cliente: ${clienteID}</h2>
                    <div class="status-badge ${statusClass}">${ultimoEnvio.Proceso_envio}</div>
                </div>
                
                <div class="detalle-group">
                    <div class="detalle-item">
                        <p class="label">Última actualización</p>
                        <p class="valor">${fecha}</p>
                    </div>
                    <div class="detalle-item">
                        <p class="label">Ubicación</p>
                        <p class="valor">${ultimoEnvio.Ubicacion}</p>
                    </div>
                </div>
                
                <div class="notas-group">
                    <p class="label">Descripción del Envío</p>
                    <p class="valor">${ultimoEnvio.Descripcion}</p>
                </div>

                <div class="notas-group">
                    <p class="label">Nombre del Cliente</p>
                    <p class="valor">${ultimoEnvio.Nombre_cliente}</p>
                </div>
                
            </div>
        `;
    }
}


// Inicializar todas las funcionalidades al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    initSections();
    initEvents();
    initMobileFeatures();
    initCarousel();
    initFAQ();
    
    // Inicializar el sistema de rastreo conectado a MySQL
    // Nota: El DOM.trackButton del código original era '#rastrearBtn', pero
    // se ha corregido en la definición de DOM para usar '#rastrear-btn',
    // que es el que se usa en el HTML con el sistema de rastreo más reciente.
    new TrackingSystem(); 
});
