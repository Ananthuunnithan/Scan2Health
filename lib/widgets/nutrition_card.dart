import 'package:flutter/material.dart';

class NutritionCard extends StatelessWidget {
  const NutritionCard({super.key, required this.icon, required this.label, required this.value, required this.goal, required this.color});

  final IconData icon;
  final String label;
  final String value;
  final String goal;
  final Color color;

  @override
  Widget build(BuildContext context) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, color: color),
            const Spacer(),
            Text(label, style: Theme.of(context).textTheme.labelLarge),
            Text('$value / $goal', style: const TextStyle(fontWeight: FontWeight.w800)),
          ]),
        ),
      );
}
