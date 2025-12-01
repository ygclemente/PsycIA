<?php
// Conexão com o banco
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "psicia_db";

$conn = new mysqli($host, $user, $pass, $dbname);

// Verifica erro
if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}
?>