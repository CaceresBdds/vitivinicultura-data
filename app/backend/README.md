# Backend — API Vitivinicultura Argentina

API REST de solo lectura que expone, en formato JSON, la información
procesada por el pipeline ETL y almacenada en PostgreSQL a través de las
vistas analíticas existentes.

## Stack

- Python
- FastAPI
- Uvicorn
- psycopg 3 (SQL directo, sin ORM)
- python-dotenv

## Estructura

```text
app/backend/
├── app/
│   ├── main.py                     # aplicación FastAPI, CORS y manejo de errores
│   ├── db.py                       # conexión a PostgreSQL y carga de .env
│   ├── validation.py               # validación de año y utilidades numéricas
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
│   └── test_api.py
└── requirements.txt
```

## Configuración

La conexión reutiliza las variables de entorno del proyecto:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

Si existe un archivo `.env` en la raíz del repositorio, se carga
automáticamente (sin sobrescribir variables ya definidas en el entorno).
No se almacenan credenciales en el código.

## Instalación

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r app/backend/requirements.txt
```

## Ejecución

```bash
uvicorn app.main:app --reload --port 8000
```

desde el directorio `app/backend`, o:

```bash
python -m uvicorn app.main:app --app-dir app/backend --port 8000
```

La documentación interactiva de FastAPI queda disponible en `/docs`.

## Endpoints

Base path: `/api`

```text
GET /api/national/summary
GET /api/national/evolution
GET /api/provinces?year=YYYY
GET /api/provinces/{provinceId}/summary?year=YYYY
GET /api/provinces/{provinceId}/history
GET /api/provinces/{provinceId}/departments?year=YYYY
```

## Pruebas

Las pruebas son de integración y requieren una base de datos accesible:

```bash
pip install pytest httpx2
pytest app/backend/tests
```

## Decisiones de implementación

- Los cálculos derivados (variaciones, participaciones y ratio
  producción/superficie) se realizan en el backend a partir de las vistas.
- La ausencia de datos se preserva como `null` y nunca se convierte en `0`.
- Los años válidos para las métricas comparadas son 2012-2024.
- `productionSurfaceRatio` se expone como ratio producción/superficie,
  expresado en quintales por hectárea.
