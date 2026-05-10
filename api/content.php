<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists(CONTENT_FILE)) {
        send_json(['ok' => false, 'error' => 'Content file not found.'], 404);
    }
    header('Content-Type: application/json; charset=utf-8');
    readfile(CONTENT_FILE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['ok' => false, 'error' => 'Method not allowed.'], 405);
}

require_admin();
$data = read_json_body();

$allowed = [
    'siteName', 'tagline', 'heroTitle', 'heroSubtitle', 'phone', 'whatsapp', 'instagram',
    'locationText', 'mapQuery', 'aboutTitle', 'aboutText', 'specialityTitle',
    'specialities', 'logoImage', 'heroImage', 'menuImage', 'contactImage', 'cakeImages', 'freshBakeImages'
];

$clean = [];
foreach ($allowed as $key) {
    if (!array_key_exists($key, $data)) {
        continue;
    }
    if (in_array($key, ['specialities', 'cakeImages', 'freshBakeImages'], true)) {
        $items = is_array($data[$key]) ? $data[$key] : [];
        $clean[$key] = array_values(array_filter(array_map(static fn($item) => trim((string)$item), $items)));
    } else {
        $clean[$key] = trim((string)$data[$key]);
    }
}

if (empty($clean['siteName'])) {
    send_json(['ok' => false, 'error' => 'Site name is required.'], 422);
}

$dir = dirname(CONTENT_FILE);
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

$json = json_encode($clean, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if (file_put_contents(CONTENT_FILE, $json, LOCK_EX) === false) {
    send_json(['ok' => false, 'error' => 'Could not save. Check folder permission for /data.'], 500);
}

send_json(['ok' => true, 'content' => $clean]);
