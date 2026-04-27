<?php
// Get the data from the POST message
$post_data = json_decode(file_get_contents('php://input'), true);

if ($post_data) {
    $data = $post_data['filedata'];
    $name = $post_data['name'];

    $dir = "../data";

    // Create directory if it doesn't exist
    if (!is_dir($dir)) {
        mkdir($dir);
    }

    // Save file
    file_put_contents("{$dir}/{$name}", $data);
}
?>