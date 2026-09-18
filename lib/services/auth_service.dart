import 'package:firebase_auth/firebase_auth.dart';

/// A small boundary between the authentication UI and Firebase Authentication.
class AuthService {
  AuthService({FirebaseAuth? firebaseAuth})
    : _firebaseAuth = firebaseAuth ?? FirebaseAuth.instance;

  final FirebaseAuth _firebaseAuth;

  User? get currentUser => _firebaseAuth.currentUser;
  Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();

  Future<UserCredential> register({
    required String email,
    required String password,
  }) async {
    try {
      final credential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      await credential.user?.sendEmailVerification();
      return credential;
    } on FirebaseAuthException catch (error) {
      throw AuthFailure.fromFirebase(error);
    }
  }

  Future<UserCredential> login({
    required String email,
    required String password,
  }) async {
    try {
      return await _firebaseAuth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
    } on FirebaseAuthException catch (error) {
      throw AuthFailure.fromFirebase(error);
    }
  }

  Future<void> logout() => _firebaseAuth.signOut();

  Future<void> sendPasswordResetEmail(String email) async {
    try {
      await _firebaseAuth.sendPasswordResetEmail(email: email.trim());
    } on FirebaseAuthException catch (error) {
      throw AuthFailure.fromFirebase(error);
    }
  }
}

class AuthFailure implements Exception {
  const AuthFailure(this.message);
  final String message;

  factory AuthFailure.fromFirebase(FirebaseAuthException error) {
    const messages = {
      'invalid-email': 'Please enter a valid email address.',
      'weak-password': 'Password is too weak.',
      'email-already-in-use': 'This email is already registered.',
      'user-not-found': 'No account was found for this email address.',
      'wrong-password': 'Incorrect email or password.',
      'invalid-credential': 'Incorrect email or password.',
      'user-disabled': 'This account has been disabled.',
      'too-many-requests': 'Too many attempts. Please try again later.',
      'network-request-failed':
          'Network error. Please check your internet connection.',
    };
    return AuthFailure(
      messages[error.code] ??
          'Unable to complete this request. Please try again.',
    );
  }
}
