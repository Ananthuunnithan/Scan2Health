import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../services/profile_service.dart';

class EditProfileScreen extends StatefulWidget {
  final Map<String, dynamic> profile;

  const EditProfileScreen({
    super.key,
    required this.profile,
  });

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _nameController;
  late final TextEditingController _ageController;
  late final TextEditingController _heightController;
  late final TextEditingController _weightController;

  String? _sex;
  String? _activityLevel;
  String? _goal;
  String? _dietPreference;

  List<String> _healthConditions = [];
  List<String> _allergies = [];

  bool _isSaving = false;

  static const List<String> sexes = [
    'Female',
    'Male',
    'Intersex',
    'Prefer not to say',
  ];

  static const List<String> activityLevels = [
    'Sedentary',
    'Lightly Active',
    'Moderately Active',
    'Very Active',
  ];

  static const List<String> goals = [
    'Weight Loss',
    'Weight Maintenance',
    'Weight Gain',
    'Muscle Gain',
    'General Healthy Eating',
  ];

  static const List<String> dietaryPreferences = [
    'Vegetarian',
    'Non-Vegetarian',
    'Vegan',
    'Eggetarian',
    'Other',
  ];

  static const List<String> healthConditionOptions = [
    'DIABETES',
    'HYPERTENSION',
    'HIGH_CHOLESTEROL',
    'OBESITY',
    'IRON_DEFICIENCY_ANEMIA',
    'KIDNEY_DISEASE',
    'CELIAC_DISEASE',
    'LACTOSE_INTOLERANCE',
  ];

  static const List<String> allergyOptions = [
    'Peanut',
    'Milk',
    'Egg',
    'Soy',
    'Gluten',
    'Other',
  ];

