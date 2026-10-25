import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../models/nutrition_summary.dart';
import '../../widgets/nutrition_overview.dart';
import '../scan/scan_screen.dart';
import '../profile/profile_screen.dart';
import '../../services/daily_nutrition_service.dart';
import '../history/history_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, this.embedded = false});
  final bool embedded;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) => widget.embedded ? const _Dashboard() : Scaffold(
    body: SafeArea(
      child: _tab == 0
          ? const _Dashboard()
          : _tab == 1
              ? const ScanScreen()
              : _tab == 2
                  ? const HistoryScreen()
                  : const ProfileScreen(),
    ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _tab,
          onDestinationSelected: (value) => setState(() => _tab = value),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.document_scanner_outlined), selectedIcon: Icon(Icons.document_scanner), label: 'Scan'),
            NavigationDestination(icon: Icon(Icons.history_outlined), selectedIcon: Icon(Icons.history), label: 'History'),
            NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
          ],
        ),
      );
}
class _Dashboard extends StatefulWidget {
  const _Dashboard();

  @override
  State<_Dashboard> createState() => _DashboardState();
}

class _DashboardState extends State<_Dashboard> {
  Map<String, dynamic>? _dailyNutrition;
  bool _isLoadingNutrition = true;
  String? _nutritionError;
  String? _assessmentError;
  Map<String, dynamic>? _dailyAssessment;


  Future<void> _loadDailyNutrition() async {
    final today = DateTime.now();
    final date =
        '${today.year.toString().padLeft(4, '0')}-'
        '${today.month.toString().padLeft(2, '0')}-'
        '${today.day.toString().padLeft(2, '0')}';

    // Load nutrition independently.
    try {
      final result =
          await DailyNutritionService.getDailyNutrition(date: date);

      if (!mounted) return;

      setState(() {
        _dailyNutrition = result['dailyNutrition'];
        _isLoadingNutrition = false;
        _nutritionError = null;
      });
    } catch (error) {
      if (!mounted) return;

      setState(() {
        _isLoadingNutrition = false;
        _nutritionError =
            error.toString().replaceFirst('Exception: ', '');
      });
    }

    // A failed assessment must not hide successfully loaded nutrition.
    try {
      final result =
          await DailyNutritionService.getDailyAssessment(date: date);

      if (!mounted) return;

      setState(() {
        _dailyAssessment = result['dailyAssessment'];
        _assessmentError = null;
      });
    } catch (error) {
      if (!mounted) return;

      setState(() {
        _dailyAssessment = null;
        _assessmentError =
            error.toString().replaceFirst('Exception: ', '');
      });
    }
  }


  @override
    void initState() {
      super.initState();
      _loadDailyNutrition();
    }

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const CircleAvatar(backgroundColor: AppTheme.paleGreen, child: Icon(Icons.eco_rounded, color: AppTheme.primaryGreen)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Good morning!', style: Theme.of(context).textTheme.bodyMedium),
              Text('Your healthy day starts here', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
            ])),
            const Icon(Icons.notifications_none_rounded),
          ]),
          const SizedBox(height: 28),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(color: AppTheme.primaryGreen, borderRadius: BorderRadius.circular(24)),
            child: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Icon(Icons.auto_awesome_rounded, color: Colors.white),
              SizedBox(height: 16),
              Text('Ready to make a smarter food choice?', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
              SizedBox(height: 8),
              Text('Scan a packaged product to understand its nutrition and ingredients.', style: TextStyle(color: Colors.white70)),
            ]),
          ),
          const SizedBox(height: 28),
          Text("Today's nutrition", style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),
          if (_isLoadingNutrition)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Center(
                  child: CircularProgressIndicator(),
                ),
              ),
            )
          else if (_nutritionError != null)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Unable to load today\'s nutrition',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(_nutritionError!),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: _loadDailyNutrition,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            )
          else
          NutritionOverview(
            summary: NutritionSummary(
              calories:
                  (_dailyNutrition?['totals']?['calories'] as num?)?.round(),
              protein:
                  (_dailyNutrition?['totals']?['protein'] as num?)?.round(),
              carbohydrates:
                  (_dailyNutrition?['totals']?['carbohydrates'] as num?)?.round(),
              sugar:
                  (_dailyNutrition?['totals']?['sugars'] as num?)?.round(),
              fiber:
                  (_dailyNutrition?['totals']?['fiber'] as num?)?.round(),
              sodium:
                  (_dailyNutrition?['totals']?['sodium'] as num?)?.round(),
            ),
          ),
            const SizedBox(height: 28),
          Text("Today's insight", style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),
          Card(
            color: AppTheme.paleGreen,
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.lightbulb_outline_rounded,
                    color: AppTheme.primaryGreen,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child:
                          Text(
                            _assessmentError != null
                                ? 'Unable to load today\'s nutrition assessment. Please try refreshing.'
                                : (_dailyAssessment?['primaryInsight']?['message']
                                            ?.toString()
                                            .trim()
                                            .isNotEmpty ==
                                        true)
                                    ? _dailyAssessment!['primaryInsight']['message'].toString()
                                    : _dailyAssessment == null
                                        ? 'Your nutrition insight is not available yet.'
                                        : 'No nutrition concern was detected for today.',
                          ),

                  ),
                ],
              ),
            ),
          ),
        ]),
      );
}

class _PlaceholderPage extends StatelessWidget {
  const _PlaceholderPage({required this.tab});
  final int tab;

  @override
  Widget build(BuildContext context) {
    const titles = ['Home', 'Scan a food product', 'Scan history', 'Your profile'];
    const messages = ['', 'Barcode and label scanning will be connected in the next frontend phase.', 'Products you analyze will appear here.', 'Your health profile will be built in the next frontend phase.'];
    const icons = [Icons.home, Icons.document_scanner_outlined, Icons.history, Icons.person_outline];
    return Center(child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(icons[tab], size: 72, color: AppTheme.primaryGreen),
        const SizedBox(height: 20),
        Text(titles[tab], style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
        const SizedBox(height: 10),
        Text(messages[tab], textAlign: TextAlign.center),
      ]),
    ));
  }
}
