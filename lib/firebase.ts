import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Phone authentication utilities
export class PhoneAuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private recaptchaRendered: boolean = false;

  // Initialize reCAPTCHA verifier (only once per page load)
  initializeRecaptcha(containerId: string = 'recaptcha-container') {
    if (typeof window !== 'undefined' && !this.recaptchaVerifier) {
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`reCAPTCHA container with id '${containerId}' not found`);
      }
      // Only create the verifier if not already rendered
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again
          console.log('reCAPTCHA expired');
        }
      });
      this.recaptchaRendered = true;
    }
    return this.recaptchaVerifier;
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<string> {
    try {
      // Only initialize if not already present
      if (!this.recaptchaVerifier) {
        this.initializeRecaptcha();
      }
      if (!this.recaptchaVerifier) {
        throw new Error('reCAPTCHA verifier not initialized');
      }
      // Render the verifier if not already rendered
      if (!this.recaptchaRendered) {
        await this.recaptchaVerifier.render();
        this.recaptchaRendered = true;
      }
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        this.recaptchaVerifier
      );
      // Store verification ID for later use
      return confirmationResult.verificationId;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      // Reset reCAPTCHA on error
      this.cleanup();
      throw new Error(error.message || 'Failed to send OTP');
    }
  }

  // Verify OTP and sign in
  async verifyOTP(verificationId: string, otp: string) {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      // Clean up reCAPTCHA after successful login
      this.cleanup();
      return result;
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw new Error(error.message || 'Invalid OTP');
    }
  }

  // Clean up reCAPTCHA verifier
  cleanup() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
      this.recaptchaRendered = false;
    }
  }
}

export const phoneAuthService = new PhoneAuthService();

export default app;