import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  // Controladores de texto
  final _nombreController = TextEditingController();
  final _apellidosController = TextEditingController();
  final _celularController = TextEditingController();
  final _correoController = TextEditingController();
  final _usuarioController = TextEditingController();
  final _passwordController = TextEditingController();
  final _numeroDocController = TextEditingController();

  String? _tipoDocumento;
  DateTime? _fechaNacimiento;
  bool _isLoading = false;
  bool _mostrarPassword = false;

  // Función de registro (simulada por ahora)
  void _registrarUsuario() async {
    // Validar campos vacíos
    if (_nombreController.text.isEmpty ||
        _apellidosController.text.isEmpty ||
        _celularController.text.isEmpty ||
        _correoController.text.isEmpty ||
        _usuarioController.text.isEmpty ||
        _passwordController.text.isEmpty ||
        _tipoDocumento == null ||
        _numeroDocController.text.isEmpty ||
        _fechaNacimiento == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚠️ Por favor completa todos los campos.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // Simular proceso de carga
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 2));

    setState(() => _isLoading = false);

    // Mostrar éxito
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✅ Registro exitoso'),
        backgroundColor: Colors.green,
      ),
    );

    // Ir al login
    Future.delayed(const Duration(milliseconds: 1500), () {
      Navigator.pushReplacementNamed(context, '/login_page');
    });
  }

  Future<void> _seleccionarFecha() async {
    final DateTime? seleccionada = await showDatePicker(
      context: context,
      initialDate: DateTime(2000, 1, 1),
      firstDate: DateTime(1950),
      lastDate: DateTime.now(),
      locale: const Locale('es', 'ES'),
    );
    if (seleccionada != null) {
      setState(() => _fechaNacimiento = seleccionada);
    }
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
              constraints: const BoxConstraints(maxWidth: 500),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 🧭 Header / título
                  Center(
                    child: Text(
                      'Crear cuenta',
                      style: GoogleFonts.poppins(
                        fontSize: isMobile ? 28 : 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Center(
                    child: Text(
                      'Completa tus datos para registrarte',
                      style: GoogleFonts.poppins(
                        fontSize: 15,
                        color: Colors.black54,
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),

                  // 🔹 SECCIÓN 1 - Datos personales
                  _tituloSeccion('Datos personales'),
                  _campoTexto('Nombre completo', _nombreController,
                      icon: Icons.person),
                  _campoTexto('Apellidos completos', _apellidosController,
                      icon: Icons.badge),
                  _campoTexto('Celular', _celularController,
                      icon: Icons.phone, tipo: TextInputType.phone),

                  // Fecha de nacimiento
                  const SizedBox(height: 16),
                  Text('Fecha de nacimiento',
                      style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w500, fontSize: 15)),
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: _seleccionarFecha,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          vertical: 16, horizontal: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border:
                            Border.all(color: Colors.grey.shade300, width: 1),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _fechaNacimiento == null
                                ? 'Seleccionar fecha'
                                : DateFormat('dd/MM/yyyy')
                                    .format(_fechaNacimiento!),
                            style: GoogleFonts.poppins(fontSize: 14),
                          ),
                          const Icon(Icons.calendar_today,
                              color: Colors.black54),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 25),

                  // Tipo y número de documento
                  Text('Tipo de documento',
                      style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w500, fontSize: 15)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _tipoDocumento,
                    hint: const Text('Selecciona un tipo'),
                    items: const [
                      DropdownMenuItem(value: 'CC', child: Text('Cédula')),
                      DropdownMenuItem(
                          value: 'TI', child: Text('Tarjeta de Identidad')),
                      DropdownMenuItem(
                          value: 'CE', child: Text('Cédula de Extranjería')),
                      DropdownMenuItem(
                          value: 'PAS', child: Text('Pasaporte')),
                    ],
                    onChanged: (value) {
                      setState(() => _tipoDocumento = value);
                    },
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  _campoTexto('Número de documento', _numeroDocController,
                      icon: Icons.numbers, tipo: TextInputType.number),

                  const Divider(height: 40, thickness: 1),

                  // 🔹 SECCIÓN 2 - Datos de cuenta
                  _tituloSeccion('Datos de cuenta'),
                  _campoTexto('Correo electrónico', _correoController,
                      icon: Icons.email_outlined,
                      tipo: TextInputType.emailAddress),
                  _campoTexto('Nombre de usuario', _usuarioController,
                      icon: Icons.person_outline),
                  _campoPassword('Contraseña', _passwordController),

                  const SizedBox(height: 25),

                  // 🔘 Botón de registro
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _registrarUsuario,
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
                                'Registrarse',
                                key: const ValueKey('text'),
                                style: GoogleFonts.poppins(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 16,
                                ),
                              ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // 🔹 Navegación inferior
                  Center(
                    child: TextButton(
                      onPressed: () =>
                          Navigator.pushNamed(context, '/login_page'),
                      child: Text(
                        '¿Ya tienes cuenta? Inicia sesión',
                        style: GoogleFonts.poppins(
                          color: Colors.blueAccent,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  Center(
                    child: TextButton(
                      onPressed: () =>
                          Navigator.pushReplacementNamed(context, '/home_page'),
                      child: Text(
                        '← Volver al inicio',
                        style: GoogleFonts.poppins(
                          color: Colors.blueAccent,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
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

  Widget _tituloSeccion(String titulo) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        titulo,
        style: GoogleFonts.poppins(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ),
      ),
    );
  }
}
