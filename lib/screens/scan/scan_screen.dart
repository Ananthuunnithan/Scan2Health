import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../services/assessment_service.dart';
import 'barcode_scanner_screen.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final TextEditingController _barcodeController =
      TextEditingController();

  bool _isAnalyzing = false;

  @override
  void dispose() {
    _barcodeController.dispose();
    super.dispose();
  }

  Future<void> _analyzeProduct() async {
  final barcode = _barcodeController.text.trim();

  if (barcode.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Please enter a product barcode.'),
      ),
    );
    return;
  }

  setState(() {
    _isAnalyzing = true;
  });

  try {
    final result = await AssessmentService.assessProduct(barcode);

    if (!mounted) return;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AssessmentPreviewScreen(
          barcode: barcode,
          assessment: result['assessment'],
        ),
      ),
    );
  } catch (error) {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          error.toString().replaceFirst('Exception: ', ''),
        ),
      ),
    );
  } finally {
    if (mounted) {
      setState(() {
        _isAnalyzing = false;
      });
    }
  }
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Food'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),

              /*
               * Scanner visual area
               */
              GestureDetector(
                onTap: () async {
                  final barcode = await Navigator.push<String>(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const BarcodeScannerScreen(),
                    ),
                  );

                  if (barcode != null && barcode.isNotEmpty) {
                    setState(() {
                      _barcodeController.text = barcode;
                    });
                  }
                },
                child: Container(
                  width: double.infinity,
                  height: 220,
                  decoration: BoxDecoration(
                    color: AppTheme.paleGreen,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: AppTheme.primaryGreen.withOpacity(0.25),
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.qr_code_scanner_rounded,
                        size: 72,
                        color: AppTheme.primaryGreen,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Scan a food barcode',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Tap here to open the camera scanner.',
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 28),

              Row(
                children: [
                  const Expanded(child: Divider()),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Text(
                      'OR',
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ),
                  const Expanded(child: Divider()),
                ],
              ),

              const SizedBox(height: 24),

              Text(
                'Enter barcode manually',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),

              const SizedBox(height: 10),

              TextField(
                controller: _barcodeController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: 'Enter product barcode',
                  prefixIcon: const Icon(Icons.numbers_rounded),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              /*
               * Test barcode for the existing MongoDB product.
               */
              OutlinedButton.icon(
                onPressed: () {
                  _barcodeController.text = '737628064502';
                },
                icon: const Icon(Icons.science_outlined),
                label: const Text('Use Test Product'),
              ),

              const SizedBox(height: 20),

              SizedBox(
                width: double.infinity,
                height: 54,
                child: FilledButton.icon(
                  onPressed:
                      _isAnalyzing ? null : _analyzeProduct,
                  icon: _isAnalyzing
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.analytics_outlined),
                  label: Text(
                    _isAnalyzing
                        ? 'Analyzing...'
                        : 'Analyze Product',
                  ),
                ),
              ),

              const SizedBox(height: 20),

              const Text(
                'Scan2Health analyzes nutrition, ingredients, '
                'food components and your health profile to '
                'provide a personalized assessment.',
              ),
            ],
          ),
        ),
      ),
    );
  }
}


/*
 * Temporary result screen.
 *
 * This will later be replaced with the real assessment
 * returned by the backend API.
 */
class AssessmentPreviewScreen extends StatelessWidget {
  const AssessmentPreviewScreen({
    super.key,
    required this.barcode,
    required this.assessment,
  });

