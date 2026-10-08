# Architecture Specification

## Objetivo

Este documento define la arquitectura técnica de la aplicación web de exploración
de datos vitivinícolas.

La aplicación será un consumidor del pipeline ETL existente.

El pipeline, la base de datos y las vistas analíticas ya forman parte del proyecto
y no deberán ser reemplazados ni duplicados por la aplicación.

La arquitectura general será:

```text
Datasets INV
     ↓
Pipeline ETL existente
Python + pandas
     ↓
PostgreSQL
     ↓
Vistas analíticas
     ↓
Python + FastAPI
     ↓
REST API
     ↓
React + Vite + TypeScript
     ↓
Usuario
```

---

## Stack tecnológico

### Backend

- Python
- FastAPI
- psycopg 3
- SQL directo
- Uvicorn

No utilizar ORM.

El backend deberá consultar PostgreSQL mediante SQL explícito utilizando
`psycopg`.

### Frontend

- React
- Vite
- TypeScript
- React Router
- Recharts
- Leaflet
- React Leaflet

El frontend será una SPA que consumirá exclusivamente la API REST.

Recharts será utilizado para gráficos estadísticos.

Leaflet y React Leaflet serán utilizados para las visualizaciones cartográficas
basadas en geometrías GeoJSON.

### Base de datos

- PostgreSQL

La aplicación utilizará la base de datos existente del proyecto.

Las principales fuentes de información serán las vistas:

- `vw_superficie_nacional_anual`
- `vw_produccion_nacional_anual`
- `vw_superficie_provincial_anual`
- `vw_produccion_provincial_anual`
- `vw_superficie_departamental_anual`
- `vw_produccion_departamental_anual`

No deberán crearse nuevas tablas para almacenar información de la aplicación.

---

## Estructura general del repositorio

La aplicación deberá incorporarse al repositorio existente sin reorganizar
innecesariamente el pipeline actual.

Estructura esperada:

