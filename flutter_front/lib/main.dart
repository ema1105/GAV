import 'package:flutter/material.dart';
import 'presentation/screens/common/home_page.dart'; // Ajusta esta ruta según tu estructura
import 'presentation/screens/common/login_page.dart';
import 'presentation/screens/common/register_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false, // quita el letrero rojo de debug
      title: 'TuApp de Viajes',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        fontFamily: 'Roboto', // Si usas Google Fonts, puedes modificarlo luego
      ),
      // 👇 Aquí definimos la ruta inicial
      home: const HomePage(),

      // 👇 Opcional: define tus rutas para navegar desde los botones 1234
      routes: {
        '/login_page': (context) => const LoginPage(),     // <-- crea luego LoginPage.dart
        '/register_page': (context) => const RegisterPage(), // <-- crea luego RegisterPage.dart
      },
    );
  }
}
