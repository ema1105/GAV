// driver.js - VERSIÓN CON PAGINACIÓN EN FRONTEND
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZW1tYW51ZWxtb3JpbGxvcCIsImEiOiJjbWhtaHdmd2UwYnh6MnBxNHQ1eHh4bHNqIn0.o6kiz8bjWDxwUqKgnQekfg';

// Variables globales
let driverId = null;
let currentDriver = null;
let map = null;
let activeTravel = null;
let currentSection = 'inicio';

// Para paginación en frontend
let allTravelHistory = [];
let currentHistoryPage = 0;
const itemsPerPage = 10;
let currentSearchTerm = '';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicación conductor...');
    
    // Esperar a que PanelManager esté listo
    if (window.panelManager) {
        initializeWithPanelManager();
    } else {
        document.addEventListener('panelManagerReady', initializeWithPanelManager);
    }
});

async function initializeWithPanelManager() {
    console.log('Inicializando con PanelManager...');
    
    try {
        await loadDriverId();
        await loadDriverProfile();
        initializeNavigation();
        setupEventListeners();
        
        // Escuchar cambios de panel
        document.addEventListener('panelChanged', handlePanelChange);
        
        // Cargar contenido inicial
        loadSection('inicio');
    } catch (error) {
        showNotification('Error al inicializar la aplicación: ' + error.message, 'error');
    }
}

function initializeNavigation() {
    const menuItems = document.querySelectorAll('.menu-item[data-section]');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Remover active de todos los items
            menuItems.forEach(i => i.classList.remove('active'));
            // Agregar active al item clickeado
            this.classList.add('active');
            
            const sectionId = this.getAttribute('data-section');
            if (window.panelManager) {
                window.panelManager.mostrarPanel(sectionId);
            }
        });
    });
}

function handlePanelChange(event) {
    const panelId = event.detail.panelId;
    console.log('Panel cambiado a:', panelId);
    
    // Pequeño delay para permitir que el DOM se actualice
    setTimeout(() => {
        loadSection(panelId);
    }, 50);
}

// Configurar event listeners adicionales
function setupEventListeners() {
    // Event listeners adicionales si son necesarios
}

// Cargar ID del conductor
async function loadDriverId() {
  try {
        const response = await fetch('/api/driver/my-id', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error("Sesión expirada o no autenticado");
        }

        const data = await response.json();
        driverId = data.driverId;

        console.log("Driver ID cargado:", driverId);
    } catch (error) {
        console.error('Error cargando driver ID:', error);
        window.location.href = "/login";  // OPCIONAL
        throw error;
    }
}

// Cargar perfil del conductor
async function loadDriverProfile() {
    try {
         const response = await fetch('/api/driver/profile', {
             method: 'GET',
             credentials: 'include'
         });

         if (!response.ok) throw new Error("Sesión no válida");

         const data = await response.json();
         currentDriver = data;

         updateWelcomeMessage();
     } catch (error) {
         console.error('Error cargando perfil:', error);
     }
 }

// Actualizar mensaje de bienvenida
function updateWelcomeMessage() {
    const welcomeElement = document.getElementById('driverName');
    if (welcomeElement && currentDriver) {
        welcomeElement.textContent = currentDriver.fullname || 'Conductor';
    }
}

// Navegación entre secciones
function loadSection(section) {
    currentSection = section;
    
    // Obtener el contenedor específico de la sección
    let container;
    switch(section) {
        case 'inicio':
            container = document.getElementById('inicio-content');
            if (container) loadInicio(container);
            break;
        case 'solicitudes':
            container = document.getElementById('solicitudes-content');
            if (container) loadSolicitudes(container);
            break;
        case 'viajes':
            container = document.getElementById('viajes-content');
            if (container) loadViajes(container);
            break;
        case 'ruta':
            container = document.getElementById('ruta-content');
            if (container) loadRuta(container);
            break;
        case 'historial':
            container = document.getElementById('historial-content');
            if (container) loadHistorial(container);
            break;
        case 'perfil':
            container = document.getElementById('perfil-content');
            if (container) loadPerfil(container);
            break;
    }
}

