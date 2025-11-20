/*// Al inicio de client.js - DEBUG TEMPORAL
console.log('=== INICIANDO CLIENTE CON DEBUG ===');

// Sobrescribir console.error para capturar más información
const originalError = console.error;
console.error = function(...args) {
    originalError.apply(console, ['🚨 ERROR CAPTURADO:', ...args]);
    // Puedes agregar aquí envío de errores a un servicio si lo deseas
};
*/

const API_BASE = '/api/client';
const PROFILE_API_BASE = '/api/client/profile';
let map;
let currentDestination = null;
let availableDestinations = [];
let mapInitialized = false;
let destinationsLoaded = false;
let destinationMarker = null;

// Función auxiliar para fetch con timeout
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// Función para validar coordenadas
function isValidCoordinates(coords) {
    console.log('Validando coordenadas:', coords);

    if (!Array.isArray(coords) || coords.length !== 2) {
        console.error('Coordenadas no son array de 2 elementos:', coords);
        return false;
    }

    const [lon, lat] = coords;

    // Verificar que son números
    if (typeof lon !== 'number' || typeof lat !== 'number') {
        console.error('Coordenadas no son números:', typeof lon, typeof lat);
        return false;
    }

    // Verificar que no son NaN o infinitos
    if (isNaN(lon) || isNaN(lat) || !isFinite(lon) || !isFinite(lat)) {
        console.error('Coordenadas no son números finitos:', lon, lat);
        return false;
    }

    // Verificar rangos válidos
    const isLonValid = lon >= -180 && lon <= 180;
    const isLatValid = lat >= -90 && lat <= 90;

    if (!isLonValid || !isLatValid) {
        console.error('Coordenadas fuera de rango - Lon:', lon, 'Lat:', lat);
        return false;
    }

    // Verificar que no son coordenadas extremas (probable error)
    if (Math.abs(lon) > 1000 || Math.abs(lat) > 1000) {
        console.error('Coordenadas extremas (probable error):', lon, lat);
        return false;
    }

    console.log('Coordenadas válidas:', coords);
    return true;
}

// Función MEJORADA para parsear coordenadas
function parseCoordinates(lonStr, latStr) {
    console.log('Parseando coordenadas raw:', lonStr, latStr);

    if (typeof lonStr !== 'string' || typeof latStr !== 'string') {
        console.error('Coordenadas no son strings:', typeof lonStr, typeof latStr);
        return null;
    }

    // Limpiar strings
    const cleanLon = lonStr.trim().replace(/[^\d.-]/g, '');
    const cleanLat = latStr.trim().replace(/[^\d.-]/g, '');

    console.log('Coordenadas limpias:', cleanLon, cleanLat);

    // Convertir a números
    const lon = parseFloat(cleanLon);
    const lat = parseFloat(cleanLat);

    console.log('Coordenadas parseadas como números:', lon, lat);

    // Validar conversión
    if (isNaN(lon) || isNaN(lat)) {
        console.error('No se pudieron convertir a números:', cleanLon, cleanLat);
        return null;
    }

    const result = [lon, lat];

    // Validar coordenadas finales
    if (!isValidCoordinates(result)) {
        console.error('Coordenadas finales inválidas después del parseo');
        return null;
    }

    return result;
}

// Función para limpiar recursos del mapa
function cleanupMapResources() {
    console.log('Limpiando recursos del mapa...');

    if (destinationMarker) {
        destinationMarker.remove();
        destinationMarker = null;
    }

    if (map && mapInitialized) {
        try {
            if (map.getSource('route')) {
                map.removeLayer('route');
                map.removeSource('route');
            }
        } catch (error) {
            console.error('Error limpiando recursos del mapa:', error);
        }
    }

    currentDestination = null;
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicación cliente...');

    // Esperar a que PanelManager esté listo
    if (window.panelManager) {
        initializeWithPanelManager();
    } else {
        document.addEventListener('panelManagerReady', initializeWithPanelManager);
    }
});

