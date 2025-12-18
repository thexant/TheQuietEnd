<?php
$root = __DIR__;

$entries = [];

$directory = new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS);
$iterator = new RecursiveIteratorIterator($directory);

foreach ($iterator as $fileInfo) {
    if (!$fileInfo->isFile()) {
        continue;
    }

    if (strtolower($fileInfo->getExtension()) !== 'md') {
        continue;
    }

    $path = $fileInfo->getPathname();

    if (strpos($path, DIRECTORY_SEPARATOR . '.git' . DIRECTORY_SEPARATOR) !== false) {
        continue;
    }

    if (strpos($path, DIRECTORY_SEPARATOR . 'node_modules' . DIRECTORY_SEPARATOR) !== false) {
        continue;
    }

    if (strpos($path, DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR) !== false) {
        continue;
    }

    $relative = substr($path, strlen($root) + 1);

    $entries[] = [
        'relative' => $relative,
        'title' => extractTitle($path),
        'excerpt' => extractExcerpt($path),
        'updated' => $fileInfo->getMTime(),
    ];
}

usort($entries, function ($a, $b) {
    return $b['updated'] <=> $a['updated'];
});

$sections = [];
foreach ($entries as $entry) {
    $folder = dirname($entry['relative']);
    if ($folder === '.' || $folder === DIRECTORY_SEPARATOR) {
        $folderLabel = 'Root';
        $relativeWithin = $entry['relative'];
    } else {
        $folderLabel = str_replace(DIRECTORY_SEPARATOR, '/', $folder);
        $relativeWithin = substr($entry['relative'], strlen($folder) + 1);
    }

    $entry['folder'] = $folderLabel;
    $entry['relativeWithin'] = str_replace(DIRECTORY_SEPARATOR, '/', $relativeWithin);

    if (!isset($sections[$folderLabel])) {
        $sections[$folderLabel] = [];
    }
    $sections[$folderLabel][] = $entry;
}

if (!empty($sections)) {
    $sectionKeys = array_keys($sections);
    natcasesort($sectionKeys);
    $orderedSections = [];
    if (in_array('Root', $sectionKeys, true)) {
        $orderedSections['Root'] = $sections['Root'];
    }
    foreach ($sectionKeys as $key) {
        if ($key === 'Root') {
            continue;
        }
        $orderedSections[$key] = $sections[$key];
    }
    $sections = $orderedSections;
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

function extractExcerpt($path) {
    $text = @file_get_contents($path);
    if ($text === false) {
        return '';
    }

    $text = preg_replace('/```[\s\S]*?```/', '', $text);
    $text = preg_replace('/^#{1,6}.*$/m', '', $text);
    $text = preg_replace('/^>\s?/m', '', $text);
    $text = cleanText($text);
    $text = preg_replace('/\s+/', ' ', $text);

    if (strlen($text) > 180) {
        $text = substr($text, 0, 177) . '...';
    }

    return $text;
}

function displayPath($relative) {
    return '/' . str_replace(DIRECTORY_SEPARATOR, '/', $relative);
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lore &amp; Fiction - The Quiet End</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=B612+Mono:wght@400;700&family=Share+Tech+Mono&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <header>
      <div class="signal"><a href="../index.html">Homepage</a> // Lore &amp; Fiction</div>
      <h1>Lore &amp; Fiction</h1>
      <p>
        Field logs, recovered transmissions, and corridor myths assembled for quick reference.
      </p>
    </header>

    <main>
      <section class="panel">
        <h2>Registry status</h2>
        <p>
          Total records detected: <?php echo count($entries); ?>. Monitor the archive for updates.
        </p>
      </section>

      <section class="index-grid">
        <?php if (count($entries) === 0) : ?>
          <div class="panel empty">
            No records detected. Awaiting archive intake.
          </div>
        <?php else : ?>
          <?php foreach ($sections as $sectionName => $sectionEntries) : ?>
            <details class="folder-group" open>
              <summary>
                <span class="folder-title"><?php echo htmlspecialchars($sectionName, ENT_QUOTES, 'UTF-8'); ?></span>
              </summary>
              <div class="index-grid">
                <?php foreach ($sectionEntries as $entry) : ?>
                  <a class="entry" href="view.php?doc=<?php echo rawurlencode($entry['relative']); ?>">
                    <div class="entry-meta">
                      <span class="path"><?php echo htmlspecialchars($entry['relativeWithin'], ENT_QUOTES, 'UTF-8'); ?></span>
                    </div>
                    <h3>
                      <?php echo htmlspecialchars($entry['title'], ENT_QUOTES, 'UTF-8'); ?>
                    </h3>
                    <p><?php echo htmlspecialchars($entry['excerpt'], ENT_QUOTES, 'UTF-8'); ?></p>
                    <div class="entry-footer">
                      <span>Last updated: <?php echo date('Y-m-d H:i', $entry['updated']); ?></span>
                    </div>
                  </a>
                <?php endforeach; ?>
              </div>
            </details>
          <?php endforeach; ?>
        <?php endif; ?>
      </section>
    </main>

  </body>
</html>
