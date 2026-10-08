# Design Specification

## Dirección visual

La aplicación deberá tener una estética limpia, moderna y orientada a la
exploración de datos.

No deberá parecer un panel administrativo genérico ni un sistema empresarial
de gestión.

La identidad visual deberá transmitir que se trata de un producto de datos
públicos relacionado con la actividad vitivinícola argentina.

El protagonismo deberá estar en:

- los indicadores;
- los gráficos;
- la jerarquía de la información;
- la facilidad para comparar datos.

La referencia a la vitivinicultura deberá ser sutil y principalmente cromática.
No utilizar decoraciones temáticas excesivas como fotografías de viñedos,
racimos de uva, barriles o ilustraciones que distraigan del análisis.

## Estilo general

La interfaz será principalmente clara.

Se utilizará:

- fondo general claro, ligeramente cálido;
- superficies blancas para cards y áreas de contenido;
- textos oscuros de alto contraste;
- bordes suaves;
- sombras muy sutiles o inexistentes;
- espaciado amplio;
- esquinas moderadamente redondeadas.

La aplicación deberá evitar una apariencia excesivamente brillante,
saturada o cargada.

## Identidad cromática

La paleta deberá inspirarse sutilmente en la vitivinicultura.

Color principal:

- bordó / vino oscuro.

Color secundario:

- verde apagado asociado a vegetación o viñedos.

Colores neutros:

- blanco cálido;
- gris claro;
- gris oscuro para texto.

Los colores de superficie y producción deberán mantenerse consistentes
en toda la aplicación.

Propuesta:

- Superficie: verde.
- Producción: bordó.

Estos mismos colores deberán utilizarse en gráficos, indicadores,
tooltips y elementos relacionados con cada métrica.

Los estados de error, advertencia y éxito deberán utilizar colores
semánticos independientes de esta paleta.

Visualmente, la dirección sería más o menos:

┌─────────────────────────────────────────────────────────────┐
│ Vitivinicultura Argentina                Panorama Provincias│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Panorama nacional                                          │
│  Superficie implantada y producción de uva                  │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 199.946  │ │ -9,61 %  │ │19,1 M qq │ │ -14,49 %│       │
│  │    ha    │ │          │ │          │ │          │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│  Evolución superficie          Evolución producción         │
│  ┌────────────────────┐       ┌────────────────────┐        │
│  │      gráfico       │       │      gráfico       │        │
│  └────────────────────┘       └────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

## Navegación principal

La aplicación utilizará una barra de navegación horizontal ubicada en la parte
superior.

La navegación deberá ser simple y tener poca presencia visual para no competir
con el contenido analítico.

Elementos principales:

- nombre o identidad de la aplicación;
- acceso a Panorama nacional;
- acceso a Provincias.

No utilizar una sidebar administrativa.

La opción correspondiente a la página actual deberá distinguirse visualmente.

---

## Tipografía

Utilizar una tipografía sans-serif moderna, legible y sobria.

La tipografía deberá priorizar la lectura de:

- cifras;
- títulos;
- etiquetas de gráficos;
- información tabular o analítica.

No utilizar tipografías decorativas relacionadas con vino o estilos manuscritos.

La jerarquía deberá distinguir claramente:

- título de página;
- descripción o subtítulo;
- título de sección;
- valor principal de un indicador;
- etiqueta del indicador;
- texto secundario.

---

## Contenedor y espaciado

El contenido principal deberá estar centrado y utilizar un ancho máximo que
evite que los gráficos se extiendan excesivamente en monitores grandes.

La interfaz deberá utilizar espaciado consistente y generoso.

Las secciones deberán diferenciarse principalmente mediante:

- espacio;
- jerarquía tipográfica;
- agrupación visual;

y no mediante una cantidad excesiva de bordes o separadores.

---

## Cards de indicadores

Los indicadores principales se mostrarán mediante cards simples.

Cada card deberá contener:

- etiqueta;
- valor principal;
- unidad cuando corresponda;
- contexto temporal cuando sea necesario.

Ejemplo:

Superficie implantada
199.946 ha
2024

Los valores serán el elemento de mayor jerarquía visual.

Las cards deberán utilizar:

- fondo claro;
- borde sutil;
- esquinas moderadamente redondeadas;
- sombra mínima o inexistente.

