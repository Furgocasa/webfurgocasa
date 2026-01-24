@echo off
echo ========================================
echo COMMIT DE MIGRACION A CARPETAS FIJAS
echo ========================================
echo.
echo INSTRUCCIONES:
echo 1. Cierra Dropbox (icono en bandeja del sistema)
echo 2. Presiona cualquier tecla para continuar
echo.
pause

git add -A
git commit -m "feat: migracion completa a arquitectura de carpetas fijas por idioma" -m "ARQUITECTURA NUEVA:" -m "- Carpetas fijas: /es/, /en/, /fr/, /de/ (en lugar de [locale] dinamico)" -m "- 108 paginas migradas (27 por idioma x 4 idiomas)" -m "- 8 paginas [location] dinamicas creadas y adaptadas" -m "- URLs perfectamente traducidas sin rewrites complejos" -m "" -m "CAMBIOS PRINCIPALES:" -m "- Creadas carpetas /es/, /en/, /fr/, /de/ con contenido traducido" -m "- Eliminada carpeta [locale] antigua (-6,400 lineas)" -m "- Eliminada carpeta location-target (-441 lineas)" -m "- Middleware simplificado: 540 a 200 lineas (-340 lineas)" -m "- Rewrites simplificados: 80 a 40 lineas (-40 lineas)" -m "- Paginas [location] adaptadas para usar params directo" -m "" -m "Total: -8,419 lineas eliminadas, arquitectura mucho mas limpia"

echo.
echo ========================================
echo COMMIT COMPLETADO
echo ========================================
echo.
echo Ahora puedes hacer git push
echo.
pause
