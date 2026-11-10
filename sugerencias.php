<?php
/**
 * Distrito Hotel — Buzón de sugerencias.
 * $DESTINO: quien recibe la sugerencia. $COPIA: correos en copia (Cc).
 */
$DESTINO = 'jeferecep@distritohotelaeropuerto.com';
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
function linea($v) { return str_replace(["\r", "\n"], ' ', $v); }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') responder(false, 'Método no permitido.', 405);
if (campo('sitio_web') !== '') responder(true, 'Gracias.');
$t = (int) campo('t', 20);
if ($t > 0 && (time() * 1000 - $t) < 3000) responder(false, 'Por favor intenta de nuevo.', 429);

$tipos = ['Sugerencia', 'Felicitación', 'Queja', 'Otro'];
$areas = ['Habitación', 'Recepción', 'Hangar Restaurante', 'Hangar Sport Bar', 'Gimnasio', 'Pantry', 'Sala de juntas', 'Transporte', 'Limpieza', 'Sitio web', 'Otra'];
$tipo   = in_array(campo('tipo', 30), $tipos, true) ? campo('tipo', 30) : 'Sugerencia';
$area   = in_array(campo('area', 40), $areas, true) ? campo('area', 40) : 'Otra';
$cal    = max(0, min(5, (int) campo('calificacion', 1)));
$texto  = campo('sugerencia', 3000);
$nombre = linea(campo('nombre', 120));
$email  = linea(campo('email', 160));
$tel    = preg_replace('/[^0-9+()\s-]/', '', campo('telefono', 30));
$habit  = linea(campo('habitacion_num', 20));
$contac = campo('contactar', 5) !== '' ? 'Sí' : 'No';
$acepto = campo('acepto', 5);

if (mb_strlen($texto) < 5) responder(false, 'Escribe tu sugerencia.', 422);
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) responder(false, 'El correo no es válido.', 422);
if (($nombre !== '' || $email !== '' || $tel !== '') && $acepto === '') responder(false, 'Para dejar tus datos acepta el Aviso de privacidad.', 422);

$cuerpo  = "Nuevo mensaje del Buzón de sugerencias — Distrito Hotel\n";
$cuerpo .= "--------------------------------------------------\n";
$cuerpo .= "Tipo:         $tipo\n";
$cuerpo .= "Área:         $area\n";
$cuerpo .= "Calificación: " . ($cal ? str_repeat('★', $cal) . str_repeat('☆', 5 - $cal) . " ($cal/5)" : 'Sin calificar') . "\n\n";
$cuerpo .= "Mensaje:\n$texto\n\n";
$cuerpo .= "Datos de contacto (opcionales)\n";
$cuerpo .= "Nombre:       " . ($nombre ?: '-') . "\n";
$cuerpo .= "Correo:       " . ($email ?: '-') . "\n";
$cuerpo .= "Teléfono:     " . ($tel ?: '-') . "\n";
$cuerpo .= "Habitación:   " . ($habit ?: '-') . "\n";
$cuerpo .= "¿Desea que lo contacten?: $contac\n\n";
$cuerpo .= "Página: " . linea(campo('pagina', 200)) . "\n";
$cuerpo .= "Fecha:  " . date('Y-m-d H:i') . "\n";

$host = preg_replace('/^www\./', '', preg_replace('/[^a-z0-9.-]/i', '', $_SERVER['HTTP_HOST'] ?? 'distritohotelaeropuerto.com'));
$asunto = '=?UTF-8?B?' . base64_encode("Buzón de sugerencias: $tipo · $area") . '?=';
$cab  = "From: Distrito Hotel Buzón <no-reply@$host>\r\n";
if ($email !== '') $cab .= "Reply-To: $email\r\n";
$cab .= "Cc: $COPIA\r\n";
$cab .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n";

if (@mail($DESTINO, $asunto, $cuerpo, $cab)) {
    responder(true, '¡Gracias! Tu mensaje nos ayuda a mejorar.');
}
responder(false, 'No pudimos enviar tu mensaje. Intenta más tarde o escríbenos por WhatsApp al 427 203 9932.', 500);