  @override
  void initState() {
    super.initState();

    final basicInfo =
        widget.profile['basicInfo'] as Map<String, dynamic>? ?? {};

    final lifestyle =
        widget.profile['lifestyle'] as Map<String, dynamic>? ?? {};

    final goalsData =
        widget.profile['goals'] as Map<String, dynamic>? ?? {};

    final diet =
        widget.profile['diet'] as Map<String, dynamic>? ?? {};

    _nameController =
        TextEditingController(text: basicInfo['name']?.toString() ?? '');

    _ageController =
        TextEditingController(text: basicInfo['age']?.toString() ?? '');

    _heightController =
        TextEditingController(text: basicInfo['heightCm']?.toString() ?? '');

    _weightController =
        TextEditingController(text: basicInfo['weightKg']?.toString() ?? '');

    _sex = basicInfo['sex']?.toString();
    _activityLevel = lifestyle['activityLevel']?.toString();
    _goal = goalsData['primary']?.toString();
    _dietPreference = diet['preference']?.toString();

    final conditions = widget.profile['healthConditions'];

    if (conditions is List) {
      _healthConditions = conditions
          .map((item) => item.toString())
          .toList();
    }

    final allergies = diet['allergies'];

    if (allergies is List) {
      _allergies = allergies
          .map((item) => item.toString())
          .toList();
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _ageController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_sex == null ||
        _activityLevel == null ||
        _goal == null ||
        _dietPreference == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please complete all required selections.'),
        ),
      );
      return;
    }

    setState(() {
      _isSaving = true;
    });

    final profileData = {
      'basicInfo': {
        'name': _nameController.text.trim(),
        'age': int.parse(_ageController.text.trim()),
        'sex': _sex,
        'heightCm': double.parse(_heightController.text.trim()),
        'weightKg': double.parse(_weightController.text.trim()),
      },
      'healthConditions': _healthConditions,
      'lifestyle': {
        'activityLevel': _activityLevel,
      },
      'goals': {
        'primary': _goal,
      },
      'diet': {
        'preference': _dietPreference,
        'allergies': _allergies,
      },
    };

    try {
      await ProfileService.saveProfile(profileData);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully.'),
        ),
      );

      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update profile: $e'),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  Future<void> _selectMultiple({
    required String title,
    required List<String> options,
    required List<String> selected,
    required Function(List<String>) onChanged,
  }) async {
    final temporarySelection = List<String>.from(selected);

    await showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: Text(title),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: options.map((option) {
                    return CheckboxListTile(
                      value: temporarySelection.contains(option),
                      title: Text(_displayName(option)),
                      controlAffinity: ListTileControlAffinity.leading,
                      onChanged: (checked) {
                        setDialogState(() {
                          if (checked == true) {
                            temporarySelection.add(option);
                          } else {
                            temporarySelection.remove(option);
                          }
                        });
                      },
                    );
                  }).toList(),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () {
                    onChanged(temporarySelection);
                    Navigator.pop(context);
                  },
                  child: const Text('Done'),
                ),
              ],
            );
          },
        );
      },
    );

    setState(() {});
  }

  String _displayName(String value) {
    return value
        .split('_')
        .map(
          (word) => word.isEmpty
              ? word
              : '${word[0]}${word.substring(1).toLowerCase()}',
        )
        .join(' ');
  }

  Widget _dropdown({
    required String label,
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
        ),
      ),
      items: items
          .map(
            (item) => DropdownMenuItem(
              value: item,
              child: Text(item),
            ),
          )
          .toList(),
      onChanged: onChanged,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Required';
        }
        return null;
      },
    );
  }

  Widget _multiSelectTile({
    required String title,
    required List<String> selected,
    required List<String> options,
    required Function(List<String>) onChanged,
  }) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.w700,
          ),
        ),
        subtitle: Text(
          selected.isEmpty
              ? 'None selected'
              : selected.map(_displayName).join(', '),
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          _selectMultiple(
            title: title,
            options: options,
            selected: selected,
            onChanged: onChanged,
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Edit Profile',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Text(
              'Basic Information',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),

            const SizedBox(height: 16),

            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Name',
                prefixIcon: const Icon(Icons.person_outline),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Name is required';
                }
                return null;
              },
            ),

            const SizedBox(height: 14),

            TextFormField(
              controller: _ageController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Age',
                prefixIcon: const Icon(Icons.cake_outlined),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              validator: (value) {
                final age = int.tryParse(value ?? '');

                if (age == null || age < 1 || age > 120) {
                  return 'Enter a valid age';
                }

                return null;
              },
            ),

            const SizedBox(height: 14),

            _dropdown(
              label: 'Sex',
              value: _sex,
              items: sexes,
              onChanged: (value) {
                setState(() {
                  _sex = value;
                });
              },
            ),

            const SizedBox(height: 14),

            TextFormField(
              controller: _heightController,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: InputDecoration(
                labelText: 'Height (cm)',
                prefixIcon: const Icon(Icons.height),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              validator: (value) {
                final height = double.tryParse(value ?? '');

                if (height == null || height < 40 || height > 300) {
                  return 'Enter a valid height';
                }

                return null;
              },
            ),

            const SizedBox(height: 14),

            TextFormField(
              controller: _weightController,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: InputDecoration(
                labelText: 'Weight (kg)',
                prefixIcon: const Icon(Icons.monitor_weight_outlined),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              validator: (value) {
                final weight = double.tryParse(value ?? '');

                if (weight == null || weight < 2 || weight > 500) {
                  return 'Enter a valid weight';
                }

                return null;
              },
            ),

            const SizedBox(height: 28),

            const Text(
              'Health & Lifestyle',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),

            const SizedBox(height: 16),

            _multiSelectTile(
              title: 'Health Conditions',
              selected: _healthConditions,
              options: healthConditionOptions,
              onChanged: (value) {
                setState(() {
                  _healthConditions = value;
                });
              },
            ),

            _dropdown(
              label: 'Activity Level',
              value: _activityLevel,
              items: activityLevels,
              onChanged: (value) {
                setState(() {
                  _activityLevel = value;
                });
              },
            ),

            const SizedBox(height: 14),

            _dropdown(
              label: 'Primary Goal',
              value: _goal,
              items: goals,
              onChanged: (value) {
                setState(() {
                  _goal = value;
                });
              },
            ),

            const SizedBox(height: 28),

            const Text(
              'Diet',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),

            const SizedBox(height: 16),

            _dropdown(
              label: 'Dietary Preference',
              value: _dietPreference,
              items: dietaryPreferences,
              onChanged: (value) {
                setState(() {
                  _dietPreference = value;
                });
              },
            ),

            const SizedBox(height: 14),

            _multiSelectTile(
              title: 'Allergies',
              selected: _allergies,
              options: allergyOptions,
              onChanged: (value) {
                setState(() {
                  _allergies = value;
                });
              },
            ),

            const SizedBox(height: 28),

            SizedBox(
              height: 54,
              child: ElevatedButton.icon(
                onPressed: _isSaving ? null : _saveProfile,
                icon: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                        ),
                      )
                    : const Icon(Icons.save_outlined),
                label: Text(
                  _isSaving ? 'Saving...' : 'Save Changes',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}