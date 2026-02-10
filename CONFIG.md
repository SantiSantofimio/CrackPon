# 📱 Cómo conectar CrackPon en múltiples dispositivos

## 1. Inicia el servidor
```bash
npm start
```

El servidor escuchará en el puerto 8080.

## 2. Obtén tu IP local
Ejecuta este comando en PowerShell para encontrar tu IP:
```powershell
ipconfig
```

Busca **IPv4 Address** bajo tu conexión de red (ej: 192.168.x.x)

## 3. Acceso desde dispositivos en la misma red

### En la computadora del servidor:
```
http://localhost:8080
```

### En otros dispositivos (smartphone, tablet, otra PC):
```
http://<TU_IP_LOCAL>:8080
```

Ejemplo: `http://192.168.1.50:8080`

## 4. Juega simultáneamente
- Abre CrackPon en 2 o más dispositivos
- Selecciona tu Mokepon
- ¡Explora el mapa y choca con otros jugadores para pelear!

## ⚠️ Notas importantes

- **Todos los dispositivos deben estar en la MISMA RED WiFi**
- Si está en una red empresarial/pública, podría no funcionar por firewall
- Socket.IO sincroniza los cambios en **tiempo real**

## 🔧 Solución de problemas

**No puedo conectar desde otro dispositivo:**
- Verifica que la IP sea correcta: `ipconfig`
- Comprueba que el puerto 8080 no esté bloqueado por firewall
- Intenta desactivar temporalmente el firewall de Windows

**Los jugadores no aparecen en el mapa:**
- Espera unos segundos a que se sincronicen
- Verifica que ambos dispositivos estén en la misma red

**Los ataques no se registran:**
- Asegúrate de que hay colisión entre Mokepones en el mapa
- Ambos deben haber seleccionado sus ataques