```text
vitivinicultura-data/
├── data/
├── docs/
│   ├── PRODUCT_SPEC.md
│   ├── UI_SPEC.md
│   ├── API_SPEC.md
│   ├── ARCHITECTURE.md
│   └── DESIGN_SPEC.md
├── exploration/
├── sql/
├── src/
│   ├── extract.py
│   ├── transform.py
│   ├── validate.py
│   ├── load.py
│   └── pipeline.py
├── app/
│   ├── backend/
│   └── frontend/
├── .env
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

El directorio `src/` continuará perteneciendo exclusivamente al pipeline ETL.

El código de la aplicación deberá ubicarse dentro de `app/`.

---

# Backend

## Responsabilidad

El backend será una API REST de solo lectura.

Sus responsabilidades serán:

- recibir solicitudes HTTP del frontend;
- validar parámetros;
- consultar PostgreSQL;
- realizar cálculos derivados necesarios para la API;
- transformar los resultados SQL al formato definido en `API_SPEC.md`;
- devolver respuestas JSON;
- manejar errores de forma controlada.

El backend no deberá:

- leer archivos CSV;
- ejecutar el pipeline ETL;
- modificar datos;
- crear datos;
- eliminar datos;
- implementar autenticación;
- contener lógica de interfaz;
- devolver credenciales o información sensible.

---

## Estructura del backend

Se espera una estructura similar a:

```text
app/backend/
├── app/
│   ├── main.py
│   ├── db.py
│   ├── routers/
│   │   ├── national.py
│   │   └── provinces.py
│   ├── services/
│   │   ├── national_service.py
│   │   └── province_service.py
│   └── schemas/
│       ├── national.py
│       └── province.py
├── tests/
├── requirements.txt
└── README.md
```

El agente podrá realizar pequeños ajustes a esta estructura cuando exista una
razón técnica clara, pero deberá conservar la separación conceptual entre:

- rutas HTTP;
- acceso y consulta de datos;
- modelos de respuesta;
- configuración de base de datos.

No se deberá crear una arquitectura excesivamente compleja para una aplicación
de este tamaño.

---

## FastAPI

El punto de entrada será:

```text
app/backend/app/main.py
```

La aplicación FastAPI deberá registrar los routers necesarios para implementar
los endpoints definidos en `API_SPEC.md`.

Base path:

```text
/api
```

La documentación automática de FastAPI deberá permanecer habilitada durante
desarrollo.

---

## Acceso a PostgreSQL

La conexión deberá realizarse mediante `psycopg` versión 3.

No utilizar:

- SQLAlchemy;
- Prisma;
- ORM;
- query builders innecesarios.

Las consultas deberán escribirse explícitamente en SQL.

Toda consulta que utilice parámetros provenientes de la URL o query string
deberá usar consultas parametrizadas.

No concatenar parámetros recibidos del usuario directamente dentro del SQL.

Ejemplo conceptual:

```python
cursor.execute(
    """
    SELECT ...
    FROM vw_superficie_provincial_anual
    WHERE provincia_id = %s
      AND anio = %s
    """,
    (province_id, year)
)
```

---

## Configuración de base de datos

Las credenciales nunca deberán escribirse directamente en el código.

El backend utilizará variables de entorno.

Variables esperadas:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

La aplicación podrá reutilizar las mismas variables utilizadas actualmente por
el pipeline.

El archivo `.env` no deberá modificarse ni incluirse en Git.

`.env.example` podrá actualizarse cuando sea necesario para documentar nuevas
variables.

---

## Consultas y vistas

El backend deberá utilizar las vistas analíticas existentes siempre que estas
ya representen el nivel de agregación requerido.

No volver a consultar las tablas base para repetir agregaciones que ya existen
en las vistas.

Ejemplo:

Para obtener superficie provincial anual utilizar:

```text
vw_superficie_provincial_anual
```

y no volver a ejecutar:

```sql
SUM(superficie_ha)
GROUP BY provincia
```

sobre `superficie_vinedos` salvo que exista una necesidad documentada que las
vistas actuales no puedan resolver.

---

## Cálculos derivados

Algunos valores definidos en `API_SPEC.md` podrán calcularse en el backend,
por ejemplo:

- variación porcentual;
- participación sobre el total;
- ratio producción/superficie.

Estos cálculos deberán realizarse a partir de los datos provenientes de las
vistas analíticas.

La ausencia de información deberá conservarse como `null`.

Nunca transformar automáticamente un registro inexistente en valor `0`.

---

## Modelos de respuesta

FastAPI deberá utilizar modelos tipados para representar las respuestas de la API.

Los nombres JSON deberán coincidir con `API_SPEC.md`.

Ejemplo:

```json
{
  "year": 2024,
  "surfaceHa": 199945.8935,
  "productionQuintals": 19189739.95
}
```

Aunque PostgreSQL pueda devolver valores `NUMERIC` mediante tipos como
`Decimal`, las respuestas JSON deberán cumplir el contrato de la API y exponer
los indicadores numéricos como números.

Los identificadores geográficos deberán mantenerse como strings.

---

## Manejo de errores

El backend deberá implementar al menos:

```text
400 Bad Request
404 Not Found
500 Internal Server Error
```

Los errores deberán seguir el formato definido en `API_SPEC.md`.

Los errores internos podrán registrarse en el servidor, pero no deberán exponer
al cliente:

- stack traces;
- contraseñas;
- connection strings;
- SQL interno;
- información sensible.

---

## CORS

Durante desarrollo deberá permitirse la comunicación entre el frontend local y
el backend local mediante CORS.

La configuración deberá limitarse a los orígenes necesarios para desarrollo.

No utilizar un origen completamente abierto como configuración definitiva si no
es necesario.

---

# Frontend

## Responsabilidad

El frontend será responsable de:

- navegación;
- presentación de información;
- visualizaciones estadísticas;
- filtros;
- selección de provincia;
- selección de año;
- tooltips;
- estados de carga;
- mensajes de error;
- diseño responsive;
- representación cartográfica;
- selección de departamentos;
- integración entre datos analíticos y geometrías GeoJSON;
- leyendas cartográficas;
- sincronización entre mapa y ranking departamental.

El frontend no deberá:

- conectarse directamente a PostgreSQL;
- leer archivos CSV;
- duplicar lógica del pipeline;
- realizar consultas SQL;
- contener datos analíticos hardcodeados.

---

## Estructura del frontend

Se espera una estructura similar a:

```text
app/frontend/
├── public/
│   └── geo/
│       └── departments/
├── src/
│   ├── components/
│   │   └── maps/
│   ├── pages/
│   │   ├── NationalOverview/
│   │   ├── Provinces/
│   │   └── ProvinceDetail/
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Las geometrías territoriales utilizadas por los mapas deberán almacenarse como
assets estáticos de la aplicación.

