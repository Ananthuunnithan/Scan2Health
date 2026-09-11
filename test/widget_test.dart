import 'package:flutter_test/flutter_test.dart';
import 'package:scan2health/app.dart';

void main() {
  testWidgets('shows the Scan2Health splash screen', (tester) async {
    await tester.pumpWidget(const Scan2HealthApp());

    expect(find.text('Scan2Health'), findsOneWidget);
    expect(find.text('Your healthier choices, simplified'), findsOneWidget);
  });
}
