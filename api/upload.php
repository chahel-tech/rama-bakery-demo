<?php
require __DIR__ . '/config.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['ok' => false, 'error' => 'POST request required.'], 405);
}

if (empty($_FILES['image']) || !is_uploaded_file($_FILES['image']['tmp_name'])) {
    send_json(['ok' => false, 'error' => 'No image uploaded.'], 422);
}

$file = $_FILES['image'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    send_json(['ok' => false, 'error' => 'Upload error code: ' . $file['error']], 400);
}

if ($file['size'] > 10 * 1024 * 1024) {
    send_json(['ok' => false, 'error' => 'Image must be smaller than 10 MB.'], 422);
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
$allowed = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png'
];

if (!isset($allowed[$mime])) {
    send_json(['ok' => false, 'error' => 'Only JPG, JPEG and PNG images are allowed.'], 422);
}

if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

$originalName = pathinfo($file['name'], PATHINFO_FILENAME);
$safeName = preg_replace('/[^a-zA-Z0-9_-]+/', '-', strtolower($originalName));
$safeName = trim($safeName, '-');
if ($safeName === '') {
    $safeName = 'image';
}

$filename = $safeName . '-' . date('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.' . $allowed[$mime];
$destination = UPLOAD_DIR . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    send_json(['ok' => false, 'error' => 'Could not save uploaded image. Check /assets/uploads permission.'], 500);
}

send_json(['ok' => true, 'path' => UPLOAD_PUBLIC_PATH . $filename]);
