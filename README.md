# Informe del Proyecto - Energía Colectiva

## 1. Información General del Proyecto

**Nombre del proyecto:** Energía Colectiva  
**Estudiante:** Agustina Ferraro  
**Fecha de inicio:** Marzo 2026  
**Objetivo principal:** Desarrollar un panel de administración para gestionar salas de experiencia musical en vivo, permitiendo crear, editar y compartir salas mediante códigos QR y enlaces, además de visualizar estadísticas en tiempo real sobre la energía colectiva de los participantes.

---

## 2. Problemática

Actualmente, los eventos musicales en vivo no cuentan con herramientas digitales que permitan medir la energía colectiva del público en tiempo real. Esto impide que los organizadores evalúen de forma objetiva la interacción de la audiencia durante un show y limita la posibilidad de ajustar la experiencia para generar una conexión más significativa.

Además, la ausencia de un sistema digital centralizado provoca que cada evento requiera configuraciones manuales, lo cual resulta ineficiente y propenso a errores. No existe una plataforma que permita:

- Crear y gestionar salas de experiencia musical
- Compartir accesos mediante códigos QR o enlaces
- Monitorear estadísticas de participación en tiempo real
- Centralizar la administración de estos datos

A partir de esta necesidad surge el proyecto Energía Colectiva, orientado a brindar una solución tecnológica integral.

---

## 3. Registro de Problemas

### 3.1 Problema #1

**Fecha:** 07/04/2026  
**Descripción:** El backend desplegado en Railway no respondía correctamente. Las solicitudes fallaban y la aplicación no lograba comunicarse con la API.  
**Objetivo:** Restaurar la comunicación entre frontend y backend en producción.  
**Contexto:** Al conectar el frontend (Vercel) con el backend (Railway), los requests devolvían errores constantes. Esto impedía guardar datos como perfiles, salas y estadísticas.  
**Impacto:** Bloqueo total de la funcionalidad persistente de la aplicación.  
**Alternativas exploradas:** Verificación del backend con curl, pruebas con distintos endpoints  
**Solución implementada:** Se identificó un problema de caché en la CDN (Fastly). Como solución temporal, se implementó un fallback a localStorage para mantener la funcionalidad en el frontend.  
**Aprendizajes:** La arquitectura debe contemplar mecanismos de fallback para garantizar resiliencia ante fallos externos.

### 3.2 Problema #2

**Fecha:** 08/04/2026  
**Descripción:** Los cambios realizados en la edición de salas no se guardaban correctamente.  
**Objetivo:** Asegurar la persistencia de datos entre pantallas.  
**Contexto:** Las salas podían crearse, pero no se guardaban correctamente al editarlas.  
**Impacto:** Deterioro de la experiencia de usuario y pérdida de funcionalidad clave.  
**Alternativas exploradas:** Revisión de lógica en localStorage, validación de claves utilizadas  
**Solución implementada:** Se detectó una inconsistencia en las keys. Se unificó el formato: `salas_{user.uid}_{profileName}`  
**Aprendizajes:** La consistencia en la nomenclatura de claves es fundamental para la persistencia de datos.

### 3.3 Problema #3

**Fecha:** 09/04/2026  
**Descripción:** Falta de personalización visual en las salas.  
**Objetivo:** Permitir personalizar fondos con colores o imágenes.  
**Contexto:** Todas las salas tenían el mismo fondo, dificultando su identificación.  
**Impacto:** Experiencia visual limitada y poco diferenciada.  
**Alternativas exploradas:** Sistema de colores, incorporación de imágenes  
**Solución implementada:** Se agregaron propiedades `color` e `image` a las salas y se actualizaron: DashboardScreen, SalaScreen, SalaEditScreen  
**Aprendizajes:** La personalización mejora significativamente la usabilidad y claridad visual.

### 3.4 Problema #4

**Fecha:** 09/04/2026  
**Descripción:** Inconsistencias en la interfaz de usuario entre pantallas.  
**Objetivo:** Estandarizar la UI mediante componentes reutilizables.  
**Contexto:** Cada pantalla tenía un header diferente.  
**Impacto:** Falta de coherencia visual y percepción poco profesional.  
**Alternativas:** Componentes reutilizables, headers independientes por pantalla  
**Solución implementada:** Se crearon: NavBar.jsx, BackButton.jsx y se Aplicaron en todas las pantallas principales.  
**Aprendizajes:** Los componentes reutilizables mejoran la mantenibilidad y coherencia del sistema.

### 3.5 Problema #5

**Fecha:** 14/04/2026  
**Descripción:** El BackButton se posicionaba incorrectamente sobre el NavBar.  
**Objetivo:** Ubicar correctamente el botón debajo del NavBar.  
**Contexto:** El orden visual no coincidía con el orden de renderizado.  
**Impacto:** Ruptura del layout esperado.  
**Alternativas:** Contenedor compartido, estilización independiente  
**Solución implementada:** Se ajustó el layout del BackButton con clases de contenedor equivalentes al NavBar.  
**Aprendizajes:** El orden de renderizado no define necesariamente la disposición visual.

