# Lumen — Buenas prácticas aplicadas

## Índice

1. [HTML](#1-html)
2. [CSS](#2-css)
3. [JavaScript](#3-javascript)
4. [Accesibilidad (a11y)](#4-accesibilidad-a11y)
5. [Validación de formularios](#5-validación-de-formularios)
6. [Estructura de archivos](#6-estructura-de-archivos)

---

## 1. HTML

### 1.1 Declaración del documento
- `<!DOCTYPE html>` al inicio del archivo. Indica al navegador que el documento usa HTML5 y evita que entre en *quirks mode* (modo de compatibilidad antiguo).
- `<html lang="es">` declara el idioma del contenido. Es importante para:
  - Lectores de pantalla (eligen la voz correcta).
  - Buscadores (SEO por idioma).
  - Herramientas de traducción del navegador.

### 1.2 Metadatos (`<head>`)
- `<meta charset="UTF-8">`: declara la codificación de caracteres. Sin esto, los acentos y caracteres especiales se rompen.
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">`: hace que el sitio sea responsive en móviles. Sin esta línea, el navegador móvil renderiza la página como si fuera de escritorio y aplica zoom out.
- `<meta name="description" content="...">`: la descripción que aparece debajo del título en los resultados de Google. Clave para SEO.
- `<title>` descriptivo y único: aparece en la pestaña del navegador y en los resultados de búsqueda.

### 1.3 HTML semántico
Se usaron etiquetas con significado en lugar de `<div>` para todo. Cada una le dice al navegador y a los lectores de pantalla qué es ese bloque:

| Etiqueta | Uso en el proyecto |
|----------|--------------------|
| `<header>` | Cabecera del sitio con logo y navegación |
| `<nav>` | Menú de navegación principal |
| `<main>` | Contenido principal único de la página |
| `<section>` | Cada bloque temático (hero, características, registro) |
| `<article>` | Tarjetas de características (contenido autocontenido) |
| `<footer>` | Pie de página con copyright |
| `<fieldset>` y `<legend>` | Agrupar los radios con su pregunta asociada |

**Por qué importa:** un lector de pantalla puede saltar directo al `<main>`, listar todos los `<nav>`, o anunciar "fin de la sección". Con `<div>` esto no es posible.

### 1.4 Jerarquía de encabezados
Un solo `<h1>` por página (el del hero), seguido de `<h2>` para las secciones principales y `<h3>` dentro de ellas. Nunca saltar niveles (no pasar de `<h1>` a `<h3>` directamente). Esto crea un "esqueleto" navegable para lectores de pantalla y mejora el SEO.

### 1.5 Carga de recursos
- **Orden de hojas de estilo:** primero `variables.css`, luego `styles.css`. Las variables deben existir antes de que se consuman.
- **`defer` en el script:** `<script src="script.js" defer></script>`. Hace que el script se descargue en paralelo al HTML pero se ejecute solo cuando el DOM esté listo. Evita bloquear el renderizado y elimina la necesidad de `DOMContentLoaded` (aunque también lo usamos por seguridad).
- **`preconnect` a Google Fonts:** abre la conexión TCP/TLS al servidor antes de necesitar la fuente, acelerando su carga.
- **`display=swap` en la fuente:** muestra una fuente del sistema mientras Inter carga, evitando texto invisible (FOIT).

### 1.6 Formulario bien estructurado
- **`<form action="#" method="POST">`**: define a dónde y cómo se enviarían los datos. En producción `action` apuntaría a un endpoint real.
- **`<label for="id">`**: cada label vinculada a su input por `for`/`id`. Beneficios:
  - Hacer clic en la etiqueta enfoca el input (usabilidad).
  - Lectores de pantalla anuncian la etiqueta al enfocar el campo.
  - Aumenta el área clickeable.
- **Tipos de input semánticos:** `text`, `email`, `password`, `tel`, `radio`, `checkbox`. Cada uno activa el teclado adecuado en móvil y aplica validación nativa básica.
- **`required`, `minlength`, `maxlength`, `pattern`:** validación nativa del navegador como primera línea de defensa.
- **`novalidate` en el `<form>`:** desactiva los popups nativos del navegador para que JavaScript pueda mostrar mensajes personalizados con un mejor diseño.
- **`autocomplete`:** ayuda al navegador y a los password managers a sugerir valores correctos:
  - `name` para nombre completo
  - `email` para correo
  - `new-password` para crear contraseña (le dice al navegador "no autorrellenes con la contraseña existente, ofrece una nueva")
  - `tel` para teléfono
- **`inputmode="tel"`:** muestra el teclado numérico en móviles aunque el campo acepte `+` y espacios.

---

## 2. CSS

### 2.1 Separación en capas
- **`variables.css`** contiene **solo** custom properties (variables). Sin ninguna regla de estilo.
- **`styles.css`** contiene los estilos que **consumen** esas variables.

**Por qué:** cambiar el color primario implica editar una sola línea en `variables.css`. Esta separación es la base del *design tokens pattern* usado en sistemas de diseño profesionales.

### 2.2 Custom properties (variables CSS)
Definidas en `:root` para que sean globales. Se agruparon por categoría:
- **Colores:** fondo, superficies, texto, primarios, estados (éxito/error).
- **Tipografía:** familia, tamaños (`xs` → `4xl`), pesos, line-heights.
- **Espaciado:** escala consistente (`xs` → `4xl`). Garantiza ritmo visual coherente.
- **Bordes y radios:** `sm`, `md`, `lg`, `xl`, `full` (para botones tipo píldora).
- **Sombras y transiciones:** centralizadas para mantener consistencia.
- **Layout:** ancho máximo del contenedor.

**Buena práctica:** usar una **escala** (xs/sm/md/lg/xl) en lugar de valores arbitrarios. Esto evita que termines con 17 tamaños de espaciado distintos.

### 2.3 Reset CSS básico
```css
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}
```
- **`box-sizing: border-box`:** el `width` incluye padding y border. Sin esto, calcular tamaños es un infierno.
- **`margin: 0; padding: 0;`:** elimina los márgenes/padding por defecto inconsistentes entre navegadores.
- Aplicar a todos los elementos (`*`) y pseudo-elementos (`::before`, `::after`) para uniformidad.

### 2.4 Mobile-first y responsive
- Estilos base pensados para escritorio en este proyecto, con un `@media (max-width: 768px)` que ajusta para móvil. (Mobile-first puro escribiría primero los estilos móviles y haría `min-width` para desktop, ambos enfoques son válidos.)
- **Unidades relativas:** `rem` para tamaños tipográficos, `em` para componentes que escalan con su contexto. Permite que el usuario aumente el tamaño base del navegador y todo escale.
- **Grid responsive:** `grid-template-columns: repeat(3, 1fr)` en escritorio, `1fr` (una columna) en móvil.
- **Layout flexible con `flex` y `grid`** en lugar de `float` o tablas.

### 2.5 Selectores limpios
- Clases con nombres descriptivos en kebab-case: `.feature-card`, `.btn-primary`, `.signup-form`.
- Baja especificidad: se evita anidar selectores profundamente. Una clase = un componente.
- **No** se usan IDs como selectores (los IDs solo para JS o `for`/`aria-describedby`).
- **No** hay `!important` en ninguna parte.

### 2.6 Hover, focus y transiciones
- **`:hover`** en botones y enlaces para feedback visual.
- **`:focus-visible`** (no `:focus`) para que el anillo de foco solo aparezca con teclado, no con clic de mouse. Mejora UX visual sin sacrificar accesibilidad.
- **`transition`** suaves de 150–250ms en cambios de color, transform y box-shadow. Mejora la sensación de pulido sin distraer.

### 2.7 Estados visuales del formulario
Se reflejan en CSS los estados que JavaScript aplica:
- `.input-error` → borde rojo + fondo rojo translúcido.
- `.input-success` → borde verde + fondo verde translúcido.
- `.error-message` → texto rojo pequeño.
- `.error-message.success-text` → mismo elemento pero en verde, reutilizando el `<small>` para no duplicar HTML.

### 2.8 Sin estilos en línea
Toda la presentación vive en CSS. El HTML solo tiene clases. Esto facilita el mantenimiento y permite cambiar el diseño sin tocar la estructura.

---

## 3. JavaScript

### 3.1 Espera al DOM
```js
document.addEventListener('DOMContentLoaded', () => { ... });
```
Aunque usamos `defer` en el script (que ya espera al DOM), envolver el código en `DOMContentLoaded` es una capa extra de seguridad y deja claro al lector que el código depende del DOM.

### 3.2 Modo estricto implícito
Los módulos JS modernos están en *strict mode* automáticamente, y aunque este script no es módulo, mantiene buenas prácticas: `const` y `let` (nunca `var`), arrow functions, sin variables globales colgantes.

### 3.3 Una única fuente de verdad para validación
El objeto `validators` contiene una función por campo. Cada función:
- Recibe el valor del campo.
- Devuelve `{ valid: boolean, message: string }`.
- Se usa **tanto** en validación en vivo (blur/input/change) **como** en submit.

**Por qué es buena práctica:** evita duplicar la lógica de validación. Si cambia una regla, se modifica un solo lugar.

### 3.4 Funciones pequeñas y de un solo propósito
- `getFieldValue(name)`: extrae el valor según el tipo de campo.
- `validateField(name)`: valida y pinta el resultado.
- `renderFieldState(name, result)`: actualiza solo el DOM (separación de lógica/presentación).
- `toggleDetails(details, btn)`: alterna las cards.

Cada función hace una cosa. Más fácil de leer, probar y mantener.

### 3.5 Selectores eficientes
- `document.getElementById()` en lugar de `querySelector('#id')` cuando se busca por ID (más rápido).
- `form.elements[name]` para acceder a campos del formulario por nombre.
- `data-*` attributes (`data-error-for`, `data-expandable`) para ligar JS al HTML sin acoplarse a clases de estilo.

### 3.6 Eventos correctos por tipo de control
| Control | Evento usado | Razón |
|---------|--------------|-------|
| Inputs de texto | `blur` + `input` | `blur` no molesta antes de tiempo, `input` da feedback en vivo después |
| Radios | `change` | Los radios no disparan `blur` de forma natural cuando el usuario los marca |
| Checkbox | `change` | Mismo motivo que los radios |
| Formulario | `submit` | Punto de validación final como red de seguridad |

### 3.7 `event.preventDefault()` en submit
Previene el envío por defecto del formulario, que recargaría la página. Permite a JavaScript controlar el flujo (validar y mostrar el mensaje de éxito sin recargar).

### 3.8 `event.stopPropagation()` cuando hace falta
En el botón "Ver más" dentro de cada card: se hace `stopPropagation` para que el clic no burbujee al `<article>` que también tiene listener (evita doble toggle).

### 3.9 Set para tracking de estado
```js
const touchedFields = new Set();
```
Un `Set` es la estructura ideal para "campos que ya fueron tocados": no permite duplicados, `.add()` y `.has()` son O(1).

### 3.10 Sin `var`, sin variables globales
Todo el código vive dentro del listener del `DOMContentLoaded`. No contamina el `window`. Usa solo `const` (preferido) y `let` cuando hace falta reasignar.

### 3.11 Template literals en lugar de concatenación
```js
form.querySelector(`[data-error-for="${fieldName}"]`)
```
Más legible que `'[data-error-for="' + fieldName + '"]'`.

### 3.12 Filtro defensivo en el teléfono
En lugar de validar después de que el usuario escriba basura, **prevenimos** la entrada de caracteres inválidos en tiempo real. *Mejor prevenir que validar*.

### 3.13 Mensajes de error específicos
La validación de contraseña no dice "contraseña inválida" — dice exactamente qué falta: *"Falta: una mayúscula, un número, un símbolo."*. El usuario sabe qué corregir sin adivinar.

---

## 4. Accesibilidad (a11y)

### 4.1 Etiqueta de idioma
`<html lang="es">` permite a los lectores de pantalla usar la pronunciación correcta.

### 4.2 Labels asociadas
Cada `<label for="x">` está vinculada a su input con `id="x"`. Sin esto, los lectores de pantalla no anuncian el nombre del campo.

### 4.3 `aria-label` en navegación
`<nav aria-label="Navegación principal">` ayuda a distinguir entre múltiples navegaciones (p. ej. principal vs. footer).

### 4.4 `aria-describedby` para mensajes de campo
Cada input apunta al ID de su `<small>` con el mensaje de error/éxito. El lector de pantalla anuncia el mensaje **junto con** el campo, no como elemento suelto.

### 4.5 `aria-invalid` dinámico
JavaScript añade `aria-invalid="true"` cuando un campo falla y `"false"` cuando pasa. Es la señal estándar de accesibilidad para "este campo está mal".

### 4.6 `aria-expanded` en botones expandibles
Los botones "Ver más" actualizan `aria-expanded="true|false"` cuando se abren/cierran. Los lectores de pantalla anuncian el estado.

### 4.7 `role="status"` y `aria-live="polite"` en el mensaje de éxito
Cuando el formulario se envía con éxito y se muestra el mensaje, los lectores de pantalla lo anuncian automáticamente sin interrumpir lo que el usuario esté haciendo.

### 4.8 Foco visible para teclado (`:focus-visible`)
Todos los elementos interactivos (links, botones, inputs) muestran un anillo violeta visible cuando se navegan con Tab. Solo aparece con teclado, no con clic, gracias a `:focus-visible` (en lugar del antiguo `:focus`).

### 4.9 Atributo `hidden` nativo
Para mostrar/ocultar el detalle de las cards y el mensaje de éxito se usa el atributo HTML `hidden`. Es semánticamente correcto, accesible y los lectores de pantalla lo respetan (no anuncian contenido oculto).

### 4.10 `<fieldset>` + `<legend>` para los radios
Agrupa los radios bajo una pregunta común. Los lectores de pantalla anuncian la leyenda al entrar al grupo.

---

## 5. Validación de formularios

### 5.1 Estrategia de tres capas
1. **HTML nativo:** `required`, `minlength`, `maxlength`, `pattern`, `type="email"`. Funciona aunque JS falle.
2. **JavaScript en vivo:** validación al `blur` (al salir del campo), re-validación en `input` (mientras escribe, solo si ya fue tocado).
3. **JavaScript en submit:** valida todo de nuevo como red de seguridad antes de enviar.

### 5.2 No molestar antes de tiempo
Los campos no muestran error apenas carga la página. Solo se validan **después de que el usuario haya interactuado** con ellos (concepto de "campo tocado"). Esto es UX estándar de formularios modernos.

### 5.3 Feedback de éxito, no solo de error
Cuando un campo es válido, se muestra un mensaje verde (✓) y borde verde. El usuario sabe que va bien, no solo cuándo falla.

### 5.4 Mensajes específicos
Cada error indica exactamente qué corregir, no errores genéricos.

### 5.5 Prevención > validación
El campo de teléfono filtra caracteres inválidos en tiempo real para que el usuario no pueda escribir lo que no debe.

### 5.6 Estándares internacionales
- Teléfono: rango E.164 (7–15 dígitos) en lugar de un número fijo de dígitos. La startup puede ser internacional.
- Contraseña: requisitos mínimos típicos (8+ chars, mayúscula, número, símbolo).

### 5.7 Validación en cliente NO sustituye al servidor
La validación en cliente es para UX. Un servidor real **siempre** debe validar de nuevo, porque el usuario puede desactivar JavaScript o enviar peticiones manualmente. Este proyecto solo cubre la parte cliente porque no hay backend.

---

## 6. Estructura de archivos

```
Tarea 1/
├── index.html       Estructura semántica
├── variables.css    Solo custom properties
├── styles.css       Estilos visuales
├── script.js        Validación e interactividad
└── README.md        Este documento
```

### Por qué esta separación
- **Separación de responsabilidades:** HTML estructura, CSS presentación, JS comportamiento. Cada archivo hace una sola cosa.
- **Variables aisladas:** cambiar el sistema de diseño no requiere tocar los estilos.
- **Sin dependencias externas:** solo HTML, CSS y JS vanilla. La única conexión externa es la fuente Inter de Google Fonts.

### Convenciones aplicadas
- Nombres de clases en **kebab-case** (`feature-card`, no `FeatureCard` ni `feature_card`).
- Nombres de funciones JS en **camelCase** (`validateField`, no `validate_field`).
- Atributos de datos con prefijo `data-` (`data-error-for`, `data-expandable`).
- Textos de UI en español para mantener coherencia con el público objetivo.
- Indentación consistente (4 espacios en HTML/CSS/JS).

---

## Resumen rápido para el examen

Si te preguntan "¿qué buenas prácticas aplicaste?", aquí los puntos clave:

1. **HTML semántico** (header, nav, main, section, article, footer) en vez de divs.
2. **Un solo `<h1>`** y jerarquía de encabezados correcta.
3. **Meta tags** (charset, viewport, description) y `lang` en `<html>`.
4. **Script con `defer`** para no bloquear renderizado.
5. **Labels asociadas** a inputs con `for`/`id`.
6. **Validación en tres capas:** HTML nativo + JS en vivo + JS en submit.
7. **Validación al `blur` + re-validación al `input`** (no esperar al submit).
8. **Custom properties (variables CSS)** centralizadas en `:root`.
9. **Reset básico** con `box-sizing: border-box`.
10. **Diseño responsive** con `@media`, grid y flex.
11. **`:focus-visible`** para accesibilidad de teclado sin afectar mouse.
12. **`aria-describedby`, `aria-invalid`, `aria-expanded`, `aria-live`** para lectores de pantalla.
13. **`autocomplete`** en todos los inputs para autorrelleno y password managers.
14. **`inputmode`** para mostrar el teclado correcto en móvil.
15. **Sin estilos en línea, sin frameworks, sin librerías externas.**
16. **Funciones pequeñas y reutilizables** en JS (validators como única fuente de verdad).
17. **`const` y `let`**, nunca `var`. Sin variables globales.
18. **Mensajes de error específicos** (no genéricos).
19. **Feedback de éxito**, no solo de error.
20. **Prevención de entrada inválida** (filtro en vivo del teléfono) en lugar de validar después.
