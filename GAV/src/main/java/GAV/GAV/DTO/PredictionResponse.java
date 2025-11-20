package GAV.GAV.DTO;

import lombok.Data;

@Data
public class PredictionResponse {

    private String prediccion;
    private double probabilidad;

    public PredictionResponse(String prediccion, double probabilidad){
        this.prediccion = prediccion;
        this.probabilidad = probabilidad;
    }

}
