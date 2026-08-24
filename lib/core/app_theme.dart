import 'package:flutter/material.dart';

abstract final class AppTheme {
  static const primaryGreen = Color(0xFF177A55);
  static const paleGreen = Color(0xFFE9F7F0);

  static ThemeData get lightTheme => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: primaryGreen),
        scaffoldBackgroundColor: const Color(0xFFF8FBF9),
        cardTheme: CardThemeData(
          elevation: 0,
          color: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
      );
}
