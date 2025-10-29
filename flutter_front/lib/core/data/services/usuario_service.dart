import 'package:flutter_front/core/data/services/api_services.dart';

class UsuarioService {
  static Future<void> registrarUsuario(String email, String password) async {
    final body = {'email': email, 'password': password};
    await ApiService.post('/usuarios/registro', body);
  }

  static Future<void> loginUsuario(String email, String password) async {
    final body = {'email': email, 'password': password};
    await ApiService.post('/usuarios/login', body);
  }

  static Future<Map<String, dynamic>> obtenerPerfil(int idUsuario) async {
    final response = await ApiService.get('/usuarios/$idUsuario');
    return response;
  }
}