<?php
    $server = "localhost";
    $username = "root";
    $password = "";
    $database = "hpac_sims";

    $conn = new mysqli ($server, $username, $password, $database);

    if ($conn->connect_error){
        die("Connection failed. Reason: " . $conn->connect_error);
    }

    // echo "Connected!\n";
?>