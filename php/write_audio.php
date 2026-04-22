<?php

// Get the data from the POST message
$post_data = json_decode(file_get_contents('php://input'), true);
$data = $post_data['filedata']; 
$name = $post_data['name'];

// Decode into binary audio
$decodedData = base64_decode($data);

// Save audio file
file_put_contents("../data/{$name}", $decodedData);

?>