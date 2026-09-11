import 'package:flutter/material.dart';

abstract final class AppTheme {
  static const primaryGreen = Color(0xFF1F8A55);
  static const paleGreen = Color(0xFFEAF7F0);
  static const ink = Color(0xFF24332D);
  static const muted = Color(0xFF728078);

  static ThemeData get lightTheme => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: primaryGreen, brightness: Brightness.light),
        scaffoldBackgroundColor: const Color(0xFFF8FBF9),
        textTheme: const TextTheme(bodyMedium: TextStyle(color: ink)),
        inputDecorationTheme: InputDecorationTheme(
          filled: true, fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 17),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFDCE6E0))),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFDCE6E0))),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: primaryGreen, width: 1.5)),
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          color: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
      );
}
