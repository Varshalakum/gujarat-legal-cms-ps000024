$pdfPath = "c:\Users\user1\Downloads\New folder\PS000024_Complete_MVP_Blueprint_v2.pdf"
$content = [System.IO.File]::ReadAllBytes($pdfPath)
$contentStr = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($content)

# Step 1: Decompress all streams
$streamPattern = "(?s)stream\r?\n(.+?)\r?\nendstream"
$streamMatches = [regex]::Matches($contentStr, $streamPattern)

$decompressedStreams = @()

foreach ($sm in $streamMatches) {
    try {
        $streamBytes = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes($sm.Groups[1].Value)
        $ms = New-Object System.IO.MemoryStream(,$streamBytes[2..($streamBytes.Length-1)])
        $ds = New-Object System.IO.Compression.DeflateStream($ms, [System.IO.Compression.CompressionMode]::Decompress)
        $outMs = New-Object System.IO.MemoryStream
        $ds.CopyTo($outMs)
        $ds.Close()
        $decompressedBytes = $outMs.ToArray()
        $decompressed = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($decompressedBytes)
        $outMs.Close()
        $decompressedStreams += $decompressed
    } catch {
        # Skip
    }
}

Write-Host "Decompressed $($decompressedStreams.Count) streams"

# Step 2: Parse all ToUnicode CMaps
# Build a combined mapping: glyph hex code -> unicode char
$glyphMap = @{}

foreach ($stream in $decompressedStreams) {
    if ($stream -notmatch "beginbfchar|beginbfrange") { continue }
    
    # Parse beginbfchar ... endbfchar
    $bfcharMatches = [regex]::Matches($stream, "(?s)beginbfchar\s*\n(.+?)\nendbfchar")
    foreach ($bfc in $bfcharMatches) {
        $lines = $bfc.Groups[1].Value -split "`n"
        foreach ($line in $lines) {
            $line = $line.Trim()
            if ($line -match "^<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>") {
                $srcHex = $Matches[1].ToUpper()
                $dstHex = $Matches[2]
                # Convert destination hex to unicode char
                $charCode = [Convert]::ToInt32($dstHex, 16)
                $char = [char]$charCode
                $glyphMap[$srcHex] = $char
            }
        }
    }
    
    # Parse beginbfrange ... endbfrange
    $bfrangeMatches = [regex]::Matches($stream, "(?s)beginbfrange\s*\n(.+?)\nendbfrange")
    foreach ($bfr in $bfrangeMatches) {
        $lines = $bfr.Groups[1].Value -split "`n"
        foreach ($line in $lines) {
            $line = $line.Trim()
            if ($line -match "^<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>") {
                $startHex = $Matches[1]
                $endHex = $Matches[2]
                $dstStartHex = $Matches[3]
                $startCode = [Convert]::ToInt32($startHex, 16)
                $endCode = [Convert]::ToInt32($endHex, 16)
                $dstCode = [Convert]::ToInt32($dstStartHex, 16)
                for ($i = $startCode; $i -le $endCode; $i++) {
                    $srcKey = $i.ToString("X2")
                    $glyphMap[$srcKey] = [char]($dstCode + ($i - $startCode))
                }
            }
        }
    }
}

Write-Host "Built glyph map with $($glyphMap.Count) entries"

# Step 3: Extract text from content streams using the glyph map
$allText = New-Object System.Collections.ArrayList

foreach ($stream in $decompressedStreams) {
    if ($stream -notmatch "BT") { continue }
    if ($stream -match "beginbfchar|beginbfrange") { continue }  # Skip CMap streams
    
    # Find all TJ arrays and Tj strings
    # TJ: [<hex>kern<hex>kern...] TJ
    $tjMatches = [regex]::Matches($stream, '\[([^\]]*)\]\s*TJ')
    foreach ($tj in $tjMatches) {
        $inner = $tj.Groups[1].Value
        $hexMatches = [regex]::Matches($inner, '<([0-9A-Fa-f]+)>')
        $line = ""
        foreach ($hm in $hexMatches) {
            $hexStr = $hm.Groups[1].Value.ToUpper()
            # Process 2 hex chars at a time (single byte glyph IDs)
            for ($i = 0; $i -lt $hexStr.Length; $i += 2) {
                $glyphHex = $hexStr.Substring($i, [Math]::Min(2, $hexStr.Length - $i))
                if ($glyphMap.ContainsKey($glyphHex)) {
                    $line += $glyphMap[$glyphHex]
                }
            }
        }
        if ($line.Trim().Length -gt 0) {
            [void]$allText.Add($line.Trim())
        }
    }
    
    # Tj: <hex> Tj
    $tjSingleMatches = [regex]::Matches($stream, '<([0-9A-Fa-f]+)>\s*Tj')
    foreach ($tjs in $tjSingleMatches) {
        $hexStr = $tjs.Groups[1].Value.ToUpper()
        $line = ""
        for ($i = 0; $i -lt $hexStr.Length; $i += 2) {
            $glyphHex = $hexStr.Substring($i, [Math]::Min(2, $hexStr.Length - $i))
            if ($glyphMap.ContainsKey($glyphHex)) {
                $line += $glyphMap[$glyphHex]
            }
        }
        if ($line.Trim().Length -gt 0) {
            [void]$allText.Add($line.Trim())
        }
    }
}

$result = $allText -join "`n"
$result | Out-File -FilePath "d:\Roshan\project\mvp_content.txt" -Encoding UTF8

Write-Host "Extracted $($allText.Count) text lines"
Write-Host "=== FULL CONTENT ==="
Write-Host $result
