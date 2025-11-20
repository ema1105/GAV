package GAV.GAV.Services;

import GAV.GAV.Collections.Travels;
import GAV.GAV.Collections.Users;
import GAV.GAV.Repositories.TravelsRepository;
import GAV.GAV.Repositories.UsersRepository;
import GAV.GAV.DTO.PredictionResponse;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import weka.classifiers.Classifier;

import java.io.InputStream;
import java.io.ObjectInputStream;
import java.util.ArrayList;
import weka.core.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.*;

@Service
public class PrediccionService {

    @Autowired
    private TravelsRepository travelsRepository;

    @Autowired
    private UsersRepository usersRepository;

    private final AtomicReference<Classifier> modeloRef = new AtomicReference<>();

    @PostConstruct
    public void Init(){
        try(InputStream is = getClass().getResourceAsStream("/modelos/ModeloPredictivo.model");
            ObjectInputStream ois = new ObjectInputStream(is)){
            modeloRef.set((Classifier) ois.readObject());
            System.out.println("Modelo de weka cargado");
        }catch (Exception e){
            throw new RuntimeException("Error al cargar el modelo");
        }
    }
    public PredictionResponse prediccionDesdeBD(String travelId) throws Exception{
        Classifier modelo = modeloRef.get();

        Travels travels = travelsRepository.findById(travelId)
                .orElseThrow(()-> new RuntimeException("Viaje no encontrado"));

        //datos para la prediccion
        Date requestDate = travels.getRequestDate();
        Date initHour = travels.getStartDate();

        //obtenemos el condictor asociado al viaje
        Users driver = usersRepository.findById(travels.getIdDriver())
                .orElseThrow(()-> new RuntimeException("Conductor no encontrado"));

        boolean driverAvailability= driver.getAvailability();

        ArrayList<Attribute> atributos = new ArrayList<>();
        atributos.add(new Attribute("requestdate"));
        atributos.add(new Attribute("inithour"));
        atributos.add(new Attribute("driverAvailability"));


        ArrayList<String> claseVals = new ArrayList<>(List.of("no_puntual", "puntual"));
        Attribute clase = new Attribute("puntual", claseVals);
        atributos.add(clase);

        Instances data = new Instances("PrediccionPuntualidad", atributos, 0);
        data.setClassIndex(data.numAttributes() - 1);

        Calendar calReq = Calendar.getInstance();
        calReq.setTime(requestDate);
        int diaSemana = calReq.get(Calendar.DAY_OF_WEEK);

        Calendar calStart = Calendar.getInstance();
        calStart.setTime(initHour);
        double horaDecimal = calStart.get(Calendar.HOUR_OF_DAY) + calStart.get(Calendar.MINUTE) / 60.0;

        double[] vals = new double[data.numAttributes()];
        vals[0] = diaSemana;
        vals[1] = horaDecimal;
        vals[2] = driverAvailability? 1.0 : 0.0;
        vals[3] = Utils.missingValue();

        data.add(new DenseInstance(1.0, vals));

        double pred = modelo.classifyInstance(data.instance(0));
        double[] dist = modelo.distributionForInstance(data.instance(0));

        String clasePredicha = data.classAttribute().value((int) pred);
        double probabilidad = dist[(int) pred];

        return new PredictionResponse(clasePredicha, probabilidad);
    }
}
