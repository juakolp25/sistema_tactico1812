import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Zap, MapPin, AlertTriangle, CheckCircle,
  Lock, Unlock, Radio, Target, Crosshair, ChevronRight,
  Terminal, Eye, Flame, Map, Star, Clock
} from "lucide-react";

// ─── CIFRADO CÉSAR ────────────────────────────────────────────────
const caesarEncrypt = (text, shift = 7) =>
  text.replace(/[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/g, (char) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÜÑ";
    const upper = char.toUpperCase();
    const idx = alphabet.indexOf(upper);
    if (idx === -1) return char;
    return alphabet[(idx + shift) % alphabet.length];
  });

const caesarDecrypt = (text, shift = 7) => caesarEncrypt(text, -shift + 33);

// ─── MISIONES ─────────────────────────────────────────────────────
const MISSIONS = [
  {
    id: 1,
    codename: "ALBA-01",
    title: "Reconocimiento Inicial",
    difficulty: 1,
    icon: Eye,
    description: "Las tropas realistas avanzan desde el norte. Identificá el año en que Belgrano recibió el mando del Ejército del Norte.",
    type: "number",
    hint: "El año en que San Martín también cruzaría los Andes... pero este suceso fue antes. Suma 1800 + 12.",
    answer: "1812",
    successMsg: "Comando confirmado. Belgrano asume mando en 1812. Posición verificada.",
    lore: "El 26 de enero de 1812, Manuel Belgrano recibió el mando del Ejército del Norte en Rosario, donde también izó por primera vez la bandera argentina.",
  },
  {
    id: 2,
    codename: "ORDEN-02",
    title: "Descifrar la Orden",
    difficulty: 2,
    icon: Lock,
    description: "Interceptaste un mensaje cifrado enemigo. Descifralo usando el código César (shift=7): ¿Qué letra sigue en la secuencia A-C-E-G-?",
    type: "text",
    hint: "Letras impares del abecedario. A(1), C(3), E(5), G(7)... la siguiente es la letra número 9.",
    answer: "I",
    successMsg: "Cifrado quebrado. Patrón enemigo identificado.",
    lore: "Belgrano utilizaba mensajeros con órdenes cifradas para coordinar la retirada sin que los realistas pudieran anticipar los movimientos.",
  },
  {
    id: 3,
    codename: "FUEGO-03",
    title: "Tierra Quemada — Fase I",
    difficulty: 3,
    icon: Flame,
    description: "Tenés 4 depósitos de suministros. Debés quemar exactamente los que sean número primo para negar recursos al enemigo. ¿Cuántos depósitos quemás? Depósitos: [2, 5, 8, 11, 13, 15, 17]",
    type: "number",
    hint: "Los primos son divisibles solo por 1 y por sí mismos. El 1 NO es primo.",
    answer: "5",
    successMsg: "5 depósitos incendiados. Tierra quemada ejecutada. El enemigo no avanzará.",
    lore: "La táctica de Tierra Quemada fue ordenada por Belgrano el 23 de agosto de 1812. Los jujeños sacrificaron sus cosechas, ganado y hogares antes que entregarlos al enemigo.",
  },
  {
    id: 4,
    codename: "RADIO-04",
    title: "Frecuencia Táctica",
    difficulty: 4,
    icon: Radio,
    description: "El Ejército del Norte partió de Jujuy el 23 de agosto y llegó a Tucumán el... Calculá: 23 agosto + 19 días = ¿qué día de septiembre?",
    type: "number",
    hint: "Agosto tiene 31 días. Del 23 al 31 de agosto son 8 días. Faltan 11 días más en septiembre.",
    answer: "11",
    successMsg: "Llegada calculada: 11 de septiembre de 1812. Ruta confirmada.",
    lore: "El Éxodo duró aproximadamente 19 días de marcha forzada por la quebrada. Más de 1500 personas acompañaron al ejército en este épico repliegue.",
  },
  {
    id: 5,
    codename: "VECTOR-05",
    title: "Interceptar Coordenadas",
    difficulty: 5,
    icon: Target,
    description: "El espía realista usa este código: cada número representa letras (A=1, B=2...). Decodificá: 2-5-12-7-18-1-14-15. ¿Qué palabra forma?",
    type: "text",
    hint: "B=2, E=5, L=12, G=7, R=18, A=1, N=14, O=15",
    answer: "BELGRANO",
    successMsg: "¡Identidad del comandante confirmada! BELGRANO. El enemigo conoce al líder.",
    lore: "Manuel Belgrano era el objetivo principal de los realistas. Su captura hubiera significado el fin de la resistencia patriota en el norte.",
  },
  {
    id: 6,
    codename: "NEXO-06",
    title: "Red de Suministros",
    difficulty: 6,
    icon: Crosshair,
    description: "Tenés que distribuir 840 soldados en columnas de igual tamaño. Las columnas deben ser más de 3 y menos de 10. ¿Cuántos soldados por columna si usás 7 columnas?",
    type: "number",
    hint: "840 dividido 7 = ?",
    answer: "120",
    successMsg: "Formación táctica: 7 columnas de 120 hombres. Repliegue coordinado activado.",
    lore: "El Ejército del Norte contaba con aproximadamente 1800 hombres en el Éxodo, sumados a civiles, milicianos y la heroica población jujeña.",
  },
  {
    id: 7,
    codename: "SOMBRA-07",
    title: "Doctrina de la Sombra",
    difficulty: 7,
    icon: AlertTriangle,
    description: "El patrón de movimiento realista sigue la secuencia: 3, 6, 12, 24, 48... ¿Cuántos días faltan cuando el valor llegue a 192 desde 48? (Contá los pasos)",
    type: "number",
    hint: "Cada número se duplica. 48→96→192. Contá cuántos pasos hay entre 48 y 192.",
    answer: "2",
    successMsg: "2 pasos detectados. Avance enemigo calculado. Contramedidas activadas.",
    lore: "Los realistas del general Tristán avanzaban en ondas de reconocimiento antes de comprometer fuerzas principales, una táctica que Belgrano aprendió a anticipar.",
  },
  {
    id: 8,
    codename: "ECLIPSE-08",
    title: "Noche de Eclipse",
    difficulty: 8,
    icon: Shield,
    description: "Descifra el mensaje táctico (Cifrado César, shift=3 hacia atrás): 'UHWLUDGD KDFLD HO VXU'. Escribí la primera palabra descifrada.",
    type: "text",
    hint: "Shift -3: cada letra retrocede 3 posiciones. U→R, H→E, W→T...",
    answer: "RETIRADA",
    successMsg: "Mensaje descifrado: RETIRADA HACIA EL SUR. Ruta de repliegue validada.",
    lore: "Las comunicaciones cifradas eran vitales. Belgrano implementó sistemas de mensajería secreta para coordinar el repliegue sin alertar a espías realistas infiltrados.",
  },
  {
    id: 9,
    codename: "FÉNIX-09",
    title: "El Sacrificio de Jujuy",
    difficulty: 9,
    icon: Zap,
    description: "Problema final de coordinación: Si 3 batallones queman suministros en 6 horas, ¿cuántas horas necesitan 9 batallones para quemar el triple de suministros?",
    type: "number",
    hint: "3 batallones → 6h para X suministros. 9 batallones = 3 veces más fuerza. Triple de suministros = 3X. ¿Cuánto tiempo?",
    answer: "6",
    successMsg: "Tiempo calculado: 6 horas. El trabajo proporcional equilibra la ecuación. ¡Brillante!",
    lore: "El 23 de agosto de 1812, en cuestión de horas, los jujeños ejecutaron la mayor destrucción planificada de la historia argentina para salvar la revolución.",
  },
  {
    id: 10,
    codename: "TUCUMÁN-10",
    title: "La Batalla Final — Tucumán",
    difficulty: 10,
    icon: Star,
    description: "Misión final. La Batalla de Tucumán fue el 24 de septiembre de 1812. El Éxodo empezó el 23 de agosto. ¿Cuántos días exactos pasaron entre ambos eventos?",
    type: "number",
    hint: "Del 23/8 al 24/9. Agosto tiene 31 días. Del 23/8 al 31/8 = 8 días. Luego 24 días de septiembre. Total?",
    answer: "32",
    successMsg: "¡32 DÍAS! Del sacrificio al triunfo. La Revolución sobrevivió. ¡Victoria en Tucumán!",
    lore: "El 24 de septiembre de 1812, Belgrano desobedeció órdenes de seguir retirando y plantó batalla en Tucumán. Ganó. Salvó la Revolución de Mayo.",
  },
];

