<?php
header('Content-Type: application/json; charset=utf-8');
$checks = [
    'php_working' => true,
    'php_version' => PHP_VERSION,
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'data_folder_writable' => is_writable(__DIR__ . '/data'),
    'uploads_folder_writable' => is_writable(__DIR__ . '/assets/uploads'),
    'content_file_exists' => file_exists(__DIR__ . '/data/site-content.json'),
    'api_folder_exists' => is_dir(__DIR__ . '/api'),
];
echo json_encode($checks, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
