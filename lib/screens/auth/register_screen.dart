import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../widgets/ui_controls.dart';
import '../main/main_screen.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget { const RegisterScreen({super.key}); @override State<RegisterScreen> createState() => _RegisterScreenState(); }
class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController(); final _emailController = TextEditingController(); final _passwordController = TextEditingController(); final _confirmPasswordController = TextEditingController(); final _authService = AuthService(); bool _isLoading = false;
  @override void dispose() { _nameController.dispose(); _emailController.dispose(); _passwordController.dispose(); _confirmPasswordController.dispose(); super.dispose(); }
  void _showMessage(String message) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message))); }
  Future<void> _register() async {
    if (_isLoading) return;
    final email = _emailController.text.trim();
    if (_nameController.text.trim().isEmpty || email.isEmpty || _passwordController.text.isEmpty || _confirmPasswordController.text.isEmpty) return _showMessage('Please complete all fields.');
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) return _showMessage('Please enter a valid email address.');
    if (_passwordController.text.length < 6) return _showMessage('Password must be at least 6 characters.');
    if (_passwordController.text != _confirmPasswordController.text) return _showMessage('Passwords do not match.');
    setState(() => _isLoading = true);
    try {
      await _authService.register(email: email, password: _passwordController.text);
      if (!mounted) return;
      _showMessage('Account created. A verification email has been sent.');
      Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const MainScreen()), (_) => false);
    } on AuthFailure catch (error) { _showMessage(error.message); }
    finally { if (mounted) setState(() => _isLoading = false); }
  }
  @override Widget build(BuildContext context) => AuthPage(title: 'Create Account', subtitle: 'Start your journey to a healthier you', fields: [
    AppTextField(hint: 'Full Name', icon: Icons.person_outline, controller: _nameController, enabled: !_isLoading, autofillHints: const [AutofillHints.name], textInputAction: TextInputAction.next), const SizedBox(height: 14),
    AppTextField(hint: 'Email', icon: Icons.email_outlined, controller: _emailController, enabled: !_isLoading, keyboardType: TextInputType.emailAddress, autofillHints: const [AutofillHints.email], textInputAction: TextInputAction.next), const SizedBox(height: 14),
    AppTextField(hint: 'Password', icon: Icons.lock_outline, controller: _passwordController, enabled: !_isLoading, password: true, autofillHints: const [AutofillHints.newPassword], textInputAction: TextInputAction.next), const SizedBox(height: 14),
    AppTextField(hint: 'Confirm Password', icon: Icons.lock_reset_outlined, controller: _confirmPasswordController, enabled: !_isLoading, password: true, textInputAction: TextInputAction.done, onFieldSubmitted: (_) => _register()),
  ], action: PrimaryButton(label: _isLoading ? 'Creating account...' : 'Create Account', onPressed: _isLoading ? null : _register), foot: Row(mainAxisAlignment: MainAxisAlignment.center, children: [const Text('Already have an account? '), TextButton(onPressed: _isLoading ? null : () => Navigator.of(context).pop(), child: const Text('Login'))]));
}
