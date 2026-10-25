import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:scan2health/screens/scan/scan_screen.dart';
import 'package:scan2health/screens/splash/splash_screen.dart';

void main() {
  testWidgets('shows the Scan2Health splash screen', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        title: 'Scan2Health',
        home: SplashScreen(autoNavigate: false),
      ),
    );

    expect(find.text('Scan2Health'), findsOneWidget);
    expect(find.text('Your healthier choices, simplified'), findsOneWidget);
  });

  testWidgets('requests grams when a PER_100G product has no serving size', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: AssessmentPreviewScreen(
          barcode: '123',
          assessment: {
            'product': {
              'nutritionBasis': 'PER_100G',
              'serving': {'size': null, 'unit': null},
            },
          },
          recommendations: const [],
        ),
      ),
    );

    await tester.ensureVisible(find.text('Add to Daily Intake'));
    await tester.tap(find.text('Add to Daily Intake'));
    await tester.pumpAndSettle();

    expect(find.text('Enter the amount consumed in g.'), findsOneWidget);
    expect(find.byType(TextField), findsOneWidget);
    expect(find.text('servings'), findsNothing);
    expect(find.text('How many servings did you consume?'), findsNothing);
  });

  testWidgets('rejects an empty custom amount in the intake dialog', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: AssessmentPreviewScreen(
          barcode: '123',
          assessment: {
            'product': {
              'nutritionBasis': 'PER_100G',
              'serving': {'size': null, 'unit': null},
            },
          },
          recommendations: const [],
        ),
      ),
    );

    await tester.ensureVisible(find.text('Add to Daily Intake'));
    await tester.tap(find.text('Add to Daily Intake'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Add'));
    await tester.pumpAndSettle();

    expect(find.text('Enter an amount greater than zero.'), findsOneWidget);
    expect(find.text('Enter the amount consumed in g.'), findsOneWidget);
  });

  testWidgets('submits a valid custom amount without a disposed controller', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: AssessmentPreviewScreen(
          barcode: '123',
          assessment: {
            'product': {
              'nutritionBasis': 'PER_100G',
              'serving': {'size': null, 'unit': null},
            },
          },
          recommendations: const [],
        ),
      ),
    );

    await tester.ensureVisible(find.text('Add to Daily Intake'));
    await tester.tap(find.text('Add to Daily Intake'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), '30');
    await tester.tap(find.widgetWithText(FilledButton, 'Add'));
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    expect(find.text('Add to Daily Intake'), findsOneWidget);
  });

  testWidgets(
    'requests millilitres when a PER_100ML product has no serving size',
    (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: AssessmentPreviewScreen(
            barcode: '123',
            assessment: {
              'product': {
                'nutritionBasis': 'PER_100ML',
                'serving': {'size': null, 'unit': null},
              },
            },
            recommendations: const [],
          ),
        ),
      );

      await tester.ensureVisible(find.text('Add to Daily Intake'));
      await tester.tap(find.text('Add to Daily Intake'));
      await tester.pumpAndSettle();

      expect(find.text('Enter the amount consumed in ml.'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
    },
  );

  testWidgets('retains serving-count entry for a product with a serving size', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: AssessmentPreviewScreen(
          barcode: '123',
          assessment: {
            'product': {
              'nutritionBasis': 'PER_100G',
              'serving': {'size': 50, 'unit': 'g'},
            },
          },
          recommendations: const [],
        ),
      ),
    );

    await tester.ensureVisible(find.text('Add to Daily Intake'));
    await tester.tap(find.text('Add to Daily Intake'));
    await tester.pumpAndSettle();

    expect(find.text('How many servings did you consume?'), findsOneWidget);
    expect(
      find.text('You can select 0.5, 1, 1.5, 2 servings, etc.'),
      findsOneWidget,
    );
    expect(find.byType(TextField), findsNothing);
  });

  testWidgets('shows an error for a missing nutrition basis', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: AssessmentPreviewScreen(
          barcode: '123',
          assessment: {
            'product': {
              'serving': {'size': null, 'unit': null},
            },
          },
          recommendations: const [],
        ),
      ),
    );

    await tester.ensureVisible(find.text('Add to Daily Intake'));
    await tester.tap(find.text('Add to Daily Intake'));
    await tester.pump();

    expect(
      find.text(
        'Cannot add intake because the product has no supported nutrition basis.',
      ),
      findsOneWidget,
    );
  });
}
