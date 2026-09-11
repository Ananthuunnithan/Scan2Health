import 'package:flutter/material.dart';
import '../core/app_theme.dart';
class AppLogo extends StatelessWidget { const AppLogo({super.key, this.compact = false}); final bool compact;
  @override Widget build(BuildContext context) => Row(mainAxisSize: MainAxisSize.min, children: [Container(width: compact ? 38 : 50, height: compact ? 38 : 50, decoration: BoxDecoration(color: AppTheme.primaryGreen, borderRadius: BorderRadius.circular(15)), child: const Icon(Icons.eco_rounded, color: Colors.white)), if (!compact) ...[const SizedBox(width: 10), Text('Scan2Health', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800, color: AppTheme.primaryGreen))]]);
}