Evitar cards excesivamente decoradas.

---

## Gráficos

Los gráficos deberán mantener un estilo visual consistente en toda la aplicación.

Colores de métricas:

- superficie: verde;
- producción: bordó.

Los gráficos deberán incluir:

- título claro;
- unidades comprensibles;
- tooltip;
- ejes legibles cuando correspondan;
- formato adecuado para números grandes.

Evitar:

- efectos 3D;
- degradados decorativos;
- animaciones excesivas;
- fondos gráficos innecesarios;
- exceso de líneas de cuadrícula.

La comparación de información deberá ser más importante que la decoración.

---

## Mapas territoriales

La aplicación utilizará mapas coropléticos cuando aporten información espacial
que no pueda percibirse fácilmente mediante un gráfico tradicional.

La implementación utilizará:

- Leaflet;
- React Leaflet;
- geometrías GeoJSON oficiales de unidades territoriales argentinas.

Las geometrías actuarán únicamente como referencia cartográfica.

Los datos analíticos mostrados sobre el mapa continuarán proveniendo de la API
de la aplicación y, en última instancia, de PostgreSQL.

Antes de implementar la integración deberá verificarse que los identificadores
territoriales utilizados por los datasets del INV puedan relacionarse de forma
confiable con los identificadores de las geometrías oficiales.

### Mapa departamental

La página Detalle de provincia tendrá como elemento principal de su análisis
departamental un mapa de la provincia dividido por departamentos.

El usuario podrá alternar la métrica representada entre:

- superficie implantada;
- producción de uva.

Los departamentos se colorearán mediante una escala de intensidad de acuerdo
con el valor de la métrica seleccionada.

Para superficie se utilizará una escala basada en verde.

Para producción se utilizará una escala basada en bordó.

El mapa deberá incluir una leyenda que permita interpretar la escala utilizada.

Al pasar el cursor o seleccionar un departamento deberá mostrarse:

- nombre del departamento;
- valor de la métrica activa;
- unidad;
- participación dentro del total provincial cuando esté disponible.

Los departamentos sin información para la métrica seleccionada deberán
distinguirse visualmente de aquellos cuyo valor sea realmente cero.

El mapa se complementará con un ranking de departamentos para permitir una
comparación precisa de valores.

El mapa no reemplazará por completo los gráficos comparativos.

---

## Filtros y controles

Los controles deberán integrarse visualmente con el resto de la aplicación.

El selector de año tendrá alta visibilidad porque modifica el contexto de los
datos mostrados.

Los controles deberán utilizar etiquetas claras.

Ejemplo:

Año
[ 2024 ▼ ]

En controles con pocas opciones, como la métrica del mapa, se preferirá un
selector segmentado:

[ Superficie ] [ Producción ]

La opción activa deberá resultar evidente sin utilizar efectos visuales
excesivos.

---

## Estados interactivos

Los elementos seleccionables deberán proporcionar feedback visual.

Esto incluye:

- enlaces de navegación;
- botones;
- provincias;
- departamentos;
- barras de gráficos cuando sean interactivas;
- controles de métricas.

Los estados hover y selected deberán ser perceptibles pero sutiles.

No depender únicamente del color para comunicar una selección.

---

## Formato de números

Los números deberán presentarse de forma legible para usuarios de Argentina.

La interfaz utilizará separadores y formatos adecuados para español.

Los valores podrán abreviarse cuando el espacio visual lo requiera, pero el
valor completo deberá estar disponible mediante tooltip cuando corresponda.

Ejemplos visuales:

199.946 ha

19,2 M qq

-9,61 %

Los datos enviados por la API no deberán modificarse por razones de
presentación; el formateo será responsabilidad de la interfaz.

---

## Responsive

En escritorio se podrán utilizar composiciones de dos columnas.

En pantallas pequeñas:

- las cards podrán reorganizarse;
- los gráficos se apilarán verticalmente;
- mapa y ranking departamental se mostrarán uno debajo del otro;
- la navegación deberá seguir siendo accesible;
- ningún gráfico deberá requerir desplazamiento horizontal innecesario.

La versión móvil deberá preservar las funciones principales, no simplemente
ocultar contenido importante.