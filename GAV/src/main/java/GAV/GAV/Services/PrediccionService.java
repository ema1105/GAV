package GAV.GAV.Services;

import GAV.GAV.DTO.PredictionResponse;
import org.springframework.stereotype.Service;
import weka.classifiers.Classifier;
import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instances;
import weka.core.Utils;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.util.ArrayList;
import java.io.InputStream;

@Service
public class PrediccionService {

    private Classifier modelo;

    @PostConstruct
    public void init() {
        try (InputStream is = getClass().getResourceAsStream("/modelos/modeloWekaPA.model");
             ObjectInputStream ois = new ObjectInputStream(is)) {

            modelo = (Classifier) ois.readObject();
            System.out.println("Modelo cargado correctamente");

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al cargar el modelo");
        }
    }

    public PredictionResponse predecirPuntualidad(double requestHour,
                                                  double startHour,
                                                  int driverAvailability,
                                                  int requestWeekday,
                                                  int startWeekday) {
        try {
            ArrayList<Attribute> atributos = new ArrayList<>();
            atributos.add(new Attribute("requestHour"));
            atributos.add(new Attribute("startHour"));
            atributos.add(new Attribute("driverAvailability"));
            atributos.add(new Attribute("requestWeekday"));
            atributos.add(new Attribute("startWeekday"));

            ArrayList<String> clase = new ArrayList<>();
            clase.add("puntual");
            clase.add("tarde");
            atributos.add(new Attribute("puntual", clase));

            Instances data = new Instances("PredictionData", atributos, 0);
            data.setClassIndex(data.numAttributes() - 1);

            double[] vals = new double[data.numAttributes()];
            vals[0] = requestHour;
            vals[1] = startHour;
            vals[2] = driverAvailability;
            vals[3] = requestWeekday;
            vals[4] = startWeekday;
            vals[5] = Utils.missingValue();  // CORRECTO

            data.add(new DenseInstance(1.0, vals));

            double pred = modelo.classifyInstance(data.instance(0));
            double[] dist = modelo.distributionForInstance(data.instance(0));

            String clasePredicha = data.classAttribute().value((int) pred);
            double prob = dist[(int) pred];

            return new PredictionResponse(clasePredicha, prob);

        } catch (Exception e) {
            e.printStackTrace();
            return new PredictionResponse("error", 0);
        }
    }
}
