package GAV.GAV.DTO;
import java.math.BigDecimal;
import java.util.Date;
public class TravelClientResponse {
    private String id;
    private int cantidadPasajeros;
    private String estadoViaje;
    private Date fechaSolicitud;
    private Date fechaInicio;
    private Date fechaFinalizacion;
    private Date fechaCancelacion;
    private String destinoNombre;
    private ConductorInfo conductor;
    private BigDecimal precioFinal;
    private String duracionViaje;

    public TravelClientResponse() {}

    public TravelClientResponse(String id, int cantidadPasajeros, String estadoViaje,
                                Date fechaSolicitud, Date fechaInicio, Date fechaFinalizacion,
                                Date fechaCancelacion, String destinoNombre,
                                ConductorInfo conductor, BigDecimal precioFinal, String duracionViaje) {
        this.id = id;
        this.cantidadPasajeros = cantidadPasajeros;
        this.estadoViaje = estadoViaje;
        this.fechaSolicitud = fechaSolicitud;
        this.fechaInicio = fechaInicio;
        this.fechaFinalizacion = fechaFinalizacion;
        this.fechaCancelacion = fechaCancelacion;
        this.destinoNombre = destinoNombre;
        this.conductor = conductor;
        this.precioFinal = precioFinal;
        this.duracionViaje = duracionViaje;
    }

    public static class ConductorInfo {
        private String nombreCompleto;
        private String telefono;

        public ConductorInfo(String nombreCompleto, String telefono) {
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

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public int getCantidadPasajeros() { return cantidadPasajeros; }
    public void setCantidadPasajeros(int cantidadPasajeros) { this.cantidadPasajeros = cantidadPasajeros; }
    public String getEstadoViaje() { return estadoViaje; }
    public void setEstadoViaje(String estadoViaje) { this.estadoViaje = estadoViaje; }
    public Date getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(Date fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }
    public Date getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(Date fechaInicio) { this.fechaInicio = fechaInicio; }
    public Date getFechaFinalizacion() { return fechaFinalizacion; }
    public void setFechaFinalizacion(Date fechaFinalizacion) { this.fechaFinalizacion = fechaFinalizacion; }
    public Date getFechaCancelacion() { return fechaCancelacion; }
    public void setFechaCancelacion(Date fechaCancelacion) { this.fechaCancelacion = fechaCancelacion; }
    public String getDestinoNombre() { return destinoNombre; }
    public void setDestinoNombre(String destinoNombre) { this.destinoNombre = destinoNombre; }
    public ConductorInfo getConductor() { return conductor; }
    public void setConductor(ConductorInfo conductor) { this.conductor = conductor; }
    public BigDecimal getPrecioFinal() { return precioFinal; }
    public void setPrecioFinal(BigDecimal precioFinal) { this.precioFinal = precioFinal; }
    public String getDuracionViaje() { return duracionViaje; }
    public void setDuracionViaje(String duracionViaje) { this.duracionViaje = duracionViaje; }
}
