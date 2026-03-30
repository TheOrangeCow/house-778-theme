<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    .custom-alert {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba( 0, 123, 255, 0.5);
        z-index: 9999;
        display: none;
        max-width: 400px;
        width: 100%;
    }

    .custom-alert h2 {
        text-align: center;
        color: #333;
        margin-bottom: 20px;
    }

    .custom-alert p {
        color: #777;
        font-size: 1rem;
        margin-bottom: 20px;
        text-align: center;
    }

    .custom-alert button {
        padding: 10px 20px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: block;
        margin: 0 auto;
    }

    .custom-alert button:hover {
        background-color: #0056b3;
    }
</style>
</head>
<body>
<div id="customAlert" class="custom-alert">
    <h2 id="alertTitle"></h2>
    <p id="alertMessage"></p>
    <button onclick="hideAlert()">Close</button>
</div>

<script>
    function showAlert(title, message) {
        document.getElementById("alertTitle").innerHTML = title;
        document.getElementById("alertMessage").innerHTML = message;
        document.getElementById("customAlert").style.display = "block";
    }
    function hideAlert() {
        document.getElementById("customAlert").style.display = "none";
    }
</script>
</body>
</html>
