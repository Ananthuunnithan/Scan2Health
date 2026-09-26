import 'package:flutter/material.dart';
import '../analytics/analytics_screen.dart';
import '../home/home_screen.dart';
import '../profile/profile_form_screen.dart';
import '../scan/scan_screen.dart';
class MainScreen extends StatefulWidget { const MainScreen({super.key}); @override State<MainScreen> createState() => _MainScreenState(); }
class _MainScreenState extends State<MainScreen> { int selected = 0; @override Widget build(BuildContext context) { final pages = [const HomeScreen(embedded: true), const ScanScreen(), const AnalyticsScreen(), const ProfileFormScreen()]; return Scaffold(body: SafeArea(child: pages[selected]), bottomNavigationBar: NavigationBar(selectedIndex: selected, onDestinationSelected: (index) => setState(() => selected = index), destinations: const [NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'), NavigationDestination(icon: Icon(Icons.document_scanner_outlined), selectedIcon: Icon(Icons.document_scanner), label: 'Scan'), NavigationDestination(icon: Icon(Icons.bar_chart_outlined), selectedIcon: Icon(Icons.bar_chart), label: 'Analytics'), NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile')])); } }