  final String barcode;
  final Map<String, dynamic> assessment;

@override
Widget build(BuildContext context) {
  final overallStatus =
      assessment['overallStatus']?.toString() ?? 'NO_WARNING';

  final summary =
      assessment['summary']?.toString() ?? '';

  final product =
      assessment['product'] as Map<String, dynamic>? ?? {};

  final nutrition =
      product['nutrition'] as Map<String, dynamic>? ?? {};

  final serving =
      product['serving'] as Map<String, dynamic>? ?? {};

  final ingredients =
      product['ingredients'] as Map<String, dynamic>? ?? {};

  final foodComponents =
      product['foodComponents'] as List<dynamic>? ?? [];

  final allergens =
      product['allergens'] as List<dynamic>? ?? [];

  final allergyFindings =
      assessment['allergyFindings'] as List<dynamic>? ?? [];

  final nutritionFindings =
      assessment['nutritionFindings'] as List<dynamic>? ?? [];

  final productName =
      product['productName']?.toString() ?? 'Unknown product';

  final brand =
      product['brand']?.toString() ?? '';

  final barcode =
      product['barcode']?.toString() ?? this.barcode;

  final nutritionBasis =
      product['nutritionBasis']?.toString() ?? '';

  final servingSize = serving['size'];
  final servingUnit =
      serving['unit']?.toString() ?? '';

  return Scaffold(
    appBar: AppBar(
      title: const Text('Food Details'),
    ),
    body: SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            // --------------------------------------------------
            // PRODUCT HEADER
            // --------------------------------------------------

            Text(
              productName,
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),

            if (brand.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                brand,
                style: Theme.of(context)
                    .textTheme
                    .bodyLarge,
              ),
            ],

            const SizedBox(height: 20),

            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  children: [
                    _InfoRow(
                      label: 'Barcode',
                      value: barcode,
                    ),
                    const SizedBox(height: 10),
                    _InfoRow(
                      label: 'Basis',
                      value: _formatBasis(nutritionBasis),
                    ),
                  ],
                ),
              ),
            ),

            // --------------------------------------------------
            // NUTRITION
            // --------------------------------------------------

            const SizedBox(height: 28),

            _SectionTitle(
              title: 'Nutrition',
              icon: Icons.monitor_heart_outlined,
            ),

            const SizedBox(height: 6),

            Text(
              _formatBasis(nutritionBasis),
              style: Theme.of(context)
                  .textTheme
                  .bodySmall,
            ),

            const SizedBox(height: 12),

            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  children: [
                    _NutritionRow(
                      label: 'Calories',
                      value: nutrition['calories'],
                      unit: 'kcal',
                    ),

                    _NutritionRow(
                      label: 'Protein',
                      value: nutrition['protein'],
                      unit: 'g',
                    ),

                    _NutritionRow(
                      label: 'Carbohydrates',
                      value: nutrition['carbohydrates'],
                      unit: 'g',
                    ),

                    _NutritionRow(
                      label: 'Sugars',
                      value: nutrition['sugars'],
                      unit: 'g',
                    ),

                    _NutritionRow(
                      label: 'Total Fat',
                      value: nutrition['totalFat'],
                      unit: 'g',
                    ),

                    _NutritionRow(
                      label: 'Saturated Fat',
                      value: nutrition['saturatedFat'],
                      unit: 'g',
                    ),

                    _NutritionRow(
                      label: 'Fiber',
                      value: nutrition['fiber'],
                      unit: 'g',
                    ),

                    _NutritionRow(
                      label: 'Sodium',
                      value: nutrition['sodium'],
                      unit: 'mg',
                    ),

                    _NutritionRow(
                      label: 'Cholesterol',
                      value: nutrition['cholesterol'],
                      unit: 'mg',
                    ),

                    _NutritionRow(
                      label: 'Iron',
                      value: nutrition['iron'],
                      unit: 'g',
                    ),

                    _NutritionRow(
                      label: 'Calcium',
                      value: nutrition['calcium'],
                      unit: 'g',
                    ),
                  ],
                ),
              ),
            ),

            // --------------------------------------------------
            // SERVING
            // --------------------------------------------------

            if (servingSize != null) ...[
              const SizedBox(height: 28),

              _SectionTitle(
                title: 'Serving Information',
                icon: Icons.restaurant_outlined,
              ),

              const SizedBox(height: 12),

              Card(
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Text(
                    '${_formatNumber(servingSize)} $servingUnit',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                ),
              ),
            ],

            // --------------------------------------------------
            // INGREDIENTS
            // --------------------------------------------------

            const SizedBox(height: 28),

            _SectionTitle(
              title: 'Ingredients',
              icon: Icons.list_alt_outlined,
            ),

            const SizedBox(height: 12),

            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Text(
                  ingredients['text']?.toString() ??
                      'Ingredient information is not available.',
                ),
              ),
            ),

            // --------------------------------------------------
            // FOOD COMPONENTS
            // --------------------------------------------------

            if (foodComponents.isNotEmpty) ...[
              const SizedBox(height: 28),

              _SectionTitle(
                title: 'Detected Food Components',
                icon: Icons.category_outlined,
              ),

              const SizedBox(height: 12),

              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: foodComponents
                    .map(
                      (component) => Chip(
                        avatar: const Icon(
                          Icons.check_circle_outline,
                          size: 18,
                        ),
                        label: Text(
                          _formatComponent(
                            component.toString(),
                          ),
                        ),
                      ),
                    )
                    .toList(),
              ),
            ],

            // --------------------------------------------------
            // DECLARED ALLERGENS
            // --------------------------------------------------

            if (allergens.isNotEmpty) ...[
              const SizedBox(height: 28),

              _SectionTitle(
                title: 'Declared Allergens',
                icon: Icons.warning_amber_outlined,
              ),

              const SizedBox(height: 12),

              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: allergens
                    .map(
                      (allergen) => Chip(
                        label: Text(
                          _formatComponent(
                            allergen.toString(),
                          ),
                        ),
                      ),
                    )
                    .toList(),
              ),
            ],

            // --------------------------------------------------
            // PERSONALIZED ASSESSMENT
            // --------------------------------------------------

            const SizedBox(height: 32),

            _SectionTitle(
              title: 'Personalized Assessment',
              icon: Icons.auto_awesome_rounded,
            ),

            const SizedBox(height: 12),

            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: _statusBackgroundColor(
                  overallStatus,
                ),
                borderRadius: BorderRadius.circular(22),
              ),
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                children: [
                  Icon(
                    _statusIcon(overallStatus),
                    size: 48,
                  ),

                  const SizedBox(height: 14),

                  Text(
                    _formatStatus(overallStatus),
                    style: Theme.of(context)
                        .textTheme
                        .headlineSmall
                        ?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),

                  const SizedBox(height: 8),

                  Text(summary),
                ],
              ),
            ),

            // --------------------------------------------------
            // FINDINGS
            // --------------------------------------------------

            if (allergyFindings.isNotEmpty) ...[
              const SizedBox(height: 20),

              Text(
                'Allergy Findings',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),

              const SizedBox(height: 10),

              ...allergyFindings.map(
                (finding) => _FindingCard(
                  icon: Icons.warning_amber_rounded,
                  title: finding['allergy']?.toString() ??
                      'Allergy detected',
                  subtitle:
                      finding['message']?.toString() ??
                          'Allergy component detected.',
                ),
              ),
            ],

            if (nutritionFindings.isNotEmpty) ...[
              const SizedBox(height: 20),

              Text(
                'Nutrition Findings',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),

              const SizedBox(height: 10),

              ...nutritionFindings.map(
                (finding) => _FindingCard(
                  icon: Icons.analytics_outlined,
                  title: finding['nutrient']?.toString() ??
                      'Nutrition rule',
                  subtitle:
                      finding['message']?.toString() ??
                          'Nutrition rule triggered.',
                ),
              ),
            ],

            const SizedBox(height: 28),

            const Text(
              'This assessment uses the available product '
              'information and your saved health profile. '
              'Missing information is not treated as zero.',
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    ),
  );
}
}
String _formatStatus(String status) {
  switch (status) {
    case 'AVOID':
      return 'AVOID';
    case 'CAUTION':
      return 'CAUTION';
    case 'NO_WARNING':
      return 'NO WARNING';
    default:
      return status;
  }
}