// ==================== SECCIÓN INICIO ====================
function loadInicio(container) {
    if (!container) {
        container = document.getElementById('inicio-content');
    }
    if (!container) return;
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Solicitudes Pendientes</h3>
                <div class="stat-number" id="stats-pending">0</div>
                <p>Esperando tu respuesta</p>
            </div>
            <div class="stat-card">
                <h3>Viajes Activos</h3>
                <div class="stat-number" id="stats-active">0</div>
                <p>En curso o asignados</p>
            </div>
            <div class="stat-card">
                <h3>Viajes Completados</h3>
                <div class="stat-number" id="stats-completed">0</div>
                <p>Historial total</p>
            </div>
            <div class="stat-card">
                <h3>Ganancias del Día</h3>
                <div class="stat-number" id="stats-earnings">$0</div>
                <p>Total de hoy</p>
            </div>
        </div>

        <div class="action-note">
            💡 <strong>Recuerda:</strong> Revisa frecuentemente las solicitudes de viaje y mantén actualizada tu disponibilidad.
        </div>
    `;

    loadDashboardStats();
}

async function loadDashboardStats() {
    try {
        const [requests, travels, history, earnings] = await Promise.all([
            fetch(`/api/driver/${driverId}/travel-requests`).then(res => res.json()),
            fetch(`/api/driver/${driverId}/travels`).then(res => res.json()),
            fetch(`/api/driver/${driverId}/history`).then(res => res.json()),
            fetch(`/api/driver/${driverId}/daily-earnings`).then(res => res.json())
        ]);

        document.getElementById('stats-pending').textContent = Array.isArray(requests) ? requests.length : 0;
        document.getElementById('stats-active').textContent = Array.isArray(travels) ? travels.length : 0;
        document.getElementById('stats-completed').textContent = Array.isArray(history) ? history.length : 0;
        document.getElementById('stats-earnings').textContent = earnings.dailyEarnings ? 
            `$${earnings.dailyEarnings.toLocaleString('es-CO', {minimumFractionDigits: 0, maximumFractionDigits: 0})}` : '$0';
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// ==================== SECCIÓN SOLICITUDES ====================
function loadSolicitudes(container) {
    if (!container) {
        container = document.getElementById('solicitudes-content');
    }
    if (!container) return;
    
    container.innerHTML = `
        <div class="action-note">
            📋 <strong>Instrucciones:</strong> Revisa cada viaje asignado y decide si aceptar o rechazar. Si aceptas, podrás iniciarlo cuando estés listo.
        </div>

        <div id="solicitudes-container">
            <div class="loading">Cargando solicitudes...</div>
        </div>
    `;

    loadTravelRequests();
}

async function loadTravelRequests() {
    const container = document.getElementById('solicitudes-container');

    try {
        const response = await fetch(`/api/driver/${driverId}/travel-requests`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al cargar solicitudes');
        }

        if (!data.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📋</div>
                    <h3>No hay solicitudes pendientes</h3>
                    <p>Cuando recibas nuevas solicitudes de viaje, aparecerán aquí.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data.map(travel => `
            <div class="travel-card">
                <div class="travel-header">
                    <h3>${travel.destinationName || 'Destino no especificado'}</h3>
                    <span class="status-badge status-assigned">ASIGNADO</span>
                </div>

                <div class="travel-info">
                    <div class="info-row">
                        <span class="info-label">Pasajeros:</span>
                        <span class="info-value">${travel.numberPassengers}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Fecha solicitud:</span>
                        <span class="info-value">${formatDate(travel.requestDate)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Precio:</span>
                        <span class="info-value">$${travel.finalPrice ? travel.finalPrice.toLocaleString() : 'Por calcular'}</span>
                    </div>
                </div>

                ${travel.clientInfo ? `
                <div class="client-info-section">
                    <div class="client-name">👤 ${travel.clientInfo.fullName}</div>
                    <div class="client-phone">📞 ${travel.clientInfo.phoneNumber}</div>
                </div>
                ` : ''}

                <div class="travel-actions">
                    <button class="btn-accept" onclick="acceptTravelRequest('${travel.id}')">
                        ✅ Aceptar Viaje
                    </button>
                    <button class="btn-reject" onclick="rejectTravelRequest('${travel.id}')">
                        ❌ Rechazar Viaje
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        container.innerHTML = `
            <div class="error-state">
                <h3>Error al cargar solicitudes</h3>
                <p>${error.message}</p>
                <button onclick="loadTravelRequests()">Reintentar</button>
            </div>
        `;
    }
}

