# API Specification

## Objetivo

La API REST será la única vía de comunicación entre el frontend y PostgreSQL.

El backend deberá consultar los datos procesados por el pipeline ETL,
principalmente mediante las vistas analíticas existentes.

El frontend no deberá conectarse directamente a PostgreSQL ni realizar
agregaciones que correspondan a la capa de datos.

Base path:

```text
/api
```

## Convenciones

- Las respuestas utilizarán JSON.
- Los valores numéricos deberán enviarse como números y no como strings.
- Los identificadores geográficos deberán mantenerse como strings.
- La ausencia de datos deberá representarse mediante `null`, nunca mediante `0`
  salvo que la fuente contenga realmente un valor cero.
- Los errores deberán devolver un código HTTP apropiado y una respuesta JSON.
- Los endpoints que reciban un año deberán validar que se encuentre dentro
  del período permitido para ese análisis.
- Las comparaciones entre superficie y producción utilizarán el período común
  2012-2024.
- Producción dispone además de información para 2025, pero ese año no deberá
  utilizarse en endpoints que comparen ambas métricas.
- Los nombres de propiedades JSON utilizarán `camelCase`.
- Los identificadores de provincia y departamento serán utilizados como claves
  principales para relacionar información geográfica siempre que estén disponibles.

---

## GET /api/national/summary

Devuelve los principales indicadores nacionales utilizados en la página
Panorama nacional.

### Response

```json
{
  "year": 2024,
  "surfaceHa": 199945.8935,
  "productionQuintals": 19189739.95,
  "surfaceChangePct": -9.61,
  "productionChangePct": -14.49
}
```

### Fuente de datos

- `vw_superficie_nacional_anual`
- `vw_produccion_nacional_anual`

### Reglas

- El año de referencia será 2024.
- `surfaceHa` representa la superficie total implantada en 2024.
- `productionQuintals` representa la producción total de uva en 2024.
- `surfaceChangePct` compara superficie de 2012 contra superficie de 2024.
- `productionChangePct` compara producción de 2012 contra producción de 2024.
- Los cambios porcentuales se calcularán mediante:

```text
(valor_2024 - valor_2012) / valor_2012 * 100
```

- Los porcentajes serán enviados ya expresados como porcentaje.
- Por ejemplo, `-9.61` representa `-9.61 %`.

---

## GET /api/national/evolution

Devuelve la evolución nacional de superficie y producción durante el período
común 2012-2024.

También incluye las variaciones interanuales necesarias para las visualizaciones
de Panorama nacional.

### Response

```json
[
  {
    "year": 2012,
    "surfaceHa": 221201.85,
    "productionQuintals": 22442431.43,
    "surfaceYoYPct": null,
    "productionYoYPct": null
  },
  {
    "year": 2013,
    "surfaceHa": 223580.36,
    "productionQuintals": 28717487.3,
    "surfaceYoYPct": 1.08,
    "productionYoYPct": 27.96
  }
]
```

### Fuente de datos

- `vw_superficie_nacional_anual`
- `vw_produccion_nacional_anual`

### Reglas

- El período será 2012-2024.
- La respuesta deberá ordenarse ascendentemente por año.
- Para 2012:
  - `surfaceYoYPct` será `null`.
  - `productionYoYPct` será `null`.
- La variación interanual se calculará mediante:

```text
(valor_actual - valor_anterior) / valor_anterior * 100
```

- No deberá incluirse producción de 2025 en este endpoint.
- Los registros de superficie con geografía incompleta forman parte del total
  nacional porque no es necesario conocer su ubicación para calcular dicho total.

---

## GET /api/provinces

Devuelve la información provincial correspondiente al año seleccionado.

Será el endpoint principal de la página Análisis provincial.

### Query parameters

```text
year
```

### Ejemplo

```http
GET /api/provinces?year=2024
```

### Response

Los valores numéricos del siguiente ejemplo representan únicamente la estructura
esperada de la respuesta.