class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(
            label,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        Expanded(
          child: Text(value),
        ),
      ],
    );
  }
}


class _FindingCard extends StatelessWidget {
  const _FindingCard({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(subtitle),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
class _SectionTitle extends StatelessWidget {
  const _SectionTitle({
    required this.title,
    required this.icon,
  });

  final String title;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          icon,
          color: AppTheme.primaryGreen,
        ),
        const SizedBox(width: 10),
        Text(
          title,
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
      ],
    );
  }
}


class _NutritionRow extends StatelessWidget {
  const _NutritionRow({
    required this.label,
    required this.value,
    required this.unit,
  });

  final String label;
  final dynamic value;
  final String unit;

  @override
  Widget build(BuildContext context) {
    if (value == null) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Text(label),
          ),
          Text(
            '${_formatNumber(value)} $unit',
            style: const TextStyle(
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

String _formatNumber(dynamic value) {
  if (value == null) {
    return 'Not available';
  }

  final number = double.tryParse(value.toString());

  if (number == null) {
    return value.toString();
  }

  if (number == number.roundToDouble()) {
    return number.toInt().toString();
  }

  return number.toStringAsFixed(2);
}


String _formatBasis(String basis) {
  switch (basis) {
    case 'PER_100G':
      return 'Per 100 g';

    case 'PER_100ML':
      return 'Per 100 ml';

    case 'PER_SERVING':
      return 'Per serving';

    default:
      return basis;
  }
}


String _formatComponent(String value) {
  return value
      .replaceAll('-', ' ')
      .replaceAll('_', ' ')
      .split(' ')
      .map(
        (word) => word.isEmpty
            ? word
            : '${word[0].toUpperCase()}${word.substring(1)}',
      )
      .join(' ');
}


Color _statusBackgroundColor(String status) {
  switch (status) {
    case 'AVOID':
      return Colors.red.shade50;

    case 'CAUTION':
      return Colors.orange.shade50;

    default:
      return AppTheme.paleGreen;
  }
}


IconData _statusIcon(String status) {
  switch (status) {
    case 'AVOID':
      return Icons.warning_rounded;

    case 'CAUTION':
      return Icons.info_outline_rounded;

    default:
      return Icons.check_circle_outline_rounded;
  }
}