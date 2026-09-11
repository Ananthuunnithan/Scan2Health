import 'package:flutter/material.dart';

import 'core/app_theme.dart';
import 'screens/splash/splash_screen.dart';

class Scan2HealthApp extends StatelessWidget {
  const Scan2HealthApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'Scan2Health',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const SplashScreen(),
      );
}
