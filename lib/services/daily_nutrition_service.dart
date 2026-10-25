import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;

class DailyNutritionService {
  static const String baseUrl = 'http://10.0.2.2:5000';

  static Future<Map<String, dynamic>> getDailyNutrition({
    required String date,
  }) async {
    final user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      throw Exception('User is not authenticated.');
    }

    final idToken = await user.getIdToken();

    if (idToken == null || idToken.isEmpty) {
      throw Exception('Unable to obtain Firebase ID token.');
    }

    final response = await http.get(
      Uri.parse(
        '$baseUrl/api/nutrition/daily?date=$date',
      ),
      headers: {
        'Authorization': 'Bearer $idToken',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);

      if (data is Map<String, dynamic>) {
        return data;
      }

      throw Exception('Invalid daily nutrition response.');
    }

    String? errorMessage;
    try {
      final errorData = jsonDecode(response.body);

      if (errorData is Map<String, dynamic> &&
          errorData['message'] != null) {
        errorMessage = errorData['message'].toString();
      }
    } catch (_) {
      // Fall through to the generic error below.
    }

    if (errorMessage != null) {
      throw Exception(errorMessage);
    }

    throw Exception(
      'Failed to fetch daily nutrition '
      '(${response.statusCode}).',
    );
  }

  static Future<Map<String, dynamic>> getWeeklyNutrition({
    required String endDate,
  }) async {
    final user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      throw Exception('User is not authenticated.');
    }

    final idToken = await user.getIdToken();

    if (idToken == null || idToken.isEmpty) {
      throw Exception('Unable to obtain Firebase ID token.');
    }

    final response = await http.get(
      Uri.parse(
        '$baseUrl/api/nutrition/daily/weekly?endDate=$endDate',
      ),
      headers: {
        'Authorization': 'Bearer $idToken',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);

      if (data is Map<String, dynamic>) {
        return data;
      }

      throw Exception('Invalid weekly nutrition response.');
    }

    String? errorMessage;
    try {
      final errorData = jsonDecode(response.body);

      if (errorData is Map<String, dynamic> &&
          errorData['message'] != null) {
        errorMessage = errorData['message'].toString();
      }
    } catch (_) {
      // Fall through to the generic error below.
    }

    if (errorMessage != null) {
      throw Exception(errorMessage);
    }

    throw Exception(
      'Failed to fetch weekly nutrition '
      '(${response.statusCode}).',
    );
  }

  static Future<Map<String, dynamic>> getDailyAssessment({
    required String date,
  }) async {
    final user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      throw Exception('User is not authenticated.');
    }

    final idToken = await user.getIdToken();

    if (idToken == null || idToken.isEmpty) {
      throw Exception('Unable to obtain Firebase ID token.');
    }

    final response = await http.get(
      Uri.parse('$baseUrl/api/nutrition/daily/assessment?date=$date'),
      headers: {
        'Authorization': 'Bearer $idToken',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);

      if (data is Map<String, dynamic>) {
        return data;
      }

      throw Exception('Invalid daily assessment response.');
    }

    String? errorMessage;
    try {
      final errorData = jsonDecode(response.body);

      if (errorData is Map<String, dynamic> &&
          errorData['message'] != null) {
        errorMessage = errorData['message'].toString();
      }
    } catch (_) {}

    if (errorMessage != null) {
      throw Exception(errorMessage);
    }

    throw Exception(
      'Failed to fetch daily assessment (${response.statusCode}).',
    );
  }
}
