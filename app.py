import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-secret')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///lumen.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelo de Base de Datos
class WaitlistEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    source = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<WaitlistEntry {self.email}>'

# Crear tablas si no existen
with app.app_context():
    db.create_all()

# Rutas
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')
    
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No se enviaron datos.'}), 400

    email = data.get('email')
    
    # Validación simple en backend
    if not email or '@' not in email:
        return jsonify({'error': 'Correo inválido.'}), 400

    # Verificar si ya existe
    existing_user = WaitlistEntry.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'Este correo ya está registrado en la lista de espera.'}), 409

    try:
        new_entry = WaitlistEntry(
            fullname=data.get('fullname'),
            email=email,
            phone=data.get('phone'),
            source=data.get('source')
            # Nota: No guardamos la contraseña en la base de datos por ahora, 
            # ya que es solo una lista de espera. En un registro real, se debe usar Werkzeug security para hashearla.
        )
        db.session.add(new_entry)
        db.session.commit()
        return jsonify({'message': 'Registro exitoso.'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Ocurrió un error al guardar en la base de datos.'}), 500

# ==========================================
# RUTAS DE ADMINISTRACIÓN (API ONLY)
# ==========================================
# Estas rutas proveen datos crudos para que el 
# desarrollador Frontend construya el Panel de Control.

@app.route('/api/admin/users', methods=['GET'])
def get_users():
    """Retorna la lista de todos los usuarios registrados en formato JSON."""
    users = WaitlistEntry.query.all()
    users_data = []
    for u in users:
        users_data.append({
            'id': u.id,
            'fullname': u.fullname,
            'email': u.email,
            'phone': u.phone,
            'source': u.source,
            'created_at': u.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify(users_data), 200

@app.route('/api/admin/export', methods=['GET'])
def export_users_csv():
    """Genera un CSV con los datos de los usuarios (descargable)."""
    from flask import Response
    import csv
    from io import StringIO

    users = WaitlistEntry.query.all()
    def generate():
        data = StringIO()
        writer = csv.writer(data)
        writer.writerow(['ID', 'Nombre', 'Correo', 'Telefono', 'Fuente', 'Fecha de Registro'])
        yield data.getvalue()
        data.seek(0)
        data.truncate(0)

        for u in users:
            writer.writerow([u.id, u.fullname, u.email, u.phone, u.source, u.created_at.strftime('%Y-%m-%d %H:%M:%S')])
            yield data.getvalue()
            data.seek(0)
            data.truncate(0)

    response = Response(generate(), mimetype='text/csv')
    response.headers.set("Content-Disposition", "attachment", filename="espera_lumen.csv")
    return response

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
