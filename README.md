# Proyect-2-Web-Intro
This project is a full-stack web application that allows users to browse, search, and order from a list of categorized restaurants.



### Crear y activar entorno virtual


```bash
python -m venv .venv
.\.venv\Scripts\activate     # En Windows

source .venv/bin/activate    # En macOS/Linux
```

### Instalar dependencias
```bash
pip install -r requirements.txt
```

### Ejecutar el servidor backend (FastAPI)
##### Desde la carpeta backend/, con el entorno activado

```bash
uvicorn app.main:app --reload --port 8000    
```

### Ejecutar el sitio web (frontend)
Usar el servidor local de Apache en el puerto 8080

`http://localhost:8080
`
