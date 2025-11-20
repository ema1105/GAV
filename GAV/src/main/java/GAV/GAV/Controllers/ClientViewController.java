package GAV.GAV.Controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ClientViewController {

    @GetMapping("/cliente/inicio")
    public String mostrarInicioCliente(){
        return "clienteInicio";
    }

}
