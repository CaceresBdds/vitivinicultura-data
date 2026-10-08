# UI Specification

## Objetivo de la interfaz

La aplicación debe permitir explorar los datos vitivinícolas de forma visual,
clara e interactiva, evitando que el usuario necesite conocer la estructura
de la base de datos o realizar consultas SQL.

La interfaz debe priorizar la lectura, comparación y exploración territorial
de la información sobre la cantidad de elementos mostrados.

La aplicación tendrá navegación entre diferentes niveles de análisis:

- panorama nacional;
- análisis provincial;
- detalle de provincia.

---

## Navegación principal

La aplicación contará con una navegación principal que permita acceder a:

- Panorama nacional
- Provincias

El detalle de una provincia se accederá desde la sección de análisis provincial,
seleccionando una provincia.

No existirá una sección independiente de departamentos.

El análisis departamental formará parte del detalle de cada provincia.

---

# Página: Panorama nacional

## Objetivo

Permitir comprender rápidamente cómo evolucionaron la superficie implantada
con viñedos y la producción de uva en Argentina durante el período disponible.

Cuando ambas métricas sean comparadas, se utilizará el período común
2012-2024.

---

## Indicadores principales

En la parte superior se mostrarán cuatro indicadores:

- superficie total implantada en 2024, expresada en hectáreas;
- variación porcentual de la superficie entre 2012 y 2024;
- producción total de uva en 2024, expresada en quintales;
- variación porcentual de la producción entre 2012 y 2024.

Los indicadores deberán mostrar valores formateados para facilitar su lectura.

---

## Evolución de superficie

Mostrar un gráfico temporal con:

- eje X: año;
- eje Y: superficie implantada en hectáreas;
- período: 2012-2024.

El usuario deberá poder consultar el valor exacto de cada año mediante tooltip.

---

## Evolución de producción

Mostrar un gráfico temporal con:

- eje X: año;
- eje Y: producción de uva en quintales;
- período: 2012-2024.

El usuario deberá poder consultar el valor exacto de cada año mediante tooltip.

---

## Variación interanual

Mostrar en un mismo gráfico:

- variación interanual de superficie;
- variación interanual de producción.

Ambas métricas se mostrarán como porcentajes.

El período será 2013-2024, ya que 2012 no dispone de un año anterior dentro
del dataset para calcular su variación.

---

## Diseño general

La página debe utilizar una distribución similar a:

```text
┌───────────────────────────────────────────────────────────┐
│ Panorama nacional                                        │
│ Superficie y producción vitivinícola argentina           │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│ Superficie  │ Cambio      │ Producción  │ Cambio          │
│ 2024        │ superficie  │ 2024        │ producción      │
├───────────────────────────┬───────────────────────────────┤
│ Evolución superficie     │ Evolución producción          │
├───────────────────────────────────────────────────────────┤
│ Variación interanual superficie vs producción            │
└───────────────────────────────────────────────────────────┘
```

---

# Página: Análisis provincial

## Objetivo

Permitir comparar la importancia relativa de las provincias dentro de la
actividad vitivinícola argentina para un año determinado.

La página deberá facilitar:

- identificar las provincias con mayor superficie implantada;
- identificar las provincias con mayor producción;
- comparar su participación dentro del total nacional;
- consultar el ratio agregado producción/superficie;
- seleccionar una provincia para profundizar en su análisis.

---

## Período

La página trabajará exclusivamente con el período común 2012-2024.

El selector de año mostrará esos años y tendrá 2024 seleccionado por defecto.

Cambiar el año actualizará toda la información de la página.

---

## Rankings provinciales

Se mostrarán dos gráficos de barras horizontales:

- superficie implantada por provincia;
- producción de uva por provincia.

Las provincias se ordenarán de mayor a menor según la métrica correspondiente.

Los gráficos mostrarán todas las provincias disponibles para el año seleccionado.

Al pasar el cursor sobre una provincia se mostrará un tooltip con:

- nombre de la provincia;
- valor exacto de la métrica;
- unidad;
- participación porcentual sobre el total nacional correspondiente.

---

## Selección de provincia

El usuario podrá seleccionar una provincia haciendo clic sobre ella en cualquiera
de los rankings.

La provincia seleccionada quedará activa en la página y se utilizará para
mostrar un resumen provincial.

La selección realizada en un ranking deberá reflejarse también en el otro cuando
la provincia exista en ambos datasets.

La provincia seleccionada deberá distinguirse visualmente de las demás.

Si una provincia tiene superficie registrada pero no producción para el año
seleccionado, la aplicación deberá indicar:

```text
Sin dato de producción
```

La ausencia de registros nunca deberá mostrarse como producción igual a cero.

---

## Resumen de provincia seleccionada

Cuando exista una provincia seleccionada se mostrarán:

- superficie implantada;
- producción de uva;
- participación sobre la superficie nacional;
- participación sobre la producción nacional;
- ratio agregado producción/superficie expresado en quintales por hectárea.

