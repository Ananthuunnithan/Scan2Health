import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;

class ProfileService {
  static const String baseUrl = 'http://10.0.2.2:5000';

  static Future<Map<String, dynamic>> getProfile() async {
    final user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      throw Exception('User is not authenticated.');
    }

    final idToken = await user.getIdToken();

    if (idToken == null || idToken.isEmpty) {
      throw Exception('Unable to obtain Firebase ID token.');
    }

    final response = await http.get(
      Uri.parse('$baseUrl/api/profile'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $idToken',
      },
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200) {
      if (data is Map<String, dynamic>) {
        return data;
      }

      throw Exception('Invalid profile response.');
    }

    if (data is Map<String, dynamic> && data['message'] != null) {
      throw Exception(data['message']);
    }

    throw Exception(
      'Failed to load profile (${response.statusCode}).',
    );
  }

  static Future<Map<String, dynamic>> saveProfile(
    Map<String, dynamic> profileData,
  ) async {
    final user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      throw Exception('User is not authenticated.');
    }

    final idToken = await user.getIdToken();

    if (idToken == null || idToken.isEmpty) {
      throw Exception('Unable to obtain Firebase ID token.');
    }

    final response = await http.post(
      Uri.parse('$baseUrl/api/profile'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $idToken',
      },
      body: jsonEncode(profileData),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 || response.statusCode == 201) {
      if (data is Map<String, dynamic>) {
        return data;
      }

      throw Exception('Invalid profile response.');
    }

    if (data is Map<String, dynamic> && data['message'] != null) {
      throw Exception(data['message']);
    }

    throw Exception(
      'Failed to save profile (${response.statusCode}).',
    );
  }
}