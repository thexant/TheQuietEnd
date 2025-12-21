$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Clean-Text($text) {
  $text = $text -replace '`([^`]+)`', '$1'
  $text = $text -replace '\*\*([^*]+)\*\*', '$1'
  $text = $text -replace '\*([^*]+)\*', '$1'
  $text = $text -replace '\[([^\]]+)\]\([^\)]+\)', '$1'
  $text = $text -replace '[_#>]', ''
  return $text.Trim()
}

function Get-Title($path) {
  $lines = Get-Content -Path $path -ErrorAction SilentlyContinue
  if (-not $lines) {
    return (Get-Item $path).BaseName -replace '[-_]', ' '
  }
  foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if (-not $trimmed) { continue }
    $match = [regex]::Match($trimmed, '^#{1,6}\s+(.*)$')
    if ($match.Success) {
      return (Clean-Text $match.Groups[1].Value)
    }
  }
  return (Get-Item $path).BaseName -replace '[-_]', ' '
}

function Get-Excerpt($path, [int]$limit = 180) {
  $text = Get-Content -Path $path -Raw -ErrorAction SilentlyContinue
  if (-not $text) { return '' }
  $text = [regex]::Replace($text, '(?s)```.*?```', '')
  $text = [regex]::Replace($text, '^#{1,6}.*$', '', 'Multiline')
  $text = [regex]::Replace($text, '^>\s?', '', 'Multiline')
  $text = Clean-Text $text
  $text = [regex]::Replace($text, '\s+', ' ')
  if ($text.Length -gt $limit) {
    return $text.Substring(0, $limit - 3) + '...'
  }
  return $text
}

function Get-SearchText($path) {
  $text = Get-Content -Path $path -Raw -ErrorAction SilentlyContinue
  if (-not $text) { return '' }
  $text = [regex]::Replace($text, '(?s)```.*?```', '')
  $text = [regex]::Replace($text, '^#{1,6}.*$', '', 'Multiline')
  $text = [regex]::Replace($text, '^>\s?', '', 'Multiline')
  $text = Clean-Text $text
  $text = [regex]::Replace($text, '\s+', ' ')
  return $text
}

$entries = @()
Get-ChildItem -Path $root -Recurse -File -Filter *.md | ForEach-Object {
  $path = $_.FullName
  if ($path -match '\\\.git\\' -or $path -match '\\node_modules\\' -or $path -match '\\vendor\\') {
    return
  }
  $relative = $path.Substring($root.Length)
  if ($relative.StartsWith('\') -or $relative.StartsWith('/')) {
    $relative = $relative.Substring(1)
  }
  $folder = [System.IO.Path]::GetDirectoryName($relative)
  if ([string]::IsNullOrWhiteSpace($folder) -or $folder -eq '.') {
    $folderLabel = 'Root'
    $relativeWithin = $relative
  } else {
    $folderLabel = $folder -replace '\\', '/'
    $relativeWithin = $relative.Substring($folder.Length + 1) -replace '\\', '/'
  }
  $updated = [int][Math]::Floor((($_.LastWriteTimeUtc) - [datetime]'1970-01-01').TotalSeconds)
  $entries += [ordered]@{
    relative = $relative -replace '\\', '/'
    title = Get-Title $path
    excerpt = Get-Excerpt $path
    search = Get-SearchText $path
    updated = $updated
    folder = $folderLabel
    relativeWithin = $relativeWithin
  }
}

$entries = $entries | Sort-Object -Property updated -Descending
$payload = [ordered]@{
  count = $entries.Count
  entries = $entries
}

$jsonPath = Join-Path $root 'lore-index.json'
$dataPath = Join-Path $root 'lore-index.data.js'
$json = $payload | ConvertTo-Json -Depth 6
Set-Content -Path $jsonPath -Value $json -Encoding UTF8
$js = 'window.LORE_ENTRIES = ' + $json + ';'
Set-Content -Path $dataPath -Value $js -Encoding UTF8
