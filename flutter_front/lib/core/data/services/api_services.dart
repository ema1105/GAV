import 'dart:convert';
import 'package:flutter_front/core/constants/api_constants.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';


class ApiService {
  static final _client = http.Client();
  static const _headers = {'Content-Type': 'application/json'};

  static Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');

    try {
      final response = await _client.post(url, headers: _headers, body: jsonEncode(body));
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error en POST ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      debugPrint('Error POST: $e');
      rethrow;
    }
  }

  static Future<dynamic> get(String endpoint) async {
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');

    try {
      final response = await _client.get(url, headers: _headers);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error en GET ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Error GET: $e');
      rethrow;
    }
  }
}
