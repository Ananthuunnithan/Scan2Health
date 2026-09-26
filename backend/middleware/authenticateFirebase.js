const admin = require('firebase-admin');

// Application Default Credentials use GOOGLE_APPLICATION_CREDENTIALS, keeping
// service-account secrets out of source control.
if (!admin.apps.length) {
  admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'scan2health-2055c'
});
}

module.exports = async (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Authentication is required.' });

  try {
    req.firebaseUser = await admin.auth().verifyIdToken(token);
    return next();
  } catch (error) {
  console.error('========== FIREBASE TOKEN ERROR ==========');
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  console.error('==========================================');

  return res.status(401).json({
    success: false,
    message: 'Your session is invalid or has expired. Please sign in again.'
  });
} 
};
