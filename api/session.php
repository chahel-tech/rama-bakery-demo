<?php
require __DIR__ . '/config.php';

// GET checks current session without extending it.
// POST refreshes the session only while admin is active.
$refresh = $_SERVER['REQUEST_METHOD'] === 'POST';
$status = admin_session_status($refresh);
send_json(['ok' => true] + $status);
