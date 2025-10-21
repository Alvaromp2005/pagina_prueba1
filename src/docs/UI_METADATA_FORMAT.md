# Formato de Metadatos de UI para Formularios Dinámicos

Este documento describe el formato de metadatos utilizado para generar formularios dinámicos en la aplicación. Los metadatos definen la estructura, validación y comportamiento de los campos del formulario.

## Estructura General

Los metadatos de UI se definen como un array de objetos, donde cada objeto representa un parámetro/campo del formulario:

```json
{
  "ui_metadata": [
    {
      "name": "nombre_del_campo",
      "type": "tipo_de_campo",
      "label": "Etiqueta visible",
      "required": true/false,
      "defaultValue": "valor_por_defecto",
      "placeholder": "texto_de_ayuda",
      "description": "descripción_del_campo",
      "validation": {
        "pattern": "expresión_regular",
        "min": valor_mínimo,
        "max": valor_máximo,
        "minLength": longitud_mínima,
        "maxLength": longitud_máxima
      },
      "options": [
        { "value": "valor1", "label": "Etiqueta 1" },
        { "value": "valor2", "label": "Etiqueta 2" }
      ]
    }
  ]
}
```

## Propiedades de Campo

### Propiedades Básicas

- **`name`** (string, requerido): Identificador único del campo. Se usa como clave en el objeto de datos del formulario.
- **`type`** (string, requerido): Tipo de campo que determina el componente de entrada a renderizar.
- **`label`** (string, requerido): Texto que se muestra como etiqueta del campo.
- **`required`** (boolean, opcional): Indica si el campo es obligatorio. Por defecto: `false`.
- **`defaultValue`** (string/number/boolean, opcional): Valor inicial del campo.
- **`placeholder`** (string, opcional): Texto de ayuda que se muestra cuando el campo está vacío.
- **`description`** (string, opcional): Descripción adicional del campo que se muestra como ayuda.

### Validación

La propiedad `validation` es un objeto opcional que define reglas de validación:

- **`pattern`** (string): Expresión regular para validar el formato del valor.
- **`min`** (number): Valor mínimo para campos numéricos.
- **`max`** (number): Valor máximo para campos numéricos.
- **`minLength`** (number): Longitud mínima para campos de texto.
- **`maxLength`** (number): Longitud máxima para campos de texto.

### Opciones para Campos Select

Para campos de tipo `select`, la propiedad `options` define las opciones disponibles:

```json
"options": [
  { "value": "opcion1", "label": "Opción 1" },
  { "value": "opcion2", "label": "Opción 2" }
]
```

## Tipos de Campo Soportados

### 1. Texto Simple
```json
{
  "name": "nombre",
  "type": "text",
  "label": "Nombre completo",
  "required": true,
  "placeholder": "Ingresa tu nombre"
}
```

### 2. Email
```json
{
  "name": "email",
  "type": "email",
  "label": "Correo electrónico",
  "required": true,
  "placeholder": "ejemplo@correo.com"
}
```

### 3. Número
```json
{
  "name": "edad",
  "type": "number",
  "label": "Edad",
  "required": false,
  "placeholder": "25"
}
```

### 4. Área de Texto
```json
{
  "name": "descripcion",
  "type": "textarea",
  "label": "Descripción",
  "required": false,
  "placeholder": "Describe tu solicitud..."
}
```

### 5. Fecha
```json
{
  "name": "fecha_nacimiento",
  "type": "date",
  "label": "Fecha de nacimiento",
  "required": true
}
```

### 6. Selección Simple
```json
{
  "name": "pais",
  "type": "select",
  "label": "País",
  "required": true,
  "options": [
    {"value": "mx", "label": "México"},
    {"value": "us", "label": "Estados Unidos"},
    {"value": "ca", "label": "Canadá"}
  ]
}
```

### 7. Radio Buttons
```json
{
  "name": "genero",
  "type": "radio",
  "label": "Género",
  "required": true,
  "options": [
    {"value": "m", "label": "Masculino"},
    {"value": "f", "label": "Femenino"},
    {"value": "o", "label": "Otro"}
  ]
}
```

### 8. Checkboxes
```json
{
  "name": "intereses",
  "type": "checkbox",
  "label": "Intereses",
  "required": false,
  "options": [
    {"value": "tech", "label": "Tecnología"},
    {"value": "sports", "label": "Deportes"},
    {"value": "music", "label": "Música"}
  ]
}
```

### 9. Archivo
```json
{
  "name": "documento",
  "type": "file",
  "label": "Subir documento",
  "required": false
}
```

### 10. Contraseña
```json
{
  "name": "password",
  "type": "password",
  "label": "Contraseña",
  "required": true,
  "placeholder": "Mínimo 8 caracteres"
}
```

## Ejemplo Completo

```json
{
  "fields": [
    {
      "name": "nombre",
      "type": "text",
      "label": "Nombre completo",
      "required": true,
      "placeholder": "Ingresa tu nombre"
    },
    {
      "name": "email",
      "type": "email",
      "label": "Correo electrónico",
      "required": true,
      "placeholder": "ejemplo@correo.com"
    },
    {
      "name": "edad",
      "type": "number",
      "label": "Edad",
      "required": false,
      "placeholder": "25"
    },
    {
      "name": "pais",
      "type": "select",
      "label": "País",
      "required": true,
      "options": [
        {"value": "mx", "label": "México"},
        {"value": "us", "label": "Estados Unidos"},
        {"value": "ca", "label": "Canadá"}
      ]
    },
    {
      "name": "comentarios",
      "type": "textarea",
      "label": "Comentarios adicionales",
      "required": false,
      "placeholder": "Comparte tus comentarios..."
    }
  ]
}
```

## Notas Importantes

1. **Validación**: Los campos marcados como `required: true` son obligatorios
2. **Nombres únicos**: Cada campo debe tener un `name` único
3. **Opciones**: Los campos `select`, `radio` y `checkbox` requieren el array `options`
4. **Formato JSON**: El contenido debe ser JSON válido
5. **Envío**: Los datos se envían al webhook del workflow como un objeto JSON

## Ubicación en n8n

Para usar este formato:
1. Abre tu workflow en n8n
2. Añade una sticky note
3. En el contenido de la nota, incluye el JSON con la estructura `UI_METADATA`
4. El formulario se renderizará automáticamente en la interfaz

## Ejemplo de Datos Enviados

Cuando el usuario completa el formulario, los datos se envían al webhook en este formato:

```json
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "edad": 30,
  "pais": "mx",
  "comentarios": "Excelente servicio"
}
```