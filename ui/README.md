# UI

## Producción

Si no se requieren cambios en la funcionalidad de la UI, se puede utilizar solamente la carpeta ```dist``` que ya se encuentra lista para su uso. No hace falta compilar nada, ni correr npm. Ahí mismo se pueden cambiar los estilos e imágenes de ser necesario.

### Cambios de Estilos
 
Modificar los estilos dentro del directorio ```dist/static/css/style.css``` y ```dist/static/css/tsa2.css``` 

También se puede cambiar los textos de la app modificando todos los labels (```lb_```) que figuran como atributos de ```<div id=app>``` según corresponda. 

Es **importante** notar que la url de la api se configura en el atributo ***apiurl*** del div con id ```app```. Esto tiene que apuntar a la URL donde se eligió ejecutar la API. En este caso apunta a la API de producción hosteada por buenosaires.gob.ar


```html
<div id="app" apiurl=https://tsa2.buenosaires.gob.ar 
  lb_00=" El archivo "
  lb_01=" fue enviado con éxito para ser sellado"
  lb_02="Se ha producido un error al intentar sellar " 
  lb_03=" se encuentra sellado por: "
  lb_04=" en el bloque " 
  lb_05="No se ha podido verificar el archivo "
  lb_06="Volver a Sellar o Verificar" 
  lb_07="Cargando"
  lb_08="Arrastrá archivos aquí<br>ó"
  lb_09="Seleccioná archivos <span class='sr-only'>para Sellar o Verificar</span>"
  lb_10="Nombre del archivo: " 
  lb_11="Hash del archivo: " 
  lb_12="Sellar"
  lb_13="Verificar"
  lb_14=" Agregar archivos" 
  lb_15=" Copiar" 
  lb_16="Enlace de verificación" 
  lb_17="Remover archivo"
  lb_18="Seleccionar otros archivos" 
  lb_19=" Solo se pueden agregar " 
  lb_20=" archivos por vez">
</div>
 ```

Para embeberlo en otro contexto hay que copiar el div ```<div id=app>```, los estilos  ```link``` y el script ```tsa2.js``` del body. 

## Desarrollo 

En caso de necesitar realizar cambios en la UI.

### 1. Setup del proyecto
```
npm install
```

### 2. Compila y tiene un live-reload para desarrollar 
```
npm run serve
```

**Importante:** Siempre tratar de poner en el wording/texto de la app como atributo en el HTML para poder facilitar los cambios de texto/traducciones sin tener la necesidad de compilar.

### 3. Después de realizar los cambios es necesario hacer un build para compilar y minimizar en la carpeta ```dist```.
```
npm run build
```

### 4. Corré el test para verificar que no haya errores
```
npm run test
```

### 5. Arreglo de lints 
```
npm run lint
```

### Si se requiere más configuración
Ver [Configuration Reference](https://cli.vuejs.org/config/).
