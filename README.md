# Pipeline ETL de datos vitivinícolas

Proyecto de procesamiento de datos públicos de la actividad vitivinícola argentina utilizando Python, pandas, PostgreSQL y SQL.

El objetivo es construir un pipeline ETL reproducible que extraiga datasets públicos, aplique transformaciones y validaciones sobre los datos y cargue el resultado en una base de datos PostgreSQL para su posterior consulta y análisis.

## Datos utilizados

Actualmente el pipeline utiliza dos datasets:

- Superficie implantada con viñedos, período 2012-2024.
- Producción de uvas, período 2012-2025.

Los archivos CSV originales se encuentran en el directorio `data/`.

## Flujo ETL

El pipeline sigue el siguiente proceso:

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
```

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

Los registros detectados no se eliminan, sino que se conservan y se identifican mediante columnas booleanas.

### Validate

`src/validate.py`

Comprueba que los DataFrames transformados cumplen las condiciones esperadas antes de modificar la base de datos.

Si alguna validación falla, el pipeline se detiene.

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

## Estructura del proyecto

```text
vitivinicultura-data/
├── data/
├── sql/
│   ├── create_database.sql
│   └── schema.sql
├── src/
│   ├── extract.py
│   ├── transform.py
│   ├── validate.py
│   ├── load.py
│   └── pipeline.py
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

## Base de datos

Primero ejecutar:

```text
sql/create_database.sql
```

desde una conexión a una base existente de PostgreSQL, por ejemplo `postgres`.

Luego conectarse a la base:

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

## Ejecución

Desde la raíz del proyecto:

```powershell
python src/pipeline.py
```

El pipeline:

```text
extrae
→ transforma
→ valida
→ carga
```

los dos datasets en PostgreSQL.

## Validación de la carga

Después de una ejecución correcta, las tablas contienen actualmente:

```text
superficie_vinedos → 9053 registros
produccion_uvas    → 7582 registros
```

La estrategia de full refresh permite ejecutar nuevamente el pipeline sin acumular duplicados correspondientes a ejecuciones anteriores.

## Estado del proyecto

Actualmente se encuentra implementada una primera versión funcional del pipeline ETL con:

```text
Extract   ✓
Transform ✓
Validate  ✓
Load      ✓
```

Los datos almacenados en PostgreSQL quedan disponibles para su posterior explotación mediante SQL y herramientas de análisis.