function initializeWithPanelManager() {
    console.log('Inicializando con PanelManager...');

    // Configurar event listeners para los items del menú
    initializeNavigation();

    // Cargar datos iniciales
    loadUserProfile();
    loadActiveTravels();
    loadTravelHistory();
    setupEventListeners();

    // Escuchar cambios de panel
    document.addEventListener('panelChanged', handlePanelChange);
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
        switch(panelId) {
            case 'inicio':
                loadActiveTravels();
                break;
            case 'solicitar':
                if (!mapInitialized) {
                    initializeMap();
                } else {
                    // Redimensionar mapa si ya está inicializado
                    setTimeout(() => {
                        if (map && typeof map.resize === 'function') {
                            map.resize();
                        }
                    }, 300);
                }

                if (!destinationsLoaded) {
                    loadAvailableDestinations();
                } else {
                    populateDestinationDropdown();
                }
                break;
            case 'historial':
                loadTravelHistory();
                break;
            case 'perfil':
                loadUserProfile();
                break;
        }
    }, 50);
}

// 1. Mapa y funcionalidades de viaje
function initializeMap() {
    console.log('Inicializando mapa...');

    if (mapInitialized && map) {
        console.log('Mapa ya inicializado, redimensionando...');
        setTimeout(() => {
            if (map && typeof map.resize === 'function') {
                map.resize();
            }
        }, 300);
        return;
    }

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Contenedor del mapa no encontrado');
        return;
    }

    const rect = mapContainer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        console.log('Contenedor del mapa no visible, reintentando...');
        setTimeout(initializeMap, 100);
        return;
    }

    if (typeof mapboxgl === 'undefined') {
        console.error('Mapbox GL JS no está cargado');
        showMessage('Error al cargar el mapa. Por favor recarga la página.', 'error');
        return;
    }

    try {
        mapboxgl.accessToken = 'pk.eyJ1IjoiZW1tYW51ZWxtb3JpbGxvcCIsImEiOiJjbWhtaHdmd2UwYnh6MnBxNHQ1eHh4bHNqIn0.o6kiz8bjWDxwUqKgnQekfg';

        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-75.49372752027492, 10.524580108158908],
            zoom: 12,
            antialias: false,
            preserveDrawingBuffer: false,
            trackResize: true,
            maxZoom: 15,
            minZoom: 10
        });

        map.on('load', () => {
            console.log('Mapa cargado correctamente');
            mapInitialized = true;

            // Marcador del origen (hotel)
            new mapboxgl.Marker({ color: '#4CAF50' })
                .setLngLat([-75.49372752027492, 10.524580108158908])
                .setPopup(new mapboxgl.Popup().setHTML('<h3>Hotel Estelar Manzanillo del Mar</h3><p>Origen de los viajes</p>'))
                .addTo(map);

            map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        });

        map.on('error', (e) => {
            console.error('Error en el mapa:', e);
            showMessage('Error al cargar el mapa', 'error');
        });

        map.on('webglcontextlost', () => {
            console.error('Contexto WebGL perdido');
            showMessage('Error de gráficos. Por favor recarga la página.', 'error');
        });

        map.on('webglcontextrestored', () => {
            console.log('Contexto WebGL restaurado');
            mapInitialized = true;
        });

    } catch (error) {
        console.error('Error al inicializar el mapa:', error);
        showMessage('Error crítico al cargar el mapa', 'error');
    }

    window.addEventListener('resize', () => {
        if (map && mapInitialized) {
            setTimeout(() => {
                if (map && typeof map.resize === 'function') {
                    map.resize();
                }
            }, 100);
        }
    });
}

// 2. Cargar destinos disponibles - OPTIMIZADO
async function loadAvailableDestinations() {
    console.log('Cargando destinos disponibles...');

    // Mostrar loading
    const select = document.getElementById('destinationSelect');
    if (select) {
        select.innerHTML = '<option value="">Cargando destinos...</option>';
        select.disabled = true;
    }

    try {
        const response = await fetchWithTimeout(`${API_BASE}/destinations`, {
            credentials: 'include',
            timeout: 5000
        });

        if (response.ok) {
            availableDestinations = await response.json();
            destinationsLoaded = true;
            console.log('Destinos cargados:', availableDestinations.length);

            // Habilitar el select y poblar opciones
            if (select) {
                select.disabled = false;
                populateDestinationDropdown();
            }
        } else {
            console.error('Error cargando destinos:', response.status);
            showMessage('Error al cargar destinos disponibles', 'error');
        }
    } catch (error) {
        console.error('Error cargando destinos:', error);
        if (select) {
            select.innerHTML = '<option value="">Error cargando destinos</option>';
        }
        if (error.name === 'AbortError') {
            showMessage('Timeout al cargar destinos', 'error');
        } else {
            showMessage('Error de conexión al cargar destinos', 'error');
        }
    }
}

