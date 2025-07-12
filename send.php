<?php
// Konfiguration
$empfaenger = "deine@email.de";  // ⬅️ Hier deine E-Mail eintragen
$betreff = "Neue Nachricht über beckerbyte.com";

// Nur POST zulassen
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Bot-Schutz (Honeypot)
    if (!empty($_POST['honeypot'])) {
        http_response_code(400);
        exit("Spam erkannt.");
    }

    // Eingaben validieren
    $email = filter_var(trim($_POST["email"]), FILTER_VALIDATE_EMAIL);
    $nachricht = trim($_POST["message"]);

    if (!$email || empty($nachricht)) {
        http_response_code(400);
        exit("Ungültige Eingabe.");
    }

    // Mailtext bauen
    $inhalt = "Von: $email\n\nNachricht:\n$nachricht";

    // Header setzen
    $header = "From: kontakt@beckerbyte.com\r\n";
    $header .= "Reply-To: $email";

    // Senden
    if (mail($empfaenger, $betreff, $inhalt, $header)) {
        http_response_code(200);
        echo "Nachricht gesendet.";
    } else {
        http_response_code(500);
        echo "Fehler beim Versand.";
    }
} else {
    http_response_code(405);
    echo "Nur POST erlaubt.";
}
?>
