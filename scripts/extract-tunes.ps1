Add-Type -AssemblyName System.IO.Compression.FileSystem

$docPath = Join-Path $PSScriptRoot "..\copy of forza tune database.txt"
$outPath = Join-Path $PSScriptRoot "..\scripts\tunes-extracted.json"

$zip = [System.IO.Compression.ZipFile]::OpenRead($docPath)
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$reader = [System.IO.StreamReader]::new($entry.Open())
$xml = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()

$xml2 = $xml -replace '</w:p>', "`n" -replace '<[^>]+>', '' -replace '&amp;', '&' -replace '&gt;', '>' -replace '&lt;', '<'

$lines = $xml2 -split '\n'
$results = [System.Collections.Generic.List[object]]::new()
$currentClass = 'Unknown'
$isCommunity = $false
$isOffroad = $false
$used = @{}

foreach ($rawLine in $lines) {
    $t = ($rawLine.Trim() -replace '\s{2,}', ' ')

    # Detect section headers
    if ($t -match 'CLASS') {
        if ($t -match '\bS2\b') { $currentClass = 'S2' }
        elseif ($t -match '\bS1\b') { $currentClass = 'S1' }
        elseif ($t -match 'A CLASS') { $currentClass = 'A' }
        elseif ($t -match 'B CLASS') { $currentClass = 'B' }
        $isCommunity = [bool]($t -match 'COMMUNITY')
        $isOffroad = [bool]($t -match 'OFFROAD|OFF-ROAD')
        continue
    }

    # Must have pipe and a share code
    if ($t -notmatch '\|') { continue }
    if ($t -notmatch '\d{3} \d{3} \d{3}') { continue }
    # Skip header/separator rows
    if ($t -match 'Share Code|Tune Name|^\s*-') { continue }

    $cols = $t -split '\|'
    $carName = $cols[0].Trim()
    $tuneName = if ($cols.Count -gt 1) { $cols[1].Trim() } else { '' }

    # Extract share code
    $code = ''
    foreach ($col in $cols) {
        if ($col -match '(\d{3}) (\d{3}) (\d{3})') {
            $code = "$($Matches[1])$($Matches[2])$($Matches[3])"
            break
        }
    }
    if (-not $code) { continue }
    if ($carName.Length -lt 2) { continue }
    if ($used.ContainsKey($code)) { continue }
    $used[$code] = $true

    $tunerName = 'Unknown'
    $drivetrain = 'Unknown'
    if ($isCommunity -and $cols.Count -gt 2) { $tunerName = $cols[2].Trim() }
    if ($isCommunity -and $cols.Count -gt 4) { $drivetrain = $cols[4].Trim() }

    $discipline = if ($isOffroad) { 'Offroad' } else { 'Road' }

    $results.Add([PSCustomObject]@{
        car_name   = $carName
        tune_name  = $tuneName
        tuner_name = $tunerName
        share_code = $code
        pi_class   = $currentClass
        drivetrain = $drivetrain
        discipline = $discipline
    })
}

Write-Host "Total parsed: $($results.Count)"

$results | ConvertTo-Json -Depth 3 | Set-Content -Encoding UTF8 $outPath
Write-Host "Saved to: $outPath"
