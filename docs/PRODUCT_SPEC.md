# Product Specification

## Producto

Aplicación web de exploración de datos sobre la actividad vitivinícola argentina.

La aplicación utilizará exclusivamente los datos procesados por el pipeline ETL existente y almacenados en PostgreSQL. Su objetivo es ofrecer una interfaz visual y accesible para consultar la evolución de la superficie implantada con viñedos y la producción de uva, sin que el usuario necesite acceder directamente a archivos CSV, consultas SQL o herramientas de análisis.

## Objetivo

Permitir que un usuario pueda:

- comprender la evolución nacional de la superficie implantada y la producción de uva;
- comparar la actividad entre provincias;
- consultar la evolución histórica de una provincia;
- explorar la distribución de superficie y producción a nivel departamental;
- filtrar y navegar los datos de forma interactiva.

## Tipo de aplicación

La aplicación será exclusivamente de consulta.

No permitirá crear, modificar ni eliminar datos.

Los datos serán obtenidos mediante una API REST desarrollada específicamente para la aplicación. El backend consultará PostgreSQL y utilizará principalmente las vistas analíticas ya existentes.

El frontend nunca accederá directamente a PostgreSQL ni procesará los archivos CSV originales.

## Alcance

La aplicación incluirá análisis a tres niveles:

- nacional;
- provincial;
- departamental.

El período disponible dependerá de cada fuente:

- superficie implantada: 2012-2024;
- producción de uva: 2012-2025.

Cuando se comparen ambas métricas se utilizará el período común 2012-2024.

## Fuera de alcance

La primera versión no incluirá:

- autenticación de usuarios;
- roles o permisos;
- ABM/CRUD;
- modificación de datos;
- carga manual de archivos;
- ejecución del pipeline desde la aplicación;
- panel administrativo.