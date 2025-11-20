package GAV.GAV.Controllers;

import GAV.GAV.Collections.Users;
import GAV.GAV.Services.ClientServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class LoginController {

     @Autowired
     private ClientServices clientServices;

    @GetMapping("/")
    public String home() {
        return "homepage";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login"; // Carga templates/login.html
    }

    @GetMapping("/register")
    public String registerPage() {
        return "register"; // Carga templates/register.html
    }

    @PostMapping("/register")
    public String registerUser(@ModelAttribute Users client, Model model) {

        // Validación de existencia de nombre de usuario, email y número de documento
        if (clientServices.usernameExists(client.getUsername())) {
            model.addAttribute("error", "Nombre de usuario ya está en uso.");
            return "register";
        }
        if (clientServices.emailExists(client.getEmail())) {
            model.addAttribute("error", "Correo electrónico ya está en uso.");
            return "register";
        }
        if (clientServices.documentExists(client.getDocumentNumber())) {
            model.addAttribute("error", "Número de documento ya está en uso.");
            return "register";
        }
        if (clientServices.phoneExists(client.getNumber())) {
            model.addAttribute("error", "Numero de telefono ya esta en uso");
            return "register";
        }
        // Registrar cliente con todos los datos
        clientServices.registerClient(client);
        return "redirect:/login";
    }
}

