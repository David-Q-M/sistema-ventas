# Script to restart Sistema Ventas

echo "Stopping existing node/java processes..."
Get-Process -Name "java", "node" -ErrorAction SilentlyContinue | Stop-Process -Force

echo "Starting Backend..."
Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory "c:\Users\david\OneDrive\Documentos\Sistema-Ventas\sistemaVentas" -NoNewWindow
Start-Sleep -Seconds 15

echo "Starting Frontend..."
Start-Process -FilePath "ng" -ArgumentList "serve -o" -WorkingDirectory "c:\Users\david\OneDrive\Documentos\Sistema-Ventas\sistemaventas-frontend" -NoNewWindow

echo "Sistema reiniciado. Espera a que se abra el navegador."
