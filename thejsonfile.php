<?php
ini_set('display_errors', 1); 
ini_set('display_startup_errors', 1); 
error_reporting(E_ALL);
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$host = "127.0.0.1:3306";
$user = getenv('db_user');
$pass = getenv('db_pass');
$db = "settings";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(array('error' => 'Database connection failed'));
    exit;
}

session_start();
$username = $_GET['user'] ?? '';

if (empty($username)) {
    http_response_code(400);
    echo json_encode(array('error' => 'No username provided'));
    exit;
}

$stmt = $conn->prepare("SELECT * FROM user_preferences WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $userPreferences = $result->fetch_assoc();

    echo json_encode($userPreferences);
} else {
    http_response_code(404);
    echo json_encode(array('error' => 'User preferences not found'));
}

$stmt->close();
$conn->close();
?>
