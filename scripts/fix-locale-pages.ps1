# Script para convertir páginas [locale] a locale fijo
param(
    [Parameter(Mandatory=$true)]
    [string]$LocaleCode,
    
    [Parameter(Mandatory=$true)]
    [string]$LocalePath
)

Write-Host "Procesando páginas para locale: $LocaleCode en $LocalePath"

# Buscar todos los archivos page.tsx en el directorio
$pageFiles = Get-ChildItem -Path $LocalePath -Filter "page.tsx" -Recurse

foreach ($file in $pageFiles) {
    Write-Host "Procesando: $($file.FullName)"
    
    $content = Get-Content -Path $file.FullName -Raw
    
    # Reemplazos comunes
    $content = $content -replace 'params: Promise<\{ locale: string \}>', ''
    $content = $content -replace 'interface \w+PageProps \{[^}]*params: Promise<\{ locale: string \}>;[^}]*\}', ''
    $content = $content -replace '\{ params \}: \w+PageProps', ''
    $content = $content -replace 'const \{ locale: localeStr \} = await params;', "const locale: Locale = '$LocaleCode'; // Locale fijo"
    $content = $content -replace 'const locale = localeStr as Locale;', ''
    $content = $content -replace 'params: \w+PageProps', ''
    $content = $content -replace 'generateMetadata\(\{ params \}: \w+PageProps\)', 'generateMetadata()'
    $content = $content -replace 'export default async function \w+Page\(\{ params \}: \w+PageProps\)', "export default async function $($LocaleCode.ToUpper())Page()"
    
    # Guardar cambios
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Procesamiento completado para $LocaleCode"