### 3.6 Problema #6

**Fecha:** 15/04/2026  
**Descripción:** El color del perfil no se mostraba en el avatar del NavBar, aparecía en negro.  
**Objetivo:** Mostrar el color del perfil en el círculo del NavBar.  
**Contexto:** El NavBar siempre usaba `bg-zinc-800` en lugar del color del perfil.  
**Impacto:** El usuario no podía identificar su perfil visualmente.  
**Alternativas exploradas:** Revisar cómo se cargaba el perfil desde localStorage  
**Solución implementada:** Se modificó NavBar.jsx para usar `currentProfile?.color` como fondo del círculo avatar mediante style inline.  
**Aprendizajes:** Los valores por defecto deben verificarse en cada componente.

### 3.7 Problema #7

**Fecha:** 15/04/2026  
**Descripción:** Al guardar un perfil, no se actualizaba automáticamente en el NavBar.  
**Objetivo:** Actualización automática del perfil sin recargar.  
**Contexto:** El perfil editado no se reflejaba en el NavBar hasta recargar la página.  
**Impacto:** Confusión del usuario al no ver los cambios.  
**Alternativas exploradas:** Forzar actualización del contexto  
**Solución implementada:** En ProfileEditScreen, después de guardar, se actualiza `currentProfile` en el contexto de React y localStorage.  
**Aprendizajes:** Hay que mantener sincronizado el estado en múltiples ubicaciones.

### 3.8 Problema #8

**Fecha:** 15/04/2026  
**Descripción:** El NavBar estaba más abajo en estadísticas, editar sala y editar perfil que en otras pantallas.  
**Objetivo:** Alinear el NavBar en todas las pantallas.  
**Contexto:** Algunas pantallas usaban `pt-24` y otras no.  
**Impacto:** Inconsistencia visual.  
**Alternativas:** Revisar clases de padding  
**Solución implementada:** Se removió `pt-24` de StatsScreen, SalaEditScreen y ProfileEditScreen.  
**Aprendizajes:** Los valores por defecto deben ser consistentes desde el inicio.

### 3.9 Problema #9

**Fecha:** 15/04/2026  
**Descripción:** El BackButton tapaba el menú dropdown del NavBar.  
**Objetivo:** Que el menú dropdown sea clickeable.  
**Contexto:** El BackButton tenía mayor z-index que el dropdown.  
**Impacto:** No se podían usar las opciones del menú.  
**Alternativas exploradas:** Ajustar z-index del dropdown  
**Solución implementada:** 
1. Se puso `z-[500]` en el dropdown del NavBar
2. Se envolvió BackButton en `div className="pointer-events-none"` y el botón con `pointer-events-auto`
3. Se aplicó esta solución en DashboardScreen, SalaScreen, StatsScreen, SalaEditScreen, ProfileEditScreen  
**Aprendizajes:** Los eventos de puntero requieren manejo explícito en componentes superpuestos.

### 3.10 Problema #10

**Fecha:** 15/04/2026  
**Descripción:** El fondo de sala no se mostraba al editar perfil desde una sala.  
**Objetivo:** Mostrar el fondo de la sala al editar perfil.  
**Contexto:** ProfileEditScreen no tenía fondo.  
**Impacto:** Experiencia visual不一致.  
**Alternativas:** Agregar estado de sala  
**Solución implementada:** Se agregó `salaData` en ProfileEditScreen que se carga desde localStorage y se muestra el fondo.  
**Aprendizajes:** Las pantallas relacionadas deben mantener contexto visual.

### 3.11 Problema #11

**Fecha:** 15/04/2026  
**Descripción:** El botón volver en-link iba al dashboard en lugar de volver a la sala.  
**Objetivo:** Navegación coherente al volver.  
**Contexto:** El historial de navegación incluía /dashboard antes que /sala.  
**Impacto:** Navegación confusa.  
**Alternativas exploradas:** Usar `navigate(-1)`, guardar origen manualmente  
**Solución implementada:** 
1. Se creó LinkModal.jsx como ruta separada `/link`
2. Se implementó sistema `cameFrom` en DashboardScreen: `localStorage.setItem('cameFrom', 'dashboard')`
3. Cada pantalla usa este valor para navegar de vuelta  
**Aprendizajes:** El historial del navegador no siempre refleja la intención del usuario.

---

## 4. Recursos y Links

**Frontend (Vercel):** https://energia-colectiva.vercel.app  
**Backend (Railway):** https://tp-eventos-backend-production.up.railway.app  
**Repositorio Frontend:** https://github.com/agustiinaferraro/tp-eventos-frontend  
**Repositorio Backend:** https://github.com/agustiinaferraro/tp-eventos-backend  
**Presentación:** [Link a la presentación]

