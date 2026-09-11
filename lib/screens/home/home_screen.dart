import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../models/nutrition_summary.dart';
import '../../widgets/nutrition_overview.dart';

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
        body: SafeArea(child: _tab == 0 ? const _Dashboard() : _PlaceholderPage(tab: _tab)),
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

class _Dashboard extends StatelessWidget {
  const _Dashboard();

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
          const NutritionOverview(summary: NutritionSummary(calories: 860, protein: 34, sugar: 21)),
          const SizedBox(height: 28),
          Text("Today's insight", style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),
          const Card(
            color: AppTheme.paleGreen,
            child: Padding(
              padding: EdgeInsets.all(18),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Icon(Icons.lightbulb_outline_rounded, color: AppTheme.primaryGreen),
                SizedBox(width: 12),
                Expanded(child: Text('You are close to your daily sugar limit. Choose a low-sugar snack if you scan one today.')),
              ]),
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
