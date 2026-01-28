const API_BASE_URL = 'http://210.131.214.117:3000/api';

const Auth = {
    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('role', data.role);
                return { success: true };
            }
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Login Error:', error);
            return { success: false, message: 'サーバーに接続できません' };
        }
    },
    logout() {
        localStorage.clear();
        window.location.href = '/login.html';
    }
};
