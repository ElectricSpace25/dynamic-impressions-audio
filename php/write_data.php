<?php
// Get the data from the POST message
$post_data = json_decode(file_get_contents('php://input'), true);

if ($post_data) {
    $data = $post_data['filedata'];
    $id = $post_data['id'];

    $dir = "../data";
    $name = "{$dir}/{$id}.csv"; 

    // Create directory if it doesn't exist
    if (!is_dir($dir)) {
        mkdir($dir);
    }

    // Write the file to disk
    file_put_contents($name, $data);
}
?>