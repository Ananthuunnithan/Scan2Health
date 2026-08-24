import 'package:flutter_test/flutter_test.dart';
import 'package:scan2health/app.dart';

void main() {
  testWidgets('shows the Scan2Health dashboard', (tester) async {
    await tester.pumpWidget(const Scan2HealthApp());

    expect(find.text('Your healthy day starts here'), findsOneWidget);
    expect(find.text("Today's nutrition"), findsOneWidget);
  });
}
