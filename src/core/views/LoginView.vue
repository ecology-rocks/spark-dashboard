<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/core/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const mode = ref<'login' | 'register'>('login'); // Toggle between Login and Register

async function handleSubmit() {
    try {
        if (mode.value === 'login') {
            await auth.login(email.value, password.value);
        } else {
            await auth.register(email.value, password.value);
        }
        // If successful, go to Dashboard
        router.push('/');
    } catch (e) {
        // Error is handled in store, but we catch it here to stop the redirect
        console.error(e);
    }
}
</script>

<template>
    <div class="login-container">
        <div class="card">
            <h2>{{ mode === 'login' ? 'Login' : 'Create Account' }}</h2>

            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label>Email</label>
                    <input v-model="email" type="email" required placeholder="you@example.com" />
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input v-model="password" type="password" required placeholder="******" />
                </div>

                <p v-if="auth.authError" class="error">{{ auth.authError }}</p>

                <button type="submit" class="primary-btn">
                    {{ mode === 'login' ? 'Sign In' : 'Sign Up' }}
                </button>
            </form>

            <div class="toggle-mode">
                <p v-if="mode === 'login'">
                    New here? <a href="#" @click.prevent="mode = 'register'">Create an account</a>
                </p>
                <p v-else>
                    Already have an account? <a href="#" @click.prevent="mode = 'login'">Back to Login</a>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: #f4f4f4;
}

.card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.form-group input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}

.primary-btn {
    width: 100%;
    padding: 0.75rem;
    background: #2c3e50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

.primary-btn:hover {
    background: #34495e;
}

.error {
    color: red;
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.toggle-mode {
    margin-top: 1rem;
    text-align: center;
    font-size: 0.9rem;
}
</style>