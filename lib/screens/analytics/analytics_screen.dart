import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../services/daily_nutrition_service.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  Map<String, dynamic>? _dailyNutrition;
  Map<String, dynamic>? _weeklyNutrition;
  bool _isLoading = true;
  String? _error;

  Future<void> _loadDailyNutrition() async {
    try {
      final today = DateTime.now();

      final date =
          '${today.year.toString().padLeft(4, '0')}-'
          '${today.month.toString().padLeft(2, '0')}-'
          '${today.day.toString().padLeft(2, '0')}';

      final result = await DailyNutritionService.getDailyNutrition(
        date: date,
      );
      final weeklyResult = await DailyNutritionService.getWeeklyNutrition(
        endDate: date,
      );
      if (!mounted) return;

      setState(() {
        _dailyNutrition = result['dailyNutrition'];
        _weeklyNutrition = weeklyResult;
        _isLoading = false;
      });
    } catch (error) {
      if (!mounted) return;

      setState(() {
        _isLoading = false;
        _error = error.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  @override
  void initState() {
    super.initState();
    _loadDailyNutrition();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Nutrition Analytics',
            style: Theme.of(context)
                .textTheme
                .headlineSmall
                ?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 7),
          const Text(
            'Your nutrition at a glance',
            style: TextStyle(color: AppTheme.muted),
          ),
          const SizedBox(height: 24),

          if (_isLoading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: CircularProgressIndicator(),
              ),
            )
          else if (_error != null)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    const Text('Unable to load nutrition data'),
                    const SizedBox(height: 8),
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: _loadDailyNutrition,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            )
          else
            Grid(
              dailyNutrition: _dailyNutrition,
            ),

          const SizedBox(height: 24),

            ChartCard(
              'Daily Progress',
              (((_dailyNutrition?['totals']?['calories'] as num?) ?? 0) / 2000)
                  .clamp(0, 1)
                  .toDouble(),
            ),
          const SizedBox(height: 14),
          ChartCard(
            'Weekly Nutrition',
            ((_weeklyNutrition?['weeklyNutrition']?['progress'] as num?) ?? 0)
                .clamp(0, 1)
                .toDouble(),
          ),
          const SizedBox(height: 14),
          NutritionTrendCard(
            weeklyNutrition: _weeklyNutrition,
          ),
        ],
      ),
    );
  }
}
class Grid extends StatelessWidget {
  const Grid({
    super.key,
    required this.dailyNutrition,
  });

  final Map<String, dynamic>? dailyNutrition;

  @override
  Widget build(BuildContext context) {
    final totals =
        dailyNutrition?['totals'] as Map<String, dynamic>? ?? {};

    final calories =
        (totals['calories'] as num?)?.round() ?? 0;

    final protein =
        (totals['protein'] as num?)?.round() ?? 0;

    final carbohydrates =
        (totals['carbohydrates'] as num?)?.round() ?? 0;

    final fat = (totals['totalFat'] as num?)?.round();

    final d = [
      ('Calories', '$calories kcal', Icons.local_fire_department),
      ('Protein', '$protein g', Icons.fitness_center),
      ('Carbohydrates', '$carbohydrates g', Icons.grain),
      (
        'Fat',
        fat == null ? 'N/A' : '$fat g',
        Icons.water_drop_outlined,
      ),
    ];
     return GridView.builder(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), itemCount: 4, gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 1.45, crossAxisSpacing: 12, mainAxisSpacing: 12), itemBuilder: (_, i) => Card(child: Padding(padding: const EdgeInsets.all(15), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Icon(d[i].$3, color: AppTheme.primaryGreen), const Spacer(), Text(d[i].$1, style: const TextStyle(color: AppTheme.muted)), Text(d[i].$2, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17))])))); } }
class ChartCard extends StatelessWidget { const ChartCard(this.title, this.value, {super.key}); final String title; final double value; @override Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)), const SizedBox(height: 16), ClipRRect(borderRadius: BorderRadius.circular(8), child: LinearProgressIndicator(value: value, minHeight: 10, backgroundColor: AppTheme.paleGreen, color: AppTheme.primaryGreen)), const SizedBox(height: 9), Text('${(value * 100).round()}% on track', style: const TextStyle(color: AppTheme.muted))]))); }
class NutritionTrendCard extends StatelessWidget {
  const NutritionTrendCard({
    super.key,
    required this.weeklyNutrition,
  });

  final Map<String, dynamic>? weeklyNutrition;

  @override
  Widget build(BuildContext context) {
    final weeklyData =
        weeklyNutrition?['weeklyNutrition'] as Map<String, dynamic>?;

    final days =
        (weeklyData?['days'] as List<dynamic>?) ?? [];

    const dailyGoal = 2000.0;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Nutrition Trends',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Daily calorie intake over the last 7 days',
              style: TextStyle(
                color: AppTheme.muted,
              ),
            ),
            const SizedBox(height: 20),

            if (days.isEmpty)
              const Padding(
                padding: EdgeInsets.all(20),
                child: Center(
                  child: Text(
                    'No nutrition data available.',
                  ),
                ),
              )
            else
              SizedBox(
                height: 190,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: days.map((day) {
                    final data =
                        day as Map<String, dynamic>;

                    final calories =
                        (data['calories'] as num?)
                                ?.toDouble() ??
                            0;

                    final barHeight =
                        ((calories / dailyGoal) * 120)
                            .clamp(4, 120)
                            .toDouble();

                    final date =
                        data['date']?.toString() ?? '';

                    final label = date.length >= 10
                        ? date.substring(8, 10)
                        : '';

                    return Column(
                      mainAxisAlignment:
                          MainAxisAlignment.end,
                      children: [
                        Text(
                          calories.round() == 0
                              ? ''
                              : '${calories.round()}',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          width: 24,
                          height: barHeight,
                          decoration: BoxDecoration(
                            color: AppTheme.primaryGreen,
                            borderRadius:
                                BorderRadius.circular(6),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          label,
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppTheme.muted,
                          ),
                        ),
                      ],
                    );
                  }).toList(),
                ),
              ),

            const SizedBox(height: 8),

            const Row(
              mainAxisAlignment:
                  MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.circle,
                  size: 8,
                  color: AppTheme.primaryGreen,
                ),
                SizedBox(width: 6),
                Text(
                  'Calories consumed',
                  style: TextStyle(
                    color: AppTheme.muted,
                    fontSize: 12,
                  ),
                ),
                SizedBox(width: 16),
                Text(
                  'Goal: 2000 kcal/day',
                  style: TextStyle(
                    color: AppTheme.muted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}