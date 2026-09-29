# Pipeline ETL de datos vitivinícolas

Proyecto de procesamiento y análisis de datos públicos de la actividad vitivinícola argentina utilizando Python, pandas, PostgreSQL y SQL.

El objetivo es construir un pipeline ETL reproducible que extraiga datasets públicos, aplique transformaciones y validaciones sobre los datos, cargue el resultado en PostgreSQL y prepare una capa analítica reutilizable para su posterior consulta y análisis.

## Datos utilizados

Actualmente el proyecto utiliza dos datasets públicos del Instituto Nacional de Vitivinicultura (INV):

- Superficie implantada con viñedos, período 2012-2024.
- Producción de uvas, período 2012-2025.

Los archivos CSV originales se encuentran en el directorio `data/`.

## Flujo general

El proyecto sigue el siguiente flujo:

```text
CSV
 ↓
Extract
 ↓
Transform
 ↓
Validate
 ↓
Load
 ↓
PostgreSQL
 ↓
Vistas analíticas
 ↓
Consultas SQL de análisis
```

## Pipeline ETL

### Extract

`src/extract.py`

Lee los archivos CSV utilizando pandas y genera los DataFrames utilizados por el resto del pipeline.

Los identificadores geográficos se cargan como texto para preservar correctamente códigos con ceros iniciales o caracteres alfanuméricos.

### Transform

`src/transform.py`

Aplica las transformaciones definidas durante el profiling.

Para superficie:

- identifica registros con información geográfica incompleta;
- identifica filas exactamente duplicadas.

Para producción:

- identifica filas exactamente duplicadas.

Los registros detectados no se eliminan. Se conservan y se identifican mediante columnas booleanas para evitar modificar información sin evidencia suficiente para considerarla errónea.

### Validate

`src/validate.py`

Comprueba que los DataFrames transformados cumplen las condiciones esperadas antes de modificar la base de datos.

Entre las validaciones se controlan:

- cantidad esperada de registros;
- cantidad de registros con geografía incompleta;
- cantidad de filas marcadas como duplicados exactos.

Si alguna validación falla, el pipeline se detiene antes de cargar los datos.

### Load

`src/load.py`

Utiliza Psycopg para conectarse a PostgreSQL.

La carga utiliza una estrategia de full refresh:

```text
TRUNCATE
   ↓
COPY superficie_vinedos
   ↓
COPY produccion_uvas
```

El proceso se ejecuta dentro de una transacción, por lo que una carga incompleta no debe dejar la base de datos en un estado parcial.

## Base de datos

Los datos procesados se almacenan en dos tablas principales:

```text
superficie_vinedos
produccion_uvas
```

Los scripts necesarios para crear la base y su estructura se encuentran en `sql/`.

### create_database.sql

Crea la base de datos:

```text
vitivinicultura
```

### schema.sql

Crea las tablas utilizadas por el pipeline.

### views.sql

Crea una capa de vistas analíticas con agregaciones reutilizables.

Actualmente se definen las siguientes vistas:

```text
vw_superficie_nacional_anual
vw_produccion_nacional_anual

vw_superficie_provincial_anual
vw_produccion_provincial_anual

vw_superficie_departamental_anual
vw_produccion_departamental_anual
```

Las vistas no almacenan físicamente una copia de los resultados.

PostgreSQL conserva la definición de cada consulta y obtiene los datos desde las tablas base cuando la vista es consultada.

Las vistas permiten centralizar agregaciones frecuentes y evitar repetir lógica como `SUM()` y `GROUP BY` en las consultas analíticas.

## Análisis SQL

Las consultas de análisis se encuentran en:

```text
sql/analysis/
```

Esta capa utiliza principalmente las vistas analíticas para responder preguntas sobre:

- evolución nacional de superficie y producción;
- variaciones interanuales;
- cambio acumulado entre 2012 y 2024;
- comparación de la dirección de ambas métricas;
- distribución provincial;
- rankings provinciales;
- cambios provinciales entre 2012 y 2024;
- participación provincial sobre los totales nacionales;
- diferencias de cobertura entre ambos datasets;
- ratio agregado de producción sobre superficie;
- distribución y rankings departamentales;
- comportamiento de la producción durante 2025.

Los análisis que comparan superficie y producción utilizan principalmente el período común 2012-2024.

El año 2025 se analiza únicamente para producción porque el dataset de superficie finaliza en 2024.

## Estructura del proyecto

