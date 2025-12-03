<?php
// Conexão com o banco
$host = "sql211.infinityfree.com";
$user = "if0_40572272";
$pass = "yagocedup1";
$dbname = "if0_40572272_psicia_db";

$conn = new mysqli($host, $user, $pass, $dbname);

// Verifica erro
if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}
?>