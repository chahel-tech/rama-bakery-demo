<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['ok' => false, 'error' => 'POST request required.'], 405);
}

$data = read_json_body();
$username = trim((string)($data['username'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($username === ADMIN_USERNAME && password_verify($password, ADMIN_PASSWORD_HASH)) {
    session_regenerate_id(true);
    $_SESSION['rama_admin_logged_in'] = true;
    $_SESSION['rama_admin_last_activity'] = time();
    send_json([
        'ok' => true,
        'timeoutSeconds' => ADMIN_IDLE_TIMEOUT_SECONDS,
        'remainingSeconds' => ADMIN_IDLE_TIMEOUT_SECONDS
    ]);
}

send_json(['ok' => false, 'error' => 'Wrong username or password.'], 401);