Ubicación sugerida:

```text
app/frontend/public/geo/departments/
```

Se recomienda mantener los archivos GeoJSON organizados de forma que la
aplicación pueda cargar únicamente la geometría correspondiente a la provincia
que se está visualizando.

Los GeoJSON contendrán exclusivamente:

- geometría territorial;
- identificadores territoriales;
- nombres u otros metadatos geográficos necesarios.

No deberán contener:

- superficie vitícola;
- producción de uva;
- participaciones;
- ratios;
- indicadores analíticos.

Los valores analíticos deberán provenir siempre de la API.

El agente podrá ajustar la organización interna cuando sea necesario, evitando
estructuras innecesariamente complejas.

---

## Páginas

La aplicación tendrá tres experiencias principales:

```text
Panorama nacional
      ↓
Análisis provincial
      ↓
Detalle de provincia
```

Las funcionalidades y comportamiento de cada pantalla están definidos en
`UI_SPEC.md`.

La dirección visual está definida en `DESIGN_SPEC.md`.

---

## Navegación

React Router deberá manejar la navegación.

Rutas sugeridas:

```text
/
/provinces
/provinces/:provinceId
```

Comportamiento esperado:

```text
/                      → Panorama nacional
/provinces             → Análisis provincial
/provinces/:provinceId → Detalle de provincia
```

El año seleccionado podrá conservarse mediante query parameter cuando sea útil.

Ejemplo:

```text
/provinces/50?year=2024
```

Esto permitirá conservar el contexto al navegar desde Análisis provincial hacia
Detalle de provincia.

Si el usuario vuelve a la página provincial, deberá intentarse preservar el año
que estaba explorando cuando resulte razonable.

---

## Comunicación con la API

Toda comunicación HTTP deberá centralizarse en una capa de servicio.

Ejemplo:

```text
src/services/api.ts
```

Los componentes React no deberán contener URLs completas repetidas ni lógica
HTTP duplicada.

La URL base de la API deberá configurarse mediante una variable de entorno de
Vite.

Ejemplo:

```text
VITE_API_URL=http://localhost:8000/api
```

No deberán hardcodearse URLs del backend dentro de múltiples componentes.

---

## TypeScript

El frontend deberá utilizar TypeScript.

Se deberán definir tipos para las estructuras recibidas desde la API.

Ejemplo conceptual:

```typescript
interface NationalSummary {
  year: number
  surfaceHa: number
  productionQuintals: number
  surfaceChangePct: number
  productionChangePct: number
}
```

También deberán tiparse las estructuras provinciales y departamentales utilizadas
por gráficos y mapas.

No abusar del tipo `any`.

---

## Visualizaciones

La librería principal de gráficos estadísticos será Recharts.

Se utilizarán principalmente:

- gráficos de líneas;
- gráficos de barras horizontales;
- tooltips.

Los gráficos deberán utilizar exclusivamente datos obtenidos desde la API.

No deberán existir valores analíticos hardcodeados dentro de los componentes.