// ─── BOOT SEQUENCE ────────────────────────────────────────────────
const BOOT_LINES = [
  "SISTEMA TÁCTICO BELGRANO v1812.0 — INICIANDO...",
  "Cargando protocolos del Ejército del Norte...",
  "Conectando con el Cuartel General — Jujuy, 1812...",
  "Cifrado César activado [SHIFT=7]...",
  "Módulo de Tierra Quemada: EN LÍNEA",
  "Radar de avance realista: ACTIVO",
  "23/AGO/1812 — EL ÉXODO HA COMENZADO",
  ">> COMANDANTE, AGUARDAMOS ÓRDENES <<",
];

// ─── ASCII MAP ─────────────────────────────────────────────────────
const ASCII_MAP = `
╔══════════════════════════════════════════════════════════╗
║         MAPA TÁCTICO — ÉXODO JUJEÑO 1812                ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║   [★] JUJUY  ──────────────────────────────────────     ║
║       │  23/AGO/1812                                     ║
║       │  Tierra quemada ejecutada                        ║
║       ▼                                                  ║
║   [◆] QUEBRADA DE HUMAHUACA                             ║
║       │  Desfiladero protector                           ║
║       │  ~800km de marcha                                ║
║       ▼                                                  ║
║   [◈] VOLCÁN                                            ║
║       │  Paso estratégico                                ║
║       │  Primeros combates de retaguardia                ║
║       ▼                                                  ║
║   [◇] LEDESMA                                           ║
║       │  Cruce del río San Francisco                     ║
║       │  Punto de reorganización                         ║
║       ▼                                                  ║
║   [◉] GÜEMES — Vanguardia gaucha                        ║
║       │  Martín Miguel de Güemes cubre la retirada       ║
║       │  Gauchos hostizan al enemigo realista            ║
║       ▼                                                  ║
║   [★] TUCUMÁN  ◄── DESTINO FINAL                        ║
║       │  11/SEP/1812 — Llegada del Éxodo                ║
║       │  24/SEP/1812 — BATALLA DE TUCUMÁN               ║
║       └── ¡VICTORIA DE LA REVOLUCIÓN! ✦                 ║
║                                                          ║
║  FUERZAS: ~1800 soldados + civiles jujeños               ║
║  DURACIÓN: 19 días de marcha                             ║
║  RESULTADO: La Revolución de Mayo sobrevivió             ║
╚══════════════════════════════════════════════════════════╝`;

