/**
 * Useful Tool Site - 認証管理システム
 * サーバーとの通信およびローカルセッションの管理を担当
 */

const AUTH_CONFIG = {
    // UbuntuサーバーのIPに書き換え済み
    API_BASE_URL: 'http://210.131.214.117:3000/api'
};

const AuthService = {
    /**
     * ログイン実行
     * @param {string} username 
     * @param {string} password 
     */
    async login(username, password) {
        try {
            const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ログインに失敗しました');
            }

            const data = await response.json();

            // 成功時：セッションストレージに情報を格納
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', data.username);
            sessionStorage.setItem('userRole', data.role); // 'admin' or 'user'
            sessionStorage.setItem('authToken', data.token); // JWT等の認証トークン

            return { success: true };
        } catch (error) {
            console.error('Auth Error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * ログアウト実行
     */
    logout() {
        sessionStorage.clear();
        const prefix = window.location.pathname.includes('/tool/') || window.location.pathname.includes('/admin/') ? '../' : '';
        window.location.href = prefix + 'login.html';
    },

    /**
     * 認証ヘッダーの取得（APIリクエスト用）
     */
    getAuthHeader() {
        const token = sessionStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

window.handleLogout = AuthService.logout;
