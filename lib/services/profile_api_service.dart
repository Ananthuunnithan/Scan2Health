import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/user_profile.dart';
import 'auth_service.dart';

class ProfileApiService {
  ProfileApiService({http.Client? client, AuthService? authService})
      : _client = client ?? http.Client(), _authService = authService ?? AuthService();

  static const _baseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:5000');
  final http.Client _client;
  final AuthService _authService;

  Future<UserProfile?> fetchProfile() async {
    final response = await _request('GET');
    if (response.statusCode == 404) return null;
    return _profileFromResponse(response);
  }

  Future<UserProfile> createProfile(UserProfile profile) async =>
      _profileFromResponse(await _request('POST', profile));

  Future<UserProfile> updateProfile(UserProfile profile) async =>
      _profileFromResponse(await _request('PUT', profile));

  Future<http.Response> _request(String method, [UserProfile? profile]) async {
    final token = await _authService.getIdToken();
    if (token == null) throw const ProfileApiException('Please sign in to manage your profile.');
    final headers = {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'};
    final uri = Uri.parse('$_baseUrl/api/profile');
    try {
      return switch (method) {
        'GET' => await _client.get(uri, headers: headers),
        'POST' => await _client.post(uri, headers: headers, body: jsonEncode(profile!.toJson())),
        _ => await _client.put(uri, headers: headers, body: jsonEncode(profile!.toJson())),
      };
    } on Exception {
      throw const ProfileApiException('Unable to reach the server. Check your connection and try again.');
    }
  }

  UserProfile _profileFromResponse(http.Response response) {
    Map<String, dynamic> body;
    try { body = Map<String, dynamic>.from(jsonDecode(response.body) as Map); } catch (_) {
      throw const ProfileApiException('The server returned an unexpected response.');
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ProfileApiException(body['message'] as String? ?? 'Unable to save your profile. Please try again.');
    }
    return UserProfile.fromJson(Map<String, dynamic>.from(body['profile'] as Map));
  }
}

class ProfileApiException implements Exception {
  const ProfileApiException(this.message);
  final String message;
}
