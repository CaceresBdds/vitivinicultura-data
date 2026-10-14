# Vitivinicultura Argentina

Proyecto de datos sobre la actividad vitivinícola argentina: pipeline ETL en
Python, base de datos PostgreSQL con vistas analíticas, consultas SQL, consumo
mediante Power BI y una aplicación web interactiva compuesta por una API REST
(FastAPI) y un frontend (React + Vite + TypeScript).

## Objetivo

Construir un flujo reproducible que procese datasets públicos del Instituto
Nacional de Vitivinicultura (INV), los cargue en PostgreSQL y exponga una capa
analítica reutilizable. Sobre esa capa se apoyan el análisis SQL, el consumo
desde Power BI y la aplicación web, que permite explorar la evolución nacional,
comparar provincias y analizar la distribución departamental de superficie
implantada y producción de uva.

## Fuente de datos

- **INV (Instituto Nacional de Vitivinicultura)**: datasets públicos de
  superficie implantada con viñedos y producción de uvas de Argentina.
- **Datos Argentina / GeoRef (IGN)**: geometrías territoriales oficiales de
  departamentos, compatibles con GeoRef, usadas por el mapa departamental del
  frontend. Los identificadores territoriales de los datasets del INV coinciden
  con los identificadores oficiales de departamento (por ejemplo, `50105` →
  San Rafael).

## Datasets utilizados

Los archivos CSV originales se encuentran en `data/`.

| Archivo | Contenido | Período | Registros |
| --- | --- | --- | --- |
| `inv-superficie-viniedos-2012-2024.csv` | Superficie implantada con viñedos (ha) | 2012-2024 | 9.053 |
| `inv-produccion-uvas-2012-2025.csv` | Producción de uva (quintales) | 2012-2025 | 7.582 |

Las comparaciones entre superficie y producción utilizan el período común
**2012-2024**. Producción dispone además de información para 2025, que se
analiza únicamente a nivel producción.

## Arquitectura general

```text
INV / CSV
    ↓
Python + pandas ETL
    ↓
PostgreSQL
    ↓
Vistas analíticas
    ├── análisis SQL
    ├── Power BI
    └── FastAPI REST API
            ↓
       React frontend
            ↓
   aplicación web interactiva
```

La aplicación **no** modifica el pipeline ni la base de datos: es un consumidor
de los datos procesados.

## Pipeline ETL (Python + pandas)

El código del pipeline se encuentra en `src/` y se ejecuta con `python src/pipeline.py`.

```text
Extract → Transform → Validate → Load
```

- **Extract** (`src/extract.py`): lee los CSV con pandas. Los identificadores
  geográficos se cargan como texto para preservar ceros iniciales.
- **Transform** (`src/transform.py`): identifica registros con geografía
  incompleta (superficie) y filas exactamente duplicadas (ambos datasets). No
  elimina registros: los señaliza con columnas booleanas.
- **Validate** (`src/validate.py`): comprueba cantidades esperadas de filas,
  registros con geografía incompleta y duplicados exactos antes de cargar. Si
  falla, el pipeline se detiene.
- **Load** (`src/load.py`): usa psycopg 3 y una estrategia de *full refresh*
  (`TRUNCATE` + `COPY`) dentro de una transacción.

## PostgreSQL y vistas analíticas

Los datos procesados se almacenan en dos tablas:

```text
superficie_vinedos
produccion_uvas
```

Los scripts de base de datos están en `sql/`:

- `create_database.sql`: crea la base `vitivinicultura`.
- `schema.sql`: crea las tablas.
- `views.sql`: crea seis vistas analíticas con agregaciones reutilizables.

Vistas disponibles:

```text
vw_superficie_nacional_anual        vw_produccion_nacional_anual
vw_superficie_provincial_anual      vw_produccion_provincial_anual
vw_superficie_departamental_anual   vw_produccion_departamental_anual
```