// ─── RADAR COMPONENT ──────────────────────────────────────────────
function RadarPulse() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.3" />
          </radialGradient>
        </defs>
        {[1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx="400" cy="300" r={i * 80} fill="none" stroke="#38bdf8" strokeWidth="0.5" opacity={0.6 - i * 0.1} />
        ))}
        <line x1="0" y1="0" x2="800" y2="600" stroke="#38bdf8" strokeWidth="0.3" opacity="0.4" />
        <line x1="800" y1="0" x2="0" y2="600" stroke="#38bdf8" strokeWidth="0.3" opacity="0.4" />
        <line x1="400" y1="0" x2="400" y2="600" stroke="#38bdf8" strokeWidth="0.3" opacity="0.4" />
        <line x1="0" y1="300" x2="800" y2="300" stroke="#38bdf8" strokeWidth="0.3" opacity="0.4" />
        <motion.line
          x1="400" y1="300" x2="400" y2="60"
          stroke="#38bdf8" strokeWidth="1" opacity="0.8"
          style={{ transformOrigin: "400px 300px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

// ─── GLOW TEXT ────────────────────────────────────────────────────
function GlowText({ children, className = "", color = "#38bdf8" }) {
  return (
    <span
      className={className}
      style={{ textShadow: `0 0 8px ${color}, 0 0 20px ${color}40` }}
    >
      {children}
    </span>
  );
}

// ─── SCANLINE OVERLAY ─────────────────────────────────────────────
function Scanlines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        backgroundSize: "100% 4px",
      }}
    />
  );
}