El ratio deberá denominarse explícitamente:

```text
Ratio producción/superficie
```

No deberá denominarse rendimiento.

Si no existe producción para la combinación año + provincia:

- producción deberá mostrarse como no disponible;
- participación de producción deberá mostrarse como no disponible;
- ratio producción/superficie deberá mostrarse como no disponible.

---

## Navegación al detalle

El resumen incluirá una acción:

```text
Ver detalle de [provincia]
```

Esta acción abrirá la página Detalle de provincia.

El año seleccionado deberá conservarse al navegar al detalle.

---

## Diseño general

Distribución sugerida:

```text
┌───────────────────────────────────────────────────────────────┐
│ Análisis provincial                       Año: [ 2024 ▼ ]    │
│ Comparación territorial de superficie y producción           │
├───────────────────────────────┬───────────────────────────────┤
│ Superficie por provincia      │ Producción por provincia     │
│                               │                               │
│ ranking                       │ ranking                       │
│                               │                               │
└───────────────────────────────┴───────────────────────────────┘

Provincia seleccionada: Mendoza

┌────────────┬────────────┬────────────┬────────────┬───────────┐
│ Superficie │ Producción │ Part. sup. │ Part. prod.│ Ratio     │
└────────────┴────────────┴────────────┴────────────┴───────────┘

                                      [ Ver detalle de Mendoza → ]
```

---

# Página: Detalle de provincia

## Objetivo

Permitir analizar una provincia específica con mayor profundidad.

La página deberá priorizar la distribución departamental de superficie
implantada y producción de uva.

La evolución histórica de la provincia también deberá estar disponible como
contexto, pero tendrá menor protagonismo que el análisis territorial por
departamentos.

---

## Contexto de navegación

La página recibirá la provincia seleccionada desde la sección Análisis provincial.

También conservará el año seleccionado en la página anterior.

El usuario deberá poder cambiar el año desde esta pantalla.

El período disponible será 2012-2024.

---

## Encabezado

Mostrar:

- nombre de la provincia seleccionada;
- año activo;
- selector de año;
- acción para volver al análisis provincial.

Ejemplo:

```text
Mendoza

Detalle provincial                     Año: [ 2024 ▼ ]

[ ← Volver a provincias ]
```

---

## Resumen provincial

Mostrar indicadores compactos correspondientes a la provincia y año
seleccionados:

- superficie total implantada;
- producción total de uva;
- participación sobre la superficie nacional;
- participación sobre la producción nacional;
- ratio agregado producción/superficie.

Si no existe producción para la combinación provincia + año, los indicadores
correspondientes deberán mostrarse como no disponibles y nunca como cero.

---

## Evolución histórica

Mostrar dos gráficos temporales compactos:

- evolución de la superficie implantada de la provincia;
- evolución de la producción de uva de la provincia.

Período:

```text
2012-2024
```

Los gráficos deberán permitir consultar el valor exacto de cada año mediante tooltip.

Esta sección tendrá un rol secundario dentro de la página.

No deberá tener mayor protagonismo visual que el análisis departamental.

---

# Análisis departamental

## Objetivo

Esta será la sección principal de la página Detalle de provincia.

El objetivo será permitir comprender cómo se distribuyen territorialmente la
superficie implantada y la producción de uva dentro de la provincia seleccionada.

La información será presentada combinando:

- un mapa coroplético de departamentos;
- un ranking departamental.

Ambas visualizaciones deberán representar la misma métrica activa.

---

## Selector de métrica

El usuario podrá alternar entre:

```text
[ Superficie ] [ Producción ]
```

Por defecto estará seleccionada:

```text
Superficie
```

Al cambiar la métrica deberán actualizarse simultáneamente:

- el mapa departamental;
- la escala de colores;
- la leyenda;
- los tooltips;
- el ranking departamental.

---

## Mapa departamental

Mostrar un mapa de la provincia dividido por sus departamentos.

Cada departamento deberá representarse mediante su geometría territorial.

Los departamentos se colorearán según la intensidad de la métrica seleccionada.

Para superficie:

- utilizar una escala asociada al color verde;
- representar superficie implantada en hectáreas.

Para producción:

- utilizar una escala asociada al color bordó;
- representar producción de uva en quintales.

El mapa deberá mostrar únicamente la provincia actualmente seleccionada.

No será necesario mostrar todo el territorio argentino en esta visualización.

---

## Leyenda del mapa

El mapa deberá incluir una leyenda que permita interpretar la relación entre
intensidad de color y valor de la métrica.

La leyenda deberá actualizarse al cambiar entre superficie y producción.

Los departamentos sin información deberán representarse mediante un estilo
visual distinto de aquellos departamentos cuyo valor sea realmente cero.

La ausencia de datos nunca deberá representarse como valor cero.

---

## Tooltip departamental

Al pasar el cursor sobre un departamento se mostrará como mínimo:

- nombre del departamento;
- valor de la métrica activa;
- unidad correspondiente;
- participación dentro del total provincial.

