import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_input.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDFDFD),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                'assets/images/login_illustration.png',
                height: 180,
              ),
              const SizedBox(height: 30),
              const Text(
                'Iniciar Sesión',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 30),
              const CustomInput(label: 'Correo o usuario'),
              const SizedBox(height: 20),
              const CustomInput(label: 'Contraseña', obscureText: true),
              const SizedBox(height: 30),
              CustomButton(
                text: 'Entrar',
                onPressed: () {},
              ),
              const SizedBox(height: 15),
              TextButton(
                onPressed: () {},
                child: const Text('¿Olvidaste tu contraseña?'),
              ),
              const SizedBox(height: 30),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/register'),
                child: const Text("¿No tienes cuenta? Regístrate"),
              ),
              TextButton(
                onPressed: () {
                 Navigator.pop(context);
                },
                child: const Text(
                   '← Volver al inicio',
                   style: TextStyle(
                   color: Colors.blueAccent,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
             ),
          ),
            ],
          ),
        ),
      ),
    );
  }
}
