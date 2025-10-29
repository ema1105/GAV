import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 700;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 🟫 Encabezado principal con imagen y degradado
              SizedBox(
                height: MediaQuery.of(context).size.height * 0.55,
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
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withOpacity(0.6),
                              Colors.black.withOpacity(0.3),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                    ),
                    Center(
                      child: AnimatedOpacity(
                        duration: const Duration(milliseconds: 800),
                        opacity: 1,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'TU VIAJE SOFISTICADO A CARTAGENA\nCOMIENZA AQUÍ',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontSize: isMobile ? 22 : 28,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1.2,
                              ),
                            ),
                            const SizedBox(height: 40),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.pushNamed(context, '/login_page');
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.black,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 40, vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                elevation: 6,
                              ),
                              child: Text(
                                'Iniciar Sesión',
                                style: GoogleFonts.poppins(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            OutlinedButton(
                              onPressed: () {
                                Navigator.pushNamed(context, '/register_page');
                              },
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(
                                    color: Colors.white, width: 2),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 40, vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: Text(
                                'Registrarse',
                                style: GoogleFonts.poppins(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // 🟤 Sección de beneficios (responsive)
              Container(
                padding:
                    const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Color(0xFFFFFFFF),
                      Color(0xFFF5F0E6),
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: isMobile
                    ? Column(
                        children: const [
                          _FeatureIcon(
                            icon: Icons.directions_car_filled,
                            title: 'ASIGNACIÓN PERSONALIZADA',
                            subtitle:
                                'Rutas optimizadas para ejecutivos y placer',
                          ),
                          SizedBox(height: 25),
                          _FeatureIcon(
                            icon: Icons.star_rate,
                            title: 'EXPERIENCIA EXCLUSIVA',
                            subtitle:
                                'Servicio adaptado a tus preferencias VIP',
                          ),
                          SizedBox(height: 25),
                          _FeatureIcon(
                            icon: Icons.verified_user,
                            title: 'SEGURIDAD Y CONFIANZA',
                            subtitle: 'Viaja con tranquilidad, siempre',
                          ),
                        ],
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: const [
                          _FeatureIcon(
                            icon: Icons.directions_car_filled,
                            title: 'ASIGNACIÓN PERSONALIZADA',
                            subtitle:
                                'Rutas optimizadas para ejecutivos y placer',
                          ),
                          _FeatureIcon(
                            icon: Icons.star_rate,
                            title: 'EXPERIENCIA EXCLUSIVA',
                            subtitle:
                                'Servicio adaptado a tus preferencias VIP',
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
                    Text(
                      'DESCUBRE CARTAGENA',
                      style: GoogleFonts.poppins(
                        fontSize: isMobile ? 22 : 26,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.1,
                      ),
                    ),
                    const SizedBox(height: 25),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: const [
                          SizedBox(width: 20),
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
                padding: const EdgeInsets.all(30),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Color(0xFFF5F0E6),
                      Color(0xFFFFFFFF),
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'SOBRE EL HOTEL MANZANILLO DEL MAR',
                      style: GoogleFonts.poppins(
                        fontSize: isMobile ? 18 : 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 15),
                    Text(
                      'Experimenta el lujo frente al mar Caribe. Con instalaciones modernas y servicio inigualable, '
                      'el hotel es el destino preferido para quienes buscan exclusividad y confort en Cartagena.',
                      style: GoogleFonts.poppins(height: 1.6, fontSize: 14),
                    ),
                    const SizedBox(height: 20),
                    Text('📍 Dirección: Manzanillo del Mar, Cartagena',
                        style: GoogleFonts.poppins(fontSize: 14)),
                    Text('📞 Teléfono: +57 603 123 4567',
                        style: GoogleFonts.poppins(fontSize: 14)),
                    Text('📧 Email: info@manzanillotravel.com',
                        style: GoogleFonts.poppins(fontSize: 14)),
                  ],
                ),
              ),

              // ⚫ Footer
              Container(
                color: Colors.black,
                padding: const EdgeInsets.all(20),
                child: Center(
                  child: Text(
                    '© 2025 Manzanillo Travel · Todos los derechos reservados',
                    style: GoogleFonts.poppins(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
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
      width: 140,
      child: Column(
        children: [
          Icon(icon, size: 45, color: Colors.black87),
          const SizedBox(height: 10),
          Text(
            title,
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: Colors.black54,
            ),
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
      margin: const EdgeInsets.symmetric(horizontal: 12),
      width: 180,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          ClipRRect(
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(12)),
            child: Image.asset(image, height: 120, fit: BoxFit.cover),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Text(
              title,
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
            ),
          ),
          TextButton(
            onPressed: () {},
            child: Text(
              'Ver más',
              style: GoogleFonts.poppins(
                color: const Color(0xFF1E88E5),
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
