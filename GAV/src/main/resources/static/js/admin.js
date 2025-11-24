// --- Variables globales ---
let modalAsignarVehiculo; // Declarar en scope global

// Función para mostrar notificaciones
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-message">${message}</div>
        <button class="notification-close">&times;</button>
    `;

    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 500);
    });

    container.appendChild(notification);

    // Forzar reflow para activar la animación
    void notification.offsetWidth;
    notification.classList.add('show');

    // Eliminar la notificación después de la duración especificada
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 500);
        }, duration);
    }
}

// Función para mostrar modal de asignar vehículo - EN SCOPE GLOBAL
async function mostrarModalAsignarVehiculo(driverId, driverName) {
    try {
        // Cargar vehículos disponibles Y conductores para ver asignaciones
        const [carsResponse, driversResponse] = await Promise.all([
            fetch("/api/admin/cars"),
            fetch("/api/admin/drivers")
        ]);

        if (!carsResponse.ok || !driversResponse.ok) throw new Error("Error al obtener datos");

        const cars = await carsResponse.json();
        const drivers = await driversResponse.json();

        // Obtener IDs de vehículos ya asignados
        const assignedCarIds = drivers
            .filter(driver => driver.idCars && driver.id !== driverId)
            .map(driver => driver.idCars);

        // Filtrar vehículos no asignados (excepto si ya está asignado al conductor actual)
        const availableCars = cars.filter(car =>
            !assignedCarIds.includes(car.id) ||
            drivers.find(d => d.id === driverId && d.idCars === car.id)
        );

        // Actualizar información del conductor
        document.getElementById("modal-driver-name").textContent = driverName;
        document.getElementById("modal-driver-info").textContent = `ID: ${driverId}`;

        // Limpiar selección previa
        document.getElementById("btn-confirmar-asignacion").disabled = true;
        document.getElementById("selected-vehicle").style.display = 'none';
        document.getElementById("vehicles-list").innerHTML = '';

        // Mostrar lista de vehículos disponibles
        if (availableCars.length === 0) {
            document.getElementById("vehicles-list").innerHTML =
                '<div class="empty-state"><p>No hay vehículos disponibles para asignar.</p></div>';
        } else {
            let vehiclesHTML = '';
            availableCars.forEach(car => {
                const isCurrentlyAssigned = drivers.find(d => d.id === driverId && d.idCars === car.id);
                vehiclesHTML += `
                    <div class="vehicle-card" data-id="${car.id}">
                        <div class="vehicle-icon">🚗</div>
                        <div class="vehicle-info">
                            <h4>${car.brand} ${car.model}</h4>
                            <p>Placa: ${car.plate} | Capacidad: ${car.capacity} pasajeros</p>
                            <p class="vehicle-category">Categoría: ${car.category}</p>
                        </div>
                        <div class="vehicle-status ${isCurrentlyAssigned ? 'assigned' : 'available'}">
                            ${isCurrentlyAssigned ? 'Asignado actualmente' : 'Disponible'}
                        </div>
                    </div>
                `;
            });
            document.getElementById("vehicles-list").innerHTML = vehiclesHTML;

            // Asignar eventos a las tarjetas de vehículos
            document.querySelectorAll(".vehicle-card").forEach(card => {
                card.addEventListener("click", () => {
                    // Remover selección previa
                    document.querySelectorAll(".vehicle-card").forEach(c => {
                        c.classList.remove("selected");
                    });

                    // Seleccionar vehículo
                    card.classList.add("selected");

                    // Actualizar información del vehículo seleccionado
                    const vehicleName = card.querySelector("h4").textContent;
                    const vehicleDetails = card.querySelector("p").textContent;

                    document.getElementById("selected-vehicle-name").textContent = vehicleName;
                    document.getElementById("selected-vehicle-details").textContent = vehicleDetails;
                    document.getElementById("selected-vehicle").style.display = 'block';

                    // Habilitar botón de confirmación
                    document.getElementById("btn-confirmar-asignacion").disabled = false;
                    document.getElementById("btn-confirmar-asignacion").setAttribute("data-vehicle-id", card.getAttribute("data-id"));
                });
            });
        }

        // Configurar búsqueda en tiempo real
        const searchInput = document.getElementById("search-vehiculo");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const vehicleCards = document.querySelectorAll(".vehicle-card");

                vehicleCards.forEach(card => {
                    const vehicleText = card.textContent.toLowerCase();
                    if (vehicleText.includes(searchTerm)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }

        // Guardar el ID del conductor en el botón de confirmación
        document.getElementById("btn-confirmar-asignacion").setAttribute("data-driver-id", driverId);

        // CORRECCIÓN: Usar la variable global
        modalAsignarVehiculo.style.display = 'block';

    } catch (error) {
        showNotification("Error al cargar la lista de vehículos", 'error');
    }
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Menú Hamburguesa - Responsive
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');

    // Alternar menú
    if (menuToggle && sidebar && mobileOverlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        });

        // Cerrar menú al hacer clic en el overlay
        mobileOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Cerrar menú al hacer clic en un enlace (en móviles)
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                    mobileOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        // Cerrar menú al redimensionar la ventana si se vuelve a tamaño desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    //---Variables globales
    const content = document.getElementById("main-content");
    const menuItems = document.querySelectorAll('.menu-item');

    // Modales - INICIALIZAR LA VARIABLE GLOBAL
    modalAsignarVehiculo = document.getElementById("modal-asignar-vehiculo");
    const modalAsignar = document.getElementById("modal-asignar");
    const modalEditarRuta = document.getElementById("modal-editar-ruta");
    const modalEditarConductor = document.getElementById("modal-editar-conductor");
    const modalEditarVehiculo = document.getElementById("modal-editar-vehiculo");

    const closeButtons = document.querySelectorAll('.close');

    // Funciones de utilidad
    function setActiveMenuItem(activeItem) {
        menuItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    }

    // Cerrar modales
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modalAsignar.style.display = 'none';
            modalAsignarVehiculo.style.display = 'none';
            modalEditarRuta.style.display = 'none';
            modalEditarConductor.style.display = 'none';
            modalEditarVehiculo.style.display = 'none';
        });
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            modalAsignar.style.display = 'none';
            modalAsignarVehiculo.style.display = 'none';
            modalEditarRuta.style.display = 'none';
            modalEditarConductor.style.display = 'none';
            modalEditarVehiculo.style.display = 'none';
        }
    });

    // Cancelar asignación de vehículo
    document.getElementById("btn-cancelar-asignacion").addEventListener("click", () => {
        modalAsignarVehiculo.style.display = 'none';
    });

    // === BOTONES DE MENÚ ===

    document.getElementById("btn-inicio").addEventListener("click", (e) => {
        setActiveMenuItem(e.currentTarget);
        content.innerHTML = `
            <div class="content-header">
                <h2>Panel de Control</h2>
                <p>Aquí verás estadísticas generales del sistema.</p>
            </div>
        `;
    });

    // === SOLICITUDES PENDIENTES ===
    document.getElementById("btn-pendientes").addEventListener("click", async (e) => {
        setActiveMenuItem(e.currentTarget);
        content.innerHTML = `
            <div class="content-header">
                <h2>Solicitudes Pendientes</h2>
                <p>Gestiona las solicitudes pendientes de aprobación.</p>
            </div>
            <div id="tabla-pendientes" class="table-container"></div>
        `;

        const tabla = document.getElementById("tabla-pendientes");

        async function cargarSolicitudes() {
            try {
                const response = await fetch("/api/admin/travels/pending");
                if (!response.ok) throw new Error("Error al obtener las solicitudes");
                const data = await response.json();

                if (data.length === 0) {
                    tabla.innerHTML = `<div class="empty-state"><p>No hay solicitudes pendientes.</p></div>`;
                    return;
                }

                let tablaHTML = `
                    <div class="card">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Destino</th>
                                    <th>Pasajeros</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                data.forEach(req => {
                    const fecha = new Date(req.fechaSolicitud).toLocaleString('es-CO');
                    tablaHTML += `
                        <tr>
                            <td>${req.id}</td>
                            <td>${req.clienteNombre}</td>
                            <td>${req.destinoNombre}</td>
                            <td>${req.cantidadPasajeros}</td>
                            <td>${fecha}</td>
                            <td>
                                <button class="btn-primary btn-asignar" data-id="${req.id}" data-passengers="${req.cantidadPasajeros}">
                                    <span class="btn-icon">👤</span>
                                    Asignar Conductor
                                </button>
                            </td>
                        </tr>
                    `;
                });

                tablaHTML += `</tbody></table></div>`;
                tabla.innerHTML = tablaHTML;

                // Asignar eventos a los botones de asignar
                document.querySelectorAll(".btn-asignar").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        const travelId = btn.getAttribute("data-id");
                        const passengers = btn.getAttribute("data-passengers");
                        await mostrarConductoresDisponibles(travelId, passengers);
                    });
                });

            } catch (error) {
                showNotification("Error al cargar las solicitudes", 'error');
                tabla.innerHTML = `<div class="error-state"><p>❌ Error al cargar los datos.</p></div>`;
            }
        }

        cargarSolicitudes();
    });

    // Función para mostrar conductores disponibles
    async function mostrarConductoresDisponibles(travelId, passengers) {
        try {
            const response = await fetch(`/api/admin/drivers/available?passengers=${passengers}`);
            if (!response.ok) throw new Error("Error al obtener conductores disponibles");
            const conductores = await response.json();

            document.getElementById("modal-info").innerHTML =
                `Viaje ID: ${travelId} - ${passengers} pasajeros<br>Selecciona un conductor:`;

            let listaHTML = '';
            if (conductores.length === 0) {
                listaHTML = '<p class="empty-state">No hay conductores disponibles para esta cantidad de pasajeros.</p>';
            } else {
                listaHTML = '<div class="drivers-list">';
                conductores.forEach(driver => {
                    listaHTML += `
                        <div class="driver-card">
                            <h4>${driver.nombreCompleto}</h4>
                            <p>📞 ${driver.telefono}</p>
                            <p>🚗 ${driver.car.brand} ${driver.car.model} - ${driver.car.plate}</p>
                            <p>💺 Capacidad: ${driver.car.capacity} pasajeros</p>
                            <button class="btn-primary btn-seleccionar" data-travel="${travelId}" data-driver="${driver.id}">
                                Seleccionar
                            </button>
                        </div>
                    `;
                });
                listaHTML += '</div>';
            }

            document.getElementById("lista-conductores-disponibles").innerHTML = listaHTML;
            modalAsignar.style.display = 'block';

            // Asignar eventos a los botones de selección
            document.querySelectorAll(".btn-seleccionar").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const travelId = btn.getAttribute("data-travel");
                    const driverId = btn.getAttribute("data-driver");
                    await asignarConductor(travelId, driverId);
                });
            });

        } catch (error) {
            showNotification("Error al cargar conductores disponibles", 'error');
        }
    }

    // Función para asignar conductor
    async function asignarConductor(travelId, driverId) {
        try {
        const response = await fetch("/api/admin/travels/assign", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
               
            },
            body: JSON.stringify({ travelId, driverId })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Error al asignar conductor");
        }

        showNotification("Conductor asignado correctamente", 'success');
        modalAsignar.style.display = 'none';
        
    
        document.getElementById("btn-pendientes").click();
        
    } catch (error) {
        console.error("Error al asignar conductor:", error);
        showNotification("Error al asignar conductor: " + error.message, 'error');
    }
}
       

    // === GESTIÓN DE CONDUCTORES ===
    document.getElementById("btn-conductores").addEventListener("click", async (e) => {
        setActiveMenuItem(e.currentTarget);
        content.innerHTML = `
            <div class="content-header">
                <h2>Gestión de Conductores</h2>
                <p>Administra la información de los conductores.</p>
            </div>

            <div class="card">
                <h3>Registrar Nuevo Conductor</h3>
                <form id="form-driver" class="driver-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <div class="input-container">
                                <input type="text" id="fullname" required />
                                <label for="fullname" class="label">
                                    <span class="icon">👤</span>
                                    Nombre completo
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="text" id="lastname" required />
                                <label for="lastname" class="label">
                                    <span class="icon">📝</span>
                                    Apellido
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="text" id="username" required />
                                <label for="username" class="label">
                                    <span class="icon">🔑</span>
                                    Usuario
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="email" id="email" required />
                                <label for="email" class="label">
                                    <span class="icon">📧</span>
                                    Correo electrónico
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="text" id="number" required />
                                <label for="number" class="label">
                                    <span class="icon">📱</span>
                                    Teléfono
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="text" id="documentNumber" required />
                                <label for="documentNumber" class="label">
                                    <span class="icon">🆔</span>
                                    Número de documento
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="password" id="password" required />
                                <label for="password" class="label">
                                    <span class="icon">🔒</span>
                                    Contraseña
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="text" id="license" required />
                                <label for="license" class="label">
                                    <span class="icon">🪪</span>
                                    Número de licencia
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container select-container">
                                <select id="licenseType" name="licenseType" required>
                                    <option value=""></option>
                                    <option value="B1">B1</option>
                                    <option value="B2">B2</option>
                                    <option value="B3">B3</option>
                                    <option value="C1">C1</option>
                                    <option value="C2">C2</option>
                                    <option value="C3">C3</option>
                                </select>
                                <label for="licenseType" class="label">
                                    <span class="icon">🚘/🚍</span>
                                    Tipo de licencia
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="number" id="age" required min="18" />
                                <label for="age" class="label">
                                    <span class="icon">🎂</span>
                                    Edad
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary">
                        <span class="btn-text">Registrar Conductor</span>
                        <span class="btn-icon">→</span>
                    </button>
                </form>
            </div>

            <div id="tabla-conductores" class="table-container"></div>
        `;

        const tabla = document.getElementById("tabla-conductores");
        const form = document.getElementById("form-driver");

        async function cargarConductores() {
            try {
                const response = await fetch("/api/admin/drivers");
                if (!response.ok) throw new Error("Error al obtener los conductores");
                const data = await response.json();

                if (data.length === 0) {
                    tabla.innerHTML = `<div class="empty-state"><p>No hay conductores registrados.</p></div>`;
                    return;
                }

                let tablaHTML = `
                    <div class="card">
                        <h3>Conductores Registrados</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Usuario</th>
                                    <th>Correo</th>
                                    <th>Teléfono</th>
                                    <th>Documento</th>
                                    <th>Licencia</th>
                                    <th>Tipo Licencia</th>
                                    <th>Edad</th>
                                    <th>Vehículo Asignado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                data.forEach(driver => {
                    const vehiculoInfo = driver.idCars ? 'Asignado' : 'Sin asignar';
                    tablaHTML += `
                        <tr>
                            <td>${driver.fullname} ${driver.lastname}</td>
                            <td>${driver.username}</td>
                            <td>${driver.email}</td>
                            <td>${driver.number}</td>
                            <td>${driver.documentNumber}</td>
                            <td>${driver.license}</td>
                            <td>${driver.licenseType}</td>
                            <td>${driver.age}</td>
                            <td>${vehiculoInfo}</td>
                            <td>
                                <button class="btn-asignar-vehiculo" data-id="${driver.id}" data-name="${driver.fullname} ${driver.lastname}">
                                    <span class="btn-icon">🚗</span>
                                    Asignar Vehículo
                                </button>
                                <button class="btn-delete" data-id="${driver.id}">
                                    <span class="btn-icon">🗑️</span>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    `;
                });

                tablaHTML += `</tbody></table></div>`;
                tabla.innerHTML = tablaHTML;

                // Asignar eventos a los botones
                document.querySelectorAll(".btn-delete").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        const id = btn.getAttribute("data-id");
                        if (confirm("¿Seguro que deseas eliminar este conductor?")) {
                            await eliminarConductor(id);
                        }
                    });
                });

                // Asignar eventos a los botones de asignar vehículo
                document.querySelectorAll(".btn-asignar-vehiculo").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        const driverId = btn.getAttribute("data-id");
                        const driverName = btn.getAttribute("data-name");
                        await mostrarModalAsignarVehiculo(driverId, driverName);
                    });
                });

            } catch (error) {
                showNotification("Error al cargar los conductores", 'error');
                tabla.innerHTML = `<div class="error-state"><p>❌ Error al cargar los conductores.</p></div>`;
            }
        }

        async function eliminarConductor(id) {
            try {
                const res = await fetch(`/api/admin/drivers/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("No se pudo eliminar el conductor");
                showNotification("Conductor eliminado correctamente", 'success');
                cargarConductores();
            } catch (err) {
                showNotification("Error al eliminar el conductor", 'error');
            }
        }

        form.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            const nuevoDriver = {
                fullname: document.getElementById("fullname").value,
                lastname: document.getElementById("lastname").value,
                username: document.getElementById("username").value,
                email: document.getElementById("email").value,
                number: document.getElementById("number").value,
                documentNumber: document.getElementById("documentNumber").value,
                password: document.getElementById("password").value,
                license: document.getElementById("license").value,
                licenseType: document.getElementById("licenseType").value,
                age: parseInt(document.getElementById("age").value)
            };

            try {
                const res = await fetch("/api/admin/drivers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(nuevoDriver)
                });

                if (!res.ok) {
                    const err = await res.json();
                    showNotification("Error al registrar conductor: " + (err.error || "No se pudo registrar"), 'error');
                    return;
                }

                showNotification("Conductor registrado correctamente", 'success');
                form.reset();
                cargarConductores();

            } catch (err) {
                showNotification("Error al registrar conductor", 'error');
            }
        });

        cargarConductores();
    });

    // Confirmar asignación de vehículo
    document.getElementById("btn-confirmar-asignacion").addEventListener("click", async () => {
        const driverId = document.getElementById("btn-confirmar-asignacion").getAttribute("data-driver-id");
        const carId = document.getElementById("btn-confirmar-asignacion").getAttribute("data-vehicle-id");

        try {
            // Obtener datos actuales del conductor
            const driverResponse = await fetch(`/api/admin/drivers/${driverId}`);
            if (!driverResponse.ok) throw new Error("Error al obtener datos del conductor");
            const driver = await driverResponse.json();

            // Actualizar el vehículo asignado
            driver.idCars = carId || null;

            const updateResponse = await fetch(`/api/admin/drivers/${driverId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(driver)
            });

            if (!updateResponse.ok) {
                const error = await updateResponse.json();
                throw new Error(error.error || "Error al asignar vehículo");
            }

            showNotification("Vehículo asignado correctamente", 'success');
            modalAsignarVehiculo.style.display = 'none';
            // Recargar la vista actual
            if (document.getElementById("btn-todos-conductores")) {
                document.getElementById("btn-todos-conductores").click();
            } else {
                document.getElementById("btn-conductores").click();
            }

        } catch (error) {
            showNotification("Error al asignar vehículo: " + error.message, 'error');
        }
    });

    // === GESTIÓN DE VEHÍCULOS ===
    document.getElementById("btn-autos").addEventListener("click", async (e) => {
        setActiveMenuItem(e.currentTarget);
        content.innerHTML = `
            <div class="content-header">
                <h2>Gestión de Vehículos</h2>
                <p>Administra la información de los vehículos.</p>
            </div>

            <div class="card">
                <h3>Registrar Nuevo Vehículo</h3>
                <form id="form-car" class="car-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <div class="input-container">
                                <input type="text" id="car-plate" required />
                                <label for="car-plate" class="label">
                                    <span class="icon">🚗</span>
                                    Placa
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="text" id="car-brand" required />
                                <label for="car-brand" class="label">
                                    <span class="icon">🏷️</span>
                                    Marca
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="text" id="car-model" required />
                                <label for="car-model" class="label">
                                    <span class="icon">🚙</span>
                                    Modelo
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="number" id="car-capacity" required min="1" />
                                <label for="car-capacity" class="label">
                                    <span class="icon">💺</span>
                                    Capacidad
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <select id="car-category" required>
                                    <option value="">Seleccione categoría</option>
                                    <option value="SEDAN">Sedán</option>
                                    <option value="SUV">SUV</option>
                                    <option value="MINIVAN">Minivan</option>
                                    <option value="AUTOBUS">Autobús</option>
                                    <option value="BUS">Bus</option>
                                </select>
                                <label for="car-category" class="label">
                                    <span class="icon">📋</span>
                                    Categoría
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary">
                        <span class="btn-text">Registrar Vehículo</span>
                        <span class="btn-icon">→</span>
                    </button>
                </form>
            </div>

            <div id="tabla-vehiculos" class="table-container"></div>
        `;

        const tabla = document.getElementById("tabla-vehiculos");
        const form = document.getElementById("form-car");

        async function cargarVehiculos() {
            try {
                const response = await fetch("/api/admin/cars");
                if (!response.ok) throw new Error("Error al obtener los vehículos");
                const data = await response.json();

                if (data.length === 0) {
                    tabla.innerHTML = `<div class="empty-state"><p>No hay vehículos registrados.</p></div>`;
                    return;
                }

                let tablaHTML = `
                    <div class="card">
                        <h3>Vehículos Registrados</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Placa</th>
                                    <th>Marca</th>
                                    <th>Modelo</th>
                                    <th>Capacidad</th>
                                    <th>Categoría</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                data.forEach(car => {
                    tablaHTML += `
                        <tr>
                            <td>${car.plate}</td>
                            <td>${car.brand}</td>
                            <td>${car.model}</td>
                            <td>${car.capacity}</td>
                            <td>${car.category}</td>
                            <td>
                                <button class="btn-delete" data-id="${car.id}">
                                    <span class="btn-icon">🗑️</span>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    `;
                });

                tablaHTML += `</tbody></table></div>`;
                tabla.innerHTML = tablaHTML;

                // Asignar eventos a los botones eliminar
                document.querySelectorAll(".btn-delete").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        const id = btn.getAttribute("data-id");
                        if (confirm("¿Seguro que deseas eliminar este vehículo?")) {
                            await eliminarVehiculo(id);
                        }
                    });
                });

            } catch (error) {
                showNotification("Error al cargar los vehículos", 'error');
                tabla.innerHTML = `<div class="error-state"><p>❌ Error al cargar los vehículos.</p></div>`;
            }
        }

        async function eliminarVehiculo(id) {
            try {
                const res = await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("No se pudo eliminar el vehículo");
                showNotification("Vehículo eliminado correctamente", 'success');
                cargarVehiculos();
            } catch (err) {
                showNotification("Error al eliminar el vehículo", 'error');
            }
        }

        form.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            const nuevoCar = {
                plate: document.getElementById("car-plate").value,
                brand: document.getElementById("car-brand").value,
                model: document.getElementById("car-model").value,
                capacity: parseInt(document.getElementById("car-capacity").value),
                category: document.getElementById("car-category").value
            };

            try {
                const res = await fetch("/api/admin/cars", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(nuevoCar)
                });

                if (!res.ok) {
                    const err = await res.json();
                    showNotification("Error al registrar vehículo: " + (err.error || "No se pudo registrar"), 'error');
                    return;
                }

                showNotification("Vehículo registrado correctamente", 'success');
                form.reset();
                cargarVehiculos();

            } catch (err) {
                showNotification("Error al registrar vehículo", 'error');
            }
        });

        cargarVehiculos();
    });

    // === GESTIÓN DE RUTAS ===
    document.getElementById("btn-rutas").addEventListener("click", async (e) => {
        setActiveMenuItem(e.currentTarget);
        content.innerHTML = `
            <div class="content-header">
                <h2>Gestión de Rutas</h2>
                <p>Administra las rutas disponibles para los viajes.</p>
            </div>

            <div class="card">
                <h3>Registrar Nueva Ruta</h3>
                <form id="form-location" class="location-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <div class="input-container">
                                <input type="text" id="location-destination" required />
                                <label for="location-destination" class="label">
                                    <span class="icon">📍</span>
                                    Destino
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="text" id="location-description" required />
                                <label for="location-description" class="label">
                                    <span class="icon">📝</span>
                                    Descripción
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="number" id="location-latitude" step="any" required />
                                <label for="location-latitude" class="label">
                                    <span class="icon">🌐</span>
                                    Latitud
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="number" id="location-longitude" step="any" required />
                                <label for="location-longitude" class="label">
                                    <span class="icon">🌐</span>
                                    Longitud
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-container">
                                <input type="number" id="location-price" step="0.01" required />
                                <label for="location-price" class="label">
                                    <span class="icon">💰</span>
                                    Precio
                                </label>
                                <div class="underline"></div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary">
                        <span class="btn-text">Registrar Ruta</span>
                        <span class="btn-icon">→</span>
                    </button>
                </form>
            </div>

            <div id="tabla-rutas" class="table-container"></div>
        `;

        const tabla = document.getElementById("tabla-rutas");
        const form = document.getElementById("form-location");
        const formEditar = document.getElementById("form-editar-location");

        async function cargarRutas() {
            try {
                const response = await fetch("/api/admin/locations");
                if (!response.ok) throw new Error("Error al obtener las rutas");
                const data = await response.json();

                if (data.length === 0) {
                    tabla.innerHTML = `<div class="empty-state"><p>No hay rutas registradas.</p></div>`;
                    return;
                }

                let tablaHTML = `
                    <div class="card">
                        <h3>Rutas Registradas</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Destino</th>
                                    <th>Descripción</th>
                                    <th>Latitud</th>
                                    <th>Longitud</th>
                                    <th>Precio</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                data.forEach(location => {
                    tablaHTML += `
                        <tr>
                            <td>${location.destination}</td>
                            <td>${location.description}</td>
                            <td>${location.latitude}</td>
                            <td>${location.longitude}</td>
                            <td>$${location.price}</td>
                            <td>
                                <button class="btn-editar" data-id="${location.id}"
                                        data-destination="${location.destination}"
                                        data-description="${location.description}"
                                        data-latitude="${location.latitude}"
                                        data-longitude="${location.longitude}"
                                        data-price="${location.price}">
                                    <span class="btn-icon">✏️</span>
                                    Editar
                                </button>
                                <button class="btn-delete" data-id="${location.id}">
                                    <span class="btn-icon">🗑️</span>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    `;
                });

                tablaHTML += `</tbody></table></div>`;
                tabla.innerHTML = tablaHTML;

                // Asignar eventos a los botones eliminar
                document.querySelectorAll(".btn-delete").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        const id = btn.getAttribute("data-id");
                        if (confirm("¿Seguro que deseas eliminar esta ruta?")) {
                            await eliminarRuta(id);
                        }
                    });
                });

                // Asignar eventos a los botones editar
                document.querySelectorAll(".btn-editar").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const id = btn.getAttribute("data-id");
                        const destination = btn.getAttribute("data-destination");
                        const description = btn.getAttribute("data-description");
                        const latitude = btn.getAttribute("data-latitude");
                        const longitude = btn.getAttribute("data-longitude");
                        const price = btn.getAttribute("data-price");

                        // Llenar el formulario de edición
                        document.getElementById("edit-location-id").value = id;
                        document.getElementById("edit-location-destination").value = destination;
                        document.getElementById("edit-location-description").value = description;
                        document.getElementById("edit-location-latitude").value = latitude;
                        document.getElementById("edit-location-longitude").value = longitude;
                        document.getElementById("edit-location-price").value = price;

                        modalEditarRuta.style.display = 'block';
                    });
                });

            } catch (error) {
                showNotification("Error al cargar las rutas", 'error');
                tabla.innerHTML = `<div class="error-state"><p>❌ Error al cargar las rutas.</p></div>`;
            }
        }

        // Manejar envío del formulario de edición
        formEditar.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            const locationId = document.getElementById("edit-location-id").value;
            const updatedLocation = {
                destination: document.getElementById("edit-location-destination").value,
                description: document.getElementById("edit-location-description").value,
                latitude: parseFloat(document.getElementById("edit-location-latitude").value),
                longitude: parseFloat(document.getElementById("edit-location-longitude").value),
                price: parseFloat(document.getElementById("edit-location-price").value)
            };

            try {
                const res = await fetch(`/api/admin/locations/${locationId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedLocation)
                });

                if (!res.ok) {
                    const err = await res.json();
                    showNotification("Error al actualizar ruta: " + (err.error || "No se pudo actualizar"), 'error');
                    return;
                }

                showNotification("Ruta actualizada correctamente", 'success');
                modalEditarRuta.style.display = 'none';
                cargarRutas();

            } catch (err) {
                showNotification("Error al actualizar ruta", 'error');
            }
        });

        async function eliminarRuta(id) {
            try {
                const res = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("No se pudo eliminar la ruta");
                showNotification("Ruta eliminada correctamente", 'success');
                cargarRutas();
            } catch (err) {
                showNotification("Error al eliminar la ruta", 'error');
            }
        }

        form.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            const nuevaLocation = {
                destination: document.getElementById("location-destination").value,
                description: document.getElementById("location-description").value,
                latitude: parseFloat(document.getElementById("location-latitude").value),
                longitude: parseFloat(document.getElementById("location-longitude").value),
                price: parseFloat(document.getElementById("location-price").value)
            };

            try {
                const res = await fetch("/api/admin/locations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(nuevaLocation)
                });

                if (!res.ok) {
                    const err = await res.json();
                    showNotification("Error al registrar ruta: " + (err.error || "No se pudo registrar"), 'error');
                    return;
                }

                showNotification("Ruta registrada correctamente", 'success');
                form.reset();
                cargarRutas();

            } catch (err) {
                showNotification("Error al registrar ruta", 'error');
            }
        });

        cargarRutas();
    });

    // === TODOS LOS CONDUCTORES (NUEVO MÓDULO) ===
    document.getElementById("btn-todos-conductores").addEventListener("click", async (e) => {
        setActiveMenuItem(e.currentTarget);
        content.innerHTML = `
            <div class="content-header">
                <h2>Todos los Conductores</h2>
                <p>Consulta y gestiona todos los conductores registrados en el sistema.</p>
            </div>

            <div class="card">
                <div class="table-controls">
                    <div class="search-container">
                        <input type="text" id="search-conductores" placeholder="Buscar por nombre, usuario, email..." />
                        <button id="btn-buscar-conductores" class="btn-primary">Buscar</button>
                    </div>
                    <div class="table-info" id="info-conductores"></div>
                </div>
            </div>

            <div id="tabla-todos-conductores" class="table-container"></div>
            <div id="pagination-conductores" class="pagination"></div>
        `;

        let currentPage = 1;
        const pageSize = 10;
        let allDrivers = [];
        let filteredDrivers = [];

        const searchInput = document.getElementById("search-conductores");
        const searchBtn = document.getElementById("btn-buscar-conductores");
        const tabla = document.getElementById("tabla-todos-conductores");
        const pagination = document.getElementById("pagination-conductores");
        const infoDiv = document.getElementById("info-conductores");

        async function cargarTodosConductores(page = 1, searchTerm = '') {
            try {
                // Usar el endpoint existente para obtener conductores
                const response = await fetch("/api/admin/drivers");
                if (!response.ok) throw new Error("Error al obtener los conductores");
                const data = await response.json();

                allDrivers = data;

                // Aplicar filtro de búsqueda si existe
                if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    filteredDrivers = allDrivers.filter(driver =>
                        driver.fullname?.toLowerCase().includes(term) ||
                        driver.lastname?.toLowerCase().includes(term) ||
                        driver.username?.toLowerCase().includes(term) ||
                        driver.email?.toLowerCase().includes(term) ||
                        driver.number?.includes(term) ||
                        driver.documentNumber?.includes(term) ||
                        driver.license?.includes(term)
                    );
                } else {
                    filteredDrivers = allDrivers;
                }

                mostrarConductoresPaginados(page);
                mostrarPaginacionConductores(page, filteredDrivers.length);
                actualizarInfoConductores(page, filteredDrivers.length);

            } catch (error) {
                showNotification("Error al cargar los conductores", 'error');
                tabla.innerHTML = `<div class="error-state"><p>❌ Error al cargar los conductores.</p></div>`;
            }
        }

        function mostrarConductoresPaginados(page) {
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const driversPage = filteredDrivers.slice(startIndex, endIndex);

            if (driversPage.length === 0) {
                tabla.innerHTML = `<div class="empty-state"><p>No se encontraron conductores.</p></div>`;
                return;
            }

            let tablaHTML = `
                <div class="card">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Usuario</th>
                                <th>Correo</th>
                                <th>Teléfono</th>
                                <th>Documento</th>
                                <th>Licencia</th>
                                <th>Categoria</th>
                                <th>Edad</th>
                                <th>Vehiculo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            driversPage.forEach(driver => {
                const vehiculoInfo = driver.idCars ? 'Asignado' : 'Sin asignar';
                const estado = 'Activo';

                tablaHTML += `
                    <tr>
                         <td>${driver.fullname} ${driver.lastname}</td>
                         <td>${driver.username}</td>
                         <td>${driver.email}</td>
                         <td>${driver.number}</td>
                         <td>${driver.documentNumber}</td>
                         <td>${driver.license || 'N/A'}</td>
                         <td>${driver.licenseType || 'N/A'}</td>
                         <td>${driver.age || 'N/A'}</td>
                          <td>${vehiculoInfo}</td>
                          <td><span class="status-${estado.toLowerCase()}">${estado}</span></td>
                                    <td>
                                        <button class="btn-editar btn-editar-conductor"
                                                data-id="${driver.id}"
                                                data-fullname="${driver.fullname}"
                                                data-lastname="${driver.lastname}"
                                                data-username="${driver.username}"
                                                data-email="${driver.email}"
                                                data-number="${driver.number}"
                                                data-document="${driver.documentNumber}">
                                            <span class="btn-icon">✏️</span>
                                            Editar
                                        </button>
                                        <button class="btn-asignar-vehiculo" data-id="${driver.id}" data-name="${driver.fullname} ${driver.lastname}">
                                            <span class="btn-icon">🚗</span>
                                            Asignar Vehículo
                                        </button>
                                        <button class="btn-delete" data-id="${driver.id}">
                                            <span class="btn-icon">🗑️</span>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            `;
                        });

            tablaHTML += `</tbody></table></div>`;
            tabla.innerHTML = tablaHTML;

            // Asignar eventos a los botones
            document.querySelectorAll(".btn-editar-conductor").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    const fullname = btn.getAttribute("data-fullname");
                    const lastname = btn.getAttribute("data-lastname");
                    const username = btn.getAttribute("data-username");
                    const email = btn.getAttribute("data-email");
                    const number = btn.getAttribute("data-number");
                    const documentNumber = btn.getAttribute("data-document");

                    // SOLO establecer valores para campos que existen en el modal
                    document.getElementById("edit-driver-id").value = id;
                    document.getElementById("edit-driver-fullname").value = fullname;
                    document.getElementById("edit-driver-lastname").value = lastname;
                    document.getElementById("edit-driver-username").value = username;
                    document.getElementById("edit-driver-email").value = email;
                    document.getElementById("edit-driver-number").value = number;
                    document.getElementById("edit-driver-documentNumber").value = documentNumber;

                    modalEditarConductor.style.display = 'block';
                });
            });

            document.querySelectorAll(".btn-asignar-vehiculo").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const driverId = btn.getAttribute("data-id");
                    const driverName = btn.getAttribute("data-name");
                    await mostrarModalAsignarVehiculo(driverId, driverName);
                });
            });

            document.querySelectorAll(".btn-delete").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.getAttribute("data-id");
                    if (confirm("¿Seguro que deseas eliminar este conductor?")) {
                        await eliminarConductor(id);
                    }
                });
            });
        }

        function mostrarPaginacionConductores(currentPage, totalItems) {
            const totalPages = Math.ceil(totalItems / pageSize);
            pagination.innerHTML = '';

            if (totalPages <= 1) return;

            let paginationHTML = '<div class="pagination-buttons">';

            // Botón anterior
            if (currentPage > 1) {
                paginationHTML += `<button class="page-btn" data-page="${currentPage - 1}">‹ Anterior</button>`;
            }

            // Números de página
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);

            for (let i = startPage; i <= endPage; i++) {
                if (i === currentPage) {
                    paginationHTML += `<button class="page-btn active" data-page="${i}">${i}</button>`;
                } else {
                    paginationHTML += `<button class="page-btn" data-page="${i}">${i}</button>`;
                }
            }

            // Botón siguiente
            if (currentPage < totalPages) {
                paginationHTML += `<button class="page-btn" data-page="${currentPage + 1}">Siguiente ›</button>`;
            }

            paginationHTML += '</div>';
            pagination.innerHTML = paginationHTML;

            // Asignar eventos a los botones de paginación
            document.querySelectorAll(".page-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const page = parseInt(btn.getAttribute("data-page"));
                    currentPage = page;
                    mostrarConductoresPaginados(page);
                    mostrarPaginacionConductores(page, filteredDrivers.length);
                    actualizarInfoConductores(page, filteredDrivers.length);
                });
            });
        }

        function actualizarInfoConductores(currentPage, totalItems) {
            const startItem = (currentPage - 1) * pageSize + 1;
            const endItem = Math.min(currentPage * pageSize, totalItems);

            infoDiv.innerHTML = `
                Mostrando ${startItem}-${endItem} de ${totalItems} conductores
            `;
        }

        // Eventos de búsqueda
        searchBtn.addEventListener("click", () => {
            currentPage = 1;
            cargarTodosConductores(1, searchInput.value);
        });

        searchInput.addEventListener("keypress", (e) => {
            if (e.key === 'Enter') {
                currentPage = 1;
                cargarTodosConductores(1, searchInput.value);
            }
        });

        // Manejar envío del formulario de edición
        document.getElementById("form-editar-conductor").addEventListener("submit", async (ev) => {
            ev.preventDefault(); // CORRECCIÓN: estaba mal escrito
            const driverId = document.getElementById("edit-driver-id").value;
            const updatedDriver = {
                fullname: document.getElementById("edit-driver-fullname").value,
                lastname: document.getElementById("edit-driver-lastname").value,
                username: document.getElementById("edit-driver-username").value,
                email: document.getElementById("edit-driver-email").value,
                number: document.getElementById("edit-driver-number").value,
                documentNumber: document.getElementById("edit-driver-documentNumber").value
            };

            try {
                const res = await fetch(`/api/admin/drivers/${driverId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedDriver)
                });

                if (!res.ok) {
                    const err = await res.json();
                    showNotification("Error al actualizar conductor: " + (err.error || "No se pudo actualizar"), 'error');
                    return;
                }

                showNotification("Conductor actualizado correctamente", 'success');
                modalEditarConductor.style.display = 'none';
                cargarTodosConductores(currentPage, searchInput.value);

            } catch (err) {
                showNotification("Error al actualizar conductor", 'error');
            }
        });

        async function eliminarConductor(id) {
            try {
                const res = await fetch(`/api/admin/drivers/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("No se pudo eliminar el conductor");
                showNotification("Conductor eliminado correctamente", 'success');
                cargarTodosConductores(currentPage, searchInput.value);
            } catch (err) {
                showNotification("Error al eliminar el conductor", 'error');
            }
        }

        cargarTodosConductores(1);
    });

    // === TODOS LOS VEHÍCULOS (NUEVO MÓDULO) ===
    document.getElementById("btn-todos-vehiculos").addEventListener("click", async (e) => {
        setActiveMenuItem(e.currentTarget);
        content.innerHTML = `
            <div class="content-header">
                <h2>Todos los Vehículos</h2>
                <p>Consulta y gestiona todos los vehículos registrados en el sistema.</p>
            </div>

            <div class="card">
                <div class="table-controls">
                    <div class="search-container">
                        <input type="text" id="search-vehiculos" placeholder="Buscar por placa, marca, modelo o conductor..." />
                        <button id="btn-buscar-vehiculos" class="btn-primary">Buscar</button>
                    </div>
                    <div class="table-info" id="info-vehiculos"></div>
                </div>
            </div>

            <div id="tabla-todos-vehiculos" class="table-container"></div>
            <div id="pagination-vehiculos" class="pagination"></div>
        `;

        let currentPage = 1;
        const pageSize = 10;
        let allVehicles = [];
        let filteredVehicles = [];
        let conductorMap = {};

        const searchInput = document.getElementById("search-vehiculos");
        const searchBtn = document.getElementById("btn-buscar-vehiculos");
        const tabla = document.getElementById("tabla-todos-vehiculos");
        const pagination = document.getElementById("pagination-vehiculos");
        const infoDiv = document.getElementById("info-vehiculos");

        async function cargarTodosVehiculos(page = 1, searchTerm = '') {
            try {
                // Obtener vehículos y conductores en paralelo
                const [vehiclesResponse, driversResponse] = await Promise.all([
                    fetch("/api/admin/cars"),
                    fetch("/api/admin/drivers")
                ]);

                if (!vehiclesResponse.ok) throw new Error("Error al obtener los vehículos");
                if (!driversResponse.ok) throw new Error("Error al obtener los conductores");

                const vehicles = await vehiclesResponse.json();
                const drivers = await driversResponse.json();

                allVehicles = vehicles;

                // Crear un mapa de conductores por ID de vehículo asignado
                conductorMap = {};
                drivers.forEach(driver => {
                    if (driver.idCars) {
                        conductorMap[driver.idCars] = {
                            nombre: `${driver.fullname} ${driver.lastname}`,
                            telefono: driver.number,
                            id: driver.id
                        };
                    }
                });

                // Aplicar filtro de búsqueda si existe
                if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    filteredVehicles = allVehicles.filter(vehicle => {
                        const conductorInfo = conductorMap[vehicle.id];
                        const conductorNombre = conductorInfo ? conductorInfo.nombre.toLowerCase() : '';

                        return vehicle.plate?.toLowerCase().includes(term) ||
                               vehicle.brand?.toLowerCase().includes(term) ||
                               vehicle.model?.toLowerCase().includes(term) ||
                               vehicle.category?.toLowerCase().includes(term) ||
                               conductorNombre.includes(term);
                    });
                } else {
                    filteredVehicles = allVehicles;
                }

                mostrarVehiculosPaginados(page);
                mostrarPaginacionVehiculos(page, filteredVehicles.length);
                actualizarInfoVehiculos(page, filteredVehicles.length);

            } catch (error) {
                showNotification("Error al cargar los vehículos", 'error');
                tabla.innerHTML = `<div class="error-state"><p>❌ Error al cargar los vehículos.</p></div>`;
            }
        }

        function mostrarVehiculosPaginados(page) {
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const vehiclesPage = filteredVehicles.slice(startIndex, endIndex);

            if (vehiclesPage.length === 0) {
                tabla.innerHTML = `<div class="empty-state"><p>No se encontraron vehículos.</p></div>`;
                return;
            }

            let tablaHTML = `
                <div class="card">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Placa</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>Capacidad</th>
                                <th>Categoría</th>
                                <th>Conductor Asignado</th>
                                <th>Teléfono Conductor</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            vehiclesPage.forEach(vehicle => {
                const conductorInfo = conductorMap[vehicle.id];
                const conductorNombre = conductorInfo ? conductorInfo.nombre : 'Sin asignar';
                const conductorTelefono = conductorInfo ? conductorInfo.telefono : 'N/A';
                const estado = conductorInfo ? 'Asignado' : 'Disponible';

                tablaHTML += `
                    <tr>
                        <td>${vehicle.plate}</td>
                        <td>${vehicle.brand}</td>
                        <td>${vehicle.model}</td>
                        <td>${vehicle.capacity}</td>
                        <td>${vehicle.category}</td>
                        <td>${conductorNombre}</td>
                        <td>${conductorTelefono}</td>
                        <td><span class="status-${estado.toLowerCase()}">${estado}</span></td>
                        <td>
                            <button class="btn-editar btn-editar-vehiculo"
                                    data-id="${vehicle.id}"
                                    data-plate="${vehicle.plate}"
                                    data-brand="${vehicle.brand}"
                                    data-model="${vehicle.model}"
                                    data-capacity="${vehicle.capacity}"
                                    data-category="${vehicle.category}">
                                <span class="btn-icon">✏️</span>
                                Editar
                            </button>
                            ${conductorInfo ? `
                            <button class="btn-desasignar" data-vehicle-id="${vehicle.id}" data-driver-id="${conductorInfo.id}">
                                <span class="btn-icon">🚫</span>
                                Desasignar
                            </button>
                            ` : ''}
                            <button class="btn-delete" data-id="${vehicle.id}">
                                <span class="btn-icon">🗑️</span>
                                Eliminar
                            </button>
                        </td>
                    </tr>
                `;
            });

            tablaHTML += `</tbody></table></div>`;
            tabla.innerHTML = tablaHTML;

            // Asignar eventos a los botones
            document.querySelectorAll(".btn-editar-vehiculo").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    const plate = btn.getAttribute("data-plate");
                    const brand = btn.getAttribute("data-brand");
                    const model = btn.getAttribute("data-model");
                    const capacity = btn.getAttribute("data-capacity");
                    const category = btn.getAttribute("data-category");

                    // Llenar el formulario de edición
                    document.getElementById("edit-vehicle-id").value = id;
                    document.getElementById("edit-vehicle-plate").value = plate;
                    document.getElementById("edit-vehicle-brand").value = brand;
                    document.getElementById("edit-vehicle-model").value = model;
                    document.getElementById("edit-vehicle-capacity").value = capacity;
                    document.getElementById("edit-vehicle-category").value = category;

                    modalEditarVehiculo.style.display = 'block';
                });
            });

            // Asignar eventos a los botones de desasignar
            document.querySelectorAll(".btn-desasignar").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const vehicleId = btn.getAttribute("data-vehicle-id");
                    const driverId = btn.getAttribute("data-driver-id");

                    if (confirm("¿Estás seguro de que deseas desasignar este vehículo del conductor?")) {
                        await desasignarVehiculo(driverId, vehicleId);
                    }
                });
            });

            // Asignar eventos a los botones eliminar
            document.querySelectorAll(".btn-delete").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.getAttribute("data-id");
                    if (confirm("¿Seguro que deseas eliminar este vehículo?")) {
                        await eliminarVehiculo(id);
                    }
                });
            });
        }

        function mostrarPaginacionVehiculos(currentPage, totalItems) {
            const totalPages = Math.ceil(totalItems / pageSize);
            pagination.innerHTML = '';

            if (totalPages <= 1) return;

            let paginationHTML = '<div class="pagination-buttons">';

            // Botón anterior
            if (currentPage > 1) {
                paginationHTML += `<button class="page-btn" data-page="${currentPage - 1}">‹ Anterior</button>`;
            }

            // Números de página
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);

            for (let i = startPage; i <= endPage; i++) {
                if (i === currentPage) {
                    paginationHTML += `<button class="page-btn active" data-page="${i}">${i}</button>`;
                } else {
                    paginationHTML += `<button class="page-btn" data-page="${i}">${i}</button>`;
                }
            }

            // Botón siguiente
            if (currentPage < totalPages) {
                paginationHTML += `<button class="page-btn" data-page="${currentPage + 1}">Siguiente ›</button>`;
            }

            paginationHTML += '</div>';
            pagination.innerHTML = paginationHTML;

            // Asignar eventos a los botones de paginación
            document.querySelectorAll(".page-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const page = parseInt(btn.getAttribute("data-page"));
                    currentPage = page;
                    cargarTodosVehiculos(page, searchInput.value);
                });
            });
        }

        function actualizarInfoVehiculos(currentPage, totalItems) {
            const startItem = (currentPage - 1) * pageSize + 1;
            const endItem = Math.min(currentPage * pageSize, totalItems);

            infoDiv.innerHTML = `
                Mostrando ${startItem}-${endItem} de ${totalItems} vehículos
            `;
        }

        // Eventos de búsqueda
        searchBtn.addEventListener("click", () => {
            currentPage = 1;
            cargarTodosVehiculos(1, searchInput.value);
        });

        searchInput.addEventListener("keypress", (e) => {
            if (e.key === 'Enter') {
                currentPage = 1;
                cargarTodosVehiculos(1, searchInput.value);
            }
        });

        // Manejar envío del formulario de edición de vehiculos
        document.getElementById("form-editar-vehiculo").addEventListener("submit", async (ev) => {
            ev.preventDefault();
            const vehicleId = document.getElementById("edit-vehicle-id").value;
            const updatedVehicle = {
                plate: document.getElementById("edit-vehicle-plate").value,
                brand: document.getElementById("edit-vehicle-brand").value,
                model: document.getElementById("edit-vehicle-model").value,
                capacity: parseInt(document.getElementById("edit-vehicle-capacity").value),
                category: document.getElementById("edit-vehicle-category").value
            };

            try {
                const res = await fetch(`/api/admin/cars/${vehicleId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedVehicle)
                });

                if (!res.ok) {
                    const err = await res.json();
                    showNotification("Error al actualizar vehículo: " + (err.error || "No se pudo actualizar"), 'error');
                    return;
                }

                showNotification("Vehículo actualizado correctamente", 'success');
                modalEditarVehiculo.style.display = 'none';
                cargarTodosVehiculos(currentPage, searchInput.value);

            } catch (err) {
                showNotification("Error al actualizar vehículo", 'error');
            }
        });

        async function eliminarVehiculo(id) {
            try {
                const res = await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("No se pudo eliminar el vehículo");
                showNotification("Vehículo eliminado correctamente", 'success');
                cargarTodosVehiculos(currentPage, searchInput.value);
            } catch (err) {
                showNotification("Error al eliminar el vehículo", 'error');
            }
        }

        async function desasignarVehiculo(driverId, vehicleId) {
            try {
                // Obtener datos actuales del conductor
                const driverResponse = await fetch(`/api/admin/drivers/${driverId}`);
                if (!driverResponse.ok) throw new Error("Error al obtener datos del conductor");
                const driver = await driverResponse.json();

                // Quitar la asignación del vehículo
                driver.idCars = null;

                const updateResponse = await fetch(`/api/admin/drivers/${driverId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(driver)
                });

                if (!updateResponse.ok) {
                    const error = await updateResponse.json();
                    throw new Error(error.error || "Error al desasignar vehículo");
                }

                showNotification("Vehículo desasignado correctamente", 'success');
                cargarTodosVehiculos(currentPage, searchInput.value);

            } catch (error) {
                showNotification("Error al desasignar el vehículo: " + error.message, 'error');
            }
        }

        cargarTodosVehiculos(1);
    });

    // === TODAS LAS RUTAS (NUEVO MÓDULO) ===
    document.getElementById("btn-todos-rutas").addEventListener("click", async (e) => {
        setActiveMenuItem(e.currentTarget);
        content.innerHTML = `
            <div class="content-header">
                <h2>Todas las Rutas</h2>
                <p>Consulta y gestiona todas las rutas registradas en el sistema.</p>
            </div>

            <div class="card">
                <div class="table-controls">
                    <div class="search-container">
                        <input type="text" id="search-rutas" placeholder="Buscar por destino, descripción..." />
                        <button id="btn-buscar-rutas" class="btn-primary">Buscar</button>
                    </div>
                    <div class="table-info" id="info-rutas"></div>
                </div>
            </div>

            <div id="tabla-todos-rutas" class="table-container"></div>
            <div id="pagination-rutas" class="pagination"></div>
        `;

        let currentPage = 1;
        const pageSize = 10;
        let allRoutes = [];
        let filteredRoutes = [];

        const searchInput = document.getElementById("search-rutas");
        const searchBtn = document.getElementById("btn-buscar-rutas");
        const tabla = document.getElementById("tabla-todos-rutas");
        const pagination = document.getElementById("pagination-rutas");
        const infoDiv = document.getElementById("info-rutas");

        async function cargarTodasRutas(page = 1, searchTerm = '') {
            try {
                // Usar el endpoint existente para obtener rutas
                const response = await fetch("/api/admin/locations");
                if (!response.ok) throw new Error("Error al obtener las rutas");
                const data = await response.json();

                allRoutes = data;

                // Aplicar filtro de búsqueda si existe
                if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    filteredRoutes = allRoutes.filter(route =>
                        route.destination?.toLowerCase().includes(term) ||
                        route.description?.toLowerCase().includes(term)
                    );
                } else {
                    filteredRoutes = allRoutes;
                }

                mostrarRutasPaginadas(page);
                mostrarPaginacionRutas(page, filteredRoutes.length);
                actualizarInfoRutas(page, filteredRoutes.length);

            } catch (error) {
                console.error("Error:", error);
                tabla.innerHTML = `<div class="error-state"><p>❌ Error al cargar las rutas.</p></div>`;
            }
        }

        function mostrarRutasPaginadas(page) {
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const routesPage = filteredRoutes.slice(startIndex, endIndex);

            if (routesPage.length === 0) {
                tabla.innerHTML = `<div class="empty-state"><p>No se encontraron rutas.</p></div>`;
                return;
            }

            let tablaHTML = `
                <div class="card">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Destino</th>
                                <th>Descripción</th>
                                <th>Latitud</th>
                                <th>Longitud</th>
                                <th>Precio</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            routesPage.forEach(route => {
                const estado = 'Activa';

                tablaHTML += `
                    <tr>
                        <td>${route.destination}</td>
                        <td>${route.description}</td>
                        <td>${route.latitude}</td>
                        <td>${route.longitude}</td>
                        <td>$${route.price}</td>
                        <td><span class="status-${estado.toLowerCase()}">${estado}</span></td>
                        <td>
                            <button class="btn-editar btn-editar-ruta"
                                    data-id="${route.id}"
                                    data-destination="${route.destination}"
                                    data-description="${route.description}"
                                    data-latitude="${route.latitude}"
                                    data-longitude="${route.longitude}"
                                    data-price="${route.price}">
                                <span class="btn-icon">✏️</span>
                                Editar
                            </button>
                            <button class="btn-delete" data-id="${route.id}">
                                <span class="btn-icon">🗑️</span>
                                Eliminar
                            </button>
                        </td>
                    </tr>
                `;
            });

            tablaHTML += `</tbody></table></div>`;
            tabla.innerHTML = tablaHTML;

            // Asignar eventos a los botones
            document.querySelectorAll(".btn-editar-ruta").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    const destination = btn.getAttribute("data-destination");
                    const description = btn.getAttribute("data-description");
                    const latitude = btn.getAttribute("data-latitude");
                    const longitude = btn.getAttribute("data-longitude");
                    const price = btn.getAttribute("data-price");

                    // Llenar el formulario de edición
                    document.getElementById("edit-location-id").value = id;
                    document.getElementById("edit-location-destination").value = destination;
                    document.getElementById("edit-location-description").value = description;
                    document.getElementById("edit-location-latitude").value = latitude;
                    document.getElementById("edit-location-longitude").value = longitude;
                    document.getElementById("edit-location-price").value = price;

                    modalEditarRuta.style.display = 'block';
                });
            });

            document.querySelectorAll(".btn-delete").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.getAttribute("data-id");
                    if (confirm("¿Seguro que deseas eliminar esta ruta?")) {
                        await eliminarRuta(id);
                    }
                });
            });
        }

        function mostrarPaginacionRutas(currentPage, totalItems) {
            const totalPages = Math.ceil(totalItems / pageSize);
            pagination.innerHTML = '';

            if (totalPages <= 1) return;

            let paginationHTML = '<div class="pagination-buttons">';

            // Botón anterior
            if (currentPage > 1) {
                paginationHTML += `<button class="page-btn" data-page="${currentPage - 1}">‹ Anterior</button>`;
            }

            // Números de página
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);

            for (let i = startPage; i <= endPage; i++) {
                if (i === currentPage) {
                    paginationHTML += `<button class="page-btn active" data-page="${i}">${i}</button>`;
                } else {
                    paginationHTML += `<button class="page-btn" data-page="${i}">${i}</button>`;
                }
            }

            // Botón siguiente
            if (currentPage < totalPages) {
                paginationHTML += `<button class="page-btn" data-page="${currentPage + 1}">Siguiente ›</button>`;
            }

            paginationHTML += '</div>';
            pagination.innerHTML = paginationHTML;

            // Asignar eventos a los botones de paginación
            document.querySelectorAll(".page-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const page = parseInt(btn.getAttribute("data-page"));
                    currentPage = page;
                    mostrarRutasPaginadas(page);
                    mostrarPaginacionRutas(page, filteredRoutes.length);
                    actualizarInfoRutas(page, filteredRoutes.length);
                });
            });
        }

        function actualizarInfoRutas(currentPage, totalItems) {
            const startItem = (currentPage - 1) * pageSize + 1;
            const endItem = Math.min(currentPage * pageSize, totalItems);

            infoDiv.innerHTML = `
                Mostrando ${startItem}-${endItem} de ${totalItems} rutas
            `;
        }

        // Eventos de búsqueda
        searchBtn.addEventListener("click", () => {
            currentPage = 1;
            cargarTodasRutas(1, searchInput.value);
        });

        searchInput.addEventListener("keypress", (e) => {
            if (e.key === 'Enter') {
                currentPage = 1;
                cargarTodasRutas(1, searchInput.value);
            }
        });

        async function eliminarRuta(id) {
            try {
                const res = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("No se pudo eliminar la ruta");
                alert("Ruta eliminada correctamente");
                cargarTodasRutas(currentPage, searchInput.value);
            } catch (err) {
                console.error(err);
                alert("Error al eliminar la ruta");
            }
        }

        cargarTodasRutas(1);
    });
// === HISTORIAL DE VIAJES ===
 document.getElementById("btn-historial").addEventListener("click", async (e) => {
        setActiveMenuItem(e.currentTarget);
        content.innerHTML = `
            <div class="content-header">
                <h2>Historial de Viajes</h2>
                <p>Consulta el historial completo de viajes.</p>
            </div>

            <div class="card">
                <div class="search-container">
                    <input type="text" id="search-historial" placeholder="Buscar por cliente, conductor o destino..." />
                    <button id="btn-buscar" class="btn-primary">Buscar</button>
                </div>
            </div>

            <div id="tabla-historial" class="table-container"></div>
            <div id="pagination-controls" class="pagination"></div>
        `;

        let currentPage = 1;
        const pageSize = 15;
        let allTravels = [];

        const searchInput = document.getElementById("search-historial");
        const searchBtn = document.getElementById("btn-buscar");

        async function cargarHistorial(page = 1, searchTerm = '') {
            try {
                const response = await fetch("/api/admin/travels/history");
                if (!response.ok) throw new Error("Error al obtener el historial");
                let data = await response.json();

                // CORRECCIÓN: Validar propiedades antes de usar toLowerCase
                if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    data = data.filter(travel => {
                        const cliente = travel.clienteNombre || '';
                        const conductor = travel.conductorInfo?.nombreCompleto || '';
                        const destino = travel.destinoNombre || '';
                        const id = travel.id || '';

                        return cliente.toLowerCase().includes(term) ||
                               conductor.toLowerCase().includes(term) ||
                               destino.toLowerCase().includes(term) ||
                               id.toString().toLowerCase().includes(term);
                    });
                }

                allTravels = data;
                mostrarHistorialPaginado(page);
                mostrarPaginacion(page, data.length);

            } catch (error) {
                console.error("Error:", error);
                document.getElementById("tabla-historial").innerHTML =
                    `<div class="error-state"><p>❌ Error al cargar el historial.</p></div>`;
            }
        }

        function mostrarHistorialPaginado(page) {
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const travelsPage = allTravels.slice(startIndex, endIndex);

            const tabla = document.getElementById("tabla-historial");

            if (travelsPage.length === 0) {
                tabla.innerHTML = `<div class="empty-state"><p>No hay viajes en el historial.</p></div>`;
                return;
            }

            let tablaHTML = `
                <div class="card">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Conductor</th>
                                <th>Destino</th>
                                <th>Pasajeros</th>
                                <th>Estado</th>
                                <th>Fecha Solicitud</th>
                                <th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            //cambio aqui
            travelsPage.forEach(travel => {

                const fechaSolicitud = travel.requestDate ? new Date(travel.requestDate).toLocaleString('es-CO')
                 : 'N/A';
                const conductorNombre = travel.conductor?.nombreCompleto|| 'No asignado';
                const clienteNombre = travel.clienteNombre || 'N/A';
                const destinoNombre = travel.destinoNombre || 'N/A';
                const numeroPasajeros = travel.cantidadPasajeros|| '0';
                const estado = travel.estadoViaje || 'Desconocido';
                const precioFinal = travel.precioFinal || '0';

                // CORRECCIÓN: Usar toLowerCase() correctamente
                const estadoClase = estado ? estado.toLowerCase() : 'desconocido';

                tablaHTML += `
                    <tr>
                        <td>${travel.id || 'N/A'}</td>
                        <td>${clienteNombre}</td>
                        <td>${conductorNombre}</td>
                        <td>${destinoNombre}</td>
                        <td>${numeroPasajeros}</td>
                        <td><span class="status-${estadoClase}">${estado}</span></td>
                        <td>${fechaSolicitud}</td>
                        <td>$${precioFinal}</td>
                    </tr>
                `;
            });

            tablaHTML += `</tbody></table></div>`;
            tabla.innerHTML = tablaHTML;
        }

        function mostrarPaginacion(currentPage, totalItems) {
            const totalPages = Math.ceil(totalItems / pageSize);
            const pagination = document.getElementById("pagination-controls");

            if (totalPages <= 1) {
                pagination.innerHTML = '';
                return;
            }

            let paginationHTML = '<div class="pagination-buttons">';

            // Botón anterior
            if (currentPage > 1) {
                paginationHTML += `<button class="page-btn" data-page="${currentPage - 1}">‹ Anterior</button>`;
            }

            // Números de página
            for (let i = 1; i <= totalPages; i++) {
                if (i === currentPage) {
                    paginationHTML += `<button class="page-btn active" data-page="${i}">${i}</button>`;
                } else {
                    paginationHTML += `<button class="page-btn" data-page="${i}">${i}</button>`;
                }
            }

            // Botón siguiente
            if (currentPage < totalPages) {
                paginationHTML += `<button class="page-btn" data-page="${currentPage + 1}">Siguiente ›</button>`;
            }

            paginationHTML += '</div>';
            pagination.innerHTML = paginationHTML;

            // Asignar eventos a los botones de paginación
            document.querySelectorAll(".page-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const page = parseInt(btn.getAttribute("data-page"));
                    currentPage = page;
                    mostrarHistorialPaginado(page);
                    mostrarPaginacion(page, allTravels.length);
                });
            });
        }

        // Eventos de búsqueda
        searchBtn.addEventListener("click", () => {
            currentPage = 1;
            cargarHistorial(1, searchInput.value);
        });

        searchInput.addEventListener("keypress", (e) => {
            if (e.key === 'Enter') {
                currentPage = 1;
                cargarHistorial(1, searchInput.value);
            }
        });

        cargarHistorial(1);
    });

    // === MODULO PREDICTIVO ===
      document.getElementById("btn-perfil").addEventListener("click", (e) => {
          setActiveMenuItem(e.currentTarget);
          content.innerHTML = `
              <div class="content-header">
                  <h2>🔮 Modelo Predictivo de Puntualidad</h2>
                  <p>Consulta la puntualidad estimada de los conductores usando inteligencia artificial.</p>
              </div>

              <div class="card">
                  <div class="prediction-info">
                      <h3>⚠️ Información Importante</h3>
                      <p>Para que la predicción funcione correctamente, los viajes deben tener:</p>
                      <ul>
                          <li>✅ <strong>Fecha de solicitud</strong> (RequestDate)</li>
                          <li>✅ <strong>Fecha de inicio del viaje</strong> (StartDate)</li>
                          <li>✅ <strong>Conductor asignado</strong></li>
                      </ul>
                      <p class="warning-text">Actualmente muchos viajes no tienen fecha de inicio, lo que impide realizar predicciones.</p>
                  </div>
              </div>

              <div class="card">
                  <h3>Realizar Predicción</h3>
                  <form id="form-predict" class="predict-form">
                      <div class="form-group">
                          <div class="input-container">
                              <input type="text" id="travelId" required placeholder=" " />
                              <label for="travelId" class="label">
                                  <span class="icon">📋</span>
                                  ID del Viaje
                              </label>
                              <div class="underline"></div>
                          </div>
                          <small class="input-help">Ingresa el ID de un viaje que tenga conductor asignado y fecha de inicio</small>
                      </div>

                      <button type="submit" class="btn-primary btn-predict">
                          <span class="btn-text">🔮 Predecir Puntualidad</span>
                          <span class="btn-icon">→</span>
                      </button>
                  </form>
              </div>

              <div id="resultado-prediccion" class="result-container"></div>

              <div class="card">
                  <h3>📈 Viajes Disponibles para Predicción</h3>
                  <div class="filter-info">
                      <p>Mostrando solo viajes que pueden ser procesados por el modelo predictivo</p>
                  </div>
                  <div id="lista-viajes-predictivos" class="table-container">
                      <p>Cargando viajes disponibles...</p>
                  </div>
              </div>
          `;

          const form = document.getElementById("form-predict");
          const resultadoDiv = document.getElementById("resultado-prediccion");

          // Cargar viajes que cumplan con los requisitos para predicción
          cargarViajesParaPrediccion();

          form.addEventListener("submit", async (ev) => {
              ev.preventDefault();
              const travelId = document.getElementById("travelId").value.trim();

              if (!travelId) {
                  mostrarError("Por favor ingresa un ID de viaje válido.");
                  return;
              }

              await realizarPrediccion(travelId);
          });

          async function cargarViajesParaPrediccion() {
              try {
                  // Obtener todos los viajes para filtrar los que sirven para predicción
                  const response = await fetch("/api/admin/travels/history");
                  const listaDiv = document.getElementById("lista-viajes-predictivos");

                  if (!response.ok) {
                      listaDiv.innerHTML = '<p class="empty-state">No se pudieron cargar los viajes.</p>';
                      return;
                  }

                  const travels = await response.json();

                  // Filtrar viajes que tengan conductor asignado (para poder hacer predicción)
                  const travelsConConductor = travels.filter(travel =>
                      travel.idDriver && travel.idDriver !== '' && travel.idDriver !== null
                  );

                  if (travelsConConductor.length === 0) {
                      listaDiv.innerHTML = `
                          <div class="empty-state">
                              <p>No hay viajes con conductor asignado para predecir.</p>
                              <p class="small-text">Los viajes necesitan tener conductor asignado para poder realizar predicciones.</p>
                          </div>
                      `;
                      return;
                  }

                  let tablaHTML = `
                      <table class="data-table">
                          <thead>
                              <tr>
                                  <th>ID Viaje</th>
                                  <th>Cliente</th>
                                  <th>Conductor</th>
                                  <th>Destino</th>
                                  <th>Estado</th>
                                  <th>Fecha Solicitud</th>
                                  <th>¿Puede Predecir?</th>
                                  <th>Acción</th>
                              </tr>
                          </thead>
                          <tbody>
                  `;

                  travelsConConductor.forEach(travel => {
                      const fechaSolicitud = travel.requestDate ?
                          new Date(travel.requestDate).toLocaleString('es-CO') : 'N/A';

                      // Verificar si tiene startDate (requerido para predicción)
                      const tieneStartDate = travel.startDate != null;
                      const puedePredecir = tieneStartDate ? '✅ Sí' : '❌ No (falta StartDate)';
                      const estado = travel.travelStatus || 'N/A';
                      const conductorNombre = travel.driverInfo?.fullname || 'Conductor asignado';

                      tablaHTML += `
                          <tr>
                              <td><code class="travel-id">${travel.id || 'N/A'}</code></td>
                              <td>${travel.clienteNombre || travel.clientName || 'N/A'}</td>
                              <td>${conductorNombre}</td>
                              <td>${travel.destinoNombre || travel.destinationName || 'N/A'}</td>
                              <td><span class="status-${estado.toLowerCase()}">${estado}</span></td>
                              <td>${fechaSolicitud}</td>
                              <td>${puedePredecir}</td>
                              <td>
                                  <button class="btn-primary btn-sm usar-viaje ${!tieneStartDate ? 'disabled' : ''}"
                                          data-id="${travel.id}"
                                          ${!tieneStartDate ? 'disabled title="Este viaje no tiene fecha de inicio (StartDate)"' : ''}>
                                      🔮 Predecir
                                  </button>
                              </td>
                          </tr>
                      `;
                  });

                  tablaHTML += `</tbody></table>`;
                  listaDiv.innerHTML = tablaHTML;

                  // Asignar eventos a los botones "Predecir" (solo los habilitados)
                  document.querySelectorAll(".usar-viaje:not(.disabled)").forEach(btn => {
                      btn.addEventListener("click", () => {
                          const travelId = btn.getAttribute("data-id");
                          document.getElementById("travelId").value = travelId;
                          realizarPrediccion(travelId);
                      });
                  });

              } catch (error) {
                  console.error("Error al cargar viajes:", error);
                  const listaDiv = document.getElementById("lista-viajes-predictivos");
                  if (listaDiv) {
                      listaDiv.innerHTML = '<p class="error-state">Error al cargar viajes disponibles.</p>';
                  }
              }
          }

          async function realizarPrediccion(travelId) {
              const resultadoDiv = document.getElementById("resultado-prediccion");
              if (!resultadoDiv) {
                  console.error("Elemento resultado-prediccion no encontrado");
                  return;
              }

              // Mostrar estado de carga
              resultadoDiv.innerHTML = `
                  <div class="prediction-loading">
                      <div class="loading-spinner"></div>
                      <h4>Analizando datos del viaje...</h4>
                      <p>El modelo de IA está procesando la información para generar la predicción.</p>
                      <div class="loading-details">
                          <div class="loading-step">✓ Obteniendo datos del viaje</div>
                          <div class="loading-step">🔄 Analizando patrones temporales</div>
                          <div class="loading-step">⏳ Evaluando historial del conductor</div>
                          <div class="loading-step">📊 Calculando probabilidades</div>
                      </div>
                  </div>
              `;

              try {
                  const response = await fetch(`/api/prediccion/${travelId}`, {
                      headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      }
                  });

                  if (!response.ok) {
                      let errorMessage = "Error al obtener la predicción";

                      // Intentar obtener mensaje de error del servidor en formato JSON
                      try {
                          const errorData = await response.json();
                          if (errorData && errorData.error) {
                              const errorText = errorData.error;
                              // Si el error contiene el mensaje específico sobre fechas
                              if (errorText.includes("fechas suficientes") || errorText.includes("StartDate")) {
                                  errorMessage = "❌ No se puede predecir: El viaje no tiene fecha de inicio (StartDate) registrada en la base de datos.";
                              } else if (errorText.includes("Conductor no encontrado")) {
                                  errorMessage = "❌ No se puede predecir: El conductor asignado al viaje no existe o fue eliminado.";
                              } else {
                                  errorMessage = `❌ ${errorText}`;
                              }
                          } else {
                              errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
                          }
                      } catch (e) {
                          // Si no se puede parsear como JSON, intentar como texto
                          try {
                              const errorText = await response.text();
                              if (errorText) {
                                  errorMessage = `Error del servidor: ${errorText}`;
                              } else {
                                  errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
                              }
                          } catch (e2) {
                              errorMessage = `Error ${response.status}: ${response.statusText}`;
                          }
                      }
                      throw new Error(errorMessage);
                  }

                  const data = await response.json();
                  mostrarResultadoPrediccion(data, travelId);

              } catch (error) {
                  console.error("Error en la predicción:", error);
                  mostrarError(error.message);
              }
          }

          function mostrarResultadoPrediccion(data, travelId) {
              const resultadoDiv = document.getElementById("resultado-prediccion");
              if (!resultadoDiv) return;

              const prediccion = data.clasePredicha || data.prediccion;
              const probabilidad = data.probabilidad || 0;

              // Determinar el tipo de resultado y estilos
              let icono, titulo, claseCSS, descripcion, recomendacion;

              if (prediccion === 'puntual') {
                  icono = '✅';
                  titulo = 'CONDUCTOR PUNTUAL';
                  claseCSS = 'prediction-success';
                  descripcion = 'El modelo predice que el conductor llegará a tiempo.';
                  //recomendacion = 'Puedes proceder con la asignación con confianza.';
              } else if (prediccion === 'tarde') {
                  icono = '⚠️';
                  titulo = 'POSIBLE RETRASO';
                  claseCSS = 'prediction-warning';
                  descripcion = 'El modelo detecta un alto riesgo de retraso.';
                  //recomendacion = 'Considera asignar un conductor alternativo o notificar al cliente.';
              } else {
                  icono = '❌';
                  titulo = 'ERROR EN PREDICCIÓN';
                  claseCSS = 'prediction-error';
                  descripcion = 'No se pudo determinar la puntualidad.';
                  recomendacion = 'Verifica los datos del viaje e intenta nuevamente.';
              }

              resultadoDiv.innerHTML = `
                  <div class="prediction-result ${claseCSS}">
                      <div class="prediction-header">
                          <div class="prediction-icon">${icono}</div>
                          <div class="prediction-title">
                              <h3>${titulo}</h3>
                              <p>Viaje ID: <code>${travelId}</code></p>
                          </div>
                      </div>

                      <div class="prediction-body">
                          <div class="probability-meter">
                              <div class="probability-label">
                                  <span>Probabilidad de acierto:</span>
                                  <strong>${(probabilidad * 100).toFixed(1)}%</strong>
                              </div>
                              <div class="probability-bar">
                                  <div class="probability-fill" style="width: ${probabilidad * 100}%"></div>
                              </div>
                          </div>

                          <div class="prediction-details">
                              <div class="detail-item">
                                  <span class="detail-label">Resultado:</span>
                                  <span class="detail-value ${prediccion}">${prediccion?.toUpperCase() || 'DESCONOCIDO'}</span>
                              </div>
                              <div class="detail-item">
                                  <span class="detail-label">Confianza:</span>
                                  <span class="detail-value">${(probabilidad * 100).toFixed(1)}%</span>
                              </div>
                          </div>

                          <div class="prediction-message">
                              <p><strong>Análisis:</strong> ${descripcion}</p>
                              <p><strong>Recomendación:</strong> ${recomendacion}</p>
                          </div>

                          <div class="prediction-actions">
                              <button class="btn-primary recalcular-prediccion" data-travelid="${travelId}">
                                  🔄 Recalcular
                              </button>
                              <button class="btn-secondary usar-para-nuevo" data-travelid="${travelId}">
                                  📝 Usar en Nuevo Análisis
                              </button>
                          </div>
                      </div>
                  </div>
              `;

              // Asignar eventos a los botones
              document.querySelectorAll(".recalcular-prediccion").forEach(btn => {
                  btn.addEventListener("click", () => {
                      const travelId = btn.getAttribute("data-travelid");
                      realizarPrediccion(travelId);
                  });
              });

              document.querySelectorAll(".usar-para-nuevo").forEach(btn => {
                  btn.addEventListener("click", () => {
                      const travelId = btn.getAttribute("data-travelid");
                      document.getElementById("travelId").value = travelId;
                      document.getElementById("travelId").focus();
                  });
              });
          }

          function mostrarError(mensaje) {
              const resultadoDiv = document.getElementById("resultado-prediccion");
              if (!resultadoDiv) return;

              resultadoDiv.innerHTML = `
                  <div class="prediction-result prediction-error">
                      <div class="prediction-header">
                          <div class="prediction-icon">❌</div>
                          <div class="prediction-title">
                              <h3>ERROR EN PREDICCIÓN</h3>
                              <p>No se pudo completar el análisis</p>
                          </div>
                      </div>
                      <div class="prediction-body">
                          <div class="error-message">
                              <p>${mensaje}</p>
                          </div>
                          <div class="suggestions">
                              <h4>Posibles soluciones:</h4>
                              <ul>
                                  <li>Verifica que el viaje tenga conductor asignado</li>
                                  <li>Asegúrate de que el viaje tenga fecha de inicio (StartDate)</li>
                                  <li>Confirma que el ID del viaje sea correcto</li>
                                  <li>Intenta con un viaje diferente</li>
                              </ul>
                          </div>
                          <div class="prediction-actions">
                              <button class="btn-primary" onclick="document.getElementById('form-predict').dispatchEvent(new Event('submit'))">
                                  🔄 Intentar Nuevamente
                              </button>
                              <button class="btn-secondary" onclick="cargarViajesParaPrediccion()">
                                  📋 Ver Viajes Disponibles
                              </button>
                          </div>
                      </div>
                  </div>
              `;
          }
      });


    // === CERRAR SESIÓN ===
    document.getElementById("logoutBtn").addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/logout", { method: "POST" });
            if (res.ok) window.location.href = "/homepage";
            else console.error("Error al cerrar sesión");
        } catch (err) {
            console.error("Error al intentar cerrar sesión:", err);
        }
    });
});