// panelManager.js - Gestión de paneles y navegación
class PanelManager {
    constructor() {
        this.currentPanel = null;
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.setupLogoutHandler();
    }

    initializeEventListeners() {
        // Event listener para el toggle del sidebar
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Cerrar sidebar al hacer clic fuera de él en móviles
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                const menuToggle = document.getElementById('menu-toggle');
                if (sidebar &&
                    !sidebar.contains(e.target) &&
                    !menuToggle.contains(e.target) &&
                    sidebar.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            }
        });
    }

    mostrarPanel(panelId) {
        console.log('Mostrando panel:', panelId);

        // Ocultar todos los paneles
        const panels = document.querySelectorAll('.panel, .section');
        panels.forEach(panel => {
            panel.classList.add('hidden');
            panel.classList.remove('active');
        });

        // Mostrar el panel seleccionado
        const selectedPanel = document.getElementById(panelId);
        if (selectedPanel) {
            selectedPanel.classList.remove('hidden');
            selectedPanel.classList.add('active');
            this.currentPanel = panelId;

            // Disparar evento personalizado para que client.js pueda reaccionar
            this.dispatchPanelChangeEvent(panelId);
        }

        // Cerrar sidebar en móviles
        this.closeMobileMenu();

        return this; // Para encadenamiento
    }

    dispatchPanelChangeEvent(panelId) {
        const event = new CustomEvent('panelChanged', {
            detail: {
                panelId: panelId,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menu-toggle');

        if (sidebar) {
            sidebar.classList.toggle('active');
        }
        if (menuToggle) {
            menuToggle.classList.toggle('active');
        }
    }

    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menu-toggle');

        if (sidebar) {
            sidebar.classList.remove('active');
        }
        if (menuToggle) {
            menuToggle.classList.remove('active');
        }
    }

    setupLogoutHandler() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            // Remover event listeners anteriores para evitar duplicados
            logoutBtn.replaceWith(logoutBtn.cloneNode(true));

            // Agregar nuevo event listener
            document.getElementById('logoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    handleLogout() {
        // Usar SweetAlert2 para confirmación
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                text: '¿Estás seguro que deseas salir?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, cerrar',
                cancelButtonText: 'Cancelar',
                background: '#1a1a1a',
                color: '#fff',
                position: 'center',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: true,
                focusConfirm: true,
                customClass: {
                    container: 'swal2-container-centered',
                    popup: 'swal2-popup-centered'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    this.performLogout();
                }
            });
        } else {
            // Fallback a confirm nativo si SweetAlert2 no está disponible
            if (confirm('¿Estás seguro que deseas salir?')) {
                this.performLogout();
            }
        }
    }

    performLogout() {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/logout';

        // Agregar token CSRF si está disponible
        const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_csrf';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        document.body.appendChild(form);
        form.submit();
    }

    // Métodos auxiliares
    getCurrentPanel() {
        return this.currentPanel;
    }

    showLoading(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.innerHTML = '<div class="loading">Cargando...</div>';
        }
    }

    hideLoading(panelId) {
        const loading = document.querySelector(`#${panelId} .loading`);
        if (loading) {
            loading.remove();
        }
    }
}

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.panelManager = new PanelManager();
    console.log('PanelManager inicializado');
});

// Para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PanelManager;
}