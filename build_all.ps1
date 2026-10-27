# build_all.ps1 : merges all project .sql files into ONE file (all_scripts.sql)
# Run it from the folder that contains your .sql files:
#   powershell -ExecutionPolicy Bypass -File .\build_all.ps1

$files = @(
    "create_table.sql",
    "ALTER.sql",
    "image.sql",
    "admins.sql",
    "insert_data.sql",
    "ddl_dml.sql",
    "indexes.sql",            # use ONE index file, not all three
    "VIEW.SQL",
    "view_data.sql",
    "functions.sql",
    "operators_aggregates.sql",
    "joins_subqueries.sql",
    "SUBQUEIRES.sql",
    "customer_order_details.sql",
    "inventory_validation.sql",
    "order_validation.sql",
    "payment_validation.sql",
    "payment_trigger.sql",
    "inventory_audit.sql"
)

$out = "all_scripts.sql"
if (Test-Path $out) { Remove-Item $out }

foreach ($f in $files) {
    if (Test-Path $f) {
        Add-Content -Path $out -Value "`r`n-- ==================== $f ====================`r`n" -Encoding UTF8
        Get-Content -Path $f -Raw | Add-Content -Path $out -Encoding UTF8
        Write-Host "Added $f"
    } else {
        Write-Host "SKIPPED (not found): $f" -ForegroundColor Yellow
    }
}

Write-Host "`nDone. Created $out"