// ==================== SECCIÓN VIAJES ====================
function loadViajes(container) {
    if (!container) {
        container = document.getElementById('viajes-content');
    }
    if (!container) return;
    
    container.innerHTML = `
        <div id="viajes-container">
            <div class="loading">Cargando viajes...</div>
        </div>
    `;

    loadAssignedTravels();
}

async function loadAssignedTravels() {
    const container = document.getElementById('viajes-container');

    try {
        const response = await fetch(`/api/driver/${driverId}/travels`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al cargar viajes');
        }

        if (!data.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🚗</div>
                    <h3>No hay viajes asignados</h3>
                    <p>Cuando te asignen viajes, aparecerán aquí para que los gestiones.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data.map(travel => {
            const statusClass = `status-${travel.travelStatus.toLowerCase()}`;
            let actionButton = '';

            if (travel.travelStatus === 'ACCEPTED') {
                actionButton = `<button class="btn-start" onclick="startTravel('${travel.id}')">▶️ Iniciar Viaje</button>`;
            } else if (travel.travelStatus === 'IN_PROGRESS') {
                actionButton = `<button class="btn-finish" onclick="finishTravel('${travel.id}')">🏁 Finalizar Viaje</button>`;
            }

            return `
                <div class="travel-card">
                    <div class="travel-header">
                        <h3>${travel.destinationName || 'Destino no especificado'}</h3>
                        <span class="status-badge ${statusClass}">${travel.travelStatus}</span>
                    </div>

                    <div class="travel-info">
                        <div class="info-row">
                            <span class="info-label">Pasajeros:</span>
                            <span class="info-value">${travel.numberPassengers}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Estado:</span>
                            <span class="info-value">${getStatusText(travel.travelStatus)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Precio:</span>
                            <span class="info-value">$${travel.finalPrice ? travel.finalPrice.toLocaleString() : 'N/A'}</span>
                        </div>
                        ${travel.startDate ? `
                        <div class="info-row">
                            <span class="info-label">Inicio:</span>
                            <span class="info-value">${formatDate(travel.startDate)}</span>
                        </div>
                        ` : ''}
                    </div>

                    ${travel.clientInfo ? `
                    <div class="client-info-section">
                        <div class="client-name">👤 ${travel.clientInfo.fullName}</div>
                        <div class="client-phone">📞 ${travel.clientInfo.phoneNumber}</div>
                    </div>
                    ` : ''}

                    ${actionButton ? `
                    <div class="travel-actions">
                        ${actionButton}
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');

    } catch (error) {
        container.innerHTML = `
            <div class="error-state">
                <h3>Error al cargar viajes</h3>
                <p>${error.message}</p>
                <button onclick="loadAssignedTravels()">Reintentar</button>
            </div>
        `;
    }
}

// ==================== SECCIÓN RUTA ====================
function loadRuta(container) {
    if (!container) {
        container = document.getElementById('ruta-content');
    }
    if (!container) return;
    
    container.innerHTML = `
        <div id="ruta-container">
            <div class="loading">Cargando información de ruta...</div>
        </div>
    `;

    loadActiveTravelForMap();
}

async function loadActiveTravelForMap() {
    const container = document.getElementById('ruta-container');

    try {
        const response = await fetch(`/api/driver/${driverId}/travels`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al cargar viajes');
        }

        // Buscar viaje activo (IN_PROGRESS o ACCEPTED)
        const activeTravel = data.find(travel =>
            travel.travelStatus === 'IN_PROGRESS' || travel.travelStatus === 'ACCEPTED'
        );

        if (!activeTravel) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🗺️</div>
                    <h3>No hay viaje activo</h3>
                    <p>Cuando inicies un viaje, podrás visualizar la ruta aquí.</p>
                    <button onclick="loadSection('viajes')" style="margin-top: 15px;">Ver Viajes Asignados</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="active-travel-container">
                <div class="travel-header">
                    <h3>${activeTravel.destinationName}</h3>
                    <span class="status-badge status-${activeTravel.travelStatus.toLowerCase()}">
                        ${activeTravel.travelStatus}
                    </span>
                </div>

                <div class="route-info">
                    <div class="route-point start">
                        <strong>Origen:</strong><br>
                        Hotel Estelar Manzanillo del Mar
                    </div>
                    <div class="route-point end">
                        <strong>Destino:</strong><br>
                        ${activeTravel.destinationName}
                    </div>
                </div>

                <div class="live-map" id="map"></div>

                ${activeTravel.travelStatus === 'IN_PROGRESS' ? `
                <div class="travel-timer">
                    <div>⏱️ Tiempo transcurrido:</div>
                    <div id="travel-timer">00:00:00</div>
                </div>
                ` : ''}

                <div class="travel-actions">
                    ${activeTravel.travelStatus === 'ACCEPTED' ?
                        `<button class="btn-start" onclick="startTravel('${activeTravel.id}')">▶️ Iniciar Viaje</button>` :
                        activeTravel.travelStatus === 'IN_PROGRESS' ?
                        `<button class="btn-finish" onclick="finishTravel('${activeTravel.id}')">🏁 Finalizar Viaje</button>` : ''
                    }
                </div>
            </div>
        `;

        // Inicializar mapa
        initializeMap(activeTravel.destinationName);

        // Iniciar timer si el viaje está en progreso
        if (activeTravel.travelStatus === 'IN_PROGRESS' && activeTravel.startDate) {
            startTravelTimer(new Date(activeTravel.startDate));
        }

    } catch (error) {
        container.innerHTML = `
            <div class="error-state">
                <h3>Error al cargar información de ruta</h3>
                <p>${error.message}</p>
                <button onclick="loadActiveTravelForMap()">Reintentar</button>
            </div>
        `;
    }
}

// ==================== SECCIÓN HISTORIAL ====================
function loadHistorial(container) {
    if (!container) {
        container = document.getElementById('historial-content');
    }
    if (!container) return;
    
    container.innerHTML = `
        <div class="search-bar">
            <input type="text" id="search-input" placeholder="Buscar por destino..." onkeyup="handleSearch()">
            <button onclick="searchHistory()">🔍 Buscar</button>
        </div>

        <div id="historial-container">
            <div class="loading">Cargando historial...</div>
        </div>

        <div class="pagination" id="pagination-controls"></div>
    `;

    loadAllTravelHistory();
}

// Cargar todo el historial (paginación en frontend)
async function loadAllTravelHistory() {
    const container = document.getElementById('historial-container');

    try {
        container.innerHTML = '<div class="loading">Cargando historial completo...</div>';

        const response = await fetch(`/api/driver/${driverId}/history`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al cargar historial');
        }

        allTravelHistory = Array.isArray(data) ? data : [];
        currentHistoryPage = 0;

        if (!allTravelHistory.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📜</div>
                    <h3>No hay viajes en el historial</h3>
                    <p>Cuando completes viajes, aparecerán aquí en tu historial.</p>
                </div>
            `;
            document.getElementById('pagination-controls').innerHTML = '';
            return;
        }

        // Aplicar búsqueda si existe
        let filteredHistory = allTravelHistory;
        if (currentSearchTerm) {
            filteredHistory = allTravelHistory.filter(travel =>
                travel.destinationName?.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
                travel.clientInfo?.fullName?.toLowerCase().includes(currentSearchTerm.toLowerCase())
            );
        }

        // Paginar resultados
        const startIndex = currentHistoryPage * itemsPerPage;
        const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);
        const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

        // Renderizar viajes
        container.innerHTML = paginatedHistory.map(travel => {
            const statusClass = `status-${travel.travelStatus.toLowerCase()}`;

            return `
                <div class="travel-card">
                    <div class="travel-header">
                        <h3>${travel.destinationName || 'Destino no especificado'}</h3>
                        <span class="status-badge ${statusClass}">${travel.travelStatus}</span>
                    </div>

                    <div class="travel-info">
                        <div class="info-row">
                            <span class="info-label">Pasajeros:</span>
                            <span class="info-value">${travel.numberPassengers}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Solicitado:</span>
                            <span class="info-value">${formatDate(travel.requestDate)}</span>
                        </div>
                        ${travel.startDate ? `
                        <div class="info-row">
                            <span class="info-label">Inicio:</span>
                            <span class="info-value">${formatDate(travel.startDate)}</span>
                        </div>
                        ` : ''}
                        ${travel.endDate ? `
                        <div class="info-row">
                            <span class="info-label">Fin:</span>
                            <span class="info-value">${formatDate(travel.endDate)}</span>
                        </div>
                        ` : ''}
                        ${travel.travelDuration ? `
                        <div class="info-row">
                            <span class="info-label">Duración:</span>
                            <span class="info-value">${travel.travelDuration}</span>
                        </div>
                        ` : ''}
                        <div class="info-row">
                            <span class="info-label">Precio:</span>
                            <span class="info-value cost-badge">$${travel.finalPrice ? travel.finalPrice.toLocaleString() : 'N/A'}</span>
                        </div>
                    </div>

                    ${travel.clientInfo ? `
                    <div class="client-info-section">
                        <div class="client-name">👤 ${travel.clientInfo.fullName}</div>
                        <div class="client-phone">📞 ${travel.clientInfo.phoneNumber}</div>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Renderizar paginación
        renderPagination(totalPages, currentHistoryPage);

    } catch (error) {
        container.innerHTML = `
            <div class="error-state">
                <h3>Error al cargar historial</h3>
                <p>${error.message}</p>
                <button onclick="loadAllTravelHistory()">Reintentar</button>
            </div>
        `;
    }
}

// ==================== SECCIÓN PERFIL ====================
function loadPerfil(container) {
    if (!container) {
        container = document.getElementById('perfil-content');
    }
    if (!container) return;
    
    container.innerHTML = `
        <div class="profile-form-section">
            <h3>Información Personal</h3>
            <form id="profile-form" class="perfil-form">
                <div class="form-group">
                    <label for="fullname">Nombre *</label>
                    <input type="text" id="fullname" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="lastname">Apellido *</label>
                    <input type="text" id="lastname" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="number">Teléfono *</label>
                    <input type="text" id="number" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="username">Usuario</label>
                    <input type="text" id="username" class="form-control readonly-field" readonly>
                </div>
                <button type="submit" class="btn-save">💾 Guardar Cambios</button>
            </form>
        </div>

        <div class="profile-form-section">
            <h3>Información del Vehículo</h3>
            <div id="vehicle-info">
                <div class="loading">Cargando información del vehículo...</div>
            </div>
        </div>
    `;

    loadProfileData();
    loadVehicleInfo();
    setupProfileForm();
}

// ==================== FUNCIONES DE PAGINACIÓN EN FRONTEND ====================
function renderPagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination-controls');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    // Botón anterior
    if (currentPage > 0) {
        html += `<button class="page-btn" onclick="changePage(${currentPage - 1})">‹ Anterior</button>`;
    }

    // Páginas
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            html += `<button class="page-btn active">${i + 1}</button>`;
        } else {
            html += `<button class="page-btn" onclick="changePage(${i})">${i + 1}</button>`;
        }
    }

    // Botón siguiente
    if (currentPage < totalPages - 1) {
        html += `<button class="page-btn" onclick="changePage(${currentPage + 1})">Siguiente ›</button>`;
    }

    pagination.innerHTML = html;
}