function populateDestinationDropdown() {
    const select = document.getElementById('destinationSelect');
    if (!select) {
        console.error('Dropdown de destinos no encontrado');
        return;
    }

    console.time('Populate dropdown');

    // Usar DocumentFragment para mejor rendimiento
    const fragment = document.createDocumentFragment();

    // Opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "-- Selecciona un destino --";
    fragment.appendChild(defaultOption);

    // Agregar destinos en lotes para no bloquear el UI
    let processed = 0;
    const batchSize = 10;

    const processBatch = () => {
        const end = Math.min(processed + batchSize, availableDestinations.length);

        for (let i = processed; i < end; i++) {
            const destination = availableDestinations[i];
            const option = document.createElement('option');
            option.value = destination.id;
            option.textContent = `${destination.destination} - $${destination.price}`;
            option.setAttribute('data-lat', destination.latitude);
            option.setAttribute('data-lon', destination.longitude);
            option.setAttribute('data-name', destination.destination);
            option.setAttribute('data-price', destination.price);
            fragment.appendChild(option);
        }

        processed = end;

        if (processed < availableDestinations.length) {
            // Procesar siguiente lote en el siguiente frame
            requestAnimationFrame(processBatch);
        } else {
            // Todos procesados, agregar al DOM
            select.innerHTML = '';
            select.appendChild(fragment);
            console.timeEnd('Populate dropdown');

            // Configurar event listener
            setupDestinationSelectListener(select);
        }
    };

    // Iniciar procesamiento por lotes
    processBatch();
}

// Función separada para el event listener del select
function setupDestinationSelectListener(select) {
    select.onchange = function() {
        console.log('1. Inicio cambio de destino');
        const selectedOption = this.options[this.selectedIndex];

        if (!selectedOption.value) {
            clearDestinationSelection();
            return;
        }

        console.log('2. Procesando destino:', selectedOption.getAttribute('data-name'));

        const lonStr = selectedOption.getAttribute('data-lon');
        const latStr = selectedOption.getAttribute('data-lat');
        const coordinates = parseCoordinates(lonStr, latStr);

        console.log('3. Coordenadas parseadas:', coordinates);

        if (!coordinates) {
            console.error('Coordenadas inválidas en el destino:', selectedOption.getAttribute('data-name'));
            showMessage('Error: Coordenadas del destino inválidas', 'error');
            return;
        }

        currentDestination = {
            id: selectedOption.value,
            name: selectedOption.getAttribute('data-name'),
            coordinates: coordinates,
            price: parseFloat(selectedOption.getAttribute('data-price'))
        };

        console.log('4. Mostrando info destino');
        showDestinationInfo();

        clearTimeout(window.destinationChangeTimeout);
        window.destinationChangeTimeout = setTimeout(() => {
            console.log('5. Iniciando operaciones de mapa');
            centerMapOnDestination();
            console.log('6. Después de centerMapOnDestination');
            addDestinationMarker(currentDestination);
            console.log('7. Después de addDestinationMarker');
        }, 300);
    };
}