---

## 5. Glosario

- **API:** Interfaz de comunicación entre frontend y backend
- **Backend:** Lógica del servidor
- **CDN:** Red de distribución de contenido
- **Firebase:** Plataforma de autenticación
- **Frontend:** Interfaz visual
- **localStorage:** Almacenamiento en navegador
- **MongoDB:** Base de datos NoSQL
- **Railway:** Plataforma de backend
- **React:** Librería de interfaces
- **Socket.io:** Comunicación en tiempo real
- **UI:** Interfaz de usuario
- **Vercel:** Plataforma de frontend

---

## 6. Estado Actual del Proyecto

### 6.1 Funcionalidades implementadas

- Autenticación con Firebase
- Gestión de perfiles (crear, editar, eliminar)
- Gestión de salas (crear, editar, eliminar)
- Personalización visual (color e imagen de sala)
- Slider de brillo para fondos de sala
- Generación de QR
- Compartir enlaces (LinkModal separado)
- Estadísticas de salas
- UI consistente (NavBar + BackButton)
- Sistema de navegación `cameFrom`
- Fondo de sala en todas las pantallas relacionadas

### 6.2 Problemas pendientes

- Fallback a localStorage cuando Railway está caído (solucionado parcialmente)
- Imágenes solo se guardan en backend, no en localStorage

---

## 7. Conclusión

El desarrollo del proyecto presentó desafíos técnicos principalmente relacionados con el despliegue, la persistencia de datos y la consistencia visual. A pesar de los inconvenientes, se logró mantener la funcionalidad mediante estrategias como el uso de localStorage, demostrando la importancia de diseñar sistemas resilientes.

**Principales logros:**
- Sistema funcional de gestión de salas y perfiles
- Interfaz consistente con componentes reutilizables
- Personalización visual completa
- Sistema de compartición (QR y enlaces)
- Estadísticas de uso
- Navegación inteligente con `cameFrom`
- Fondo de sala en todas las pantallas relacionadas

El proyecto continúa en desarrollo, con foco en mejorar estabilidad, rendimiento y experiencia de usuario.

---

## 8. Mejoras a Futuro

- Optimización de estadísticas en tiempo real
- Mayor personalización de salas
- Mejor manejo de errores
- Tests automatizados
- Notificaciones push
- Soporte multiidiema
- Guardar imágenes en localStorage (cache)
- Sistema de temasoscuros

---

## 9. Comandos Git Utilizados

| Comando | Descripción |
|---------|-------------|
| `git log --oneline` | Historial de commits |
| `git status` | Estado de archivos |
| `git diff` | Cambios no stageados |
| `git add .` | Añadir cambios |
| `git commit -m "mensaje"` | Guardar cambios |
| `git push` | Subir cambios a GitHub |
| `git show HEAD:ruta` | Ver archivo en commit específico |

---

## 10. Estructura de Archivos (Actualizada)

```
frontend/src/
├── components/
│   ├── NavBar.jsx           # Barra de navegación con dropdown
│   ├── BackButton.jsx      # Botón volver
│   ├── DashboardScreen.jsx   # Gestión de salas
│   ├── SalaScreen.jsx       # Ver sala (QR, experiencia)
│   ├── SalaEditScreen.jsx   # Editar sala
│   ├── StatsScreen.jsx      # Estadísticas
│   ├── ProfilesScreen.jsx   # Selector de perfiles
│   ├── ProfileEditScreen.jsx  # Crear/editar perfil
│   ├── QRModal.jsx         # Modal de código QR
│   └── LinkModal.jsx        # Modal de copiar link (ruta separada)
├── context/
│   └── AuthContext.jsx      # Autenticación Firebase
├── utils/
│   └── api.js            # Funciones API
└── constants/
    └── index.js          # Constantes (COLORS, getBaseUrl)
```

---

## 11. Rutas del Frontend

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | AuthScreen | Login / Registro |
| `/profiles` | ProfilesScreen | Selector de perfiles |
| `/profiles/edit` | ProfileEditScreen | Crear/editar perfil |
| `/dashboard` | DashboardScreen | Gestión de salas |
| `/sala` | SalaScreen | QR y opciones de compartir |
| `/sala/edit` | SalaEditScreen | Editar sala |
| `/stats` | StatsScreen | Estadísticas |
| `/link` | LinkModal | Copiar link |

---

## 12. LocalStorage

| Clave | Descripción |
|-------|-------------|
| `currentProfile` | Perfil seleccionado actualmente |
| `currentSala` | Sala seleccionada actualmente |
| `cameFrom` | Origen de la navegación ('dashboard') |
| `profiles_{uid}` | Lista de perfiles del usuario |
| `salas_{perfil}` | Lista de salas del perfil |
| `savedAccounts` | Cuentas guardadas para cambio rápido |