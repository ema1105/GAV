package GAV.GAV.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PredictionResponse {

    @JsonProperty("prediccion")
    private String prediccion;
    
    @JsonProperty("probabilidad")
    private double probabilidad;

    // Constructor sin argumentos requerido por Jackson
    public PredictionResponse() {
    }

    public PredictionResponse(String prediccion, double probabilidad){
        this.prediccion = prediccion;
        this.probabilidad = probabilidad;
    }

    // Getters y setters explícitos para asegurar la serialización
    public String getPrediccion() {
        return prediccion;
    }

    public void setPrediccion(String prediccion) {
        this.prediccion = prediccion;
    }

    public double getProbabilidad() {
        return probabilidad;
    }

    public void setProbabilidad(double probabilidad) {
        this.probabilidad = probabilidad;
    }
}