```text
vitivinicultura-data/
├── data/
│   ├── inv-superficie-viniedos-2012-2024.csv
│   └── inv-produccion-uvas-2012-2025.csv
│
├── exploration/
│   └── profiling_superficie.py
│
├── sql/
│   ├── create_database.sql
│   ├── schema.sql
│   ├── views.sql
│   │
│   └── analysis/
│       ├── 01_evolucion_nacional.sql
│       ├── 02_variacion_interanual.sql
│       ├── 03_cambio_acumulado.sql
│       ├── 04_comparacion_evolucion.sql
│       ├── 05_superficie_por_provincia.sql
│       ├── 06_produccion_por_provincia.sql
│       ├── 07_ranking_provincial.sql
│       ├── 08_cambio_provincial.sql
│       ├── 09_participacion_provincial.sql
│       ├── 10_cobertura_provincial.sql
│       ├── 11_ratio_produccion_superficie.sql
│       ├── 12_analisis_departamental.sql
│       └── 13_produccion_2025.sql
│
├── src/
│   ├── extract.py
│   ├── transform.py
│   ├── validate.py
│   ├── load.py
│   └── pipeline.py
│
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

## Requisitos

Se necesita tener instalado:

- Python
- PostgreSQL

Las dependencias de Python se encuentran declaradas en `requirements.txt`.

Actualmente:

```text
pandas
psycopg[binary]
python-dotenv
```

## Instalación

Crear un entorno virtual:

```powershell
python -m venv .venv
```

Activarlo en PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instalar las dependencias:

```powershell
python -m pip install -r requirements.txt
```

## Configuración

Crear un archivo `.env` a partir de `.env.example`:

```powershell
Copy-Item .env.example .env
```

Configurar las credenciales correspondientes:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vitivinicultura
DB_USER=postgres
DB_PASSWORD=
```

El archivo `.env` contiene configuración local y credenciales, por lo que no debe incorporarse al repositorio.

## Creación de la base de datos

Primero ejecutar:

```text
sql/create_database.sql
```

desde una conexión a una base existente de PostgreSQL, por ejemplo `postgres`.

Luego conectarse a:

```text
vitivinicultura
```

y ejecutar:

```text
sql/schema.sql
```

Este script crea las tablas:

```text
superficie_vinedos
produccion_uvas
```

Después ejecutar:

```text
sql/views.sql
```

para crear las vistas analíticas.

Las vistas pueden crearse aunque las tablas todavía estén vacías, ya que almacenan la definición de las consultas y utilizarán los datos disponibles cuando sean consultadas.

## Ejecución del pipeline

Desde la raíz del proyecto:

```powershell
python src/pipeline.py
```

El pipeline ejecuta:

```text
Extract
   ↓
Transform
   ↓
Validate
   ↓
Load
```

y carga los dos datasets procesados en PostgreSQL.

## Validación de la carga

Después de una ejecución correcta, las tablas contienen actualmente:

```text
superficie_vinedos → 9053 registros
produccion_uvas    → 7582 registros
```

También se conservan indicadores de calidad detectados durante el profiling:

```text
Superficie:
- 3 registros con geografía incompleta.
- 2 filas involucradas en un duplicado exacto.

Producción:
- 2 filas involucradas en un duplicado exacto.
```

Estos registros se conservan deliberadamente.

La estrategia de full refresh permite ejecutar nuevamente el pipeline sin acumular registros correspondientes a ejecuciones anteriores.

## Ejecución de los análisis

Una vez creadas las tablas, cargados los datos y disponibles las vistas, las consultas de:

```text
sql/analysis/
```

pueden ejecutarse directamente sobre la base `vitivinicultura`.

La capa analítica consume principalmente las vistas para evitar repetir las agregaciones definidas a nivel nacional, provincial y departamental.

## Orden de reconstrucción

Para reconstruir el proyecto desde cero:

```text
1. Crear el entorno de Python e instalar requirements.txt
2. Crear y configurar .env
3. Ejecutar sql/create_database.sql
4. Conectarse a vitivinicultura
5. Ejecutar sql/schema.sql
6. Ejecutar sql/views.sql
7. Ejecutar python src/pipeline.py
8. Ejecutar las consultas de sql/analysis/
```

## Estado del proyecto

Actualmente se encuentra implementada una primera versión funcional con:

```text
Extracción                ✓
Transformación            ✓
Validación                ✓
Carga PostgreSQL          ✓
Vistas analíticas         ✓
Consultas SQL de análisis ✓
```

Los datos quedan preparados en PostgreSQL para continuar con etapas posteriores de explotación y visualización.