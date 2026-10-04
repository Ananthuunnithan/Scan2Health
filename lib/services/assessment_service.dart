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

  static Future<Map<String, dynamic>> assessProduct(
    String barcode,
  ) async {
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
      body: jsonEncode({
        'barcode': barcode,
      }),
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
    try {
      final errorData = jsonDecode(response.body);

      if (errorData is Map<String, dynamic> &&
          errorData['message'] != null) {
        throw Exception(errorData['message']);
      }
    } catch (_) {
      // Fall through to the generic error below.
    }

    throw Exception(
      'Assessment request failed '
      '(${response.statusCode}).',
    );
  }
}