// 3. Funciones del mapa - OPTIMIZADAS
function addDestinationMarker(destination) {
    if (!map || !mapInitialized) return;

    try {
        // Eliminar marcador anterior
        if (destinationMarker) {
            destinationMarker.remove();
        }

        // Crear marcador simple
        destinationMarker = new mapboxgl.Marker({ color: '#FF5722' })
            .setLngLat(destination.coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div class="map-popup">
                    <h3>${destination.name}</h3>
                    <p>Destino seleccionado</p>
                    <p><strong>Precio base: $${destination.price}</strong></p>
                </div>
            `))
            .addTo(map);
    } catch (error) {
        console.error('Error en addDestinationMarker:', error);
    }
}

function selectDestinationFromMap(destinationId) {
    console.log('Seleccionando destino:', destinationId);

    const destination = availableDestinations.find(dest => dest.id === destinationId);
    if (destination) {
        currentDestination = {
            id: destination.id,
            name: destination.destination,
            coordinates: [destination.longitude, destination.latitude],
            price: parseFloat(destination.price)
        };

        const select = document.getElementById('destinationSelect');
        if (select) {
            select.value = destinationId;
        }

        showDestinationInfo();

        // Usar timeout para evitar bloqueo
        setTimeout(() => {
            centerMapOnDestination();
            addDestinationMarker(currentDestination);
        }, 100);

        showMessage(`Destino seleccionado: ${destination.destination}`, 'success');
    } else {
        console.error('Destino no encontrado:', destinationId);
        showMessage('Error al seleccionar el destino', 'error');
    }
}

function showDestinationInfo() {
    const selectedDestination = document.getElementById('selectedDestination');
    const basePrice = document.getElementById('basePrice');
    const locationInfo = document.getElementById('locationInfo');

    if (selectedDestination) selectedDestination.textContent = currentDestination.name;
    if (basePrice) basePrice.textContent = currentDestination.price.toFixed(0);
    if (locationInfo) locationInfo.classList.remove('hidden');

    calculateEstimatedPrice();
}

// Función MEJORADA para centrar el mapa - EVITA BLOQUEOS
function centerMapOnDestination() {
    if (!map || !currentDestination || !mapInitialized) {
        console.log('Mapa no listo para centrar');
        return;
    }

    // VERIFICACIÓN EXTRA de coordenadas
    if (!isValidCoordinates(currentDestination.coordinates)) {
        console.error('Coordenadas inválidas detectadas en centerMap:', currentDestination.coordinates);
        showMessage('Error: Ubicación del destino no es válida', 'error');
        return;
    }

    console.log('Centrando mapa en:', currentDestination.coordinates);

    // Usar requestAnimationFrame para no bloquear
    requestAnimationFrame(() => {
        try {
            // Usar jumpTo en lugar de flyTo para mayor estabilidad
            map.jumpTo({
                center: currentDestination.coordinates,
                zoom: 14
            });

            console.log('Mapa centrado exitosamente');

            // Dibujar ruta después de un pequeño delay
            setTimeout(() => {
                if (map && mapInitialized) {
                    drawRoute([-75.49372752027492, 10.524580108158908], currentDestination.coordinates);
                }
            }, 100);

        } catch (error) {
            console.error('Error crítico al centrar mapa:', error);
            showMessage('Error al mostrar la ubicación en el mapa', 'error');
        }
    });
}

// Función MEJORADA para agregar marcador - MÁS ROBUSTA
function addDestinationMarker(destination) {
    if (!map || !mapInitialized) {
        console.log('Mapa no disponible para agregar marcador');
        return;
    }

    // Verificación EXTRA de coordenadas
    if (!isValidCoordinates(destination.coordinates)) {
        console.error('Coordenadas inválidas para marcador:', destination.coordinates);
        return;
    }

    console.log('Agregando marcador en:', destination.coordinates);

    // Usar requestAnimationFrame
    requestAnimationFrame(() => {
        try {
            // Eliminar marcador anterior de forma segura
            if (destinationMarker) {
                try {
                    destinationMarker.remove();
                } catch (e) {
                    console.warn('Error al eliminar marcador anterior:', e);
                }
                destinationMarker = null;
            }

            // Crear marcador simple sin popup inicialmente
            destinationMarker = new mapboxgl.Marker({
                color: '#FF5722',
                draggable: false // Mejor rendimiento
            })
            .setLngLat(destination.coordinates)
            .addTo(map);

            console.log('Marcador agregado exitosamente');

            // Agregar popup después de un delay
            setTimeout(() => {
                if (destinationMarker && mapInitialized) {
                    try {
                        const popup = new mapboxgl.Popup({ offset: 25 })
                            .setHTML(`
                                <div class="map-popup">
                                    <h3>${destination.name}</h3>
                                    <p>Destino seleccionado</p>
                                    <p><strong>Precio base: $${destination.price}</strong></p>
                                </div>
                            `);
                        destinationMarker.setPopup(popup);
                    } catch (e) {
                        console.warn('Error al agregar popup:', e);
                    }
                }
            }, 500);

        } catch (error) {
            console.error('Error crítico al agregar marcador:', error);
        }
    });
}

// Función para dibujar ruta
function drawRoute(origin, destination) {
    if (!map || !mapInitialized) {
            console.log('Mapa no disponible para dibujar ruta');
            return;
        }

        // Verificación básica
        if (!origin || !destination || !Array.isArray(origin) || !Array.isArray(destination)) {
            console.error('Coordenadas básicas inválidas para ruta:', {origin, destination});
            return;
        }

        console.log('Solicitando ruta real desde:', origin, 'hasta:', destination);

        requestAnimationFrame(() => {
            try {
                // Limpiar ruta anterior de forma segura
                if (map.getSource('route')) {
                    try {
                        map.removeLayer('route');
                        map.removeSource('route');
                    } catch (e) {
                        console.warn('Error al limpiar ruta anterior:', e);
                    }
                }

                // Construir URL para la API de direcciones de Mapbox
                const originStr = `${origin[0]},${origin[1]}`;
                const destinationStr = `${destination[0]},${destination[1]}`;
                const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originStr};${destinationStr}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

                console.log('Solicitando ruta a Mapbox Directions API...');

                // Hacer la solicitud a la API de direcciones
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.routes && data.routes.length > 0) {
                            const route = data.routes[0];
                            console.log('Ruta obtenida, distancia:', route.distance, 'duración:', route.duration);

                            // Añadir la ruta al mapa
                            map.addSource('route', {
                                'type': 'geojson',
                                'data': {
                                    'type': 'Feature',
                                    'properties': {},
                                    'geometry': route.geometry
                                }
                            });

                            map.addLayer({
                                'id': 'route',
                                'type': 'line',
                                'source': 'route',
                                'layout': {
                                    'line-join': 'round',
                                    'line-cap': 'round'
                                },
                                'paint': {
                                    'line-color': '#4CAF50',
                                    'line-width': 4,
                                    'line-opacity': 0.7
                                }
                            });

                            console.log('Ruta real dibujada exitosamente');
                        } else {
                            console.warn('No se encontró ruta, dibujando línea recta como fallback');
                            drawFallbackRoute(origin, destination);
                        }
                    })
                    .catch(error => {
                        console.error('Error al obtener ruta de Mapbox:', error);
                        console.log('Dibujando ruta de fallback (línea recta)...');
                        drawFallbackRoute(origin, destination);
                    });

            } catch (error) {
                console.error('Error al dibujar ruta:', error);
                drawFallbackRoute(origin, destination);
            }
    });
}
// Función de respaldo para cuando falla la API de direcciones
function drawFallbackRoute(origin, destination) {
    try {
        if (map.getSource('route')) {
            map.removeLayer('route');
            map.removeSource('route');
        }

        map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [origin, destination]
                }
            }
        });

        map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#FF9800',
                'line-width': 3,
                'line-opacity': 0.6,
                'line-dasharray': [2, 2]
            }
        });

        console.log('Ruta de fallback dibujada');
    } catch (error) {
        console.error('Error incluso con ruta de fallback:', error);
    }
}

function calculateEstimatedPrice() {
    if (!currentDestination) return;

    const passengersInput = document.getElementById('passengersCount');
    const estimatedPrice = document.getElementById('estimatedPrice');
    const extraChargeInfo = document.getElementById('extraChargeInfo');

    if (!passengersInput || !estimatedPrice) return;

    const passengers = parseInt(passengersInput.value) || 1;
    let finalPrice = currentDestination.price;

    // Lógica de excedente: $4000 por cada pasajero extra después del 4to
    if (passengers > 4) {
        const extraPassengers = passengers - 4;
        const extraCharge = 4000 * extraPassengers;
        finalPrice += extraCharge;

        if (extraChargeInfo) {
            extraChargeInfo.textContent = `+ $${extraCharge} por ${extraPassengers} pasajero(s) extra`;
            extraChargeInfo.classList.remove('hidden');
        }
    } else {
        if (extraChargeInfo) {
            extraChargeInfo.classList.add('hidden');
        }
    }

    estimatedPrice.textContent = finalPrice.toFixed(0);
}

function clearDestinationSelection() {
    console.log('Limpiando selección de destino');

    // Limpiar marcador de forma segura
    if (destinationMarker) {
        try {
            destinationMarker.remove();
        } catch (e) {
            console.warn('Error al remover marcador:', e);
        }
        destinationMarker = null;
    }

    // Limpiar ruta de forma segura
    if (map && mapInitialized) {
        try {
            if (map.getSource('route')) {
                map.removeLayer('route');
                map.removeSource('route');
            }
        } catch (e) {
            console.warn('Error al limpiar ruta:', e);
        }
    }

    currentDestination = null;

    const locationInfo = document.getElementById('locationInfo');
    if (locationInfo) {
        locationInfo.classList.add('hidden');
    }

    console.log('Limpieza completada');
}

// 4. Funciones para cargar datos
async function loadActiveTravels() {
    try {
        const response = await fetch(`${API_BASE}/travels/active`, {
            credentials: 'include'
        });

        if (response.ok) {
            const travels = await response.json();
            displayActiveTravels(travels);
        } else {
            const container = document.getElementById('activeTravels');
            if (container) {
                container.innerHTML = '<p>Error al cargar viajes activos</p>';
            }
        }
    } catch (error) {
        console.error('Error:', error);
        const container = document.getElementById('activeTravels');
        if (container) {
            container.innerHTML = '<p>Error de conexión</p>';
        }
    }
}

async function loadTravelHistory() {
    try {
        const response = await fetch(`${API_BASE}/travels/history`, {
            credentials: 'include'
        });

        if (response.ok) {
            const history = await response.json();
            displayTravelHistory(history);
        } else {
            const container = document.getElementById('travelHistory');
            if (container) {
                container.innerHTML = '<p>Error al cargar historial</p>';
            }
        }
    } catch (error) {
        console.error('Error:', error);
        const container = document.getElementById('travelHistory');
        if (container) {
            container.innerHTML = '<p>Error de conexión</p>';
        }
    }
}

// 5. Funciones para mostrar datos
function displayActiveTravels(travels) {
    const container = document.getElementById('activeTravels');
    if (!container) {
        console.error('Contenedor de viajes activos no encontrado');
        return;
    }

    if (!travels || travels.length === 0) {
        container.innerHTML = '<p>No tienes viajes activos actualmente.</p>';
        return;
    }

    let html = '';
    travels.forEach(travel => {
        html += `
            <div class="travel-card">
                <h4>Viaje a ${travel.destinoNombre || 'Destino'}</h4>
                <div class="travel-details">
                    <p><strong>Estado:</strong> ${getStatusText(travel.estadoViaje)}</p>
                    <p><strong>Pasajeros:</strong> ${travel.cantidadPasajeros || travel.numberPassengers || 1}</p>
                    <p><strong>Precio:</strong> $${travel.precioFinal?.toFixed(0) || travel.finalPrice?.toFixed(0) || '0'}</p>
                    <p><strong>Solicitado:</strong> ${formatDate(travel.fechaSolicitud)}</p>
                    ${travel.conductor ?
                        `<p><strong>Conductor:</strong> ${travel.conductor.nombreCompleto} - ${travel.conductor.telefono}</p>` :
                        '<p><strong>Conductor:</strong> Pendiente de asignación</p>'
                    }
                </div>
                ${travel.estadoViaje === 'REQUESTED' || travel.estadoViaje === 'ASSIGNED' ?
                    `<button class="btn btn-secondary" onclick="cancelTravel('${travel.id}')">Cancelar Viaje</button>` :
                    ''
                }
            </div>
        `;
    });

    container.innerHTML = html;
}

function displayTravelHistory(history) {
    const container = document.getElementById('travelHistory');
    if (!container) {
        console.error('Contenedor de historial no encontrado');
        return;
    }

    if (!history || history.length === 0) {
        container.innerHTML = '<p>No tienes viajes en tu historial.</p>';
        return;
    }

    let html = '';
    history.forEach(travel => {
        const statusClass = travel.estadoViaje === 'CANCELLED' ? 'cancelled' :
                          travel.estadoViaje === 'FINISHED' ? 'finished' : '';

        html += `
            <div class="travel-card ${statusClass}">
                <h4>Viaje a ${travel.destinoNombre || 'Destino'}</h4>
                <div class="travel-details">
                    <p><strong>Estado:</strong> ${getStatusText(travel.estadoViaje)}</p>
                    <p><strong>Pasajeros:</strong> ${travel.cantidadPasajeros || travel.numberPassengers || 1}</p>
                    <p><strong>Precio:</strong> $${travel.precioFinal?.toFixed(0) || travel.finalPrice?.toFixed(0) || '0'}</p>
                    <p><strong>Solicitado:</strong> ${formatDate(travel.fechaSolicitud)}</p>
                    ${travel.fechaFinalizacion ?
                        `<p><strong>Finalizado:</strong> ${formatDate(travel.fechaFinalizacion)}</p>` : ''}
                    ${travel.conductor ?
                        `<p><strong>Conductor:</strong> ${travel.conductor.nombreCompleto} - ${travel.conductor.telefono}</p>` :
                        ''
                    }
                    ${travel.duracionViaje ? `<p><strong>Duración:</strong> ${travel.duracionViaje}</p>` : ''}
                </div>
                ${createRatingStars(travel)}
            </div>
        `;
    });

    container.innerHTML = html;
    initializeStarRating();
}

// 6. Perfil de usuario
async function loadUserProfile() {
    try {
        const response = await fetch(`${PROFILE_API_BASE}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const profile = await response.json();
            displayUserProfile(profile);
        }
    } catch (error) {
        console.error('Error cargando perfil:', error);
    }
}

