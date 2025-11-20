document.addEventListener('DOMContentLoaded', function() {

const content = document.getElementById("main-content");
const menuItems = document.querySelectorAll('.menu-item');
let driverId = null;
let currentTravels = [];
let currentRequests = [];
let currentActiveTravel = null;

// === FUNCIONES BASE ===
function setActiveMenuItem(activeItem) {
    menuItems.forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
}

async function loadDriverProfile() {
    try {
        const res = await fetch("/driver/profile");
        if (res.ok) {
            const profile = await res.json();
            driverId = await getDriverIdFromProfile(profile);
            document.querySelector('.content-header h1').textContent = `Bienvenido, ${profile.fullname || 'Conductor'}`;
        }
    } catch (err) {
        console.error("Error al obtener perfil:", err);
        driverId = 'default-driver-id';
    }
}

async function getDriverIdFromProfile(profile) {
    if (profile.id) return profile.id;
    if (!profile.username) {
        console.error("EL PERFIL NO TIENE USERNAME:", profile);
        return "default-driver-id";
    }
    try {
        const driverRes = await fetch(`/api/driver/by-username/${profile.username}`);
        if (driverRes.ok) {
            const driver = await driverRes.json();
            return driver.id;
        }
    } catch (err) {
        console.error("Error obteniendo ID del conductor:", err);
    }
    return 'default-driver-id';
}

// === MÓDULO: INICIO ===
document.getElementById("btn-inicio").addEventListener("click", (e) => {
    setActiveMenuItem(e.currentTarget);
    content.innerHTML = `
        <div class="content-header">
            <h2>Inicio</h2>
            <p>Resumen de tus actividades recientes.</p>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Viajes del Día</h3>
                <div class="stat-number" id="stats-hoy">0</div>
                <p>Completados hoy</p>
            </div>
            <div class="stat-card">
                <h3>En Curso</h3>
                <div class="stat-number" id="stats-curso">0</div>
                <p>Viajes activos</p>
            </div>
            <div class="stat-card">
                <h3>Ganancias</h3>
                <div class="stat-number" id="stats-ganancias">$0</div>
                <p>Total hoy</p>
            </div>
        </div>
        <div class="action-note">
            💡 Revisa tus viajes asignados en la sección "Viajes Asignados"
        </div>
    `;
    loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        const res = await fetch(`/api/driver/${driverId}/travels`);
        if (res.ok) {
            const travels = await res.json();
            const hoy = new Date().toDateString();

            const viajesHoy = travels.filter(t =>
                new Date(t.fechaSolicitud).toDateString() === hoy &&
                t.estadoViaje === 'FINISHED'
            ).length;

            const enCurso = travels.filter(t =>
                t.estadoViaje === 'IN_PROGRESS'
            ).length;

            const gananciasHoy = travels.filter(t =>
                new Date(t.fechaSolicitud).toDateString() === hoy &&
                t.estadoViaje === 'FINISHED'
            ).reduce((sum, t) => sum + (t.precioFinal ? Number(t.precioFinal) : 0), 0);

            document.getElementById('stats-hoy').textContent = viajesHoy;
            document.getElementById('stats-curso').textContent = enCurso;
            document.getElementById('stats-ganancias').textContent = `$${gananciasHoy}`;
        }
    } catch (err) {
        console.error("Error cargando estadísticas:", err);
    }
}

// === MÓDULO: VIAJE ACTIVO ===//
document.getElementById("btn-ruta").addEventListener("click", async (e) => {
    setActiveMenuItem(e.currentTarget);
    await loadActiveTravel();
});

async function loadActiveTravel() {
    content.innerHTML = `
        <div class="content-header">
            <h2>Viaje Activo</h2>
            <p>Sigue tu ruta en tiempo real y gestiona el viaje en curso.</p>
        </div>
        <div id="active-travel-view"></div>
    `;

    const view = document.getElementById("active-travel-view");

    try {
        // Buscar viaje activo (IN_PROGRESS)
        const res = await fetch(`/api/driver/${driverId}/travels`);
        if (!res.ok) throw new Error("Error al obtener viajes");

        const travels = await res.json();
        currentActiveTravel = travels.find(t => t.estadoViaje === 'IN_PROGRESS');

        if (!currentActiveTravel) {
            view.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🚗</div>
                    <h3>No tienes un viaje activo</h3>
                    <p>Cuando inicies un viaje, aparecerá aquí con el mapa y la ruta completa</p>
                    <div class="action-note" style="margin-top: 20px;">
                        💡 Ve a "Viajes Asignados" para iniciar un viaje
                    </div>
                </div>
            `;
            return;
        }

        const clienteNombre = currentActiveTravel.cliente ? currentActiveTravel.cliente.nombreCompleto : 'Cliente no disponible';
        const clienteTelefono = currentActiveTravel.cliente ? currentActiveTravel.cliente.telefono : 'No disponible';

        view.innerHTML = `
            <div class="active-travel-container">
                <div class="travel-header">
                    <h2>Viaje a ${currentActiveTravel.destinoNombre}</h2>
                    <span class="status-badge status-in_progress">En Curso</span>
                </div>

                <div class="route-info">
                    <div class="route-point start">
                        <strong>📍 Origen</strong>
                        <p>Recogiendo a ${clienteNombre}</p>
                        <small>📞 ${clienteTelefono}</small>
                    </div>
                    <div class="route-point end">
                        <strong>🎯 Destino</strong>
                        <p>${currentActiveTravel.destinoNombre}</p>
                        <small>${currentActiveTravel.destinoCoordenadas || 'Coordenadas no disponibles'}</small>
                    </div>
                </div>

                <div class="travel-timer" id="travel-timer">
                    Tiempo transcurrido: 00:00:00
                </div>

                <div class="live-map" id="live-map-container">
                    <div style="height: 100%; display: flex; align-items: center; justify-content: center; background: #e9ecef; color: #6c757d;">
                        <div style="text-align: center;">
                            <div style="font-size: 3em;">🗺️</div>
                            <h3>Mapa en Tiempo Real</h3>
                            <p>Ruta hacia ${currentActiveTravel.destinoNombre}</p>
                            <small>Integración con Google Maps/Mapbox aquí</small>
                        </div>
                    </div>
                </div>

                <div class="live-info-panel">
                    <h4>📊 Información del Viaje</h4>
                    <div class="travel-info">
                        <div class="info-row">
                            <span class="info-label">Pasajeros:</span>
                            <span class="info-value">${currentActiveTravel.cantidadPasajeros} personas</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Valor del viaje:</span>
                            <span class="info-value">$${currentActiveTravel.precioFinal || '0'} COP</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Iniciado:</span>
                            <span class="info-value">${new Date(currentActiveTravel.fechaInicio || new Date()).toLocaleString('es-CO')}</span>
                        </div>
                    </div>
                </div>

                <div class="travel-actions">
                    <button class="btn-finish" onclick="finishTravel('${currentActiveTravel.id}')" style="flex: 1;">
                        🏁 Finalizar Viaje
                    </button>
                    <button class="btn-start" onclick="showEmergencyOptions()" style="flex: 0.5;">
                        🆘 Emergencia
                    </button>
                </div>

                <div class="action-note">
                    🎯 Mantén esta pantalla activa durante el viaje para seguir la ruta en tiempo real
                </div>
            </div>
        `;

        // Iniciar temporizador
        startTravelTimer();

    } catch (err) {
        console.error("Error cargando viaje activo:", err);
        view.innerHTML = `
            <div class="empty-state">
                <div class="icon">❌</div>
                <h3>Error al cargar el viaje activo</h3>
                <p>Intenta nuevamente más tarde</p>
            </div>
        `;
    }
}

function startTravelTimer() {
    const startTime = currentActiveTravel?.fechaInicio ? new Date(currentActiveTravel.fechaInicio) : new Date();
    const timerElement = document.getElementById('travel-timer');

    function updateTimer() {
        const now = new Date();
        const diff = now - startTime;

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        timerElement.textContent = `Tiempo transcurrido: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

function showEmergencyOptions() {
    alert("🚨 Opciones de Emergencia:\n\n• 📞 Llamar a soporte: 123-456-7890\n• 🚓 Contactar autoridades\n• ❌ Reportar problema\n\n¿Necesitas ayuda inmediata?");
}

// === MÓDULO: SOLICITUDES PENDIENTES ===
document.getElementById("btn-solicitudes").addEventListener("click", async (e) => {
    setActiveMenuItem(e.currentTarget);
    await loadTravelRequests();
});

async function loadTravelRequests() {
    content.innerHTML = `
        <div class="content-header">
            <h2>Solicitudes de Viaje</h2>
            <p>Gestiona las nuevas solicitudes asignadas a ti.</p>
        </div>
        <div id="requests-list"></div>
    `;

    const lista = document.getElementById("requests-list");

    try {
        const res = await fetch(`/api/driver/${driverId}/travel-requests`);
        if (!res.ok) throw new Error("Error al obtener solicitudes");
        const data = await res.json();
        currentRequests = data;

        if (!data || data.length === 0) {
            lista.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📋</div>
                    <h3>No hay nuevas solicitudes</h3>
                    <p>Cuando te asignen un viaje, aparecerá aquí para que lo aceptes o rechaces</p>
                </div>
            `;
            return;
        }

        let requestsHTML = '';
        data.forEach(viaje => {
            const fecha = new Date(viaje.fechaSolicitud).toLocaleDateString('es-CO');
            const hora = new Date(viaje.fechaSolicitud).toLocaleTimeString('es-CO', {
                hour: '2-digit', minute: '2-digit'
            });
            const clienteNombre = viaje.cliente ? viaje.cliente.nombreCompleto : 'Cliente no disponible';
            const clienteTelefono = viaje.cliente ? viaje.cliente.telefono : 'No disponible';

            requestsHTML += `
                <div class="travel-card">
                    <div class="travel-header">
                        <h3>Viaje a ${viaje.destinoNombre}</h3>
                        <span class="status-badge status-requested">Pendiente de Aceptación</span>
                    </div>

                    <div class="client-info-section">
                        <div class="client-name">${clienteNombre}</div>
                        <div class="client-phone">📞 ${clienteTelefono}</div>
                    </div>

                    <div class="travel-info">
                        <div class="info-row">
                            <span class="info-label">Pasajeros:</span>
                            <span class="info-value">${viaje.cantidadPasajeros} personas</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Fecha:</span>
                            <span class="info-value">${fecha}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Hora:</span>
                            <span class="info-value">${hora}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Destino:</span>
                            <span class="info-value">${viaje.destinoNombre}</span>
                        </div>
                        <div class="cost-badge">
                            $${viaje.precioFinal || '0'} COP
                        </div>
                    </div>

                    <div class="travel-actions">
                        <button class="btn-accept" onclick="acceptTravel('${viaje.id}')">
                            ✅ Aceptar Viaje
                        </button>
                        <button class="btn-reject" onclick="rejectTravel('${viaje.id}')">
                            ❌ Rechazar Viaje
                        </button>
                    </div>
                </div>
            `;
        });

        lista.innerHTML = requestsHTML;

    } catch (err) {
        console.error("Error cargando solicitudes:", err);
        lista.innerHTML = `
            <div class="empty-state">
                <div class="icon">❌</div>
                <h3>Error al cargar solicitudes</h3>
                <p>Intenta nuevamente más tarde</p>
            </div>
        `;
    }
}

// === FUNCIONES PARA ACEPTAR Y RECHAZAR VIAJES ===
async function acceptTravel(travelId) {
    if (!confirm("¿Estás seguro de aceptar este viaje?\n\nEl estado cambiará a ACEPTADO y podrás iniciarlo cuando estés listo.")) return;

    try {
        const res = await fetch(`/api/driver/travels/${travelId}/accept`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.ok) {
            alert("✅ Viaje aceptado correctamente");
            await loadTravelRequests();
            await loadAssignedTravels();
        } else {
            const error = await res.json();
            throw new Error(error.error || "Error al aceptar el viaje");
        }
    } catch (err) {
        alert("❌ Error: " + err.message);
    }
}

async function rejectTravel(travelId) {
    if (!confirm("¿Estás seguro de rechazar este viaje?\n\nEl viaje volverá al estado SOLICITADO y el administrador lo podrá asignar a otro conductor.")) return;

    try {
        const res = await fetch(`/api/driver/travels/${travelId}/reject`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.ok) {
            alert("✅ Viaje rechazado correctamente");
            await loadTravelRequests();
        } else {
            const error = await res.json();
            throw new Error(error.error || "Error al rechazar el viaje");
        }
    } catch (err) {
        alert("❌ Error: " + err.message);
    }
}

// === MÓDULO: VIAJES ASIGNADOS (SIMPLIFICADO - SIN MAPA) ===
document.getElementById("btn-viajes").addEventListener("click", async (e) => {
    setActiveMenuItem(e.currentTarget);
    await loadAssignedTravels();
});

async function loadAssignedTravels() {
    content.innerHTML = `
        <div class="content-header">
            <h2>Viajes Asignados</h2>
            <p>Gestiona tus viajes aceptados y en curso.</p>
        </div>
        <div id="travel-list-view" class="travel-list-view">
            <div id="viajes-lista"></div>
        </div>
        <div id="travel-detail-view" class="travel-detail-view">
            <!-- Se llena dinámicamente -->
        </div>
    `;

    const lista = document.getElementById("viajes-lista");

    try {
        const res = await fetch(`/api/driver/${driverId}/travels`);
        if (!res.ok) throw new Error("Error al obtener viajes");
        const data = await res.json();

        // Filtrar solo viajes aceptados, asignados y en progreso
        currentTravels = data.filter(viaje =>
            viaje.estadoViaje === 'ACCEPTED' ||
            viaje.estadoViaje === 'ASSIGNED' ||
            viaje.estadoViaje === 'IN_PROGRESS'
        );

        if (currentTravels.length === 0) {
            lista.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🚗</div>
                    <h3>No tienes viajes asignados</h3>
                    <p>Cuando aceptes un viaje de la sección "Solicitudes", aparecerá aquí</p>
                </div>
            `;
            return;
        }

        let viajesHTML = '';
        currentTravels.forEach(viaje => {
            const fecha = new Date(viaje.fechaSolicitud).toLocaleDateString('es-CO');
            const estado = getStatusBadge(viaje.estadoViaje);
            const clienteNombre = viaje.cliente ? viaje.cliente.nombreCompleto : 'Cliente no disponible';

            viajesHTML += `
                <div class="travel-card" onclick="showTravelDetail('${viaje.id}')">
                    <div class="travel-header">
                        <h3>Viaje a ${viaje.destinoNombre}</h3>
                        <span class="status-badge ${estado.class}">${estado.text}</span>
                    </div>
                    <div class="travel-info">
                        <div class="info-row">
                            <span class="info-label">Cliente:</span>
                            <span class="info-value">${clienteNombre}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Pasajeros:</span>
                            <span class="info-value">${viaje.cantidadPasajeros}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Fecha:</span>
                            <span class="info-value">${fecha}</span>
                        </div>
                        <div class="cost-badge">
                            $${viaje.precioFinal || '0'} COP
                        </div>
                    </div>
                    <div class="action-note">
                        ${viaje.estadoViaje === 'IN_PROGRESS' ?
                          '🎯 Ve a "Viaje Activo" para ver el mapa en tiempo real' :
                          '💡 Haz clic para ver detalles y acciones'}
                    </div>
                </div>
            `;
        });

        lista.innerHTML = viajesHTML;

    } catch (err) {
        console.error("Error cargando viajes:", err);
        lista.innerHTML = `
            <div class="empty-state">
                <div class="icon">❌</div>
                <h3>Error al cargar viajes</h3>
                <p>Intenta nuevamente más tarde</p>
            </div>
        `;
    }
}

// === VISTA DETALLADA DEL VIAJE (SIMPLIFICADA) ===
async function showTravelDetail(travelId) {
    const travel = currentTravels.find(t => t.id === travelId);
    if (!travel) return;

    document.getElementById("travel-list-view").style.display = 'none';
    const detailView = document.getElementById("travel-detail-view");
    detailView.style.display = 'block';

    const fecha = new Date(travel.fechaSolicitud).toLocaleDateString('es-CO');
    const hora = new Date(travel.fechaSolicitud).toLocaleTimeString('es-CO', {
        hour: '2-digit', minute: '2-digit'
    });
    const estado = getStatusBadge(travel.estadoViaje);
    const clienteNombre = travel.cliente ? travel.cliente.nombreCompleto : 'Cliente no disponible';
    const clienteTelefono = travel.cliente ? travel.cliente.telefono : 'No disponible';

    let actionButton = '';
    let actionNote = '';

    if (travel.estadoViaje === 'ACCEPTED' || travel.estadoViaje === 'ASSIGNED') {
        actionButton = `
            <button class="btn-start" onclick="startTravel('${travel.id}')">
                🚗 Iniciar Viaje
            </button>
        `;
        actionNote = `
            <div class="action-note">
                💡 Este viaje ha sido aceptado. Prepárate para iniciarlo cuando estés listo.
            </div>
        `;
    } else if (travel.estadoViaje === 'IN_PROGRESS') {
        actionButton = `
            <button class="btn-finish" onclick="finishTravel(\"${travel.id}\")">
                🏁 Finalizar Viaje
            </button>
            //ARREGLO
        `;
        actionNote = `
            <div class="action-note">
                🎯 Ve a la sección "Viaje Activo" para ver el mapa en tiempo real y seguir la ruta
            </div>
        `;
    } else {
        actionNote = `
            <div class="action-note">
                📋 Este viaje está ${estado.text.toLowerCase()}. No requiere acción.
            </div>
        `;
    }

    detailView.innerHTML = `
        <button class="back-button" onclick="showTravelList()">← Volver a la lista</button>

        <div class="travel-card">
            <div class="travel-header">
                <h2>Viaje a ${travel.destinoNombre}</h2>
                <span class="status-badge ${estado.class}">${estado.text}</span>
            </div>

            <div class="client-info-section">
                <div class="client-name">${clienteNombre}</div>
                <div class="client-phone">📞 ${clienteTelefono}</div>
            </div>

            <div class="travel-info">
                <div class="info-row">
                    <span class="info-label">Pasajeros:</span>
                    <span class="info-value">${travel.cantidadPasajeros} personas</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha solicitud:</span>
                    <span class="info-value">${fecha}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Hora solicitud:</span>
                    <span class="info-value">${hora}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Destino:</span>
                    <span class="info-value">${travel.destinoNombre}</span>
                </div>
                ${travel.fechaInicio ? `
                <div class="info-row">
                    <span class="info-label">Iniciado:</span>
                    <span class="info-value">${new Date(travel.fechaInicio).toLocaleString('es-CO')}</span>
                </div>
                ` : ''}
            </div>

            <div class="cost-badge">
                Valor del viaje: $${travel.precioFinal || '0'} COP
            </div>

            ${actionNote}
            ${actionButton}
        </div>
    `;
}

function showTravelList() {
    document.getElementById("travel-detail-view").style.display = 'none';
    document.getElementById("travel-list-view").style.display = 'block';
}

// === FUNCIONES DE ACCIÓN PARA VIAJES ===
async function startTravel(travelId) {
    if (!confirm("¿Estás listo para iniciar este viaje?\n\nEl estado cambiará a EN CURSO y podrás verlo en 'Viaje Activo'.")) return;

    try {
        const res = await fetch(`/api/driver/travels/${travelId}/start`, {
            method: "POST"
        });

        if (res.ok) {
            alert("🚗 Viaje iniciado correctamente");
            await loadAssignedTravels();
            // Redirigir automáticamente al módulo de Viaje Activo
            document.getElementById("btn-viaje").click();
        } else {
            const error = await res.json();
            throw new Error(error.error || "Error al iniciar viaje");
        }
    } catch (err) {
        alert("❌ Error: " + err.message);
    }
}

async function finishTravel(travelId) {
    if (!confirm("¿Has llegado al destino y finalizado el viaje?\n\nEl estado cambiará a FINALIZADO.")) return;

    try {
        const res = await fetch(`/api/driver/travels/${travelId}/finish`, {
            method: "POST"
        });

        if (res.ok) {
            alert("✅ Viaje finalizado correctamente");
            await loadAssignedTravels();
            await loadActiveTravel(); // Actualizar vista de viaje activo
        } else {
            const error = await res.json();
            throw new Error(error.error || "Error al finalizar viaje");
        }
    } catch (err) {
        alert("❌ Error: " + err.message);
    }
}

// === MÓDULO: HISTORIAL (CORREGIDO) ===
document.getElementById("btn-historial").addEventListener("click", async (e) => {
    setActiveMenuItem(e.currentTarget);
    content.innerHTML = `
        <div class="content-header">
            <h2>Historial de Viajes</h2>
            <p>Tus viajes finalizados y cancelados.</p>
        </div>
        <div id="tabla-historial"></div>
    `;

    await loadTravelHistory();
});

async function loadTravelHistory(page = 0, searchTerm = '') {
    const tabla = document.getElementById("tabla-historial");

    try {
        // CORREGIDO: Usar el endpoint correcto para historial paginado
        const url = `/api/driver/${driverId}/history?page=${page}&size=10${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`;
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        // Manejar diferentes formatos de respuesta
        let travels, totalPages, currentPage;

        if (data.content !== undefined) {
            // Respuesta paginada
            travels = data.content;
            totalPages = data.totalPages;
            currentPage = data.number;
        } else if (Array.isArray(data)) {
            // Respuesta como array simple
            travels = data;
            totalPages = 1;
            currentPage = 0;
        } else {
            // Formato inesperado
            console.error("Formato de respuesta inesperado:", data);
            throw new Error("Formato de respuesta no válido");
        }

        if (!travels || travels.length === 0) {
            tabla.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📜</div>
                    <h3>No hay viajes en el historial</h3>
                    <p>Los viajes completados aparecerán aquí</p>
                </div>
            `;
            return;
        }

        // Construir interfaz con búsqueda y paginación
        let tablaHTML = `
            <div class="search-bar">
                <input type="text" id="history-search-input" placeholder="Buscar por cliente, destino..." value="${searchTerm}">
                <button class="btn-start" onclick="searchHistory()">🔍 Buscar</button>
                ${searchTerm ? `<button class="btn-accept" onclick="clearSearch()">🔄 Limpiar</button>` : ''}
            </div>
        `;

        travels.forEach(viaje => {
            if (!viaje) return; // Skip null/undefined items

            const fecha = viaje.fechaSolicitud ? new Date(viaje.fechaSolicitud).toLocaleDateString('es-CO') : 'N/A';
            const estado = getStatusBadge(viaje.estadoViaje);
            const clienteNombre = viaje.cliente ? viaje.cliente.nombreCompleto : 'N/A';

            tablaHTML += `
                <div class="travel-card">
                    <div class="travel-header">
                        <h3>Viaje a ${viaje.destinoNombre || 'Destino desconocido'}</h3>
                        <span class="status-badge ${estado.class}">${estado.text}</span>
                    </div>
                    <div class="travel-info">
                        <div class="info-row">
                            <span class="info-label">Cliente:</span>
                            <span class="info-value">${clienteNombre}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Fecha:</span>
                            <span class="info-value">${fecha}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Pasajeros:</span>
                            <span class="info-value">${viaje.cantidadPasajeros || '0'}</span>
                        </div>
                        <div class="cost-badge">
                            $${viaje.precioFinal || '0'} COP
                        </div>
                    </div>
                </div>
            `;
        });

        // Agregar paginación solo si hay múltiples páginas
        if (totalPages > 1) {
            tablaHTML += `<div class="pagination">`;

            if (currentPage > 0) {
                tablaHTML += `<button class="page-btn" onclick="loadTravelHistory(${currentPage - 1}, '${searchTerm}')">← Anterior</button>`;
            }

            // Mostrar números de página
            for (let i = 0; i < totalPages; i++) {
                if (i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage + 2)) {
                    tablaHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="loadTravelHistory(${i}, '${searchTerm}')">${i + 1}</button>`;
                } else if (i === currentPage - 3 || i === currentPage + 3) {
                    tablaHTML += `<span class="page-dots">...</span>`;
                }
            }

            if (currentPage < totalPages - 1) {
                tablaHTML += `<button class="page-btn" onclick="loadTravelHistory(${currentPage + 1}, '${searchTerm}')">Siguiente →</button>`;
            }

            tablaHTML += `</div>`;
        }

        tabla.innerHTML = tablaHTML;

    } catch (err) {
        console.error("Error cargando historial:", err);
        tabla.innerHTML = `
            <div class="empty-state">
                <div class="icon">❌</div>
                <h3>Error al cargar el historial</h3>
                <p>${err.message}</p>
                <button class="btn-start" onclick="loadTravelHistory()" style="margin-top: 15px;">
                    🔄 Reintentar
                </button>
            </div>
        `;
    }
}

function searchHistory() {
    const searchTerm = document.getElementById('history-search-input').value;
    loadTravelHistory(0, searchTerm);
}

function clearSearch() {
    document.getElementById('history-search-input').value = '';
    loadTravelHistory(0, '');
}

// === MÓDULO: PERFIL ===
document.getElementById("btn-perfil").addEventListener("click", async (e) => {
    setActiveMenuItem(e.currentTarget);
    await loadProfile();
});

async function loadProfile() {
    content.innerHTML = `<div class="content-header"><h2>Perfil</h2><p>Cargando...</p></div>`;

    try {
        const [profileRes, vehicleRes] = await Promise.all([
            fetch("/driver/profile"),
            fetch(`/api/driver/${driverId}/vehicle-info`)
        ]);

        if (!profileRes.ok) throw new Error("Error al obtener perfil");

        const profile = await profileRes.json();
        const vehicleInfo = vehicleRes.ok ? await vehicleRes.json() : {};

        content.innerHTML = `
            <div class="content-header">
                <h2>Perfil del Conductor</h2>
                <p>Actualiza tu información personal</p>
            </div>

            <!-- Foto de perfil -->
            <div class="profile-form-section">
                <h3>Foto de Perfil</h3>
                <div class="profile-picture-upload">
                    <img id="profile-picture-img" src="${profile.fotoUrl || '/images/default-avatar.png'}" alt="Foto de perfil">
                    <input type="file" id="profile-picture-input" accept="image/*" style="margin: 15px 0;">
                    <button onclick="updateProfilePicture()" class="btn-start">📸 Actualizar Foto</button>
                </div>
            </div>

            <!-- Información Personal Editable -->
            <div class="profile-form-section">
                <h3>Información Personal</h3>
                <form id="profile-form">
                    <div class="form-group">
                        <label>Nombre Completo:</label>
                        <input type="text" id="nombre" value="${profile.fullname || ''}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Apellidos:</label>
                        <input type="text" id="apellido" value="${profile.lastname || ''}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Teléfono/Celular:</label>
                        <input type="text" id="telefono" value="${profile.number || ''}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Correo Electrónico:</label>
                        <input type="email" id="email" value="${profile.email || ''}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Nueva Contraseña:</label>
                        <input type="password" id="password" placeholder="Dejar vacío para no cambiar" class="form-control">
                    </div>
                    <button type="submit" class="btn-start" style="width: 100%;">💾 Guardar Cambios</button>
                </form>
            </div>

            <!-- Información del Vehículo (solo lectura) -->
            <div class="profile-form-section">
                <h3>Información del Vehículo</h3>
                <div class="form-group">
                    <label>Placa del Vehículo:</label>
                    <input type="text" value="${vehicleInfo.placa || 'No disponible'}" class="form-control readonly-field" readonly>
                </div>
                <div class="form-group">
                    <label>Modelo:</label>
                    <input type="text" value="${vehicleInfo.modelo || 'No disponible'}" class="form-control readonly-field" readonly>
                </div>
                <div class="form-group">
                    <label>Color:</label>
                    <input type="text" value="${vehicleInfo.color || 'No disponible'}" class="form-control readonly-field" readonly>
                </div>
            </div>

            <!-- Información de Documentos (solo lectura) -->
            <div class="profile-form-section">
                <h3>Documentos y Licencias</h3>
                <div class="form-group">
                    <label>Número de Identificación:</label>
                    <input type="text" value="${profile.identificacion || 'No disponible'}" class="form-control readonly-field" readonly>
                </div>
                <div class="form-group">
                    <label>Tipo de Licencia:</label>
                    <input type="text" value="${vehicleInfo.tipoLicencia || 'No disponible'}" class="form-control readonly-field" readonly>
                </div>
                <div class="form-group">
                    <label>Número de Licencia:</label>
                    <input type="text" value="${vehicleInfo.numeroLicencia || 'No disponible'}" class="form-control readonly-field" readonly>
                </div>
                <div class="action-note">
                    📝 Esta información solo puede ser modificada por el administrador. Contacta con soporte para actualizarla.
                </div>
            </div>
        `;

        // Manejar envío del formulario
        document.getElementById("profile-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            await updateProfile();
        });

    } catch (err) {
        console.error("Error cargando perfil:", err);
        content.innerHTML = `
            <div class="error-state">
                <p>❌ No se pudo cargar el perfil. Intenta nuevamente.</p>
            </div>
        `;
    }
}

async function updateProfile() {
    const dto = {
        number: document.getElementById("telefono").value,
        email: document.getElementById("email").value,
        fullname: document.getElementById("nombre").value,
        lastname: document.getElementById("apellido").value,
        password: document.getElementById("password").value || null
    };

    try {
        const res = await fetch("/driver/profile/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        if (res.ok) {
            alert("✅ Perfil actualizado correctamente");
            // Recargar el header con el nuevo nombre
            await loadDriverProfile();
        } else {
            throw new Error("Error del servidor al actualizar perfil");
        }
    } catch (err) {
        alert("❌ Error: " + err.message);
    }
}

async function updateProfilePicture() {
    const fileInput = document.getElementById('profile-picture-input');
    const file = fileInput.files[0];

    if (!file) {
        alert('📸 Por favor selecciona una imagen');
        return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
        alert('❌ Por favor selecciona un archivo de imagen válido');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch(`/api/driver/${driverId}/profile/picture`, {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            const result = await res.json();
            alert('✅ Foto de perfil actualizada correctamente');
            document.getElementById('profile-picture-img').src = result.fotoUrl + '?t=' + new Date().getTime(); // Cache bust
        } else {
            throw new Error('Error al subir la imagen');
        }
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}

// === FUNCIONES UTILITARIAS ===
function getStatusBadge(status) {
    const statusMap = {
        'REQUESTED': { text: 'Solicitado', class: 'status-requested' },
        'ASSIGNED': { text: 'Asignado', class: 'status-assigned' },
        'ACCEPTED': { text: 'Aceptado', class: 'status-accepted' },
        'IN_PROGRESS': { text: 'En Curso', class: 'status-in_progress' },
        'FINISHED': { text: 'Finalizado', class: 'status-finished' },
        'CANCELLED': { text: 'Cancelado', class: 'status-cancelled' },
        'REJECTED': { text: 'Rechazado', class: 'status-rejected' }
    };
    return statusMap[status] || { text: status, class: 'status-assigned' };
}

// === CERRAR SESIÓN ===
document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch("/logout", { method: "POST" });
    window.location.href = "/homepage";
});

// Cargar perfil al iniciar
loadDriverProfile();
)}