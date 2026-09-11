import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../widgets/app_logo.dart';
import '../auth/login_screen.dart';
class SplashScreen extends StatefulWidget { const SplashScreen({super.key}); @override State<SplashScreen> createState() => _SplashScreenState(); }
class _SplashScreenState extends State<SplashScreen> { @override void initState() { super.initState(); Timer(const Duration(milliseconds: 1400), () { if (mounted) Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen())); }); }
  @override Widget build(BuildContext context) => Scaffold(body: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [const AppLogo(), const SizedBox(height: 18), Text('Your healthier choices, simplified', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppTheme.muted)), const SizedBox(height: 44), const SizedBox(width: 28, height: 28, child: CircularProgressIndicator(strokeWidth: 3))]))); }
