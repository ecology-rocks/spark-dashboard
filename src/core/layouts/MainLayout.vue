<script setup lang="ts">
import { activePlugins } from '@/core/pluginLoader';
import { APP_CONFIG } from '@/config';
import { useAuthStore } from '@/core/stores/auth'; // <--- Check this

const auth = useAuthStore(); // <--- Check this
</script>

<template>
    <div class="app-shell">
        <aside class="sidebar">
            <div class="logo">
                <span class="app-icon">{{ APP_CONFIG.appIcon }}</span>
                <span class="app-name">{{ APP_CONFIG.appName }}</span>
            </div>

            <div class="user-section">
                <div v-if="auth.user" class="logged-in">
                    <p class="user-email">{{ auth.user.email }}</p>
                    <button @click="auth.logout" class="logout-btn">Logout</button>
                </div>
                <div v-else class="logged-out">
                    <router-link to="/login" class="login-btn">Login</router-link>
                </div>
            </div>

            <nav>
                <div class="nav-divider">Menu</div>
                <router-link to="/" class="nav-item">
                    Dashboard
                </router-link>

                <div class="nav-divider">Plugins</div>

                <template v-for="plugin in activePlugins" :key="plugin.manifest.id">
                    <router-link v-if="plugin.routes.length > 0" :to="plugin.routes[0]!.path" class="nav-item">
                        {{ plugin.manifest.name }}
                    </router-link>
                </template>
            </nav>
        </aside>

        <main class="content">
            <RouterView />
        </main>
    </div>
</template>

<style scoped>
.app-shell {
    display: flex;
    height: 100vh;
}

.sidebar {
    width: 250px;
    background: #f4f4f4;
    padding: 1rem;
    border-right: 1px solid #ddd;
}

.content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
}

.nav-item {
    display: block;
    padding: 0.5rem;
    text-decoration: none;
    color: #333;
    margin-bottom: 0.25rem;
}

.nav-item.router-link-active {
    background: #e0e0e0;
    font-weight: bold;
    border-radius: 4px;
}

.nav-divider {
    margin-top: 1.5rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    color: #666;
    font-weight: bold;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 2rem;
}

.user-section {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #ddd;
}

.user-email {
    font-size: 0.85rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    word-break: break-all;
}

.logout-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
}

.login-btn {
    display: block;
    background: #2c3e50;
    color: white;
    text-align: center;
    padding: 8px;
    border-radius: 4px;
    text-decoration: none;
}
</style>