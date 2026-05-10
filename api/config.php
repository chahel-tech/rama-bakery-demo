<?php
// Rama's Bakery admin configuration.
// IMPORTANT: Change ADMIN_PASSWORD_HASH before handing this to a real client.
// To generate a new hash on GoDaddy/cPanel Terminal or local PHP:
// php -r 'echo password_hash("YOUR_NEW_PASSWORD", PASSWORD_DEFAULT), PHP_EOL;'

session_start();

// Auto logout time for admin panel. 15 minutes = 15 * 60 seconds.
// Change this value if the client wants a longer/shorter login time.
const ADMIN_IDLE_TIMEOUT_SECONDS = 15 * 60;

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH = '$2y$12$k9KpqbtQi9.JXWpvaDZp5.6JqWpumlm4sSb2x5Ds7v5MifyyWEZ7K'; // password: Rama@123
const CONTENT_FILE = __DIR__ . '/../data/site-content.json';
const UPLOAD_DIR = __DIR__ . '/../assets/uploads/';
const UPLOAD_PUBLIC_PATH = 'assets/uploads/';

function send_json(array $payload, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function destroy_admin_session(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}

function admin_session_status(bool $refresh = false): array {
    if (empty($_SESSION['rama_admin_logged_in'])) {
        return [
            'loggedIn' => false,
            'expired' => false,
            'timeoutSeconds' => ADMIN_IDLE_TIMEOUT_SECONDS,
            'remainingSeconds' => 0
        ];
    }

    $now = time();
    $lastActivity = (int)($_SESSION['rama_admin_last_activity'] ?? $now);
    $idleSeconds = max(0, $now - $lastActivity);

    if ($idleSeconds >= ADMIN_IDLE_TIMEOUT_SECONDS) {
        destroy_admin_session();
        return [
            'loggedIn' => false,
            'expired' => true,
            'timeoutSeconds' => ADMIN_IDLE_TIMEOUT_SECONDS,
            'remainingSeconds' => 0
        ];
    }

    if ($refresh) {
        $_SESSION['rama_admin_last_activity'] = $now;
        $idleSeconds = 0;
    }

    return [
        'loggedIn' => true,
        'expired' => false,
        'timeoutSeconds' => ADMIN_IDLE_TIMEOUT_SECONDS,
        'remainingSeconds' => max(0, ADMIN_IDLE_TIMEOUT_SECONDS - $idleSeconds)
    ];
}

function require_admin(): void {
    $status = admin_session_status(true);
    if (empty($status['loggedIn'])) {
        $message = !empty($status['expired'])
            ? 'Session expired because admin was inactive. Please login again.'
            : 'Unauthorized. Please login again.';
        send_json(['ok' => false, 'error' => $message], 401);
    }
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
