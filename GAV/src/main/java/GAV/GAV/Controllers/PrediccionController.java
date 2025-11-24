package GAV.GAV.Controllers;

import GAV.GAV.DTO.PredictionResponse;
import GAV.GAV.Collections.Travels;
import GAV.GAV.Collections.Users;
import GAV.GAV.Repositories.TravelsRepository;
import GAV.GAV.Repositories.UsersRepository;
import GAV.GAV.Services.PrediccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Calendar;
import java.util.Date;

@RestController
@RequestMapping("/api/prediccion")
public class PrediccionController {

    @Autowired
    private PrediccionService prediccionService;

    @Autowired
    private TravelsRepository travelsRepository;

    @Autowired
    private UsersRepository usersRepository;

    @GetMapping(value = "/{travelId}", produces = "application/json")
    public ResponseEntity<?> predecir(@PathVariable String travelId) {
        try {
            // Buscar viaje
            Travels travel = travelsRepository.findById(travelId)
                    .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

            Date requestDate = travel.getRequestDate();
            Date startDate = travel.getStartDate();

            if (requestDate == null || startDate == null) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("error", "El viaje no tiene fechas suficientes para predecir."));
            }

            // Obtener conductor
            Users driver = usersRepository.findById(travel.getIdDriver())
                    .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));

            int driverAvailability = driver.getAvailability() ? 1 : 0;

            // Convertir horas → decimales
            double requestHour = convertToDecimalHour(requestDate);
            double startHour = convertToDecimalHour(startDate);

            // Obtener día de la semana
            int requestWeekday = getWeekday(requestDate);
            int startWeekday = getWeekday(startDate);

            // Llamar al servicio de predicción
            PredictionResponse respuesta = prediccionService.predecirPuntualidad(
                    requestHour,
                    startHour,
                    driverAvailability,
                    requestWeekday,
                    startWeekday
            );

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(respuesta);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Error en la predicción: " + e.getMessage()));
        }
    }

    // Convierte Date → Hora decimal
    private double convertToDecimalHour(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);

        int hour = cal.get(Calendar.HOUR_OF_DAY);
        int minute = cal.get(Calendar.MINUTE);

        return hour + (minute / 60.0);
    }

    // Retorna día de la semana (1 = domingo, 7 = sábado)
    private int getWeekday(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        return cal.get(Calendar.DAY_OF_WEEK);
    }
}
