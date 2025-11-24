package GAV.GAV.Controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DriverViewController {
    @GetMapping("/conductor/inicio")
    public String mostrarInicio(){
        return "conductorInicio";
    }
}