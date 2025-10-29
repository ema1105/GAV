import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 255, 255, 255),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 🟫 Encabezado principal con imagen
SizedBox(
  height: 400,
  child: Stack(
    children: [
      Positioned.fill(
        child: Image.asset(
          'assets/imgs/cartagena.jpg',
          fit: BoxFit.cover,
        ),
      ),
      Positioned.fill(
        child: Container(
          color: Colors.black.withOpacity(0.4),
        ),
      ),
      Center(
  child: Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      const Text(
        'TU VIAJE SOFISTICADO A CARTAGENA\nCOMIENZA AQUÍ',
        textAlign: TextAlign.center,
        style: TextStyle(
          color: Colors.white,
          fontSize: 26,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
        ),
      ),
      const SizedBox(height: 40),

      // 🔹 Botón de Iniciar Sesión
      ElevatedButton(
        onPressed: () {
          Navigator.pushNamed(context, '/login_page');
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color.fromARGB(255, 0, 0, 0),
          foregroundColor: const Color.fromARGB(255, 255, 255, 255),
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: const Text(
          'Iniciar Sesión',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
      ),

      const SizedBox(height: 20),

      // 🔹 Botón de Registrarse
      OutlinedButton(
        onPressed: () {
          Navigator.pushNamed(context, '/register_page');
        },
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Colors.white, width: 2),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: const Text(
          'Registrarse',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
      ),
    ],
  ),
),

    ],
  ),
),

            // 🟤 Sección de beneficios
            Container(
              color: const Color(0xFFF5F0E6),
              padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: const [
                  _FeatureIcon(
                    icon: Icons.directions_car_filled,
                    title: 'ASIGNACIÓN PERSONALIZADA',
                    subtitle: 'Rutas optimizadas para ejecutivos y placer',
                  ),
                  _FeatureIcon(
                    icon: Icons.star_rate,
                    title: 'EXPERIENCIA EXCLUSIVA',
                    subtitle: 'Servicio adaptado a tus preferencias VIP',
                  ),
                  _FeatureIcon(
                    icon: Icons.verified_user,
                    title: 'SEGURIDAD Y CONFIANZA',
                    subtitle: 'Viaja con tranquilidad, siempre',
                  ),
                ],
              ),
            ),

            // 🏙️ Sección de destinos
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: Column(
                children: [
                  const Text(
                    'DESCUBRE CARTAGENA',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.1,
                    ),
                  ),
                  const SizedBox(height: 25),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        const SizedBox(width: 20),
                        _DestinationCard(
                          image: 'assets/imgs/ciudad.jpg',
                          title: 'Ciudad Amurallada',
                        ),
                        _DestinationCard(
                          image: 'assets/imgs/islas.jpg',
                          title: 'Islas del Rosario',
                        ),
                        _DestinationCard(
                          image: 'assets/imgs/castillo.jpg',
                          title: 'Castillo San Felipe',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // 📞 Sección de contacto
            Container(
              color: const Color(0xFFF5F0E6),
              padding: const EdgeInsets.all(30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'SOBRE EL HOTEL MANZANILLO DEL MAR',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.1,
                    ),
                  ),
                  SizedBox(height: 15),
                  Text(
                    'Experimenta el lujo frente al mar Caribe. Con instalaciones modernas y servicio inigualable, '
                    'el hotel es el destino preferido para quienes buscan exclusividad y confort en Cartagena.',
                    style: TextStyle(height: 1.5),
                  ),
                  SizedBox(height: 20),
                  Text('📍 Dirección: Manzanillo del Mar, Cartagena'),
                  Text('📞 Teléfono: +57 603 123 4567'),
                  Text('📧 Email: info@manzanillotravel.com'),
                ],
              ),
            ),

            // ⚫ Footer
            Container(
              color: Colors.black,
              padding: const EdgeInsets.all(20),
              child: const Center(
                child: Text(
                  '© 2025 Manzanillo Travel · Todos los derechos reservados',
                  style: TextStyle(color: Colors.white70),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// 🔹 Widget para íconos con descripción
class _FeatureIcon extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _FeatureIcon({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 110,
      child: Column(
        children: [
          Icon(icon, size: 40, color: Colors.black87),
          const SizedBox(height: 10),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12, color: Colors.black54),
          ),
        ],
      ),
    );
  }
}

// 🔹 Widget para mostrar destinos
class _DestinationCard extends StatelessWidget {
  final String image;
  final String title;

  const _DestinationCard({required this.image, required this.title});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 10),
      width: 180,
      child: Column(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.asset(image, height: 100, fit: BoxFit.cover),
          ),
          const SizedBox(height: 10),
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          TextButton(
            onPressed: () {},
            child: const Text('VER MÁS'),
          ),
        ],
      ),
    );
  }
}
