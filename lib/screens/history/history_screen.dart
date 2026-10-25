import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../services/daily_nutrition_service.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _dailyNutrition;

  Future<void> _loadHistory() async {
    try {
      final today = DateTime.now();

      final date =
          '${today.year.toString().padLeft(4, '0')}-'
          '${today.month.toString().padLeft(2, '0')}-'
          '${today.day.toString().padLeft(2, '0')}';

      final result = await DailyNutritionService.getDailyNutrition(
        date: date,
      );

      if (!mounted) return;

      setState(() {
        _dailyNutrition = result['dailyNutrition'];
        _isLoading = false;
        _error = null;
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
    _loadHistory();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Unable to load history',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _error!,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: _loadHistory,
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    final foods =
        (_dailyNutrition?['foods'] as List<dynamic>?) ?? [];

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Today\'s History',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Text(
              '${foods.length} food${foods.length == 1 ? '' : 's'} consumed',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),

            Expanded(
              child: foods.isEmpty
                  ? const Center(
                      child: Text(
                        'No food consumed today.',
                      ),
                    )
                  : ListView.builder(
                      itemCount: foods.length,
                      itemBuilder: (context, index) {
                        final food =
                            foods[index] as Map<String, dynamic>;

                        final product =
                            food['productId']
                                as Map<String, dynamic>?;

                        final productName =
                            product?['productName']?.toString() ??
                                'Unknown product';

                        final brand =
                            product?['brand']?.toString() ??
                                '';

                        final quantity =
                            (food['quantity'] as num?)?.toDouble() ??
                                0;

                        final nutrition =
                            food['nutritionConsumed']
                                as Map<String, dynamic>?;

                        final calories =
                            (nutrition?['calories'] as num?)
                                    ?.round() ??
                                0;

                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            leading: const CircleAvatar(
                              backgroundColor:
                                  AppTheme.paleGreen,
                              child: Icon(
                                Icons.restaurant_rounded,
                                color: AppTheme.primaryGreen,
                              ),
                            ),
                            title: Text(
                              productName,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            subtitle: Text(
                              brand.isEmpty
                                  ? 'Quantity: $quantity'
                                  : '$brand\nQuantity: $quantity',
                            ),
                            isThreeLine: brand.isNotEmpty,
                            trailing: Text(
                              '$calories kcal',
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}