Las unidades, formatos y colores deberán seguir lo establecido en
`UI_SPEC.md` y `DESIGN_SPEC.md`.

---

# Cartografía

## Tecnología

Las visualizaciones territoriales deberán implementarse mediante:

- Leaflet;
- React Leaflet;
- archivos GeoJSON de referencia territorial.

Los GeoJSON serán utilizados exclusivamente para representar geometrías de
provincias y departamentos.

Los datos analíticos continuarán obteniéndose mediante la API REST.

Flujo:

```text
GeoJSON territorial ─────────────┐
                                 ↓
                           React Leaflet
                                 ↑
                              React
                                 ↑
                              REST API
                                 ↑
                              FastAPI
                                 ↑
                            PostgreSQL
```

La cartografía y los datos analíticos representan responsabilidades diferentes:

```text
GeoJSON
    ↓
define dónde está cada departamento
y cuál es su geometría

API
    ↓
define qué valores de superficie,
producción y participación posee
cada departamento
```

---

## Fuente cartográfica

Las geometrías territoriales deberán provenir de una fuente oficial.

Para esta aplicación se utilizarán geometrías compatibles con los identificadores
territoriales oficiales utilizados por GeoRef.

Las geometrías se incorporarán al proyecto como assets estáticos para evitar
depender de una consulta externa a GeoRef cada vez que un usuario abra la
aplicación.

La aplicación no deberá necesitar acceso en tiempo real a GeoRef para funcionar.

---

## Integración entre datos y geometrías

Los identificadores territoriales utilizados por los datasets del INV son
compatibles con los identificadores oficiales utilizados por GeoRef para los
departamentos.

Esta compatibilidad fue verificada utilizando los departamentos de Mendoza.

Por ejemplo:

```text
50007 → Capital
50014 → General Alvear
50063 → Luján de Cuyo
50070 → Maipú
50105 → San Rafael
50126 → Tupungato
```

La integración entre los datos analíticos y las geometrías GeoJSON deberá
realizarse mediante el identificador territorial.

En la API el identificador se expondrá como:

```text
departmentId
```

y deberá corresponder al identificador presente en el GeoJSON.

Ejemplo:

```text
INV / API
departmentId = "50105"
        ↓
GeoJSON
id = "50105"
        ↓
San Rafael
```

No será necesaria una tabla de correspondencias adicional mientras se mantenga
esta compatibilidad.

La unión no deberá realizarse mediante nombres de departamentos cuando exista
el identificador territorial.

Los nombres podrán utilizarse únicamente con fines de presentación.

---

## Departamentos sin datos

Las geometrías GeoJSON representan el territorio oficial y podrán contener
departamentos para los cuales una determinada métrica o año no posea registros
en los datos del INV.

Esto es esperado.

Ejemplo conceptual:

```text
GeoJSON
Capital existe
        ↓
API
no devuelve producción para Capital
        ↓
Mapa
Capital continúa visible
        ↓
Sin dato
```

En estos casos:

- el departamento deberá continuar visible en el mapa;
- deberá utilizarse un estilo específico para ausencia de información;
- el tooltip deberá indicar que no existe dato disponible;
- no deberá asignarse automáticamente un valor igual a cero.

La aplicación deberá distinguir estrictamente:

```text
valor = 0
```

de:

```text
dato inexistente
```

---

## Mapa departamental

El mapa departamental será implementado en la página Detalle de provincia.

El frontend deberá:

- cargar la geometría correspondiente a la provincia activa;
- combinar cada departamento con los datos recibidos desde la API;
- colorear los polígonos según la métrica seleccionada;
- actualizar el mapa al cambiar entre superficie y producción;
- actualizar la escala de colores;
- mostrar tooltips;
- mostrar una leyenda;
- permitir seleccionar un departamento;
- sincronizar la selección entre mapa y ranking departamental;
- distinguir departamentos sin datos;
- mantener visibles las geometrías incluso cuando no exista información analítica.

La API no deberá devolver geometrías geográficas.