Ejemplo para superficie:

```text
San Rafael

Superficie implantada
18.420 ha

Participación provincial
13,2 %
```

Ejemplo para producción:

```text
San Rafael

Producción de uva
1.850.000 qq

Participación provincial
15,4 %
```

Si no existe información para la métrica seleccionada se mostrará:

```text
Sin dato disponible
```

---

## Selección de departamento

El usuario podrá seleccionar un departamento desde el mapa o desde el ranking.

El departamento seleccionado deberá quedar resaltado en ambas visualizaciones.

Por ejemplo:

```text
selección en mapa
        ↓
resalta departamento en ranking

selección en ranking
        ↓
resalta departamento en mapa
```

La selección tendrá únicamente fines exploratorios.

No se implementará una página adicional de detalle departamental en esta versión.

---

## Ranking departamental

Junto al mapa se mostrará un ranking de departamentos correspondiente a la
métrica actualmente seleccionada.

Para superficie mostrará:

```text
Superficie implantada por departamento
```

Para producción mostrará:

```text
Producción de uva por departamento
```

El ranking utilizará barras horizontales.

Los departamentos se ordenarán de mayor a menor.

Cada elemento deberá mostrar o permitir consultar:

- nombre del departamento;
- valor;
- participación dentro del total provincial.

El ranking permitirá comparar con mayor precisión valores que en el mapa pueden
ser difíciles de distinguir únicamente mediante intensidad de color.

---

## Tratamiento de datos faltantes

La ausencia de registros de producción no deberá interpretarse como producción
igual a cero.

Cuando un departamento tenga superficie registrada pero no producción:

- deberá seguir apareciendo en el mapa de superficie;
- deberá aparecer normalmente en el ranking de superficie;
- al cambiar a producción deberá indicarse que no existe información;
- no deberá asignársele artificialmente producción igual a cero.

La interfaz deberá distinguir claramente:

```text
valor = 0
```

de:

```text
dato inexistente
```

---

## Diseño general

La página deberá priorizar visualmente el análisis departamental.

Distribución sugerida:

```text
┌────────────────────────────────────────────────────────────────┐
│ Mendoza                                      [← Provincias]   │
│ Detalle provincial                  Año: [ 2024 ▼ ]           │
├───────────┬───────────┬───────────┬───────────┬────────────────┤
│Superficie │Producción │Part. sup. │Part. prod.│ Ratio          │
├──────────────────────────────┬─────────────────────────────────┤
│ Evolución superficie        │ Evolución producción             │
└──────────────────────────────┴─────────────────────────────────┘


ANÁLISIS DEPARTAMENTAL

Métrica: [ Superficie ] [ Producción ]

┌──────────────────────────────────┬─────────────────────────────┐
│                                  │ Ranking de departamentos   │
│                                  │                             │
│        MAPA DE PROVINCIA         │ San Rafael   █████████     │
│                                  │ Maipú        ███████       │
│   departamentos coloreados       │ San Martín   ██████        │
│   según la métrica activa        │ ...                         │
│                                  │                             │
│          [ leyenda ]             │                             │
└──────────────────────────────────┴─────────────────────────────┘
```

---

# Estados generales de la interfaz

## Carga

Mientras se obtienen datos desde la API, la interfaz deberá mostrar un estado de
carga adecuado.

No deberán aparecer valores temporales inventados o hardcodeados.

---

## Error

Si una solicitud a la API falla, deberá mostrarse un mensaje comprensible para
el usuario.

Ejemplo:

```text
No fue posible cargar la información.
Intentá nuevamente.
```

No mostrar errores técnicos internos de FastAPI, PostgreSQL o JavaScript al
usuario final.

---

## Sin datos

Cuando una consulta válida no posea información deberá mostrarse explícitamente
un estado de ausencia de datos.

Ejemplos:

```text
Sin dato de producción
```

```text
Sin información disponible para este período
```

La ausencia de datos no deberá representarse mediante cero salvo que cero sea
realmente el valor almacenado.

---

# Comportamiento responsive

En pantallas grandes podrán utilizarse composiciones de dos columnas.

En pantallas pequeñas:

- los indicadores podrán reorganizarse en varias filas;
- los gráficos se apilarán verticalmente;
- los rankings ocuparán todo el ancho disponible;
- el mapa y el ranking departamental se mostrarán uno debajo del otro;
- la navegación deberá seguir siendo accesible;
- los controles de año y métrica deberán conservar su funcionalidad.

No deberá eliminarse información importante únicamente por utilizar un
dispositivo móvil.

---

# Límites funcionales de la interfaz

La aplicación será exclusivamente de consulta.

No incluirá:

- creación de datos;
- modificación de datos;
- eliminación de datos;
- autenticación;
- usuarios;
- roles;
- panel administrativo;
- carga manual de datasets;
- ejecución del pipeline ETL desde la interfaz;
- detalle individual de departamentos.

El nivel máximo de exploración territorial de esta versión será el análisis
departamental dentro del detalle de una provincia.