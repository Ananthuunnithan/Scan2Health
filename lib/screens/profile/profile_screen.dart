import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../services/profile_service.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = true;
  String? _errorMessage;

  Map<String, dynamic>? _profile;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await ProfileService.getProfile();

      setState(() {
        _profile = response['profile'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  String _value(dynamic value) {
    if (value == null || value.toString().isEmpty) {
      return 'Not provided';
    }

    return value.toString();
  }

  String _listValue(dynamic value) {
    if (value == null || value is! List || value.isEmpty) {
      return 'None';
    }

    return value.join(', ');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'My Profile',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.error_outline,
                size: 56,
                color: Colors.redAccent,
              ),
              const SizedBox(height: 16),
              Text(
                'Unable to load profile',
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _loadProfile,
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_profile == null) {
      return const Center(
        child: Text('No profile found.'),
      );
    }

    final basicInfo =
        _profile!['basicInfo'] as Map<String, dynamic>? ?? {};

    final lifestyle =
        _profile!['lifestyle'] as Map<String, dynamic>? ?? {};

    final goals =
        _profile!['goals'] as Map<String, dynamic>? ?? {};

    final diet =
        _profile!['diet'] as Map<String, dynamic>? ?? {};

    return RefreshIndicator(
      onRefresh: _loadProfile,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildProfileHeader(
            name: _value(basicInfo['name']),
          ),

          const SizedBox(height: 24),

          _buildSectionTitle('Basic Information'),

          _buildInfoCard(
            children: [
              _buildInfoRow(
                Icons.person_outline,
                'Name',
                _value(basicInfo['name']),
              ),
              _buildInfoRow(
                Icons.cake_outlined,
                'Age',
                '${_value(basicInfo['age'])} years',
              ),
              _buildInfoRow(
                Icons.wc_outlined,
                'Sex',
                _value(basicInfo['sex']),
              ),
              _buildInfoRow(
                Icons.height,
                'Height',
                '${_value(basicInfo['heightCm'])} cm',
              ),
              _buildInfoRow(
                Icons.monitor_weight_outlined,
                'Weight',
                '${_value(basicInfo['weightKg'])} kg',
              ),
            ],
          ),

          const SizedBox(height: 20),

          _buildSectionTitle('Health & Lifestyle'),

          _buildInfoCard(
            children: [
              _buildInfoRow(
                Icons.medical_information_outlined,
                'Health Conditions',
                _listValue(_profile!['healthConditions']),
              ),
              _buildInfoRow(
                Icons.directions_run,
                'Activity Level',
                _value(lifestyle['activityLevel']),
              ),
              _buildInfoRow(
                Icons.flag_outlined,
                'Primary Goal',
                _value(goals['primary']),
              ),
            ],
          ),

          const SizedBox(height: 20),

          _buildSectionTitle('Diet'),

          _buildInfoCard(
            children: [
              _buildInfoRow(
                Icons.restaurant_outlined,
                'Dietary Preference',
                _value(diet['preference']),
              ),
              _buildInfoRow(
                Icons.warning_amber_outlined,
                'Allergies',
                _listValue(diet['allergies']),
              ),
            ],
          ),

          const SizedBox(height: 24),

          SizedBox(
            height: 52,
            child: ElevatedButton.icon(
              onPressed: () async {
                final updated = await Navigator.push<bool>(
                  context,
                  MaterialPageRoute(
                    builder: (_) => EditProfileScreen(
                      profile: _profile!,
                    ),
                  ),
                );

                if (updated == true) {
                  _loadProfile();
                }
              },
              icon: const Icon(Icons.edit_outlined),
              label: const Text(
                'Edit Profile',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),

          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildProfileHeader({
    required String name,
  }) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppTheme.paleGreen,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 34,
            backgroundColor: AppTheme.primaryGreen,
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : '?',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(width: 18),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Welcome back',
                  style: TextStyle(
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required List<Widget> children,
  }) {
    return Card(
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: 18,
          vertical: 8,
        ),
        child: Column(
          children: children,
        ),
      ),
    );
  }

  Widget _buildInfoRow(
    IconData icon,
    String label,
    String value,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            color: AppTheme.primaryGreen,
            size: 24,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}