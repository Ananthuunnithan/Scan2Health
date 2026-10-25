import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;

class AssessmentService {
  /*
   * Android Emulator:
   * 10.0.2.2 points to the host computer's localhost.
   *
   * Your Node.js backend is running on port 5000.
   */
  static const String baseUrl = 'http://10.0.2.2:5000';

  static Future<Map<String, dynamic>> assessProduct(String barcode) async {
    final user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      throw Exception('User is not authenticated.');
    }

    /*
     * Get the Firebase ID token of the currently
     * signed-in user.
     */
    final idToken = await user.getIdToken();

    if (idToken == null || idToken.isEmpty) {
      throw Exception('Unable to obtain Firebase ID token.');
    }

    final response = await http.post(
      Uri.parse('$baseUrl/api/assessment'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $idToken',
      },
      body: jsonEncode({'barcode': barcode}),
    );

    /*
     * Successful response.
     */
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);

      if (data is Map<String, dynamic>) {
        return data;
      }

      throw Exception('Invalid assessment response.');
    }

    /*
     * Try to extract the backend error message.
     */
    String? errorMessage;
    try {
      final errorData = jsonDecode(response.body);

      if (errorData is Map<String, dynamic> && errorData['message'] != null) {
        errorMessage = errorData['message'].toString();
      }
    } catch (_) {
      // Fall through to the generic error below.
    }

    if (errorMessage != null) {
      throw Exception(errorMessage);
    }

    throw Exception(
      'Assessment request failed '
      '(${response.statusCode}).',
    );
  }

  static Future<Map<String, dynamic>> recordConsumption({
    required String barcode,
    required double quantity,
    double? consumedAmount,
    String? consumedUnit,
  }) async {
    final user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      throw Exception('User is not authenticated.');
    }

    final idToken = await user.getIdToken();

    if (idToken == null || idToken.isEmpty) {
      throw Exception('Unable to obtain Firebase ID token.');
    }

    final body = <String, dynamic>{'barcode': barcode, 'quantity': quantity};

    if (consumedAmount != null) {
      body['consumedAmount'] = consumedAmount;
    }
    if (consumedUnit != null) {
      body['consumedUnit'] = consumedUnit;
    }

    final response = await http.post(
      Uri.parse('$baseUrl/api/consumed-food'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $idToken',
      },
      body: jsonEncode(body),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);

      if (data is Map<String, dynamic>) {
        return data;
      }

      throw Exception('Invalid consumed food response.');
    }

    String? errorMessage;
    try {
      final errorData = jsonDecode(response.body);

      if (errorData is Map<String, dynamic> && errorData['message'] != null) {
        errorMessage = errorData['message'].toString();
      }
    } catch (_) {
      // Fall through to the generic error below.
    }

    if (errorMessage != null) {
      throw Exception(errorMessage);
    }

    throw Exception(
      'Failed to record food consumption '
      '(${response.statusCode}).',
    );
  }
}
