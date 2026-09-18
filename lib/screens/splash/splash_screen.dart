import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../widgets/app_logo.dart';
import '../../services/auth_service.dart';
import '../auth/login_screen.dart';
import '../main/main_screen.dart';
class SplashScreen extends StatefulWidget { const SplashScreen({super.key}); @override State<SplashScreen> createState() => _SplashScreenState(); }
class _SplashScreenState extends State<SplashScreen> { final _authService = AuthService(); @override void initState() { super.initState(); _routeFromAuthState(); }
  Future<void> _routeFromAuthState() async { final user = await _authService.authStateChanges.first; await Future<void>.delayed(const Duration(milliseconds: 1400)); if (!mounted) return; final destination = user == null ? const LoginScreen() : const MainScreen(); Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => destination)); }
  @override Widget build(BuildContext context) => Scaffold(body: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [const AppLogo(), const SizedBox(height: 18), Text('Your healthier choices, simplified', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppTheme.muted)), const SizedBox(height: 44), const SizedBox(width: 28, height: 28, child: CircularProgressIndicator(strokeWidth: 3))]))); }
