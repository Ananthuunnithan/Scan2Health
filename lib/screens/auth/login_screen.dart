import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../services/auth_service.dart';
import '../../widgets/app_logo.dart';
import '../../widgets/ui_controls.dart';
import '../main/main_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;

  @override void dispose() { _emailController.dispose(); _passwordController.dispose(); super.dispose(); }
  bool get _hasValidEmail => RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(_emailController.text.trim());
  void _showMessage(String message) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message))); }

  Future<void> _login() async {
    if (_isLoading) return;
    if (!_hasValidEmail) return _showMessage('Please enter a valid email address.');
    if (_passwordController.text.isEmpty) return _showMessage('Please enter your password.');
    setState(() => _isLoading = true);
    try {
      await _authService.login(email: _emailController.text, password: _passwordController.text);
      if (mounted) Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const MainScreen()), (_) => false);
    } on AuthFailure catch (error) { _showMessage(error.message); }
    finally { if (mounted) setState(() => _isLoading = false); }
  }

  Future<void> _forgotPassword() async {
    if (_isLoading) return;
    if (!_hasValidEmail) return _showMessage('Enter your email address above, then try again.');
    setState(() => _isLoading = true);
    try { await _authService.sendPasswordResetEmail(_emailController.text); _showMessage('Password reset email sent. Please check your inbox.'); }
    on AuthFailure catch (error) { _showMessage(error.message); }
    finally { if (mounted) setState(() => _isLoading = false); }
  }

  @override Widget build(BuildContext context) => AuthPage(title: 'Welcome Back!', subtitle: 'Log in to continue your health journey', fields: [
    AppTextField(hint: 'Email', icon: Icons.email_outlined, controller: _emailController, enabled: !_isLoading, keyboardType: TextInputType.emailAddress, autofillHints: const [AutofillHints.email], textInputAction: TextInputAction.next),
    const SizedBox(height: 14),
    AppTextField(hint: 'Password', icon: Icons.lock_outline, controller: _passwordController, enabled: !_isLoading, password: true, autofillHints: const [AutofillHints.password], textInputAction: TextInputAction.done, onFieldSubmitted: (_) => _login()),
  ], action: PrimaryButton(label: _isLoading ? 'Logging in...' : 'Login', onPressed: _isLoading ? null : _login), foot: Row(mainAxisAlignment: MainAxisAlignment.center, children: [const Text("Don't have an account? "), TextButton(onPressed: _isLoading ? null : () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RegisterScreen())), child: const Text('Register'))]), extra: Align(alignment: Alignment.centerRight, child: TextButton(onPressed: _isLoading ? null : _forgotPassword, child: const Text('Forgot Password?'))));
}
class AuthPage extends StatelessWidget { const AuthPage({super.key, required this.title, required this.subtitle, required this.fields, required this.action, required this.foot, this.extra}); final String title, subtitle; final List<Widget> fields; final Widget action, foot; final Widget? extra;
  // ignore: use_null_aware_elements
  @override Widget build(BuildContext context) => Scaffold(body: SafeArea(child: SingleChildScrollView(padding: const EdgeInsets.fromLTRB(24, 36, 24, 24), child: Center(child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 460), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const AppLogo(), const SizedBox(height: 42), Text(title, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)), const SizedBox(height: 8), Text(subtitle, style: const TextStyle(color: AppTheme.muted)), const SizedBox(height: 30), ...fields, if (extra != null) extra!, const SizedBox(height: 12), action, const SizedBox(height: 24), const Row(children: [Expanded(child: Divider()), Padding(padding: EdgeInsets.symmetric(horizontal: 14), child: Text('OR', style: TextStyle(color: AppTheme.muted))), Expanded(child: Divider())]), const SizedBox(height: 20), const SocialButton(label: 'Continue with Google', icon: Icons.g_mobiledata_rounded), const SizedBox(height: 12), const SocialButton(label: 'Continue with Apple', icon: Icons.apple), const SizedBox(height: 22), foot]))))));
}
