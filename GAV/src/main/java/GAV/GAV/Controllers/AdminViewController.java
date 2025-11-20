package GAV.GAV.Controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminViewController {
    @GetMapping("/admin/inicio")
    public String mostrarInicioAdmin(){
        return "adminInicio";
    }
}
