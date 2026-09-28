import re

with open('pages/categorias.html', 'r', encoding='utf-8') as f:
    base = f.read()

with open('../daniel/index.html', 'r', encoding='utf-8') as f:
    daniel = f.read()

# Extract Daniel's main content
d_match = re.search(r'<!-- Contenido Principal -->(.*?)<!-- Barra de Utilidad Inferior \(Footer\) -->', daniel, re.DOTALL)
daniel_main = d_match.group(1).strip() if d_match else ''

# Clean Daniel's main content paths for imgs if any
base = base.replace('</head>', '    <link href="../css/carrito.css" rel="stylesheet">\n</head>')
base = base.replace('</body>', '    <script src="../js/carrito.js"></script>\n</body>')
base = base.replace('<title>Tienda 3V - Categorías</title>', '<title>Tienda 3V - Carrito de Compras</title>')
base = base.replace('<a class="nav-link active" href="categorias.html">', '<a class="nav-link" href="categorias.html">')

# Replace the middle part with Daniel's main
m = re.search(r'(<nav.*?</nav>)(.*?)(<footer)', base, re.DOTALL)
if m:
    base = base[:m.start(2)] + '\n' + daniel_main + '\n' + base[m.start(3):]

with open('pages/carrito.html', 'w', encoding='utf-8') as f:
    f.write(base)
print('Generated carrito.html')
