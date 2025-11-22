// ===== FUNCIONALIDAD MÓVIL MEJORADA =====
function initMobileFeatures() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav.primary');
    const overlay = document.querySelector('.mobile-overlay');
    
    // Solo inicializar si estamos en móvil y los elementos existen
    if (mobileMenuToggle && window.innerWidth <= 768) {
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
        
        mobileMenuToggle.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
        
        // Cerrar menú al hacer clic en enlaces
        nav.querySelectorAll('.link, .submenu a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('mobile-open');
                overlay.classList.remove('mobile-open');
                document.body.style.overflow = '';
                
                // Reset hamburguesa
                const spans = mobileMenuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }
}

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
  carouselNext: document.querySelector('.carousel-next')
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
  
  DOM.carouselPrev.addEventListener('click', function() {
    AppState.currentCarouselIndex = AppState.currentCarouselIndex > 0 ? 
      AppState.currentCarouselIndex - 1 : DOM.carouselItems.length - 1;
    updateCarousel();
  });
  
  DOM.carouselNext.addEventListener('click', function() {
    AppState.currentCarouselIndex = AppState.currentCarouselIndex < DOM.carouselItems.length - 1 ? 
      AppState.currentCarouselIndex + 1 : 0;
    updateCarousel();
  });
  
  DOM.carouselControls.forEach((control, index) => {
    control.addEventListener('click', function() {
      AppState.currentCarouselIndex = index;
      updateCarousel();
    });
  });
  
  setInterval(function() {
    AppState.currentCarouselIndex = AppState.currentCarouselIndex < DOM.carouselItems.length - 1 ? 
      AppState.currentCarouselIndex + 1 : 0;
    updateCarousel();
  }, 5000);
}

// Funcionalidad del acordeón de preguntas frecuentes
function initFAQ() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const answer = this.nextElementSibling;
      const isActive = this.classList.contains('active');
      
      faqQuestions.forEach(q => {
        q.classList.remove('active');
        q.nextElementSibling.classList.remove('active');
      });
      
      if (!isActive) {
        this.classList.add('active');
        answer.classList.add('active');
      }
    });
  });
}

// Mostrar/ocultar selección de estados para USA
function toggleStateSelection(selectElement, stateContainer) {
  if (selectElement.value === "Estados Unidos") {
    stateContainer.classList.add('show');
  } else {
    stateContainer.classList.remove('show');
  }
  calculateQuote();
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
  const serviceType = document.getElementById('q_type').value;
  const weight = parseFloat(document.getElementById('q_weight').value) || 0;
  const origin = document.getElementById('q_origin').value;
  const destination = document.getElementById('q_dest').value;
  const urgency = document.getElementById('q_urgency').value;
  const insurance = document.getElementById('q_insurance').value;
  const originState = document.getElementById('q_origin_state').value;
  const destState = document.getElementById('q_dest_state').value;
  
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
  
  DOM.quotePrice.textContent = `$${total.toFixed(2)} USD`;
  DOM.quoteTime.textContent = DELIVERY_TIMES[serviceType][urgency];
  DOM.quoteService.textContent = serviceType;
  
  let routeText = `${origin}`;
  if (origin === "Estados Unidos" && originState) {
    routeText += ` (${originState})`;
  }
  routeText += ` → ${destination}`;
  if (destination === "Estados Unidos" && destState) {
    routeText += ` (${destState})`;
  }
  DOM.quoteRoute.textContent = routeText;
  
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
  
  // Mostrar estado de carga
  DOM.btnText.textContent = 'Enviando...';
  DOM.btnLoading.style.display = 'inline-block';
  DOM.sendQuoteBtn.disabled = true;
  
  // Validar campos obligatorios
  const name = document.getElementById('q_name').value.trim();
  const email = document.getElementById('q_email').value.trim();
  const phone = document.getElementById('q_phone').value.trim();
  const origin = document.getElementById('q_origin').value;
  const destination = document.getElementById('q_dest').value;
  const type = document.getElementById('q_type').value;
  const weight = document.getElementById('q_weight').value;
  
  if (!name || !email || !phone || !origin || !destination || !type || !weight) {
    showMessage('Por favor complete todos los campos obligatorios.', 'error');
    resetButtonState();
    return;
  }
  
  // Calcular cotización final
  calculateQuote();
  const finalPrice = DOM.quotePrice.textContent;
  
  // Obtener todos los datos
  const urgency = document.getElementById('q_urgency').value;
  const insurance = document.getElementById('q_insurance').value;
  const description = document.getElementById('q_desc').value.trim();
  const originState = document.getElementById('q_origin_state').value;
  const destState = document.getElementById('q_dest_state').value;
  
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
    if (resultado.success) {
      DOM.quoteForm.reset();
      DOM.quotePreview.classList.remove('show');
      DOM.usStateSelection.classList.remove('show');
      DOM.usDestStateSelection.classList.remove('show');
    }
    
  } catch (error) {
    showMessage('Error inesperado. Por favor contáctenos directamente: barillasm344@gmail.com', 'error');
  } finally {
    resetButtonState();
  }
}