```json
{
  "year": 2024,
  "provinces": [
    {
      "provinceId": "50",
      "province": "Mendoza",
      "surfaceHa": 100000.0,
      "productionQuintals": 10000000.0,
      "surfaceSharePct": 50.0,
      "productionSharePct": 60.0,
      "productionSurfaceRatio": 100.0
    }
  ]
}
```

### Fuente de datos

- `vw_superficie_provincial_anual`
- `vw_produccion_provincial_anual`
- `vw_superficie_nacional_anual`
- `vw_produccion_nacional_anual`

### Reglas

- `year` será obligatorio.
- Años permitidos: 2012-2024.
- Si `year` no existe o está fuera del período permitido, devolver HTTP 400.
- Las provincias deberán identificarse principalmente mediante `provincia_id`.
- La respuesta deberá incluir todas las provincias disponibles en superficie
  para el año seleccionado.
- Las provincias podrán ordenarse posteriormente en el frontend según la métrica
  utilizada por cada visualización.
- `surfaceSharePct` representa la participación de la provincia sobre la
  superficie nacional del mismo año.
- `productionSharePct` representa la participación de la provincia sobre la
  producción nacional del mismo año.
- `productionSurfaceRatio` representa:

```text
producción provincial / superficie provincial
```

y se expresará en quintales por hectárea.

- El indicador deberá denominarse ratio producción/superficie.
- No deberá denominarse rendimiento agronómico.
- Si existe superficie para una provincia pero no existe producción para el
  mismo año:
  - `productionQuintals` será `null`.
  - `productionSharePct` será `null`.
  - `productionSurfaceRatio` será `null`.
- La ausencia de producción nunca deberá interpretarse como producción igual a cero.
- Los registros provinciales de superficie no incluirán filas sin provincia
  asignada.
- El total nacional utilizado como denominador para superficie sí conservará
  los registros sin provincia, ya que forman parte del total nacional.

---

## GET /api/provinces/{provinceId}/summary

Devuelve los principales indicadores de una provincia para el año seleccionado.

Será utilizado en la página Detalle de provincia.

### Path parameters

```text
provinceId
```

### Query parameters

```text
year
```

### Ejemplo

```http
GET /api/provinces/50/summary?year=2024
```

### Response

Los valores numéricos del siguiente ejemplo representan únicamente la estructura
esperada de la respuesta.

```json
{
  "year": 2024,
  "provinceId": "50",
  "province": "Mendoza",
  "surfaceHa": 100000.0,
  "productionQuintals": 10000000.0,
  "surfaceSharePct": 50.0,
  "productionSharePct": 60.0,
  "productionSurfaceRatio": 100.0
}
```

### Fuente de datos

- `vw_superficie_provincial_anual`
- `vw_produccion_provincial_anual`
- `vw_superficie_nacional_anual`
- `vw_produccion_nacional_anual`

### Reglas

- `provinceId` será obligatorio.
- `year` será obligatorio.
- Años permitidos: 2012-2024.
- Si el año no es válido, devolver HTTP 400.
- Si la provincia no existe, devolver HTTP 404.
- Si existe superficie pero no producción:
  - `productionQuintals` será `null`.
  - `productionSharePct` será `null`.
  - `productionSurfaceRatio` será `null`.
- La ausencia de datos nunca deberá convertirse automáticamente en cero.

---

## GET /api/provinces/{provinceId}/history

Devuelve la evolución histórica de superficie y producción correspondiente a
una provincia.

Será utilizado para los gráficos históricos de la página Detalle de provincia.

### Path parameters

```text
provinceId
```

### Ejemplo

```http
GET /api/provinces/50/history
```

### Response

Los valores representan únicamente la estructura esperada.

```json
{
  "provinceId": "50",
  "province": "Mendoza",
  "history": [
    {
      "year": 2012,
      "surfaceHa": 100000.0,
      "productionQuintals": 9000000.0
    },
    {
      "year": 2013,
      "surfaceHa": 99000.0,
      "productionQuintals": null
    }
  ]
}
```

### Fuente de datos

- `vw_superficie_provincial_anual`
- `vw_produccion_provincial_anual`

### Reglas

