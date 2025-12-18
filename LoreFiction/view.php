<?php
$root = __DIR__;
require_once __DIR__ . DIRECTORY_SEPARATOR . 'Parsedown.php';
$doc = isset($_GET['doc']) ? $_GET['doc'] : '';
$doc = str_replace("\0", '', $doc);
$doc = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $doc);

$target = $doc !== '' ? realpath($root . DIRECTORY_SEPARATOR . $doc) : false;
$valid = $target && strpos($target, $root . DIRECTORY_SEPARATOR) === 0 && strtolower(pathinfo($target, PATHINFO_EXTENSION)) === 'md';

if (!$valid) {
    http_response_code(404);
    $title = 'Record missing';
    $content = 'Requested record could not be found.';
    $updated = null;
} else {
    $content = file_get_contents($target);
    $title = extractTitle($target);
    $updated = filemtime($target);
}

if ($valid) {
    $parser = new Parsedown();
    $parser->setSafeMode(true);
    $markdownHtml = $parser->text($content);
} else {
    $markdownHtml = '<p>Requested record could not be found.</p>';
}

function cleanText($text) {
    $text = preg_replace('/`([^`]+)`/', '$1', $text);
    $text = preg_replace('/\*\*([^*]+)\*\*/', '$1', $text);
    $text = preg_replace('/\*([^*]+)\*/', '$1', $text);
    $text = preg_replace('/\[([^\]]+)\]\([^\)]+\)/', '$1', $text);
    $text = preg_replace('/[_#>]/', '', $text);
    return trim($text);
}

function extractTitle($path) {
    $handle = @fopen($path, 'r');
    if (!$handle) {
        return ucwords(str_replace(['-', '_'], ' ', pathinfo($path, PATHINFO_FILENAME)));
    }

    $title = '';
    while (($line = fgets($handle)) !== false) {
        $line = trim($line);
        if ($line === '') {
            continue;
        }

        if (preg_match('/^#{1,6}\s+(.*)$/', $line, $matches)) {
            $title = $matches[1];
            break;
        }
    }

    fclose($handle);

    if ($title === '') {
        $title = ucwords(str_replace(['-', '_'], ' ', pathinfo($path, PATHINFO_FILENAME)));
    }

    return cleanText($title);
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?> - Lore &amp; Fiction</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=B612+Mono:wght@400;700&family=Literata:wght@400;600&family=Share+Tech+Mono&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <header>
      <div class="signal">
        <a href="../index.html">Homepage</a> // <a href="index.php">Lore &amp; Fiction</a> // <?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?>
      </div>
      <h1>Record display</h1>
      <p>Recovered text follows. Return to the registry when finished.</p>
    </header>

    <main>
      <article class="article">
        <div class="article-header">
          <div class="breadcrumbs"><a href="index.php">Lore &amp; Fiction</a> / Record</div>
          <h1><?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?></h1>
          <div class="meta">
            <?php if ($updated !== null) : ?>
              Last updated: <?php echo date('Y-m-d H:i', $updated); ?>
            <?php else : ?>
              Status: unavailable
            <?php endif; ?>
          </div>
        </div>
        <div class="markdown">
          <?php echo $markdownHtml; ?>
        </div>
      </article>
    </main>

    <footer>
      Return to <a href="index.php">Lore &amp; Fiction</a>.
    </footer>
  </body>
</html>