// Mostrar mensajes al usuario
function showMessage(text, type = 'info') {
  DOM.quoteMsg.textContent = text;
  DOM.quoteMsg.style.color = type === 'error' ? '#e74c3c' : 'var(--muted)';
  
  setTimeout(() => {
    DOM.quoteMsg.textContent = '';
  }, type === 'error' ? 5000 : 8000);
}

// Restablecer estado del botón
function resetButtonState() {
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

  if (id === '#inicio') {
    DOM.hero.setAttribute('aria-hidden', 'false');
  } else {
    DOM.hero.setAttribute('aria-hidden', 'true');
  }

  target.classList.add('active');
  requestAnimationFrame(() => {
    target.classList.add('visible');
  });

  AppState.currentSectionId = id;
  updateActiveNavigation(id);
  closeSubmenu();
}

// Actualizar navegación activa
function updateActiveNavigation(activeId) {
  document.querySelectorAll('nav.primary .link').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('[data-target]').forEach(a => {
    if (a.getAttribute('data-target') === activeId) a.classList.add('active');
  });
}

// Cerrar submenú
function closeSubmenu() {
  DOM.servicesSubmenu.classList.remove('show');
  DOM.servicesSubmenu.setAttribute('aria-hidden', 'true');
  DOM.servicesToggle.setAttribute('aria-expanded', 'false');
  AppState.isSubmenuOpen = false;
}

// Abrir/cerrar submenú
function toggleSubmenu() {
  AppState.isSubmenuOpen = !AppState.isSubmenuOpen;
  
  if (AppState.isSubmenuOpen) {
    DOM.servicesSubmenu.classList.add('show');
    DOM.servicesSubmenu.setAttribute('aria-hidden', 'false');
    DOM.servicesToggle.setAttribute('aria-expanded', 'true');
  } else {
    closeSubmenu();
  }
}

// Inicializar secciones
function initSections() {
  DOM.sections.forEach(s => {
    s.classList.remove('active', 'visible');
  });
  showSectionById('#inicio');
}

// Manejar scroll para efectos visuales
function handleScroll() {
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

  // Submenú
  DOM.servicesToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleSubmenu();
  });

  document.addEventListener('click', function(e) {
    if (!DOM.servicesToggle.contains(e.target) && !DOM.servicesSubmenu.contains(e.target)) {
      closeSubmenu();
    }
  });

  DOM.servicesSubmenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const target = this.getAttribute('data-target');
      closeSubmenu();
      showSectionById(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Formulario - calcular cotización en tiempo real
  const quoteInputs = ['q_type', 'q_weight', 'q_origin', 'q_dest', 'q_urgency', 'q_insurance', 'q_origin_state', 'q_dest_state'];
  quoteInputs.forEach(inputId => {
    document.getElementById(inputId).addEventListener('change', calculateQuote);
  });
  document.getElementById('q_weight').addEventListener('input', calculateQuote);

  // Mostrar/ocultar selección de estados para USA
  document.getElementById('q_origin').addEventListener('change', function() {
    toggleStateSelection(this, DOM.usStateSelection);
  });
  
  document.getElementById('q_dest').addEventListener('change', function() {
    toggleStateSelection(this, DOM.usDestStateSelection);
  });

  // Envío de formulario CORREGIDO
  DOM.quoteForm.addEventListener('submit', handleFormSubmit);
  DOM.resetBtn.addEventListener('click', function() {
    DOM.quoteForm.reset();
    DOM.quoteMsg.textContent = '';
    DOM.quotePreview.classList.remove('show');
    DOM.usStateSelection.classList.remove('show');
    DOM.usDestStateSelection.classList.remove('show');
  });

  // Scroll
  window.addEventListener('scroll', handleScroll);
}

// Inicializar aplicación
function initApp() {
  initSections();
  initEvents();
  initCarousel();
  initFAQ();
  handleScroll();
  initMobileFeatures(); // ← AGREGADA ESTA LÍNEA
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
