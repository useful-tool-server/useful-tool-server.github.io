/**
 * Useful Tool Site - 共通システムスクリプト
 * 1. ログイン状態の監視
 * 2. 権限に基づいたアクセス制限 (URLガード)
 * 3. ログアウト処理
 */

(function() {
    // ページ読み込み時に即座に実行
    document.addEventListener('DOMContentLoaded', () => {
        checkAccessControl();
    });

    /**
     * アクセス制限ロジック
     */
    function checkAccessControl() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const userRole = sessionStorage.getItem('userRole'); // 'admin' or 'user'
        const path = window.location.pathname;

        // --- 1. 未ログイン時の制限 ---
        // adminフォルダ内、または memo_ex.html への直接アクセスを禁止
        const isRestrictedPage = path.includes('/admin/') || path.includes('memo_ex.html');

        if (isRestrictedPage && !isLoggedIn) {
            alert('このページを表示するにはログインが必要です。');
            // login.htmlへリダイレクト（階層に応じてパスを調整）
            const prefix = path.includes('/tool/') || path.includes('/admin/') ? '../' : '';
            window.location.replace(prefix + 'login.html');
            return;
        }

        // --- 2. 一般ユーザーによる管理者ページへのアクセス制限 ---
        if (path.includes('/admin/') && userRole !== 'admin') {
            alert('管理者権限がありません。');
            window.location.replace('../index.html');
            return;
        }

        // --- 3. ログイン済みの場合のUI調整（任意） ---
        updateCommonUI(isLoggedIn);
    }

    /**
     * 全ページ共通のUI更新（ヘッダーのボタンなど）
     */
    function updateCommonUI(isLoggedIn) {
        const authStatusArea = document.getElementById('auth-status');
        if (!authStatusArea) return;

        if (isLoggedIn) {
            const username = sessionStorage.getItem('username') || 'User';
            authStatusArea.innerHTML = `
                <span style="margin-right:15px; font-size:0.8rem; color:#888;">Login: ${username}</span>
                <button onclick="handleLogout()" class="btn-secondary">ログアウト</button>
            `;
        }
    }
})();

/**
 * ログアウト処理（グローバル関数として定義）
 */
function handleLogout() {
    if (confirm('ログアウトしますか？')) {
        sessionStorage.clear();
        // ルートのindexへ戻るための計算
        const path = window.location.pathname;
        const prefix = path.includes('/tool/') || path.includes('/admin/') || path.includes('/qr_code/') ? '../' : '';
        window.location.replace(prefix + 'index.html');
    }
}