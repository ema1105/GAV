package GAV.GAV.Controllers;

import GAV.GAV.DTO.PredictionResponse;
import GAV.GAV.Services.PrediccionService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/prediction")
public class PrediccionController {

    @Autowired
    private PrediccionService prediccionService;

    @GetMapping("/{travelId}")
    public ResponseEntity<?> predecirPuntualidad(@PathVariable String travelId){
        try{
            PredictionResponse result = prediccionService.prediccionDesdeBD(travelId);
            return ResponseEntity.ok(result);
        }catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error en la prediccion" + e.getMessage());
        }
    }
}
