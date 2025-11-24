<?php
session_start();

// Conexão com o banco
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "psicia_db";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

// Recebe dados do formulário
$usuario_email = $_POST['usuario_email'] ?? '';
$senha = $_POST['senha_usuario'] ?? '';

// Busca usuário no banco
$sql = "SELECT * FROM tb_usuarios WHERE nome_usuario = ? OR email_usuario = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $usuario_email, $usuario_email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // Verifica senha
    if (password_verify($senha, $user['senha_usuario'])) {

        // Login bem-sucedido
        $_SESSION['nome_usuario'] = $user['nome_usuario'];

        // PEGANDO AS INFORMAÇÕES do banco
        $nome = $user['nome_usuario'];
        $genero = $user['genero_usuario'] ?? "";
        $apelido = $user['apelido_usuario'] ?? "";

        // SALVANDO NO LOCALSTORAGE + REDIRECIONAMENTO
        echo "
        <script>
            localStorage.setItem('nomeUsuario', '$nome');
            localStorage.setItem('generoUsuario', '$genero');
            localStorage.setItem('apelido', '$apelido');
            window.location.href = '../index.html';
        </script>";
        exit();

    } else {
        echo "<script>alert('Senha incorreta!'); window.location.href='../html/login.html';</script>";
        exit();
    }
} else {
    echo "<script>alert('Usuário ou email não encontrado!'); window.location.href='../html/login.html';</script>";
    exit();
}

$stmt->close();
$conn->close();
?>
