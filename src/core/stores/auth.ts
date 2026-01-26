import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  type User 
} from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  // State: Holds the user object and any error messages
  const user = ref<User | null>(null);
  const authError = ref<string | null>(null);
  const isInitialized = ref(false);
  
  const auth = getAuth();

  // 1. Initialize: Checks if the user is already logged in when the app starts
  function init() {
    return new Promise<void>((resolve) => {
      onAuthStateChanged(auth, (u) => {
        user.value = u;
        isInitialized.value = true;
        resolve();
      });
    });
  }

  // 2. Register: Creates a new account
  async function register(email: string, pass: string) {
    authError.value = null; // Clear previous errors
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      // Firebase automatically logs them in after registration
    } catch (err: any) {
      authError.value = err.message;
      throw err; // Re-throw so the UI knows it failed
    }
  }

  // 3. Login: Signs in an existing user
  async function login(email: string, pass: string) {
    authError.value = null;
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      authError.value = "Invalid email or password.";
      throw err;
    }
  }

  // 4. Logout: Signs out
  async function logout() {
    await signOut(auth);
    user.value = null;
  }

  return { 
    user, 
    authError, 
    isInitialized, 
    init, 
    register, 
    login, 
    logout 
  };
});