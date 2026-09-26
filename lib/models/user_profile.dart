class UserProfile {
  const UserProfile({
    required this.name, required this.age, required this.sex, required this.heightCm,
    required this.weightKg, required this.healthConditions, required this.activityLevel,
    required this.primaryGoal, required this.dietaryPreference, required this.allergies,
  });

  final String name;
  final int age;
  final String sex;
  final double heightCm;
  final double weightKg;
  final List<String> healthConditions;
  final String activityLevel;
  final String primaryGoal;
  final String dietaryPreference;
  final List<String> allergies;

  Map<String, dynamic> toJson() => {
    'basicInfo': {'name': name, 'age': age, 'sex': sex, 'heightCm': heightCm, 'weightKg': weightKg},
    'healthConditions': healthConditions,
    'lifestyle': {'activityLevel': activityLevel},
    'goals': {'primary': primaryGoal},
    'diet': {'preference': dietaryPreference, 'allergies': allergies},
  };

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    final basicInfo = Map<String, dynamic>.from(json['basicInfo'] as Map);
    final lifestyle = Map<String, dynamic>.from(json['lifestyle'] as Map);
    final goals = Map<String, dynamic>.from(json['goals'] as Map);
    final diet = Map<String, dynamic>.from(json['diet'] as Map);
    return UserProfile(
      name: basicInfo['name'] as String,
      age: (basicInfo['age'] as num).toInt(),
      sex: basicInfo['sex'] as String,
      heightCm: (basicInfo['heightCm'] as num).toDouble(),
      weightKg: (basicInfo['weightKg'] as num).toDouble(),
      healthConditions: List<String>.from(json['healthConditions'] as List),
      activityLevel: lifestyle['activityLevel'] as String,
      primaryGoal: goals['primary'] as String,
      dietaryPreference: diet['preference'] as String,
      allergies: List<String>.from(diet['allergies'] as List),
    );
  }
}
