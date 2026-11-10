<?php
/**
 * Distrito Hotel — recepción del formulario de contacto.
 * Envía la solicitud por correo usando mail() de Hostinger y responde en JSON.
 * $DESTINO: correos que reciben la solicitud. $COPIA: correos en copia (Cc).
 */
$DESTINO = 'reservaciones@distritohotelaeropuerto.com, gerencia@distritohotelaeropuerto.com';
$COPIA   = 'programacionmkt@mediamaster.mx, gerenciamkt@mediamaster.mx, traffickermkt@mediamaster.mx';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function responder($ok, $msg, $code = 200) {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'mensaje' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}
function campo($k, $max = 500) {
    $v = isset($_POST[$k]) ? (string) $_POST[$k] : '';
    $v = trim(strip_tags($v));
    return function_exists('mb_substr') ? mb_substr($v, 0, $max) : substr($v, 0, $max);
}
function linea($v) { return str_replace(["\r", "\n"], ' ', $v); } // evita inyección de cabeceras

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') responder(false, 'Método no permitido.', 405);

// Anti-spam: campo trampa oculto y tiempo mínimo de llenado (3 s)
if (campo('sitio_web') !== '') responder(true, 'Gracias.');
$t = (int) campo('t', 20);
if ($t > 0 && (time() * 1000 - $t) < 3000) responder(false, 'Por favor intenta de nuevo.', 429);

$nombre   = linea(campo('nombre', 120));
$email    = linea(campo('email', 160));
$telefono = preg_replace('/[^0-9+()\s-]/', '', campo('telefono', 30));
$llegada  = campo('llegada', 10);
$salida   = campo('salida', 10);
$huesped  = (int) campo('huespedes', 3);
$habit    = linea(campo('habitacion', 60));
$mensaje  = campo('mensaje', 2000);
$acepto   = campo('acepto', 5);

if ($nombre === '' || ($email === '' && $telefono === '')) responder(false, 'Escribe tu nombre y un correo o teléfono.', 422);
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) responder(false, 'El correo no es válido.', 422);
if ($acepto === '') responder(false, 'Debes aceptar el Aviso de privacidad.', 422);

$cuerpo  = "Nueva solicitud desde el sitio web de Distrito Hotel\n";
$cuerpo .= "--------------------------------------------------\n";
$cuerpo .= "Nombre:      $nombre\n";
$cuerpo .= "Correo:      $email\n";
$cuerpo .= "Teléfono:    $telefono\n";
$cuerpo .= "Llegada:     $llegada\n";
$cuerpo .= "Salida:      $salida\n";
$cuerpo .= "Huéspedes:   " . ($huesped ?: '-') . "\n";
$cuerpo .= "Habitación:  $habit\n\n";
$cuerpo .= "Mensaje:\n$mensaje\n\n";
$cuerpo .= "Página: " . linea(campo('pagina', 200)) . "\n";
$cuerpo .= "Fecha:  " . date('Y-m-d H:i') . "\n";

$host = preg_replace('/^www\./', '', preg_replace('/[^a-z0-9.-]/i', '', $_SERVER['HTTP_HOST'] ?? 'distritohotelaeropuerto.com'));
$asunto = '=?UTF-8?B?' . base64_encode('Solicitud web: ' . $nombre) . '?=';
$cab  = "From: Distrito Hotel Web <no-reply@$host>\r\n";
if ($email !== '') $cab .= "Reply-To: $email\r\n";
$cab .= "Cc: $COPIA\r\n";
$cab .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n";

if (@mail($DESTINO, $asunto, $cuerpo, $cab)) {
    responder(true, '¡Gracias! Recibimos tu solicitud y te contactaremos muy pronto.');
}
responder(false, 'No pudimos enviar tu solicitud. Escríbenos por WhatsApp o llama al 442 673 7901.', 500);