function displayUserProfile(profile) {
    const fullname = document.getElementById('fullname');
    const lastname = document.getElementById('lastname');
    const email = document.getElementById('email');
    const number = document.getElementById('number');
    const userName = document.getElementById('userName');

    if (fullname) fullname.value = profile.fullname || profile.name || '';
    if (lastname) lastname.value = profile.lastname || profile.surname || '';
    if (email) email.value = profile.email || '';
    if (number) number.value = profile.number || profile.phone || '';
    if (userName) {
        userName.textContent = `${profile.fullname || profile.name || ''} ${profile.lastname || profile.surname || ''}`.trim() || 'Usuario';
    }
}

// 7. Actualización de perfil
async function updateProfile() {
    const fullnameEl = document.getElementById('fullname');
    const lastnameEl = document.getElementById('lastname');
    const emailEl = document.getElementById('email');
    const numberEl = document.getElementById('number');
    const passwordEl = document.getElementById('password');
    const confirmPasswordEl = document.getElementById('confirmPassword');

    if (!fullnameEl || !lastnameEl || !emailEl || !numberEl) {
        showProfileMessage('Error: No se pudieron cargar los campos del perfil', 'error');
        return;
    }

    const fullname = fullnameEl.value;
    const lastname = lastnameEl.value;
    const email = emailEl.value;
    const number = numberEl.value;
    const password = passwordEl ? passwordEl.value : '';
    const confirmPassword = confirmPasswordEl ? confirmPasswordEl.value : '';

    // Validaciones básicas
    if (!fullname || !lastname || !email) {
        showProfileMessage('Nombre, apellido y email son obligatorios', 'error');
        return;
    }

    if (password && password !== confirmPassword) {
        showProfileMessage('Las contraseñas no coinciden', 'error');
        return;
    }

    const profileData = {
        fullname: fullname,
        lastname: lastname,
        email: email,
        number: number
    };

    // Solo incluir password si se proporciona
    if (password) {
        profileData.password = password;
    }

    try {
        const response = await fetch(`${PROFILE_API_BASE}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(profileData)
        });

        const result = await response.json();

        if (response.ok) {
            showProfileMessage('Perfil actualizado correctamente', 'success');
            if (passwordEl) passwordEl.value = '';
            if (confirmPasswordEl) confirmPasswordEl.value = '';

            const userName = document.getElementById('userName');
            if (userName) {
                userName.textContent = `${fullname} ${lastname}`;
            }
        } else {
            showProfileMessage(result.error || 'Error al actualizar perfil', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showProfileMessage('Error de conexión', 'error');
    }
}

// 8. Sistema de calificación
function createRatingStars(travel) {
    if (travel.estadoViaje !== 'FINISHED') return '';

    if (travel.rating || travel.punctuation) {
        const rating = travel.rating || travel.punctuation;
        return `
            <div class="rating-display">
                <strong>Calificación al conductor:</strong>
                <div class="stars">
                    ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
                </div>
                ${travel.comment ? `<p><strong>Comentario:</strong> ${travel.comment}</p>` : ''}
            </div>
        `;
    } else {
        return `
            <div class="rating-interface">
                <strong>Calificar al conductor:</strong>
                <div class="stars-rating" data-travel-id="${travel.id}">
                    <span class="star" data-rating="1">☆</span>
                    <span class="star" data-rating="2">☆</span>
                    <span class="star" data-rating="3">☆</span>
                    <span class="star" data-rating="4">☆</span>
                    <span class="star" data-rating="5">☆</span>
                </div>
                <textarea class="rating-comment" placeholder="Comentario opcional sobre el conductor" rows="2"></textarea>
                <button class="btn-rating" onclick="submitRating('${travel.id}')">Enviar Calificación</button>
            </div>
        `;
    }
}

function initializeStarRating() {
    document.querySelectorAll('.stars-rating .star').forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            const container = this.parentElement;

            container.querySelectorAll('.star').forEach(s => {
                s.classList.remove('active');
            });

            container.querySelectorAll('.star').forEach(s => {
                if (parseInt(s.getAttribute('data-rating')) <= rating) {
                    s.classList.add('active');
                    s.textContent = '★';
                } else {
                    s.textContent = '☆';
                }
            });
        });
    });
}

// 9. Event Listeners
function setupEventListeners() {
    // Solicitar viaje
    const requestBtn = document.getElementById('requestTravelBtn');
    if (requestBtn) {
        requestBtn.addEventListener('click', requestTravel);
    }

    // Actualizar perfil
    const updateBtn = document.getElementById('updateProfileBtn');
    if (updateBtn) {
        updateBtn.addEventListener('click', updateProfile);
    }

    // Cambio en número de pasajeros
    const passengersInput = document.getElementById('passengersCount');
    if (passengersInput) {
        passengersInput.addEventListener('change', calculateEstimatedPrice);
        passengersInput.addEventListener('input', calculateEstimatedPrice);
    }
}

// 10. Funciones de negocio
async function requestTravel() {
    if (!currentDestination) {
        showMessage('Por favor selecciona un destino', 'error');
        return;
    }

    const passengersCount = parseInt(document.getElementById('passengersCount').value) || 1;

    if (passengersCount < 1) {
        showMessage('El número de pasajeros debe ser al menos 1', 'error');
        return;
    }

    try {
        const requestData = {
            destinationId: currentDestination.id,
            passengersCount: passengersCount
        };

        const response = await fetch(`${API_BASE}/travels/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Viaje solicitado correctamente', 'success');
            clearDestinationSelection();
            document.getElementById('destinationSelect').value = '';
            document.getElementById('passengersCount').value = '1';
            loadActiveTravels();
        } else {
            showMessage(result.error || 'Error al solicitar viaje', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error de conexión', 'error');
    }
}

async function cancelTravel(travelId) {
    if (!confirm('¿Estás seguro de que quieres cancelar este viaje?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/travels/${travelId}/cancel`, {
            method: 'PUT',
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Viaje cancelado correctamente', 'success');
            loadActiveTravels();
        } else {
            showMessage(result.error || 'Error al cancelar viaje', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error de conexión', 'error');
    }
}

async function submitRating(travelId) {
    const ratingContainer = document.querySelector(`.stars-rating[data-travel-id="${travelId}"]`);
    const commentInput = ratingContainer?.parentElement?.querySelector('.rating-comment');

    if (!ratingContainer) return;

    const selectedRating = ratingContainer.querySelector('.star.active')?.getAttribute('data-rating');

    if (!selectedRating) {
        showMessage('Por favor selecciona una calificación', 'error');
        return;
    }

    try {
        const ratingData = {
            travelId: travelId,
            punctuation: parseInt(selectedRating),
            comments: commentInput?.value || ''
        };

        const response = await fetch(`${API_BASE}/travels/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(ratingData)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Conductor calificado correctamente', 'success');
            loadTravelHistory();
        } else {
            showMessage(result.error || 'Error al calificar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error de conexión', 'error');
    }
}

// 11. Utilidades
function showMessage(text, type) {
    const messageDiv = document.getElementById('travelMessage');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');

        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
}

function showProfileMessage(text, type) {
    const messageDiv = document.getElementById('profileMessage');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');

        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
}

function getStatusText(status) {
    const statusMap = {
        'REQUESTED': 'Solicitado',
        'ASSIGNED': 'Asignado',
        'IN_PROGRESS': 'En progreso',
        'FINISHED': 'Finalizado',
        'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('es-CO');
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return dateString;
    }
}

// Funciones globales
window.selectDestinationFromMap = selectDestinationFromMap;
window.loadTravelHistory = loadTravelHistory;
window.cancelTravel = cancelTravel;
window.submitRating = submitRating;
window.updateProfile = updateProfile;

// Exportar para módulos (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeWithPanelManager,
        loadActiveTravels,
        loadTravelHistory,
        loadUserProfile,
        updateProfile
    };
}