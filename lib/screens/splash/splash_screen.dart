
import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../services/auth_service.dart';
import '../../widgets/app_logo.dart';
import '../auth/login_screen.dart';
import '../main/main_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({
    super.key,
    this.authStateChanges,
    this.splashDuration = const Duration(milliseconds: 1400),
    this.autoNavigate = true,
  });

  final Stream<User?>? authStateChanges;
  final Duration splashDuration;

  // Disable automatic navigation when testing the splash UI alone.
  final bool autoNavigate;

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  Future<void> _routeFromAuthState() async {
    final authChanges =
        widget.authStateChanges ?? AuthService().authStateChanges;

    final user = await authChanges.first;

    await Future<void>.delayed(widget.splashDuration);

    if (!mounted) return;

    final destination =
        user == null ? const LoginScreen() : const MainScreen();

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => destination),
    );
  }

  @override
  void initState() {
    super.initState();

    if (widget.autoNavigate) {
      _routeFromAuthState();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const AppLogo(),
            const SizedBox(height: 18),
            Text(
              'Your healthier choices, simplified',
              style: Theme.of(context)
                  .textTheme
                  .bodyLarge
                  ?.copyWith(color: AppTheme.muted),
            ),
            const SizedBox(height: 44),
            const SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(strokeWidth: 3),
            ),
          ],
        ),
      ),
    );
  }
}
