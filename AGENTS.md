# Agent Instructions

## Goal

Implement the complete web application defined by the specifications in `/docs`.

The application is part of an existing viticulture data project.

Before making changes, inspect the repository and read completely:

- `docs/PRODUCT_SPEC.md`
- `docs/UI_SPEC.md`
- `docs/API_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN_SPEC.md`

These documents define the expected product, functionality, API contracts,
architecture and visual direction.

Do not replace these specifications with your own interpretation when they
already define a decision.

---

## Existing project

The repository already contains:

- a Python ETL pipeline in `/src`;
- public source datasets in `/data`;
- PostgreSQL schema and analytical views in `/sql`;
- existing project documentation.

The ETL pipeline already processes the source data and loads PostgreSQL.

The web application is a consumer of the processed data.

Expected flow:

```text
INV datasets
     ↓
Existing Python ETL
     ↓
PostgreSQL
     ↓
Analytical views
     ↓
FastAPI
     ↓
REST API
     ↓
React application
```

Do not redesign the existing ETL pipeline.

---

## Application location

Create the complete web application inside:

```text
app/
├── backend/
└── frontend/
```

Do not move or reorganize the existing pipeline unless an explicit
specification requires it.

---

## Backend

Use:

- Python
- FastAPI
- Uvicorn
- psycopg 3
- direct SQL

Do not use an ORM.

The backend must:

- implement all endpoints defined in `API_SPEC.md`;
- query PostgreSQL;
- use the existing analytical views whenever possible;
- use parameterized SQL;
- validate request parameters;
- return typed responses;
- preserve missing analytical data as `null`;
- remain read-only.

Do not:

- read the source CSV files from the API;
- execute the ETL pipeline from the API;
- create CRUD functionality;
- add authentication;
- modify analytical data.

---

## Frontend

Use:

- React
- Vite
- TypeScript
- React Router
- Recharts
- Leaflet
- React Leaflet

Implement all pages, interactions and states defined in `UI_SPEC.md`.

Follow the visual direction defined in `DESIGN_SPEC.md`.

The frontend must obtain analytical data exclusively through the REST API.

Do not hardcode analytical values.

---

## Cartography

The department map must use GeoJSON territorial geometries and analytical values
from the API.

GeoJSON provides geometry.

The REST API provides viticulture data.

Join both through the official department identifier:

```text
API departmentId
        =
GeoJSON department id
```

Do not join departments by name when an identifier is available.

Departments that exist geographically but have no analytical value for the
selected metric must remain visible and be represented as missing data.

Missing data must never be converted automatically to zero.

Use official GeoRef-compatible territorial geometries.

Store the required GeoJSON files as frontend assets according to
`ARCHITECTURE.md`.

If obtaining the required cartographic assets automatically is not possible,
implement the cartographic integration and clearly report which assets remain
to be provided instead of replacing the map with invented geometry.

---

## Environment and secrets

Existing environment variables may be used for PostgreSQL connectivity.

Do not:

- modify `.env`;
- print secrets;
- commit credentials;
- place database passwords in source code.

`.env.example` may be updated if documentation of additional variables is
necessary.

---

## Dependencies

You may install the dependencies required by the specified architecture.

Do not introduce frameworks or libraries that are not needed to implement the
specifications.

Prefer simple solutions over unnecessary abstractions.

---

## Implementation approach

Implement the entire specified application.

Do not stop after creating only the project skeleton or the first page.

Continue through:

```text
backend
→ API endpoints
→ frontend
→ navigation
→ charts
→ provincial analysis
→ province detail
→ departmental map
→ responsive behavior
→ verification
```

Resolve implementation errors encountered during the process when possible.

You may create, modify and organize files inside `/app` as required.

Small structural adjustments are allowed when technically justified and
consistent with `ARCHITECTURE.md`.

---

## Verification

Before considering the work complete:

- install backend dependencies;
- verify that the backend starts;
- verify PostgreSQL connectivity when the local environment allows it;
- exercise the API endpoints;
- install frontend dependencies;
- run the frontend build;
- verify TypeScript compilation;
- verify navigation between all pages;
- verify year filtering;
- verify province selection;
- verify province detail navigation;
- verify charts;
- verify map integration;
- verify map/ranking synchronization;
- verify loading, error and empty states;
- verify that analytical values are not hardcoded;
- verify that missing data is not treated as zero.

Use the verification requirements in `ARCHITECTURE.md` as the complete
reference.

---

## Existing project protection

Do not modify the existing ETL pipeline unless an explicit requirement makes a
change necessary.

Do not delete:

- datasets;
- SQL files;
- database definitions;
- analytical views;
- existing documentation.

Do not perform destructive database operations.

Do not perform `git push`.

---

## Decision priority

When deciding how to implement something, use this priority:

```text
explicit specification
        ↓
existing project architecture and data model
        ↓
simplicity and maintainability
        ↓
reasonable implementation judgment
```

Do not invent new product functionality merely because it could be useful.

If a minor implementation detail is unspecified, choose a sensible solution
consistent with the existing specifications.

---

## Completion report

When implementation is complete, provide a concise report containing:

- what was implemented;
- backend and frontend structure created;
- verification commands executed;
- verification results;
- important implementation decisions;
- any unresolved issue or limitation.

Do not report the project as complete if a known required feature has not been
implemented.