Las geometrías serán responsabilidad del frontend y sus assets cartográficos.

---

## Métricas del mapa

El mapa permitirá representar:

```text
Superficie
Producción
```

La métrica seleccionada determinará:

- los valores utilizados;
- la escala cromática;
- la leyenda;
- el contenido principal de los tooltips;
- el orden del ranking departamental.

Según `DESIGN_SPEC.md`:

```text
Superficie → verde
Producción → bordó
```

---

## Carga de geometrías

No será necesario cargar todas las geometrías departamentales de Argentina en
cada visita al detalle de una provincia.

La implementación deberá favorecer la carga únicamente de los datos cartográficos
necesarios para la provincia activa.

Una estructura aceptable podrá ser:

```text
public/
└── geo/
    └── departments/
        ├── 06.geojson
        ├── 10.geojson
        ├── 14.geojson
        ├── 18.geojson
        ├── 22.geojson
        ├── ...
        └── 50.geojson
```

donde el nombre del archivo podrá corresponder al identificador provincial.

Esta estructura es orientativa.

El agente podrá utilizar otra organización simple y mantenible si conserva la
capacidad de identificar y cargar la geometría de cada provincia.

---

# Estados de interfaz

Toda página que consulte la API deberá contemplar estados explícitos.

## Loading

Mientras los datos estén siendo obtenidos.

La interfaz deberá indicar que la información está cargando.

No deberán utilizarse datos ficticios mientras llega la respuesta real.

## Error

Cuando la API no pueda responder correctamente.

El usuario deberá recibir un mensaje comprensible.

No deberán mostrarse errores internos del servidor o de JavaScript.

## Empty state

Cuando una consulta válida no tenga información disponible.

La interfaz no deberá quedar vacía ni romperse.

Deberá mostrarse un mensaje adecuado, por ejemplo:

```text
Sin información disponible para este período.
```

---

# Diseño responsive

La aplicación deberá funcionar correctamente al menos en:

- escritorio;
- tablet;
- dispositivos móviles.

En pantallas grandes podrán utilizarse composiciones de dos columnas.

En pantallas pequeñas:

- los elementos podrán reorganizarse verticalmente;
- las cards podrán distribuirse en varias filas;
- los gráficos deberán ocupar el ancho disponible;
- mapa y ranking departamental deberán mostrarse uno debajo del otro;
- los filtros deberán continuar siendo accesibles;
- la navegación deberá conservar su funcionalidad.

La prioridad será conservar legibilidad y funcionalidad.

No deberá ocultarse información analítica importante únicamente porque el
usuario utilice un dispositivo móvil.

---

# Separación entre pipeline y aplicación

El pipeline existente y la aplicación deberán permanecer desacoplados.

```text
src/
    ↓
procesa datasets
    ↓
PostgreSQL
    ↓
vistas analíticas
    ↓
app/backend/
    ↓
REST API
    ↓
app/frontend/
```

La aplicación no deberá importar módulos desde `src/` para obtener información.

El pipeline no deberá conocer la existencia del frontend.

La integración entre pipeline y aplicación será exclusivamente mediante los
datos persistidos en PostgreSQL.

Esto permite que:

```text
Pipeline
    ↓
pueda ejecutarse independientemente

Backend
    ↓
pueda consultar el último estado disponible

Frontend
    ↓
pueda consumir la API sin conocer cómo fueron procesados los datos
```

---

# Dependencias

Las dependencias del pipeline y las dependencias del backend deberán mantenerse
separadas.

El archivo existente:

```text
/requirements.txt
```

continuará representando principalmente las dependencias del pipeline.

El backend tendrá:

```text
/app/backend/requirements.txt
```

Este archivo deberá incluir las dependencias necesarias para FastAPI y acceso a
PostgreSQL.

El frontend administrará sus dependencias mediante:

```text
/app/frontend/package.json
```

Allí se incluirán las dependencias necesarias para:

- React;
- Vite;
- TypeScript;
- React Router;
- Recharts;
- Leaflet;
- React Leaflet.

No agregar dependencias que no tengan una función concreta dentro de la
aplicación.

---

# Configuración local

La aplicación deberá poder ejecutarse localmente durante desarrollo.

Arquitectura esperada:

```text
PostgreSQL
localhost:5432

FastAPI
localhost:8000

React / Vite
localhost:5173
```

Los puertos anteriores representan la configuración esperada por defecto y
podrán ajustarse cuando exista una necesidad técnica.

El frontend utilizará:

```text
VITE_API_URL
```

para conocer la dirección de la API.

El backend utilizará las variables de entorno correspondientes a PostgreSQL.

---

# Seguridad básica

Aunque la aplicación sea de solo lectura y no implemente autenticación, deberán
mantenerse prácticas básicas de seguridad.

No deberán incluirse en el código:

- contraseñas;
- secretos;
- connection strings completas;
- credenciales de PostgreSQL.

Las consultas SQL con valores provenientes de parámetros deberán utilizar
parametrización mediante `psycopg`.

No concatenar valores externos directamente dentro de una sentencia SQL.

La API no deberá permitir operaciones de escritura.

---

# Verificación mínima

Antes de considerar terminada la implementación, el agente deberá verificar que:

- el backend pueda instalar sus dependencias;
- el backend pueda iniciarse correctamente;
- FastAPI pueda conectarse a PostgreSQL;
- los endpoints definidos en `API_SPEC.md` estén implementados;
- los endpoints respondan con la estructura esperada;
- los parámetros inválidos produzcan errores adecuados;
- el frontend pueda instalar sus dependencias;
- el frontend compile correctamente;
- el frontend pueda iniciarse;
- el frontend pueda consumir la API;
- las tres páginas puedan navegarse;
- el selector de año funcione;
- la navegación hacia el detalle provincial funcione;
- el año seleccionado pueda conservarse al navegar al detalle;
- los estados de carga estén contemplados;
- los estados de error estén contemplados;
- los estados sin datos estén contemplados;
- no existan datos analíticos hardcodeados;
- no se haya modificado innecesariamente el pipeline ETL existente;
- el mapa departamental pueda cargarse correctamente;
- las geometrías correspondan a la provincia seleccionada;
- las geometrías puedan relacionarse con los datos mediante `departmentId`;
- superficie y producción puedan alternarse en el mapa;
- la leyenda del mapa se actualice según la métrica;
- los tooltips cartográficos funcionen;
- mapa y ranking departamental permanezcan sincronizados;
- los departamentos sin datos se distingan de los departamentos con valor cero;
- los departamentos sin datos permanezcan visibles en el mapa;
- los datos mostrados en el mapa provengan de la API;
- los valores analíticos no estén hardcodeados dentro de los GeoJSON;
- el frontend no consulte directamente PostgreSQL;
- la aplicación no lea directamente los CSV originales.

---

# Principios de implementación

La implementación deberá priorizar:

```text
claridad
simplicidad
separación de responsabilidades
código mantenible
consistencia con las especificaciones
```

No se busca construir una arquitectura empresarial compleja.

No agregar tecnologías, patrones o capas únicamente por sofisticación.

Cuando exista una solución simple y suficientemente mantenible, deberá preferirse
sobre una solución innecesariamente abstracta.

El objetivo no es demostrar la mayor cantidad posible de tecnologías.

El objetivo es implementar correctamente el producto definido en:

```text
PRODUCT_SPEC.md
UI_SPEC.md
API_SPEC.md
ARCHITECTURE.md
DESIGN_SPEC.md
```

Cuando exista una ambigüedad menor de implementación, el agente podrá resolverla
siguiendo estos principios.

Cuando una decisión pueda alterar el alcance, el contrato de la API, la fuente
de datos o la arquitectura definida, deberán priorizarse las especificaciones
existentes sobre cualquier alternativa inventada.