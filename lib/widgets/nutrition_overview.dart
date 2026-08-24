import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../models/nutrition_summary.dart';

class NutritionOverview extends StatelessWidget {
  const NutritionOverview({super.key, required this.summary});

  final NutritionSummary summary;

  @override
  Widget build(BuildContext context) => Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Row(
                children: [
                  _CalorieRing(value: summary.calories / 2000),
                  const SizedBox(width: 18),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Calories', style: Theme.of(context).textTheme.labelLarge),
                        const SizedBox(height: 4),
                        Text(
                          '${summary.calories} / 2000 kcal',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 4),
                        Text('${(summary.calories / 2000 * 100).round()}% of your daily goal', style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 22),
              _NutritionBar(label: 'Protein', value: summary.protein, goal: 75, unit: 'g', color: Colors.blue),
              const SizedBox(height: 16),
              _NutritionBar(label: 'Sugar', value: summary.sugar, goal: 30, unit: 'g', color: Colors.orange),
            ],
          ),
        ),
      );
}

class _CalorieRing extends StatelessWidget {
  const _CalorieRing({required this.value});

  final double value;

  @override
  Widget build(BuildContext context) => SizedBox(
        height: 76,
        width: 76,
        child: Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              height: 76,
              width: 76,
              child: CircularProgressIndicator(
                value: value.clamp(0, 1).toDouble(),
                strokeWidth: 8,
                backgroundColor: AppTheme.paleGreen,
                color: AppTheme.primaryGreen,
                strokeCap: StrokeCap.round,
              ),
            ),
            const Icon(Icons.local_fire_department_rounded, color: AppTheme.primaryGreen),
          ],
        ),
      );
}

class _NutritionBar extends StatelessWidget {
  const _NutritionBar({required this.label, required this.value, required this.goal, required this.unit, required this.color});

  final String label;
  final int value;
  final int goal;
  final String unit;
  final Color color;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(label, style: Theme.of(context).textTheme.labelLarge),
              const Spacer(),
              Text('$value / $goal $unit', style: Theme.of(context).textTheme.labelMedium?.copyWith(fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(99),
            child: LinearProgressIndicator(
              value: (value / goal).clamp(0, 1).toDouble(),
              minHeight: 9,
              color: color,
              backgroundColor: color.withValues(alpha: 0.14),
            ),
          ),
        ],
      );
}