Las vistas no almacenan resultados: PostgreSQL ejecuta su consulta subyacente
cuando son consultadas, evitando repetir agregaciones (`SUM`, `GROUP BY`).

## Análisis SQL

Las consultas de análisis se encuentran en `sql/analysis/` y consumen
principalmente las vistas. Cubren, entre otros temas:

- evolución nacional de superficie y producción;
- variaciones interanuales y cambio acumulado 2012-2024;
- comparación de la dirección de ambas métricas;
- distribución, rankings, cambios y participación provincial;
- diferencias de cobertura entre ambos datasets;
- ratio agregado de producción sobre superficie;
- distribución y rankings departamentales;
- comportamiento de la producción durante 2025.

## Power BI como forma de consumo

La capa de vistas analíticas es independiente de la aplicación web y puede
consumirse desde herramientas de BI. En particular, **Power BI** puede
conectarse a PostgreSQL (conector PostgreSQL) y usar las tablas y vistas
descritas para construir tableros propios.

Esta vía reutiliza la misma capa analítica que la API: la ausencia de datos se
conserva como `NULL` y no se interpreta como cero.

## API REST con FastAPI

El backend es una API REST de solo lectura construida con FastAPI, Uvicorn,
psycopg 3 y SQL directo (sin ORM). Se encuentra en `app/backend/` y consulta
PostgreSQL usando las vistas analíticas. Base path: `/api`.

Endpoints:

```text
GET /api/national/summary
GET /api/national/evolution
GET /api/provinces?year=YYYY
GET /api/provinces/{provinceId}/summary?year=YYYY
GET /api/provinces/{provinceId}/history
GET /api/provinces/{provinceId}/departments?year=YYYY
```

Características:

- respuestas JSON con nombres en `camelCase` y valores numéricos como números;
- identificadores geográficos como strings;
- validación de `year` dentro del período 2012-2024 (HTTP 400 si es inválido,
  HTTP 404 si la provincia no existe);
- errores en formato `{ "error": "..." }` sin exponer detalles internos;
- cálculos derivados en el backend a partir de las vistas (variaciones,
  participaciones y ratio producción/superficie);
- valores faltantes preservados como `null`.

La documentación interactiva de FastAPI queda disponible en `/docs`.

## Frontend React + Vite + TypeScript

El frontend es una SPA en `app/frontend/` construida con React, Vite,
TypeScript, React Router, Recharts y Leaflet / React Leaflet. Consume
exclusivamente la API REST; no accede a PostgreSQL ni lee los CSV.

Rutas:

```text
/                        Panorama nacional
/provinces               Análisis provincial
/provinces/:provinceId   Detalle de provincia
```

Páginas:

- **Panorama nacional**: indicadores de superficie y producción (2024 y cambio
  2012-2024), evolución histórica y variación interanual (2013-2024).
- **Análisis provincial**: filtro por año, rankings de superficie y producción,
  selección de provincia y resumen con participación y ratio
  producción/superficie.
- **Detalle de provincia**: resumen provincial, evolución histórica y análisis
  departamental con mapa y ranking.

El frontend incluye estados explícitos de carga, error (con acción de
reintento) y ausencia de datos, y un diseño responsive.

## Visualizaciones y mapa departamental

- Gráficos temporales (líneas) y rankings provinciales/departamentales
  (barras horizontales) con Recharts.
- **Mapa coroplético de departamentos** de Leaflet que muestra únicamente la
  provincia seleccionada, cargando su geometría desde
  `app/frontend/public/geo/departments/{provinciaId}.geojson`.
- Selector de métrica **Superficie (verde) / Producción (bordó)** que actualiza
  mapa, escala de color, leyenda, tooltips y ranking de forma sincronizada.
- Selección de departamento sincronizada entre mapa y ranking.
- Los departamentos sin dato para la métrica activa se muestran con un estilo
  distinto (gris/discontinuo) y tooltip *"Sin dato disponible"*; nunca se
  representan como valor cero.

