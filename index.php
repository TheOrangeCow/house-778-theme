<?php
    include "alert.php";
    include "../base/chech.php"; 
    include "../base/main.php";
    session_start();
    
    $host = "127.0.0.1:3306";
    $user = getenv('db_user');
    $pass = getenv('db_pass');
    $db = "settings";
    
    $conn = new mysqli($host, $user, $pass, $db);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    function hexToRgb($hex) {
        $hex = ltrim($hex, '#');
        if (strlen($hex) === 3) {
            $hex = str_repeat($hex[0], 2) . str_repeat($hex[1], 2) . str_repeat($hex[2], 2);
        }
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));
        return ['r' => $r, 'g' => $g, 'b' => $b, 'a' => 0.5];
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $mode = $_POST['mode'];
        $background_mode = $_POST['background_mode'] ?? '#000000';
        $background_mode_secondary = $_POST['background_mode_secondary'] ?? '#000000';
    
        $concolor = hexToRgb($_POST['concolor'] ?? '#ffffff');
        $concolor2 = "rgba({$concolor['r']}, {$concolor['g']}, {$concolor['b']}, {$concolor['a']})";
    
        $textcolor = $_POST['textcolor'] ?? '#000000';
        $buttoncolor = $_POST['buttoncolor'] ?? '#ffffff';
        
        $inputcolor =  $_POST['inputcolor'] ?? '#ffffff';
        $inputcolor2 = $_POST['inputcolor2'] ?? '#000000';
        $username = $_SESSION['username'];
    
        if (stripos($username, "Guest") === false) {
            if ($_POST['background_type'] === 'gradient') {
                $background_color1 = $_POST['background_color1'];
                $background_color2 = $_POST['background_color2'];
                $background_color3 = $_POST['background_color3'];
                $background = "$background_color1 _ $background_color2 _ $background_color3";
            } else {
                $background_color = $_POST['background_color'];
                $background = $background_color;
            }
    
            $stmt = $conn->prepare("REPLACE INTO user_preferences (username, mode, background, mode_color, background_mode_secondary, concolor, textcolor, buttoncolor, inputcolor, inputcolor2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param(
                "ssssssssss", 
                $username, 
                $mode, 
                $background, 
                $background_mode, 
                $background_mode_secondary, 
                $concolor2, 
                $textcolor, 
                $buttoncolor, 
                $inputcolor, 
                $inputcolor2
            );
            
            $stmt->execute();
            $stmt->close();
        } else {
            echo "<script>showAlert('Error', 'You have to have an account to choose your theme.');</script>";
        }
    }
    
    function rgbaToHex($rgba) {
        preg_match('/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/', $rgba, $matches);
        if ($matches) {
            $r = (int)$matches[1];
            $g = (int)$matches[2];
            $b = (int)$matches[3];
            return sprintf("#%02x%02x%02x", $r, $g, $b);
        }
        return null;
    }
    
    $stmt = $conn->prepare("SELECT * FROM user_preferences WHERE username = ?");
    $stmt->bind_param("s", $_SESSION['username']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $userPreferences = $result->fetch_assoc() ?? [
        'mode' => 'dots',
        'background' => '#000000',
        'mode_color' => '#ffffff',
        'background_mode_secondary' => '#ABABAB',
        'concolor' => 'rgba(250,250,250,0.5)',
        'textcolor' => '#000000',
        'buttoncolor' => '#ffffff',
        'inputcolor' => '#ffffff',
        'inputcolor2' => '#000000',
    ];
    
    $stmt->close();
    $conn->close();
    
    $mode = $userPreferences['mode'];
    $background = $userPreferences['background'];
    $background_mode = $userPreferences['mode_color'];
    $background_mode_secondary = $userPreferences['background_mode_secondary'];
    $concolor_value = rgbaToHex($userPreferences['concolor']);
    $textcolor = $userPreferences['textcolor'];
    $buttoncolor = $userPreferences['buttoncolor'];
    $inputcolor = $userPreferences['inputcolor'];
    $inputcolor2 = $userPreferences['inputcolor2'];
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="style.css">
        <link rel="stylesheet" href="https://house-778.theorangecow.org/base/style.css">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap" rel="stylesheet">
        <link rel="icon" href="https://house-778.theorangecow.org/base/icon.ico" type="image/x-icon">
        <title>Theme</title>
    </head>
    <body>
    <canvas class="back" id="canvas"></canvas>
        <?php include '../base/sidebar.php'; ?>
        <div class="con">
            <button class="circle-btn" onclick="openNav()">☰</button>  
            <button class="home" onclick="window.location.href = 'https://house-778.theorangecow.org'">Home</button>
            <h1>Welcome, <?= htmlspecialchars($_SESSION['username']) ?> to setings</h1>
            <div>
                <form method="post">
                    <h2>Background</h2>
                    <label for="mode">Background mode:</label>
                    <select name="mode" id="mode">
                        <option value="dots" <?= $mode === 'dots' ? 'selected' : '' ?>>Dots</option>
                        <option value="dots_magnetic" <?= $mode === 'dots_magnetic' ? 'selected' : '' ?>>Dots magnetic</option>
                        <option value="particles" <?= $mode === 'particles' ? 'selected' : '' ?>>Particles</option>
                        <option value="dot_v3" <?= $mode === 'dot_v3' ? 'selected' : '' ?>>Dots text</option>
                        <option value="matrix" <?= $mode === 'matrix' ? 'selected' : '' ?>>Matrix</option>
                    </select><br><br>
                    <label for="background_type">Background Type:</label>
                    <select id="background_type" name="background_type" onchange="toggleBackgroundInputs()">
                        <option value="solid" <?= strpos($background, '_') === false ? 'selected' : '' ?>>Solid</option>
                        <option value="gradient" <?= strpos($background, '_') !== false ? 'selected' : '' ?>>Gradient</option>
                    </select><br><br>
                    <div id="solid_inputs" style="display: <?= strpos($background, '_') === false ? 'block' : 'none' ?>;">
                        <label for="background_color">Background color:</label>
                        <input type="color" id="background_color" name="background_color" value="<?= htmlspecialchars(strpos($background, '_') === false ? $background : '#000000') ?>"><br><br>
                    </div>
                    <div id="gradient_inputs" style="display: <?= strpos($background, '_') !== false ? 'block' : 'none' ?>;">
                        <label for="background_color1">Background color 1:</label>
                        <input type="color" id="background_color1" name="background_color1" value="<?= htmlspecialchars(strpos($background, ' _ ') !== false ? explode(' _ ', $background)[0] : '#000000') ?>">
                        
                        <label for="background_color2">Background color 2:</label>
                        <input type="color" id="background_color2" name="background_color2" value="<?= htmlspecialchars(strpos($background, ' _ ') !== false ? explode(' _ ', $background)[1] : '#000000') ?>">
                        
                        <label for="background_color3">Background color 3:</label>
                        <input type="color" id="background_color3" name="background_color3" value="<?= htmlspecialchars(strpos($background, ' _ ') !== false ? explode(' _ ', $background)[2] : '#000000') ?>"><br><br>
                    </div>
                    <label for="background_mode">Background mode color:</label>
                    <input type="color" id="background_mode" name="background_mode" value="<?= htmlspecialchars($background_mode) ?>">
                    <label for="background_mode_secondary">Background mode secondary color :</label>
                    <input type="color" id="background_mode_secondary" name="background_mode_secondary" value="<?= htmlspecialchars($background_mode_secondary) ?>"><br><br>
                    <h2>Foreground</h2>
                    <label for="concolor">Container:</label>
                    <input type="color" id="concolor" name="concolor" value="<?= htmlspecialchars($concolor_value) ?>"><br><br>
                    <label for="textcolor">Text:</label>
                    <input type="color" id="textcolor" name="textcolor" value="<?= htmlspecialchars($textcolor) ?>"><br><br>
                    <label for="buttoncolor">Button background:</label>
                    <input type="color" id="buttoncolor" name="buttoncolor" value="<?= htmlspecialchars($buttoncolor) ?>"><br><br>
                    <label for="inputcolor">Input background color:</label>
                    <input type="color" id="inputcolor" name="inputcolor" value="<?php echo htmlspecialchars($inputcolor); ?>"><br><br>
                    <label for="inputcolor2">Input color:</label>
                    <input type="color" id="inputcolor2" name="inputcolor2" value="<?php echo htmlspecialchars($inputcolor2); ?>"><br><br>
                    <button type="submit">Save Preferences</button>
                    <p>If your page glitches due to the old theme, press Ctrl + Shift + R.</p>
                </form>
            </div>
        </div>
    </body>
    <script>
        function toggleBackgroundInputs() {
            checkBackgroundType();
            const type = document.getElementById('background_type').value;
            document.getElementById('solid_inputs').style.display = type === 'solid' ? 'block' : 'none';
            document.getElementById('gradient_inputs').style.display = type === 'gradient' ? 'block' : 'none';
        }
        
        function checkBackgroundType() {
            const backgroundType = document.getElementById('background_type').value;
        }
        
        var bgmodecolor_value = "<?= htmlspecialchars($background_mode) ?>";
        var bgmodecolor2_value = "<?= htmlspecialchars($background_mode_secondary) ?>";
        let done = 5;
        
        function disabled() {
            const modeSelect = document.getElementById('mode');
            const bgmodecolor = document.getElementById('background_mode');
            const bgmodecolor2 = document.getElementById('background_mode_secondary');
        
            if (modeSelect.value === 'dot_v3') {
                if (done !== 0) {
                    done = 0;
                    bgmodecolor2.disabled = true;
                    bgmodecolor.disabled = false;
                    bgmodecolor.value = bgmodecolor_value;
                    bgmodecolor2.value = "#000000";
                }
            } else if (modeSelect.value === 'particles') {
                if (done !== 1) {
                    done = 1;
                    bgmodecolor.disabled = true;
                    bgmodecolor2.disabled = true;
                    bgmodecolor.value = "#000000";
                    bgmodecolor2.value = "#000000";
                }
            } else {
                if (done !== 2) {
                    done = 2;
                    bgmodecolor.disabled = false;
                    bgmodecolor2.disabled = false;
                    bgmodecolor.value = bgmodecolor_value;
                    bgmodecolor2.value = bgmodecolor2_value;
                }
            }
        }
        window.onload = function() {
            disabled();
            setInterval(disabled, 100);
        };
    </script>
    <script src="https://theme.house-778.theorangecow.org/background.js"></script>
    <script src="https://house-778.theorangecow.org/base/main.js"></script>
    <script src="https://house-778.theorangecow.org/base/sidebar.js"></script>
</html>
