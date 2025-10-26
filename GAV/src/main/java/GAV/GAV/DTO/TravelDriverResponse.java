package GAV.GAV.DTO;

import java.math.BigDecimal;
import java.util.Date;
public class TravelDriverResponse {
    private String id;
    private int cantidadPasajeros;
    private String estadoViaje;
    private Date fechaSolicitud;
    private Date fechaInicio;
    private Date fechaFinalizacion;
    private Date fechaCancelacion;
    private String destinoNombre;
    private ClientInfo cliente;
    private BigDecimal precioFinal;
    private String duracionViaje;

    public TravelDriverResponse() {}

    public TravelDriverResponse(String id, int cantidadPasajeros, String estadoViaje,
                                Date fechaSolicitud, Date fechaInicio, Date fechaFinalizacion,
                                Date fechaCancelacion, String destinoNombre,
                                ClientInfo cliente, BigDecimal precioFinal, String duracionViaje) {
        this.id = id;
        this.cantidadPasajeros = cantidadPasajeros;
        this.estadoViaje = estadoViaje;
        this.fechaSolicitud = fechaSolicitud;
        this.fechaInicio = fechaInicio;
        this.fechaFinalizacion = fechaFinalizacion;
        this.fechaCancelacion = fechaCancelacion;
        this.destinoNombre = destinoNombre;
        this.cliente = cliente;
        this.precioFinal = precioFinal;
        this.duracionViaje = duracionViaje;
    }

    public static class ClientInfo {
        private String nombreCompleto;
        private String telefono;

        public ClientInfo(String nombreCompleto, String telefono) {
            this.nombreCompleto = nombreCompleto;
            this.telefono = telefono;
        }

        public String getNombreCompleto() {
            return nombreCompleto;
        }

        public String getTelefono() {
            return telefono;
        }
    }

    // Getters
    public String getId() { return id; }
    public int getCantidadPasajeros() { return cantidadPasajeros; }
    public String getEstadoViaje() { return estadoViaje; }
    public Date getFechaSolicitud() { return fechaSolicitud; }
    public Date getFechaInicio() { return fechaInicio; }
    public Date getFechaFinalizacion() { return fechaFinalizacion; }
    public Date getFechaCancelacion() { return fechaCancelacion; }
    public String getDestinoNombre() { return destinoNombre; }
    public ClientInfo getCliente() { return cliente; }
    public BigDecimal getPrecioFinal() { return precioFinal; }
    public String getDuracionViaje() { return duracionViaje; }
}