## Calidad de datos

- **Duplicados exactos conservados y señalizados**: no se eliminan; se marcan
  con la columna booleana `duplicado_exacto` (2 filas involucradas en cada
  dataset) al no existir evidencia suficiente para considerarlos errores.
- **Geografía incompleta**: los registros de superficie sin ubicación completa
  (3 registros) se conservan y se señalizan con `geografia_incompleta`.
  Permanecen en los totales nacionales, pero se excluyen de los agregados
  provinciales y departamentales donde no pueden atribuirse territorialmente.
- **Valores faltantes ≠ cero**: la ausencia de registros se representa como
  `null`/dato no disponible en la base, la API y la interfaz. Nunca se
  convierte automáticamente en `0`.
- **Uso de IDs geográficos**: los datos analíticos y las geometrías GeoJSON se
  relacionan por identificador territorial (`provincia_id` / `departamento_id` →
  `departmentId` = `id` del GeoJSON), no por nombre. Los GeoJSON contienen
  únicamente geometría e identificadores/nombres, sin valores analíticos.

## Estructura del repositorio

```text
vitivinicultura-data/
├── data/                      # CSV originales del INV
├── docs/                      # especificaciones del producto y la app
├── exploration/               # profiling inicial (no forma parte del pipeline)
├── sql/
│   ├── create_database.sql
│   ├── schema.sql
│   ├── views.sql
│   └── analysis/              # 13 consultas de análisis
├── src/                       # pipeline ETL (extract, transform, validate, load)
├── app/
│   ├── backend/               # API REST FastAPI + psycopg 3
│   │   ├── app/               # main, db, routers, services, schemas
│   │   ├── tests/             # pruebas de integración de la API
│   │   ├── requirements.txt
│   │   └── README.md
│   └── frontend/              # SPA React + Vite + TypeScript
│       ├── public/geo/departments/   # GeoJSON oficiales por provincia
│       ├── src/               # pages, components, services, hooks, styles
│       ├── package.json
│       └── tsconfig.json
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

## Requisitos

- Python 3
- PostgreSQL
- Node.js (para el frontend)

Dependencias del pipeline (`requirements.txt`):

```text
pandas==3.0.5
psycopg[binary]==3.3.5
python-dotenv==1.2.3
```

Dependencias del backend (`app/backend/requirements.txt`):

```text
fastapi
uvicorn[standard]
psycopg[binary]
python-dotenv
```

Dependencias del frontend (`app/frontend/package.json`): React, Vite,
TypeScript, React Router, Recharts, Leaflet y React Leaflet.

## Configuración mediante variables de entorno

El backend y el pipeline reutilizan las siguientes variables (definidas en
`.env`, que no debe incorporarse al repositorio):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vitivinicultura
DB_USER=postgres
DB_PASSWORD=
```

El frontend utiliza:

```env
VITE_API_URL=http://localhost:8000/api
```

No se almacenan credenciales en el código.

## Ejecución mínima

### 1. Base de datos

Ejecutar, en orden: `sql/create_database.sql`, `sql/schema.sql` y `sql/views.sql`.

### 2. Pipeline ETL

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python src/pipeline.py
```

### 3. Backend FastAPI

```bash
python -m pip install -r app/backend/requirements.txt
cd app/backend
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend React

```bash
cd app/frontend
npm install
npm run dev          # servidor de desarrollo en http://localhost:5173
npm run build        # build de producción (incluye verificación de TypeScript)
```

## Estado del proyecto

```text
Extracción                    ✓
Transformación                ✓
Validación                    ✓
Carga PostgreSQL              ✓
Vistas analíticas             ✓
Análisis SQL                  ✓
Consumo vía Power BI          ✓ (capa analítica disponible)
API REST FastAPI              ✓
Frontend React + Vite + TS    ✓
Mapa departamental (GeoJSON)  ✓
```
