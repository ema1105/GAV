import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _usuarioController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _mostrarPassword = false;
  bool _isLoading = false;

  void _iniciarSesion() async {
    if (_usuarioController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚠️ Ingresa tu usuario y contraseña.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 2));

    setState(() => _isLoading = false);

    // TODO: Conectar al backend real aquí

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✅ Sesión iniciada correctamente'),
        backgroundColor: Colors.green,
      ),
    );

    // Ir al HomePage
    Future.delayed(const Duration(milliseconds: 1500), () {
      Navigator.pushReplacementNamed(context, '/home_page');
    });
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 700;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFF8F4E3), Colors.white],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // 🖼️ Ilustración o logo
                  Image.asset(
                    'assets/images/login_illustration.png',
                    height: 180,
                  ),
                  const SizedBox(height: 30),

                  // 🧭 Título
                  Text(
                    'Iniciar Sesión',
                    style: GoogleFonts.poppins(
                      fontSize: isMobile ? 26 : 30,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Bienvenido de nuevo 👋',
                    style: GoogleFonts.poppins(
                      fontSize: 15,
                      color: Colors.black54,
                    ),
                  ),
                  const SizedBox(height: 30),

                  // 🔹 Campos de texto
                  _campoTexto('Correo o usuario', _usuarioController,
                      icon: Icons.person_outline),
                  _campoPassword('Contraseña', _passwordController),

                  const SizedBox(height: 25),

                  // 🔘 Botón de iniciar sesión
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _iniciarSesion,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black87,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: AnimatedSwitcher(
                        duration: const Duration(milliseconds: 300),
                        child: _isLoading
                            ? const CircularProgressIndicator(
                                color: Colors.white,
                              )
                            : Text(
                                'Entrar',
                                key: const ValueKey('text'),
                                style: GoogleFonts.poppins(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 16,
                                ),
                              ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 15),

                  // 🔹 Olvidó contraseña
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      '¿Olvidaste tu contraseña?',
                      style: GoogleFonts.poppins(
                        color: Colors.blueAccent,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // 🔹 Registro
                 // 🔹 Ir a registro
TextButton(
  onPressed: () =>
      Navigator.pushReplacementNamed(context, '/register_page'),
  child: Text(
    '¿No tienes cuenta? Regístrate',
    style: GoogleFonts.poppins(
      color: Colors.blueAccent,
      fontWeight: FontWeight.w600,
    ),
  ),
),

// 🔹 Volver al inicio
TextButton(
  onPressed: () =>
      Navigator.pushNamedAndRemoveUntil(context, '/home_page', (route) => false),
  child: Text(
    '← Volver al inicio',
    style: GoogleFonts.poppins(
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
        ),
      ),
    );
  }

  // 🧱 Campos reutilizables
  Widget _campoTexto(String label, TextEditingController controller,
      {TextInputType tipo = TextInputType.text, IconData? icon}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        controller: controller,
        keyboardType: tipo,
        decoration: InputDecoration(
          prefixIcon:
              icon != null ? Icon(icon, color: Colors.black54) : null,
          labelText: label,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  Widget _campoPassword(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        controller: controller,
        obscureText: !_mostrarPassword,
        decoration: InputDecoration(
          prefixIcon: const Icon(Icons.lock_outline, color: Colors.black54),
          suffixIcon: IconButton(
            icon: Icon(
              _mostrarPassword ? Icons.visibility_off : Icons.visibility,
              color: Colors.black54,
            ),
            onPressed: () {
              setState(() => _mostrarPassword = !_mostrarPassword);
            },
          ),
          labelText: label,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}
