⚔️ SISTEMA TACTICO 1812

SISTEMA TÁCTICO BELGRANO v1812.0 es una experiencia educativa interactiva gamificada. El usuario asume el rol de un comandante del Ejército del Norte durante el Éxodo Jujeño, resolviendo acertijos lógicos, matemáticos y de criptografía para asegurar la retirada estratégica y la supervivencia de la Revolución de Mayo.

🕹️ La Experiencia
La aplicación transporta al usuario a una interfaz de terminal retro-futurista de 1812 donde debe completar 10 misiones críticas:

Criptografía: Descifrado de órdenes usando el código César.

Logística de Guerra: Cálculos de suministros y táctica de "Tierra Quemada" mediante números primos.

Navegación Histórica: Seguimiento de rutas desde Jujuy hasta Tucumán basándose en fechas y distancias reales.

Estrategia en Tiempo Real: Gestión de batallones y detección de avances realistas.

🛠️ Tecnologías Utilizadas
React.js: Estructura de componentes y lógica de estado.

Framer Motion: Animaciones de entrada, transiciones de misiones y efectos de feedback ("shake" en errores).

Lucide React: Set de iconos tácticos consistentes.

Tailwind CSS: Estilizado de la interfaz oscura (Cyber-tactic style).

Lógica de Cifrado: Implementación manual de algoritmos de desplazamiento (César).

🚀 Instalación y Uso
Si quieres correr este sistema de comando en tu máquina local, sigue estos pasos:

Clonar el repositorio:

Bash
git clone https://github.com/tu-usuario/manuel-belgrano-1812.git
Instalar dependencias:

Bash
npm install
# o
yarn install
Asegúrate de tener instaladas las librerías necesarias:

Bash
npm install framer-motion lucide-react
Iniciar la terminal:

Bash
npm start
📂 Estructura del Archivo Principal
El archivo ManuelBelgrano.jsx contiene la arquitectura completa:

BOOT_LINES: Secuencia de inicio estética de la terminal.

MISSIONS: Array de objetos con la lógica de validación, pistas (hints) y "lore" histórico.

ASCII_MAP: Un mapa táctico visual que se revela al completar la victoria en la Batalla de Tucumán.

RadarPulse & Scanlines: Componentes visuales para la inmersión atmosférica.

🏛️ Contexto Histórico
Este proyecto busca homenajear la figura de Manuel Belgrano y el sacrificio del pueblo jujeño en 1812. Cada misión incluye un apartado de lore que explica la importancia real de ese paso en la historia argentina, desde la creación de la bandera hasta la victoria decisiva en la Batalla de Tucumán.

🛠️ Próximas Mejoras (Roadmap)
[ ] Implementar persistencia con localStorage.

[ ] Agregar efectos de sonido de terminal y ambiente de batalla.

[ ] Crear un modo "Supervivencia" con tiempo limitado.

[ ] Soporte multi-idioma (Español/Inglés).

"Ni la virtud ni los talentos tienen precio, ni pueden sujetarse a recompensa, cuando se emplean en obsequio de la patria." — Manuel Belgrano

Desarrollado con fines educativos y de preservación histórica.