function changePage(page) {
    currentHistoryPage = page;
    renderCurrentPage();
}

function renderCurrentPage() {
    const container = document.getElementById('historial-container');

    // Aplicar búsqueda si existe
    let filteredHistory = allTravelHistory;
    if (currentSearchTerm) {
        filteredHistory = allTravelHistory.filter(travel =>
            travel.destinationName?.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            travel.clientInfo?.fullName?.toLowerCase().includes(currentSearchTerm.toLowerCase())
        );
    }

    const startIndex = currentHistoryPage * itemsPerPage;
    const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

    container.innerHTML = paginatedHistory.map(travel => {
        const statusClass = `status-${travel.travelStatus.toLowerCase()}`;

        return `
            <div class="travel-card">
                <div class="travel-header">
                    <h3>${travel.destinationName || 'Destino no especificado'}</h3>
                    <span class="status-badge ${statusClass}">${travel.travelStatus}</span>
                </div>

                <div class="travel-info">
                    <div class="info-row">
                        <span class="info-label">Pasajeros:</span>
                        <span class="info-value">${travel.numberPassengers}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Solicitado:</span>
                        <span class="info-value">${formatDate(travel.requestDate)}</span>
                    </div>
                    ${travel.startDate ? `
                    <div class="info-row">
                        <span class="info-label">Inicio:</span>
                        <span class="info-value">${formatDate(travel.startDate)}</span>
                    </div>
                    ` : ''}
                    ${travel.endDate ? `
                    <div class="info-row">
                        <span class="info-label">Fin:</span>
                        <span class="info-value">${formatDate(travel.endDate)}</span>
                    </div>
                    ` : ''}
                    ${travel.travelDuration ? `
                    <div class="info-row">
                        <span class="info-label">Duración:</span>
                        <span class="info-value">${travel.travelDuration}</span>
                    </div>
                    ` : ''}
                    <div class="info-row">
                        <span class="info-label">Precio:</span>
                        <span class="info-value cost-badge">$${travel.finalPrice ? travel.finalPrice.toLocaleString() : 'N/A'}</span>
                    </div>
                </div>

                ${travel.clientInfo ? `
                <div class="client-info-section">
                    <div class="client-name">👤 ${travel.clientInfo.fullName}</div>
                    <div class="client-phone">📞 ${travel.clientInfo.phoneNumber}</div>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');

    renderPagination(totalPages, currentHistoryPage);
}

// ==================== FUNCIONES DE UTILIDAD ====================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
}

function getStatusText(status) {
    const statusMap = {
        'REQUESTED': 'Solicitado',
        'ASSIGNED': 'Asignado',
        'ACCEPTED': 'Aceptado',
        'IN_PROGRESS': 'En Progreso',
        'FINISHED': 'Finalizado',
        'CANCELLED': 'Cancelado',
        'REJECTED': 'Rechazado'
    };
    return statusMap[status] || status;
}

function startTravelTimer(startDate) {
    function updateTimer() {
        const now = new Date();
        const diff = now - startDate;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        document.getElementById('travel-timer').textContent =
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// ==================== BÚSQUEDA ====================
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    currentSearchTerm = searchInput.value;
}

function searchHistory() {
    currentHistoryPage = 0;
    renderCurrentPage();
}

// ==================== FUNCIONES DE ACCIÓN ====================
async function acceptTravelRequest(travelId) {
    try {
        const response = await fetch(`/api/driver/travels/${travelId}/accept`, {
            method: 'POST'
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al aceptar el viaje');
        }

        showNotification('✅ Viaje aceptado correctamente', 'success');
        loadTravelRequests();
        loadDashboardStats();

    } catch (error) {
        showNotification('❌ Error al aceptar el viaje: ' + error.message, 'error');
    }
}

async function rejectTravelRequest(travelId) {
    try {
        const response = await fetch(`/api/driver/travels/${travelId}/reject`, {
            method: 'POST'
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al rechazar el viaje');
        }

        showNotification('✅ Viaje rechazado correctamente', 'success');
        loadTravelRequests();
        loadDashboardStats();

    } catch (error) {
        showNotification('❌ Error al rechazar el viaje: ' + error.message, 'error');
    }
}

async function startTravel(travelId) {
    try {
        const response = await fetch(`/api/driver/travels/${travelId}/start`, {
            method: 'POST'
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar el viaje');
        }

        showNotification('✅ Viaje iniciado correctamente', 'success');
        loadAssignedTravels();
        if (currentSection === 'ruta') {
            loadActiveTravelForMap();
        }

    } catch (error) {
        showNotification('❌ Error al iniciar el viaje: ' + error.message, 'error');
    }
}

async function finishTravel(travelId) {
    try {
        const response = await fetch(`/api/driver/travels/${travelId}/finish`, {
            method: 'POST'
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al finalizar el viaje');
        }

        showNotification('✅ Viaje finalizado correctamente', 'success');
        loadAssignedTravels();
        if (currentSection === 'ruta') {
            loadActiveTravelForMap();
        }
        loadDashboardStats();

    } catch (error) {
        showNotification('❌ Error al finalizar el viaje: ' + error.message, 'error');
    }
}

// ==================== GESTIÓN DE PERFIL ====================
function loadProfileData() {
    if (!currentDriver) return;

    document.getElementById('fullname').value = currentDriver.fullname || '';
    document.getElementById('lastname').value = currentDriver.lastname || '';
    document.getElementById('email').value = currentDriver.email || '';
    document.getElementById('number').value = currentDriver.number || '';
    document.getElementById('username').value = currentDriver.username || '';
}

async function loadVehicleInfo() {
    try {
        const response = await fetch(`/api/driver/${driverId}/vehicle-info`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al cargar información del vehículo');
        }

        document.getElementById('vehicle-info').innerHTML = `
            <div class="travel-info">
                <div class="info-row">
                    <span class="info-label">Placa:</span>
                    <span class="info-value">${data.plate || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Modelo:</span>
                    <span class="info-value">${data.model || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tipo de licencia:</span>
                    <span class="info-value">${data.licenseType || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Licencia:</span>
                    <span class="info-value">${data.license || 'N/A'}</span>
                </div>
            </div>
        `;

    } catch (error) {
        document.getElementById('vehicle-info').innerHTML = `
            <div class="error-state">
                <p>Error al cargar información del vehículo: ${error.message}</p>
            </div>
        `;
    }
}

function setupProfileForm() {
    const form = document.getElementById('profile-form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            fullname: document.getElementById('fullname').value,
            lastname: document.getElementById('lastname').value,
            email: document.getElementById('email').value,
            number: document.getElementById('number').value
        };

        try {
            // USAR POST EN LUGAR DE PUT - solución temporal
            const response = await fetch('/api/driver/profile/update', {
                method: 'POST', // Cambiado a POST
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al actualizar perfil');
            }

            showNotification('✅ Perfil actualizado correctamente', 'success');
            await loadDriverProfile();

        } catch (error) {
            showNotification('❌ Error al actualizar perfil: ' + error.message, 'error');
        }
    });
}

// ==================== NOTIFICACIONES ====================
function showNotification(message, type) {
    // Eliminar notificación anterior si existe
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ==================== LOGOUT ====================
// El logout ahora se maneja a través de panelManager
// Esta función se mantiene por compatibilidad pero no se usa directamente
function logout() {
    if (window.panelManager) {
        window.panelManager.handleLogout();
    } else {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            window.location.href = '/logout';
        }
    }
}

// ==================== FUNCIONES DE MAPA ====================
function initializeMap(destinationName) {
    if (!mapboxgl.supported()) {
        document.getElementById('map').innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <p>Tu navegador no soporta Mapbox GL.</p>
                <button onclick="initializeMap('${destinationName}')">Reintentar</button>
            </div>
        `;
        return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Coordenadas del hotel (origen fijo)
    const origin = [-75.49372752027492, 10.524580108158908];

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: origin,
        zoom: 12
    });

    map.on('load', function() {
        // Geocodificar el destino para obtener coordenadas
        geocodeDestination(destinationName);
    });
}

function geocodeDestination(destinationName) {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destinationName)}.json?access_token=${MAPBOX_TOKEN}`)
        .then(response => response.json())
        .then(data => {
            if (data.features && data.features.length > 0) {
                const destination = data.features[0].center;
                plotRoute(destination);
            } else {
                throw new Error('No se encontraron coordenadas para el destino');
            }
        })
        .catch(error => {
            console.error('Error en geocoding:', error);
            document.getElementById('map').innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <p>Error al cargar la ruta: ${error.message}</p>
                </div>
            `;
        });
}

function plotRoute(destination) {
    const origin = [-75.49372752027492, 10.524580108158908];

    // Obtener ruta
    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`)
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0].geometry;

                map.addSource('route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: route
                    }
                });

                map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#007bff',
                        'line-width': 5,
                        'line-opacity': 0.75
                    }
                });

                // Añadir marcadores
                new mapboxgl.Marker({ color: '#28a745' })
                    .setLngLat(origin)
                    .setPopup(new mapboxgl.Popup().setHTML('<h3>Origen</h3><p>Hotel Estelar Manzanillo del Mar</p>'))
                    .addTo(map);

                new mapboxgl.Marker({ color: '#dc3545' })
                    .setLngLat(destination)
                    .setPopup(new mapboxgl.Popup().setHTML('<h3>Destino</h3>'))
                    .addTo(map);

                // Ajustar vista para mostrar toda la ruta
                const bounds = new mapboxgl.LngLatBounds();
                bounds.extend(origin);
                bounds.extend(destination);
                map.fitBounds(bounds, { padding: 50 });

            } else {
                throw new Error('No se pudo calcular la ruta');
            }
        })
        .catch(error => {
            console.error('Error calculando ruta:', error);
        });
}

// ==================== REFRESH AUTOMÁTICO ====================
setInterval(() => {
    if (currentSection === 'solicitudes') {
        loadTravelRequests();
    } else if (currentSection === 'viajes') {
        loadAssignedTravels();
    } else if (currentSection === 'ruta') {
        loadActiveTravelForMap();
    } else if (currentSection === 'inicio') {
        loadDashboardStats();
    }
}, 30000);