// ─── DIFFICULTY BARS ──────────────────────────────────────────────
function DifficultyBar({ level }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-sm"
          style={{
            backgroundColor: i < level ? (level > 7 ? "#ef4444" : level > 4 ? "#f59e0b" : "#38bdf8") : "#1e3a5f",
            boxShadow: i < level ? `0 0 4px ${level > 7 ? "#ef4444" : level > 4 ? "#f59e0b" : "#38bdf8"}` : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── BOOT SEQUENCE SCREEN ─────────────────────────────────────────
function BootSequence({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setDone(true), 800);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-8 relative"
      style={{ background: "#020c1a" }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
    >
      <RadarPulse />
      <Scanlines />
      <div className="relative z-20 w-full max-w-2xl">
        <motion.div
          className="border border-sky-500 rounded-lg p-8"
          style={{
            background: "rgba(2, 18, 40, 0.95)",
            boxShadow: "0 0 30px rgba(56,189,248,0.2), inset 0 0 30px rgba(56,189,248,0.03)",
          }}
        >
          <div className="flex items-center gap-3 mb-6 border-b border-sky-900 pb-4">
            <Terminal className="text-sky-400 w-6 h-6" style={{ filter: "drop-shadow(0 0 6px #38bdf8)" }} />
            <GlowText className="font-mono text-sky-300 text-sm tracking-widest">
              SISTEMA TÁCTICO — EJÉRCITO DEL NORTE
            </GlowText>
          </div>
          <div className="space-y-2 font-mono text-sm min-h-48">
            {lines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2"
              >
                <span className="text-sky-600 select-none">›</span>
                <GlowText
                  className={`text-sky-200 ${i === lines.length - 1 ? "text-white" : ""}`}
                  color={i === lines.length - 1 ? "#ffffff" : "#38bdf8"}
                >
                  {line}
                </GlowText>
              </motion.div>
            ))}
            {lines.length > 0 && (
              <motion.span
                className="inline-block w-2 h-4 bg-sky-400 ml-4"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </div>
          {done && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onComplete}
              className="mt-8 w-full py-3 border border-sky-500 text-sky-300 font-mono text-sm tracking-widest uppercase hover:bg-sky-500 hover:text-black transition-all duration-200 rounded"
              style={{ boxShadow: "0 0 15px rgba(56,189,248,0.3)" }}
              whileHover={{ boxShadow: "0 0 25px rgba(56,189,248,0.6)" }}
            >
              ▶ INICIAR MISIÓN — COMANDANTE
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── MISSION CARD ─────────────────────────────────────────────────
function MissionCard({ mission, index, completed, active, onClick }) {
  const Icon = mission.icon;
  const isLocked = index > 0 && !completed;

  return (
    <motion.button
      onClick={!isLocked ? onClick : undefined}
      className="relative w-full text-left border rounded-lg p-4 transition-all duration-200"
      style={{
        background: active
          ? "rgba(56,189,248,0.1)"
          : completed
          ? "rgba(16,185,129,0.05)"
          : "rgba(2,18,40,0.8)",
        borderColor: active
          ? "#38bdf8"
          : completed
          ? "#10b981"
          : isLocked
          ? "#0f2944"
          : "#1e3a5f",
        boxShadow: active ? "0 0 20px rgba(56,189,248,0.2)" : "none",
        cursor: isLocked ? "not-allowed" : "pointer",
        opacity: isLocked ? 0.4 : 1,
      }}
      whileHover={!isLocked ? { scale: 1.02 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded border flex items-center justify-center flex-shrink-0"
          style={{
            borderColor: completed ? "#10b981" : active ? "#38bdf8" : "#1e3a5f",
            background: completed ? "rgba(16,185,129,0.1)" : "rgba(2,18,40,0.5)",
          }}
        >
          {completed ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" style={{ filter: "drop-shadow(0 0 4px #10b981)" }} />
          ) : isLocked ? (
            <Lock className="w-4 h-4 text-sky-900" />
          ) : (
            <Icon
              className="w-5 h-5"
              style={{
                color: active ? "#38bdf8" : "#4b8ab0",
                filter: active ? "drop-shadow(0 0 4px #38bdf8)" : "none",
              }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-sky-600">{mission.codename}</span>
            {active && (
              <span className="text-xs font-mono text-sky-400 animate-pulse">◉ ACTIVA</span>
            )}
          </div>
          <p
            className="font-mono text-sm truncate"
            style={{
              color: completed ? "#10b981" : active ? "#e0f2fe" : "#7ab3cc",
              textShadow: active ? "0 0 6px rgba(56,189,248,0.5)" : "none",
            }}
          >
            {mission.title}
          </p>
          <div className="mt-2">
            <DifficultyBar level={mission.difficulty} />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ─── MISSION PANEL ────────────────────────────────────────────────
function MissionPanel({ mission, onSolve, onHint, hintUsed, feedback }) {
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setInput("");
    inputRef.current?.focus();
  }, [mission.id]);

  const handleSubmit = () => {
    const ans = input.trim().toUpperCase();
    const correct = mission.answer.toUpperCase();
    if (ans === correct) {
      onSolve(true);
    } else {
      setShake(true);
      onSolve(false);
      setTimeout(() => setShake(false), 500);
    }
  };

  const encryptedHint = caesarEncrypt(mission.hint.toUpperCase(), 7);
  const Icon = mission.icon;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div
        className="border rounded-lg p-4"
        style={{
          borderColor: "#38bdf8",
          background: "rgba(2,18,40,0.95)",
          boxShadow: "0 0 20px rgba(56,189,248,0.1)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Icon className="w-6 h-6 text-sky-400" style={{ filter: "drop-shadow(0 0 6px #38bdf8)" }} />
          <div>
            <p className="font-mono text-xs text-sky-600 tracking-widest">{mission.codename}</p>
            <GlowText className="font-mono text-lg text-white font-bold">{mission.title}</GlowText>
          </div>
          <div className="ml-auto">
            <DifficultyBar level={mission.difficulty} />
          </div>
        </div>
        <div
          className="border-l-2 border-sky-600 pl-3 py-1"
          style={{ borderColor: "#38bdf8" }}
        >
          <p className="font-mono text-sky-200 text-sm leading-relaxed">{mission.description}</p>
        </div>
      </div>

      {/* Input Area */}
      <motion.div
        animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.3 }}
        className="border rounded-lg p-4"
        style={{ borderColor: "#1e3a5f", background: "rgba(2,18,40,0.9)" }}
      >
        <p className="font-mono text-xs text-sky-600 mb-3 tracking-widest">▸ INGRESÁ TU RESPUESTA</p>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-600 font-mono text-sm">›</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={mission.type === "number" ? "Ingresá un número..." : "Ingresá texto..."}
              className="w-full pl-8 pr-4 py-3 font-mono text-sm bg-transparent border border-sky-900 rounded text-sky-200 placeholder-sky-900 focus:outline-none focus:border-sky-500 transition-colors"
              style={{ caretColor: "#38bdf8" }}
            />
          </div>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 font-mono text-sm border border-sky-500 text-sky-300 rounded hover:bg-sky-500 hover:text-black transition-all duration-150"
            style={{ boxShadow: "0 0 10px rgba(56,189,248,0.2)" }}
          >
            EJECUTAR
          </button>
        </div>
      </motion.div>

      {/* Feedback */}
      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div
            key={feedback.type}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border rounded-lg p-4"
            style={{
              borderColor: feedback.type === "success" ? "#10b981" : "#ef4444",
              background: feedback.type === "success" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
              boxShadow: `0 0 15px ${feedback.type === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}
          >
            <div className="flex items-start gap-3">
              {feedback.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className="font-mono text-sm"
                  style={{ color: feedback.type === "success" ? "#6ee7b7" : "#fca5a5" }}
                >
                  {feedback.message}
                </p>
                {feedback.type === "success" && (
                  <p className="font-mono text-xs text-sky-600 mt-2 leading-relaxed">{mission.lore}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <div className="mt-auto">
        <button
          onClick={onHint}
          className="w-full py-2 font-mono text-xs border border-sky-900 text-sky-700 rounded hover:border-sky-700 hover:text-sky-500 transition-all"
        >
          {hintUsed ? "🔓 PISTA DESCIFRADA" : "🔒 DESCIFRAR PISTA [COSTO: -1 PUNTO]"}
        </button>
        {hintUsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 p-3 rounded border border-sky-900 font-mono text-xs text-sky-500"
            style={{ background: "rgba(2,18,40,0.8)" }}
          >
            <p className="text-sky-700 mb-1">▸ PISTA DESCIFRADA:</p>
            <p>{mission.hint}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── VICTORY SCREEN ───────────────────────────────────────────────
function VictoryScreen({ score, hintsUsed }) {
  const [mapVisible, setMapVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMapVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      style={{ background: "#020c1a" }}
    >
      <RadarPulse />
      <Scanlines />
      <div className="relative z-20 w-full max-w-3xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star
              className="w-16 h-16 mx-auto mb-4 text-yellow-400"
              style={{ filter: "drop-shadow(0 0 20px #fbbf24)" }}
            />
          </motion.div>
          <GlowText
            className="font-mono text-3xl font-bold text-white block mb-2"
            color="#fbbf24"
          >
            ¡MISIÓN COMPLETADA!
          </GlowText>
          <GlowText className="font-mono text-sky-400 text-lg block">
            TUCUMÁN, 24 DE SEPTIEMBRE DE 1812
          </GlowText>
          <p className="font-mono text-sky-600 text-sm mt-2">
            "La Revolución de Mayo ha sido salvada."
          </p>
          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="text-center">
              <GlowText className="font-mono text-2xl text-yellow-400 font-bold">{score}</GlowText>
              <p className="font-mono text-xs text-sky-600">PUNTUACIÓN</p>
            </div>
            <div className="text-center">
              <GlowText className="font-mono text-2xl text-sky-400 font-bold">10/10</GlowText>
              <p className="font-mono text-xs text-sky-600">MISIONES</p>
            </div>
            <div className="text-center">
              <GlowText className="font-mono text-2xl text-emerald-400 font-bold">{hintsUsed}</GlowText>
              <p className="font-mono text-xs text-sky-600">PISTAS USADAS</p>
            </div>
          </div>
        </motion.div>

        {/* ASCII MAP */}
        <AnimatePresence>
          {mapVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="border rounded-lg p-4 overflow-x-auto"
              style={{
                borderColor: "#38bdf8",
                background: "rgba(2,18,40,0.95)",
                boxShadow: "0 0 30px rgba(56,189,248,0.15)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Map className="w-4 h-4 text-sky-400" />
                <GlowText className="font-mono text-xs text-sky-400 tracking-widest">
                  MAPA TÁCTICO — RUTA DEL ÉXODO
                </GlowText>
              </div>
              <pre
                className="font-mono text-xs leading-relaxed text-sky-300"
                style={{
                  textShadow: "0 0 4px rgba(56,189,248,0.5)",
                  whiteSpace: "pre",
                  overflowX: "auto",
                }}
              >
                {ASCII_MAP}
              </pre>
              <div className="mt-4 pt-4 border-t border-sky-900">
                <p className="font-mono text-xs text-sky-600 text-center">
                  "El pueblo de Jujuy, en un acto de patriotismo sin igual, abandonó todo para salvar la Revolución."
                </p>
                <p className="font-mono text-xs text-sky-800 text-center mt-1">
                  — General Manuel Belgrano, agosto de 1812
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function ManuelBelgrano() {
  const [phase, setPhase] = useState("boot"); // boot | game | victory
  const [currentMission, setCurrentMission] = useState(0);
  const [completed, setCompleted] = useState(Array(10).fill(false));
  const [hintUsed, setHintUsed] = useState(Array(10).fill(false));
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(1000);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);

  const handleSolve = useCallback((correct) => {
    if (correct) {
      setFeedback({ type: "success", message: MISSIONS[currentMission].successMsg });
      const newCompleted = [...completed];
      newCompleted[currentMission] = true;
      setCompleted(newCompleted);
      const points = MISSIONS[currentMission].difficulty * 10;
      setScore((s) => s + points);
      if (currentMission === 9) {
        setTimeout(() => setPhase("victory"), 2000);
      } else {
        setTimeout(() => {
          setCurrentMission((m) => m + 1);
          setFeedback(null);
        }, 2500);
      }
    } else {
      setFeedback({ type: "error", message: "▸ RESPUESTA INCORRECTA. El enemigo avanza. Intentá de nuevo." });
      setScore((s) => Math.max(0, s - 5));
      setTimeout(() => setFeedback(null), 2000);
    }
  }, [currentMission, completed]);

  const handleHint = useCallback(() => {
    if (!hintUsed[currentMission]) {
      const newHintUsed = [...hintUsed];
      newHintUsed[currentMission] = true;
      setHintUsed(newHintUsed);
      setHintsUsedCount((h) => h + 1);
      setScore((s) => Math.max(0, s - 20));
    }
  }, [currentMission, hintUsed]);

  if (phase === "boot") {
    return (
      <AnimatePresence mode="wait">
        <BootSequence key="boot" onComplete={() => setPhase("game")} />
      </AnimatePresence>
    );
  }

  if (phase === "victory") {
    return <VictoryScreen score={score} hintsUsed={hintsUsedCount} />;
  }

  const completedCount = completed.filter(Boolean).length;
  const progress = (completedCount / 10) * 100;

  return (
    <div
      className="min-h-screen relative font-mono"
      style={{ background: "#020c1a" }}
    >
      <RadarPulse />
      <Scanlines />

      <div className="relative z-20 flex flex-col h-screen">
        {/* Top Bar */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b"
          style={{ borderColor: "#0f2944", background: "rgba(2,12,26,0.95)" }}
        >
          <div className="flex items-center gap-3">
            <Shield
              className="w-5 h-5 text-sky-400"
              style={{ filter: "drop-shadow(0 0 6px #38bdf8)" }}
            />
            <GlowText className="text-sky-300 text-sm tracking-widest hidden sm:block">
              SISTEMA TÁCTICO BELGRANO
            </GlowText>
            <GlowText className="text-sky-300 text-sm tracking-widest sm:hidden">
              STB-1812
            </GlowText>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 mx-6 max-w-xs hidden sm:block">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-sky-700">PROGRESO DEL ÉXODO</span>
              <span className="text-xs text-sky-500">{completedCount}/10</span>
            </div>
            <div className="w-full h-1.5 bg-sky-950 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #0ea5e9, #38bdf8)", boxShadow: "0 0 8px #38bdf8" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" style={{ filter: "drop-shadow(0 0 4px #fbbf24)" }} />
              <GlowText className="text-yellow-400 text-sm" color="#fbbf24">{score}</GlowText>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span className="text-sky-600 text-xs">1812</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Mission List - Sidebar */}
          <div
            className="w-64 flex-shrink-0 border-r overflow-y-auto p-3 hidden md:block"
            style={{
              borderColor: "#0f2944",
              background: "rgba(2,10,22,0.9)",
            }}
          >
            <p className="text-xs text-sky-700 tracking-widest mb-3 px-1">▸ MISIONES DISPONIBLES</p>
            <div className="space-y-2">
              {MISSIONS.map((mission, i) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  index={i}
                  completed={completed[i]}
                  active={i === currentMission}
                  onClick={() => completed[i] || i === currentMission ? setCurrentMission(i) : null}
                />
              ))}
            </div>
          </div>

          {/* Mission Panel */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {/* Mobile mission selector */}
            <div className="md:hidden mb-4 flex gap-2 overflow-x-auto pb-2">
              {MISSIONS.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => (completed[i] || i === currentMission) && setCurrentMission(i)}
                  className="flex-shrink-0 w-8 h-8 rounded border text-xs font-mono flex items-center justify-center"
                  style={{
                    borderColor: i === currentMission ? "#38bdf8" : completed[i] ? "#10b981" : "#0f2944",
                    background: i === currentMission ? "rgba(56,189,248,0.15)" : "rgba(2,18,40,0.8)",
                    color: i === currentMission ? "#38bdf8" : completed[i] ? "#10b981" : "#1e3a5f",
                    boxShadow: i === currentMission ? "0 0 8px rgba(56,189,248,0.3)" : "none",
                  }}
                >
                  {completed[i] ? "✓" : i + 1}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentMission}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <MissionPanel
                  mission={MISSIONS[currentMission]}
                  onSolve={handleSolve}
                  onHint={handleHint}
                  hintUsed={hintUsed[currentMission]}
                  feedback={completed[currentMission] ? { type: "success", message: MISSIONS[currentMission].successMsg } : feedback}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Info Panel */}
          <div
            className="w-56 flex-shrink-0 border-l p-3 hidden lg:flex flex-col gap-3"
            style={{ borderColor: "#0f2944", background: "rgba(2,10,22,0.9)" }}
          >
            <div>
              <p className="text-xs text-sky-700 tracking-widest mb-2">▸ ESTADO TÁCTICO</p>
              <div className="space-y-2">
                {[
                  { label: "MISIÓN ACTIVA", value: MISSIONS[currentMission].codename, color: "#38bdf8" },
                  { label: "COMPLETADAS", value: `${completedCount}/10`, color: "#10b981" },
                  { label: "PUNTUACIÓN", value: score, color: "#fbbf24" },
                  { label: "PISTAS USADAS", value: hintsUsedCount, color: "#f59e0b" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-xs text-sky-800">{item.label}</span>
                    <GlowText className="text-sm font-bold" color={item.color} style={{ color: item.color }}>
                      {item.value}
                    </GlowText>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="border rounded p-3 mt-auto"
              style={{ borderColor: "#0f2944", background: "rgba(2,18,40,0.5)" }}
            >
              <p className="text-xs text-sky-700 mb-2">▸ CIFRADO ACTIVO</p>
              <p className="text-xs text-sky-900 leading-relaxed font-mono">
                César: SHIFT=7<br />
                Estado: ACTIVO<br />
                Protocolo: 1812-ARG
              </p>
              <div className="mt-2 pt-2 border-t border-sky-950">
                <p className="text-xs text-sky-900">
                  {caesarEncrypt("BELGRANO", 7)}
                </p>
              </div>
            </div>

            <div
              className="border rounded p-3"
              style={{ borderColor: "#0f2944" }}
            >
              <p className="text-xs text-sky-700 mb-1">▸ SEÑAL RADAR</p>
              <div className="flex gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{ background: "#38bdf8", boxShadow: "0 0 4px #38bdf8" }}
                    animate={{ height: [4, Math.random() * 20 + 4, 4] }}
                    transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, repeatType: "reverse" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
