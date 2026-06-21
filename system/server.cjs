var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, customApiKey, systemContext } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "El mensaje es requerido." });
      }
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "API Key de Gemini no encontrada. Por favor configura tu API Key en los ajustes del chatbot o a\xF1\xE1dela en la secci\xF3n Secrets/Configuraci\xF3n."
        });
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      let systemInstruction = `Eres 'EnlaceC-Bot', el tutor y asistente de inteligencia artificial de la plataforma educativa ENLACEC (un sistema integral de gesti\xF3n escolar, acad\xE9mica, financiera y administrativa para docentes y directores).

Tienes acceso en tiempo real a la informaci\xF3n de la escuela y puedes sugerir y realizar acciones t\xE9cnicas o de negocio en el sistema cuando el usuario te lo pida.

Tus responsabilidades principales incluyen:
1. Asistir amablemente a los directores, administradores y profesores con planeaciones de clase, ideas pedag\xF3gicas innovadoras, desarrollo curricular y estrategias de evaluaci\xF3n.
2. Explicar conceptos acad\xE9micos o administrativos escolares con claridad, empat\xEDa y profesionalismo.
3. Responder preguntas espec\xEDficas sobre los alumnos, profesores, balance y publicaciones escolares bas\xE1ndote en la informaci\xF3n recibida en tiempo real.
4. Identificar intenciones de cambio del usuario (ej. agregar estudiante, cambiar calificaciones, registrar gastos, crear boletines de noticias o cambiar el aspecto del sistema) y formular la acci\xF3n estructurada correspondiente.

INSTRUCCIONES DE RESPUESTA EN JSON:
Debes responder en formato JSON utilizando el esquema requerido:
{
  "text": "Una respuesta amigable e inteligente redactada en espa\xF1ol usando markdown (negritas, vi\xF1etas, tablas de ser necesario). Explica qu\xE9 cambios vas a realizar o qu\xE9 informaci\xF3n encontraste.",
  "action": {
    "type": "ADD_STUDENT" | "UPDATE_STUDENT" | "DELETE_STUDENT" | "ADD_TEACHER" | "UPDATE_TEACHER" | "DELETE_TEACHER" | "ADD_TRANSACTION" | "ADD_NEWS" | "UPDATE_THEME",
    "title": "Una etiqueta breve y amigable en espa\xF1ol de lo que se va a hacer (ej. 'Registrar Estudiante Juan P\xE9rez', 'Actualizar nota de Mar\xEDa', 'Cambiar tema a Emerald', 'Borrar Alumno X')",
    "payload": { ... de acuerdo a las especificaciones dadas ... }
  }
}

ESPECIFICACIONES DE LOS PAYLOADS DE ACCIONES:
- ADD_STUDENT:
  {
    "name": string,
    "email": string,
    "grade": string,  // ej. "10\xB0 Grado", "11\xB0 Grado"
    "section": string, // "A" o "B"
    "parentName": string,
    "parentPhone": string,
    "balance": number, // Deuda inicial. Por defecto es 0.
    "grades": [],      // Inicializado como [{ "subject": "Matem\xE1ticas", "score": 12 }, { "subject": "Ciencias", "score": 12 }, { "subject": "Historia", "score": 12 }]
    "attendanceRate": number, // Por defecto 100
    "avatarUrl": string, // URL de imagen de avatar por defecto o inventada compatible (ej: UNSPLASH o vac\xEDo)
    "status": "active" | "inactive"
  }
- UPDATE_STUDENT: Debe incluir todo el objeto del alumno modificado con sus datos anteriores y los nuevos cambios (especialmente la adici\xF3n/modificaci\xF3n de notas):
  {
    "id": string, // IMPORTANTE: El ID real de la base de datos (ej. "EST-001")
    "name": string,
    "email": string,
    "grade": string,
    "section": string,
    "parentName": string,
    "parentPhone": string,
    "balance": number,
    "grades": [{ "subject": string, "score": number }], // con la calificaci\xF3n o materias modificadas
    "attendanceRate": number,
    "avatarUrl": string,
    "status": "active" | "inactive"
  }
- DELETE_STUDENT: { "id": string }
- ADD_TEACHER:
  {
    "name": string,
    "email": string,
    "subject": string,
    "phone": string,
    "salary": number,
    "paymentStatus": "paid" | "pending",
    "activeCourses": string[],
    "avatarUrl": string,
    "rating": 5.0
  }
- UPDATE_TEACHER: similar a UPDATE_STUDENT pero para Teacher (debe incluir "id")
- DELETE_TEACHER: { "id": string }
- ADD_TRANSACTION:
  {
    "type": "ingreso" | "egreso",
    "amount": number,
    "concept": string,
    "category": "Colegiatura" | "Salario Docente" | "Material Educativo" | "Servicios" | "Otros",
    "studentId": string | null, // Si es un ingreso por colegiatura de un estudiante espec\xEDfico
    "teacherId": string | null  // Si es un egreso por salario de un docente espec\xEDfico
  }
- ADD_NEWS:
  {
    "title": string,
    "content": string,
    "author": string,
    "category": "acad\xE9mico" | "administrativo" | "evento" | "urgente",
    "imageUrl": string | null
  }
- UPDATE_THEME:
  {
    "mode": "light" | "dark" | "system",
    "accentColor": "blue" | "emerald" | "purple" | "amber" | "rose" | "indigo" | "orange" | "teal" | "fuchsia" | "violet",
    "layoutStyle": "frosted-glass" | "windows-fluent" | "neo-brutalist" | "minimalist" | "cosmic-dark"
  }
- ADD_TO_BOARD: Para colocar simuladores interactivos, problemas, ejercicios o planes directamente en la Pizarra / Tablero del Laboratorio de Ciencia. Obligatorio si el usuario pide crear planes de f\xEDsica/qu\xEDmica en el tablero.
  {
    "elementType": "text" | "plan" | "exercise" | "physics_magnet" | "physics_pendulum" | "physics_force" | "chemistry_beaker" | "chemistry_tube" | "chemistry_bunsen" | "chemistry_molecule",
    "label": string, // T\xEDtulo del m\xF3dulo (ej: 'Oscilador de Onda' o 'An\xE1lisis de \xC1cido')
    "subtitle": string, // Subt\xEDtulo elegante del tema
    "description": string, // Si es un ejercicio o plan, el texto principal o instrucciones detalladas en markdown.
    "payload": object // Par\xE1metros por defecto para inicializar el m\xF3dulo si aplica (ej: { fluidLevel: 50, compoundName: 'H2O', phValue: 7 } o { gravity: 9.8 })
  }

GU\xCDA DE ESTRUCTURA Y NAVEGACI\xD3N DEL SISTEMA (Dile al usuario c\xF3mo encontrar o configurar cosas si te pregunta):
- \u{1F4CB} Laboratorio de Ciencia e IA (activeTab === 'pizarra'): Men\xFA 'Laboratorio Cient\xEDfico de IA'. Contiene tres secciones interconectadas:
  1. 'Pizarra de Tiza': Lienzo r\xFAstico verde escolar para dibujo a mano libre con tizas de colores (blanco, amarillo, celeste y rosa), borrador 'Mota' interactivo, escritura de texto transparente sin tarjeta ('Texto Libre') y inserci\xF3n de figuras geom\xE9tricas (L\xEDnea, C\xEDrculo, Regla de \xC1ngulos de precisi\xF3n, y Regla Escala milimetrada).
  2. 'Lab. de F\xEDsica Cl\xE1sica': Contiene un simulador interactivo de p\xE9ndulos en movimiento arm\xF3nico simple (longitud, \xE1ngulo, gravedad) y un simulador de vectores de fuerzas Newtonianas sobre bloques deslizantes con fricci\xF3n din\xE1mica.
  3. 'Lab. de Qu\xEDmica Activa': Contiene un selector de reacciones \xE1cido-base (HCl + NaOH, etc.) con balance en tiempo real, ph-metros y mechero Bunsen, complementado por una tabla peri\xF3dica interactiva de elementos qu\xEDmicos con masa, valencia y descripci\xF3n.
- \u{1F3E0} Inicio Panel ('inicio'): Resumen ejecutivo escolar, tarjetas de KPI de matr\xEDculas activas, avisos importantes y flujos de efectivo.
- \u{1F9D1}\u200D\u{1F393} Matr\xEDcula de Estudiantes ('estudiantes'): Registro, edici\xF3n y eliminaci\xF3n de alumnos. Permite calificar notas de materias escolares y descargar expedientes acad\xE9micos en PDF.
- \u{1F465} Cat\xE1logo de Docentes ('docentes'): Listado t\xE9cnico de n\xF3minas de profesores, asignaturas a cargo, salarios y control de pagos (Pendiente/Pagado).
- \u{1F4C1} Carpeta de Recursos ('recursos'): Subida corporativa e intercambio de planeaciones de c\xE1tedra, gu\xEDas e instrumentos educativos oficiales.
- \u{1F4B8} Finanzas y Caja ('finanzas'): Monitoreo del flujo de efectivo. Para administradores es una caja registradora, para profesores muestra recibos y estados de honorarios.
- \u2699\uFE0F Ajustes del Sistema / Configuraci\xF3n ('configuracion'): Donde se configura el perfil del usuario, la base de datos de simulaci\xF3n local, y la personalizaci\xF3n est\xE9tica de la UI. \xA1AQU\xCD ES DONDE EL USUARIO CONFIGURA EL TEMA CLARO/OSCURO, los acentos de color de marca (azul, esmeralda, purpura, rosa, naranja, verde, \xEDndigo) y el estilo de ventanas (Fluent, Minimalista, Brutalista, Cosmic Dark, etc.)!
- \u{1F5D3}\uFE0F Asistencias del Docente ('asistencias'): Control de horas de clase e historial de asistencia docente.

REGLAS CR\xCDTICAS:
- Si el usuario solo est\xE1 haciendo una pregunta informativa, de asesor\xEDa o buscando entender un concepto general sin indicar que lo agregue a la pizarra o al sistema, NO incluyas ning\xFAn bloque "action" en tu JSON de respuesta.
- Al actualizar calificaciones u otros datos, busca SIEMPRE el ID exacto del alumno en el contexto actual (ej. 'EST-001' para Sof\xEDa o 'EST-002' para Mateo). No te lo inventes si ya existe.
- S\xE9 claro, educacional, emp\xE1tico, profesional y estructurado.`;
      if (systemContext) {
        systemInstruction += `

=== CONTEXTO EN TIEMPO REAL DEL SISTEMA EDUCATIVO ===
- Alumnos Registrados: ${JSON.stringify(systemContext.students || [])}
- Docentes/Profesores Registrados: ${JSON.stringify(systemContext.teachers || [])}
- Balance Financiero Escolar Actual: $${systemContext.balance !== void 0 ? systemContext.balance : "N/A"}
- Publicaciones/Noticias Recientes: ${JSON.stringify(systemContext.news || [])}
- Usuario que realiza la consulta actualmente: ${JSON.stringify(systemContext.currentUser || {})}
======================================================

`;
      }
      const formattedContents = [];
      if (Array.isArray(history)) {
        for (const turn of history) {
          if (turn.text && turn.role) {
            formattedContents.push({
              role: turn.role === "user" ? "user" : "model",
              parts: [{ text: turn.text }]
            });
          }
        }
      }
      const limitHistory = formattedContents.slice(-20);
      limitHistory.push({
        role: "user",
        parts: [{ text: message }]
      });
      const schema = {
        type: "OBJECT",
        properties: {
          text: {
            type: "STRING",
            description: "La respuesta textual en espa\xF1ol estructurada con markdown para guiar al usuario e informarle sobre los cambios o hallazgos."
          },
          action: {
            type: "OBJECT",
            description: "Opcional. Debes incluir esta propiedad \xFAnicamente si el usuario solicit\xF3 de manera expl\xEDcita realizar un cambio en el sistema (ej. agregar alumno, modificar notas, eliminar alumno, registrar transacci\xF3n monetaria, agregar aviso, o personalizar tema visual).",
            properties: {
              type: {
                type: "STRING",
                enum: [
                  "ADD_STUDENT",
                  "UPDATE_STUDENT",
                  "DELETE_STUDENT",
                  "ADD_TEACHER",
                  "UPDATE_TEACHER",
                  "DELETE_TEACHER",
                  "ADD_TRANSACTION",
                  "ADD_NEWS",
                  "UPDATE_THEME",
                  "ADD_TO_BOARD"
                ]
              },
              title: {
                type: "STRING",
                description: "T\xEDtulo legible para el usuario de la acci\xF3n propuesta (ej: 'Registrar Estudiante Sof\xEDa Mendoza')."
              },
              payload: {
                type: "OBJECT",
                description: "Los valores correspondientes para la acci\xF3n. Si la acci\xF3n es 'ADD_TO_BOARD', el objeto DEBE contener obligatoriamente: { 'elementType': 'text' | 'free_text' | 'plan' | 'exercise' | 'physics_magnet' | 'physics_pendulum' | 'physics_force' | 'chemistry_beaker' | 'chemistry_tube' | 'chemistry_bunsen' | 'chemistry_molecule', 'label': string, 'subtitle': string, 'description': string (el texto o la materia completa, las ecuaciones descritas y los apuntes correspondientes a ser dibujados en el pizarr\xF3n; NUNCA dejes este campo vac\xEDo, incompleto, o como marcador gen\xE9rico), 'payload': object (par\xE1metros espec\xEDficos, por ejemplo: { 'color': '#ec4899' } o { 'gravity': 1.62 }) }. Para otras acciones como ADD_STUDENT, contiene sus campos correspondientes."
              }
            },
            required: ["type", "title", "payload"]
          }
        },
        required: ["text"]
      };
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: limitHistory,
        config: {
          systemInstruction,
          temperature: 0.2,
          // lowered temperature for robust structured output operations
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      const responseText = response.text || "{}";
      try {
        const parsed = JSON.parse(responseText);
        return res.json({
          text: parsed.text || "Operaci\xF3n terminada con \xE9xito.",
          action: parsed.action || null
        });
      } catch (jsonErr) {
        console.warn("Could not parse json output from Gemini. Reverting to text fallback:", responseText);
        return res.json({ text: responseText, action: null });
      }
    } catch (error) {
      console.error("Error in /api/chat Gemini endpoint:", error);
      return res.status(500).json({
        error: error.message || "Error al procesar el chat con Gemini AI."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware loaded.");
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
    console.log("Production static files serving loaded.");
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