- Período: 2012-2024.
- La serie deberá ordenarse ascendentemente por año.
- Si la provincia no existe, devolver HTTP 404.
- Deberán utilizarse los IDs provinciales para relacionar ambas fuentes.
- Si para determinado año existe superficie pero no producción:
  - `surfaceHa` conservará su valor.
  - `productionQuintals` será `null`.
- Si una métrica no existe para determinado año, deberá representarse mediante `null`.
- La ausencia de registros nunca deberá transformarse automáticamente en cero.

---

## GET /api/provinces/{provinceId}/departments

Devuelve la distribución departamental correspondiente a una provincia y año.

Será utilizado en la sección principal de la página Detalle de provincia.

### Path parameters

```text
provinceId
```

### Query parameters

```text
year
```

### Ejemplo

```http
GET /api/provinces/50/departments?year=2024
```

### Response

Los valores del siguiente ejemplo representan únicamente la estructura esperada.

```json
{
  "year": 2024,
  "provinceId": "50",
  "province": "Mendoza",
  "departments": [
    {
      "departmentId": "50007",
      "department": "Departamento ejemplo",
      "surfaceHa": 10000.0,
      "productionQuintals": 900000.0,
      "surfaceSharePct": 10.0,
      "productionSharePct": 9.0
    }
  ]
}
```

### Fuente de datos

- `vw_superficie_departamental_anual`
- `vw_produccion_departamental_anual`
- `vw_superficie_provincial_anual`
- `vw_produccion_provincial_anual`

### Reglas

- `provinceId` será obligatorio.
- `year` será obligatorio.
- Años permitidos: 2012-2024.
- Si el año no es válido, devolver HTTP 400.
- Si la provincia no existe, devolver HTTP 404.
- Los departamentos deberán identificarse principalmente mediante
  `departamento_id`.
- La participación departamental de superficie se calculará respecto de la
  superficie total de la provincia para el mismo año.
- La participación departamental de producción se calculará respecto de la
  producción total de la provincia para el mismo año.
- Si existe superficie para un departamento pero no existe producción:
  - `productionQuintals` será `null`.
  - `productionSharePct` será `null`.
- La ausencia de producción nunca deberá interpretarse como producción igual a cero.
- Los departamentos sin identificación geográfica válida no deberán incluirse
  en la distribución departamental.

---

## Formato de errores

Todos los errores deberán devolverse en formato JSON.

Formato general:

```json
{
  "error": "Mensaje descriptivo"
}
```

### 400 Bad Request

Se utilizará cuando los parámetros recibidos sean inválidos.

Ejemplo:

```json
{
  "error": "El año debe encontrarse entre 2012 y 2024."
}
```

Casos posibles:

- parámetro `year` ausente;
- año fuera del período permitido;
- formato de parámetro inválido.

### 404 Not Found

Se utilizará cuando el recurso solicitado no exista.

Ejemplo:

```json
{
  "error": "Provincia no encontrada."
}
```

### 500 Internal Server Error

Se utilizará ante errores inesperados del servidor o de PostgreSQL.

Ejemplo:

```json
{
  "error": "Error interno del servidor."
}
```

No deberán exponerse al cliente:

- contraseñas;
- credenciales;
- connection strings;
- stack traces;
- detalles internos de PostgreSQL.

---

## Consideraciones generales de implementación

La API deberá reutilizar las vistas analíticas existentes siempre que sea posible.

No deberá:

- leer directamente los archivos CSV;
- ejecutar nuevamente el pipeline ETL;
- duplicar innecesariamente agregaciones ya resueltas por las vistas;
- modificar registros de PostgreSQL;
- crear endpoints de escritura;
- interpretar registros ausentes como valores cero.

El backend será exclusivamente una capa de consulta entre PostgreSQL y el frontend.

Flujo esperado:

```text
PostgreSQL
    ↓
Vistas analíticas
    ↓
Backend REST API
    ↓
JSON
    ↓
Frontend React
```

La API deberá entregar los datos en una estructura adecuada para que el frontend
se concentre principalmente en presentación, interacción y visualización.