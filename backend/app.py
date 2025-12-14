from flask import Flask, jsonify, request, send_from_directory, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os, jwt, datetime
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

app = Flask(__name__, static_folder='../build', static_url_path='/')
CORS(app)

# Secret key for JWT (in production use env var)
JWT_SECRET = os.environ.get('JWT_SECRET') or 'change-this-secret'
JWT_ALGO = 'HS256'

# Database config (SQLite by default). To use MySQL set DATABASE_URL env var.
DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///mymoney.db'
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(128), nullable=True)
    email = db.Column(db.String(128), nullable=True)
    mobile = db.Column(db.String(20), nullable=True)
    hobbies = db.Column(db.String(256), nullable=True)
    bio = db.Column(db.String(512), nullable=True)
    avatar_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(10), nullable=False)  # income or expense
    category = db.Column(db.String(64), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    merchant = db.Column(db.String(128), nullable=False)
    date = db.Column(db.String(32), nullable=False)
    time = db.Column(db.String(32), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category = db.Column(db.String(64), nullable=False)
    limit = db.Column(db.Float, default=0.0)
    spent = db.Column(db.Float, default=0.0)
    color = db.Column(db.String(16), default='#3b82f6')

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    target = db.Column(db.Float, default=0.0)
    current = db.Column(db.Float, default=0.0)
    deadline = db.Column(db.String(64), nullable=True)
    priority = db.Column(db.String(16), default='low')

class Bill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    amount = db.Column(db.Float, default=0.0)
    due_date = db.Column(db.String(64), nullable=True)
    status = db.Column(db.String(16), default='pending')  # pending, paid, overdue
    auto = db.Column(db.Boolean, default=False)

# YNAB-like Features Models
class Account(db.Model):
    """Multiple accounts support (checking, savings, credit cards, etc.)"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    type = db.Column(db.String(32), default='checking')  # checking, savings, credit, investment
    balance = db.Column(db.Float, default=0.0)
    institution = db.Column(db.String(128), nullable=True)
    last_reconciled = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class EnvelopeBudget(db.Model):
    """Envelope budgeting system - assign every dollar a job"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category = db.Column(db.String(64), nullable=False)
    assigned = db.Column(db.Float, default=0.0)  # Amount assigned this month
    activity = db.Column(db.Float, default=0.0)  # Spending this month
    available = db.Column(db.Float, default=0.0)  # Available balance
    month = db.Column(db.String(7), nullable=False)  # YYYY-MM format
    rollover = db.Column(db.Boolean, default=True)
    priority = db.Column(db.Integer, default=5)  # 1-10 for auto-assignment
    notes = db.Column(db.String(256), nullable=True)

class RecurringTransaction(db.Model):
    """Automatic recurring transactions"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=True)
    type = db.Column(db.String(10), nullable=False)  # income or expense
    category = db.Column(db.String(64), nullable=False)
    merchant = db.Column(db.String(128), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    frequency = db.Column(db.String(16), default='monthly')  # daily, weekly, monthly, yearly
    start_date = db.Column(db.String(32), nullable=False)
    next_date = db.Column(db.String(32), nullable=False)
    end_date = db.Column(db.String(32), nullable=True)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class TransactionSplit(db.Model):
    """Split transactions across multiple categories"""
    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.Integer, db.ForeignKey('transaction.id'), nullable=False)
    category = db.Column(db.String(64), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    notes = db.Column(db.String(256), nullable=True)

class Investment(db.Model):
    """Investment tracking (stocks, bonds, crypto)"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=True)
    symbol = db.Column(db.String(16), nullable=False)  # Ticker symbol
    name = db.Column(db.String(128), nullable=False)
    type = db.Column(db.String(32), default='stock')  # stock, bond, crypto, mutual_fund
    quantity = db.Column(db.Float, default=0.0)
    purchase_price = db.Column(db.Float, default=0.0)
    current_price = db.Column(db.Float, default=0.0)
    purchase_date = db.Column(db.String(32), nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class NetWorthSnapshot(db.Model):
    """Track net worth over time"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.String(32), nullable=False)
    assets = db.Column(db.Float, default=0.0)
    liabilities = db.Column(db.Float, default=0.0)
    net_worth = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class BudgetTemplate(db.Model):
    """Pre-built budget templates"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.String(512), nullable=True)
    categories = db.Column(db.Text, nullable=False)  # JSON string
    is_public = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

# Create tables at startup
with app.app_context():
    db.create_all()

# Auth helpers
def create_token(user_id):
    payload = {'user_id': user_id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)}
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
    # PyJWT returns bytes in some versions, ensure string
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', None)
        if not auth:
            return jsonify({'error':'Authorization header missing'}), 401
        parts = auth.split()
        if parts[0].lower() != 'bearer' or len(parts) != 2:
            return jsonify({'error':'Invalid Authorization header'}), 401
        token = parts[1]
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
            user = User.query.get(data['user_id'])
            if not user:
                return jsonify({'error':'Invalid token user'}), 401
            g.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'error':'Token expired'}), 401
        except Exception as e:
            return jsonify({'error':'Invalid token', 'detail': str(e)}), 401
        return f(*args, **kwargs)
    return decorated

# Routes: auth
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json or {}
    username = (data.get('username','') or '').strip()
    password = data.get('password','') or ''
    if not username or not password:
        return jsonify({'error':'username & password required'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'error':'username taken'}), 400
    u = User(username=username, password_hash=generate_password_hash(password))
    db.session.add(u); db.session.commit()
    token = create_token(u.id)
    return jsonify({'status':'ok','token': token, 'user': {'id': u.id, 'username': u.username, 'full_name': u.full_name, 'email': u.email, 'mobile': u.mobile, 'hobbies': u.hobbies, 'bio': u.bio, 'avatar_url': u.avatar_url}}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    username = (data.get('username','') or '').strip()
    password = data.get('password','') or ''
    u = User.query.filter_by(username=username).first()
    if not u or not check_password_hash(u.password_hash, password):
        return jsonify({'error':'invalid credentials'}), 401
    token = create_token(u.id)
    return jsonify({'status':'ok','token': token, 'user': {'id': u.id, 'username': u.username, 'full_name': u.full_name, 'email': u.email, 'mobile': u.mobile, 'hobbies': u.hobbies, 'bio': u.bio, 'avatar_url': u.avatar_url}})

# Sample public hello
@app.route('/api/hello')
def hello():
    return jsonify({'message': 'Hello from Flask backend!'})

# Health check endpoint for Docker and Render
@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'MyMoney Pro Backend',
        'timestamp': datetime.datetime.utcnow().isoformat()
    }), 200

# User Profile
@app.route('/api/user/profile', methods=['GET'])
@auth_required
def get_profile():
    user = g.current_user
    return jsonify({
        'id': user.id,
        'username': user.username,
        'full_name': user.full_name,
        'email': user.email,
        'mobile': user.mobile,
        'hobbies': user.hobbies,
        'bio': user.bio,
        'avatar_url': user.avatar_url
    })

@app.route('/api/user/profile', methods=['PUT'])
@auth_required
def update_profile():
    user = g.current_user
    data = request.json or {}
    user.full_name = data.get('full_name', user.full_name)
    user.email = data.get('email', user.email)
    user.mobile = data.get('mobile', user.mobile)
    user.hobbies = data.get('hobbies', user.hobbies)
    user.bio = data.get('bio', user.bio)
    if 'avatar_url' in data:
        user.avatar_url = data.get('avatar_url')
    db.session.commit()
    return jsonify({'status': 'updated', 'user': {
        'id': user.id,
        'username': user.username,
        'full_name': user.full_name,
        'email': user.email,
        'mobile': user.mobile,
        'hobbies': user.hobbies,
        'bio': user.bio,
        'avatar_url': user.avatar_url
    }})

# Transactions (protected)
@app.route('/api/transactions', methods=['GET', 'POST'])
@auth_required
def transactions():
    user = g.current_user
    if request.method == 'GET':
        items = Transaction.query.filter_by(user_id=user.id).order_by(Transaction.created_at.desc()).all()
        return jsonify([{
            'id': t.id, 'type': t.type, 'category': t.category, 'amount': t.amount,
            'merchant': t.merchant, 'date': t.date, 'time': t.time
        } for t in items])
    data = request.json or {}
    t = Transaction(
        user_id=user.id,
        type=data.get('type','expense'),
        category=data.get('category','General'),
        amount=float(data.get('amount',0) or 0),
        merchant=data.get('merchant','Unknown'),
        date=data.get('date', datetime.datetime.utcnow().strftime('%Y-%m-%d')),
        time=data.get('time','')
    )
    db.session.add(t)
    db.session.commit()
    return jsonify({'status':'ok','id':t.id}), 201

@app.route('/api/transactions/<int:id>', methods=['PUT','DELETE'])
@auth_required
def transaction_modify(id):
    user = g.current_user
    t = Transaction.query.get_or_404(id)
    if t.user_id != user.id:
        return jsonify({'error':'not authorized'}), 403
    if request.method == 'DELETE':
        db.session.delete(t); db.session.commit()
        return jsonify({'status':'deleted'})
    data = request.json or {}
    t.type = data.get('type', t.type)
    t.category = data.get('category', t.category)
    t.amount = float(data.get('amount', t.amount) or 0)
    t.merchant = data.get('merchant', t.merchant)
    t.date = data.get('date', t.date)
    t.time = data.get('time', t.time)
    db.session.commit()
    return jsonify({'status':'updated'})

# Budgets, Goals, Bills: similar protection added
@app.route('/api/budgets', methods=['GET','POST'])
@auth_required
def budgets_route():
    user = g.current_user
    if request.method == 'GET':
        items = Budget.query.filter_by(user_id=user.id).all()
        return jsonify([
            {
                'id': b.id,
                'category': b.category,
                'limit': b.limit,
                'spent': b.spent,
                'color': b.color
            } for b in items
        ])

    data = request.json or {}
    category = data.get('category', '').strip()
    limit = data.get('limit', 0)

    # Validate input
    if not category:
        return jsonify({'error': 'Category is required'}), 400
    if not isinstance(limit, (int, float)) or limit <= 0:
        return jsonify({'error': 'Limit must be a positive number'}), 400

    b = Budget(
        user_id=user.id,
        category=category,
        limit=float(limit),
        spent=float(data.get('spent', 0) or 0),
        color=data.get('color', '#3b82f6')
    )
    db.session.add(b)
    db.session.commit()
    return jsonify({'status': 'ok', 'id': b.id}), 201

@app.route('/api/budgets/<int:id>', methods=['PUT','DELETE'])
@auth_required
def budget_modify(id):
    user = g.current_user
    b = Budget.query.get_or_404(id)
    if b.user_id != user.id:
        return jsonify({'error':'not authorized'}), 403
    if request.method == 'DELETE':
        db.session.delete(b); db.session.commit()
        return jsonify({'status':'deleted'})
    data = request.json or {}
    b.category = data.get('category', b.category)
    b.limit = float(data.get('limit', b.limit) or 0)
    b.spent = float(data.get('spent', b.spent) or 0)
    b.color = data.get('color', b.color)
    db.session.commit()
    return jsonify({'status':'updated'})

@app.route('/api/goals', methods=['GET','POST'])
@auth_required
def goals_route():
    user = g.current_user
    if request.method == 'GET':
        items = Goal.query.filter_by(user_id=user.id).all()
        return jsonify([{'id':g.id,'name':g.name,'target':g.target,'current':g.current,'deadline':g.deadline,'priority':g.priority} for g in items])
    data = request.json or {}
    g2 = Goal(user_id=user.id, name=data.get('name','Goal'), target=float(data.get('target',0) or 0), current=float(data.get('current',0) or 0), deadline=data.get('deadline',''), priority=data.get('priority','low'))
    db.session.add(g2); db.session.commit()
    return jsonify({'status':'ok','id':g2.id}), 201

@app.route('/api/goals/<int:id>', methods=['PUT','DELETE'])
@auth_required
def goal_modify(id):
    user = g.current_user
    g2 = Goal.query.get_or_404(id)
    if g2.user_id != user.id:
        return jsonify({'error':'not authorized'}), 403
    if request.method == 'DELETE':
        db.session.delete(g2); db.session.commit()
        return jsonify({'status':'deleted'})
    data = request.json or {}
    g2.name = data.get('name', g2.name)
    g2.target = float(data.get('target', g2.target) or 0)
    g2.current = float(data.get('current', g2.current) or 0)
    g2.deadline = data.get('deadline', g2.deadline)
    g2.priority = data.get('priority', g2.priority)
    db.session.commit()
    return jsonify({'status':'updated'})

@app.route('/api/bills', methods=['GET','POST'])
@auth_required
def bills_route():
    user = g.current_user
    if request.method == 'GET':
        items = Bill.query.filter_by(user_id=user.id).all()
        return jsonify([{'id':b.id,'name':b.name,'amount':b.amount,'due_date':b.due_date,'status':b.status,'auto':b.auto} for b in items])
    data = request.json or {}
    b = Bill(user_id=user.id, name=data.get('name','Bill'), amount=float(data.get('amount',0) or 0), due_date=data.get('due_date',''), status=data.get('status','pending'), auto=bool(data.get('auto',False)))
    db.session.add(b); db.session.commit()
    return jsonify({'status':'ok','id':b.id}), 201

@app.route('/api/bills/<int:id>', methods=['PUT','DELETE'])
@auth_required
def bill_modify(id):
    user = g.current_user
    b = Bill.query.get_or_404(id)
    if b.user_id != user.id:
        return jsonify({'error':'not authorized'}), 403
    if request.method == 'DELETE':
        db.session.delete(b); db.session.commit()
        return jsonify({'status':'deleted'})
    data = request.json or {}
    if 'toggle_paid' in data:
        b.status = 'paid' if b.status != 'paid' else 'pending'
    if 'toggle_auto' in data:
        b.auto = not b.auto
    b.name = data.get('name', b.name)
    b.amount = float(data.get('amount', b.amount) or 0)
    b.due_date = data.get('due_date', b.due_date)
    db.session.commit()
    return jsonify({'status':'updated','auto':b.auto,'status_now':b.status})

# Notifications endpoint (simple)
@app.route('/api/notifications')
@auth_required
def notifications():
    user = g.current_user
    notes = []
    import datetime
    today = datetime.date.today()
    for b in Bill.query.filter_by(user_id=user.id).all():
        try:
            due = datetime.datetime.strptime(b.due_date, '%Y-%m-%d').date()
            days = (due - today).days
            if days <= 7 and b.status != 'paid':
                notes.append({'type':'bill','message':f'Bill {b.name} (₹{b.amount:.2f}) due in {days} day(s).','bill_id':b.id})
        except:
            pass
    for bud in Budget.query.filter_by(user_id=user.id).all():
        if bud.limit and bud.spent / bud.limit > 0.9:
            notes.append({'type':'budget','message':f'Budget {bud.category} is at {bud.spent/bud.limit:.0%} of limit.'})
    return jsonify(notes)

# Analytics endpoint for spending trends
@app.route('/api/analytics/spending-trend')
@auth_required
def spending_trend():
    user = g.current_user
    import datetime
    from collections import defaultdict
    
    # Get last 6 months of transactions
    six_months_ago = datetime.datetime.utcnow() - datetime.timedelta(days=180)
    transactions = Transaction.query.filter_by(user_id=user.id).filter(
        Transaction.created_at >= six_months_ago
    ).all()
    
    # Group by month
    monthly = defaultdict(lambda: {'income': 0, 'expense': 0})
    months_list = []
    
    for trans in transactions:
        month_key = trans.date[:7]  # YYYY-MM format
        if trans.type == 'income':
            monthly[month_key]['income'] += trans.amount
        else:
            monthly[month_key]['expense'] += trans.amount
    
    # Generate last 6 months labels
    today = datetime.datetime.utcnow()
    for i in range(5, -1, -1):
        month_date = today - datetime.timedelta(days=30*i)
        month_key = month_date.strftime('%Y-%m')
        if month_key not in monthly:
            monthly[month_key] = {'income': 0, 'expense': 0}
        months_list.append(month_key)
    
    # Build response
    trend_data = []
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    for month_key in sorted(monthly.keys())[-6:]:
        month_num = int(month_key.split('-')[1])
        trend_data.append({
            'name': month_names[month_num - 1],
            'income': monthly[month_key]['income'],
            'expense': monthly[month_key]['expense']
        })
    
    return jsonify(trend_data)

# Analytics endpoint for spending by category
@app.route('/api/analytics/category-breakdown')
@auth_required
def category_breakdown():
    user = g.current_user
    from collections import defaultdict
    
    # Get all transactions for this user
    transactions = Transaction.query.filter_by(user_id=user.id).filter_by(type='expense').all()
    
    # Group by category
    categories = defaultdict(float)
    for trans in transactions:
        categories[trans.category] += trans.amount
    
    # Convert to list format for pie chart
    category_data = []
    colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6']
    
    for idx, (category, amount) in enumerate(sorted(categories.items(), key=lambda x: x[1], reverse=True)):
        if amount > 0:  # Only include categories with spending
            category_data.append({
                'name': category,
                'value': amount,
                'color': colors[idx % len(colors)]
            })
    
    return jsonify(category_data)

# Accounts Management
@app.route('/api/accounts', methods=['GET', 'POST'])
@auth_required
def accounts_route():
    user = g.current_user
    if request.method == 'GET':
        accounts = Account.query.filter_by(user_id=user.id).all()
        return jsonify([{
            'id': a.id,
            'name': a.name,
            'type': a.type,
            'balance': a.balance,
            'institution': a.institution,
            'last_reconciled': a.last_reconciled.isoformat() if a.last_reconciled else None
        } for a in accounts])

    data = request.json or {}
    account = Account(
        user_id=user.id,
        name=data.get('name', 'New Account'),
        type=data.get('type', 'checking'),
        balance=float(data.get('balance', 0) or 0),
        institution=data.get('institution')
    )
    db.session.add(account)
    db.session.commit()
    return jsonify({'status': 'ok', 'id': account.id}), 201

@app.route('/api/accounts/<int:id>', methods=['PUT', 'DELETE'])
@auth_required
def account_modify(id):
    user = g.current_user
    account = Account.query.get_or_404(id)
    if account.user_id != user.id:
        return jsonify({'error': 'not authorized'}), 403

    if request.method == 'DELETE':
        db.session.delete(account)
        db.session.commit()
        return jsonify({'status': 'deleted'})

    data = request.json or {}
    account.name = data.get('name', account.name)
    account.type = data.get('type', account.type)
    account.balance = float(data.get('balance', account.balance) or 0)
    account.institution = data.get('institution', account.institution)
    db.session.commit()
    return jsonify({'status': 'updated'})

# Envelope Budgeting
@app.route('/api/envelope-budgets', methods=['GET', 'POST'])
@auth_required
def envelope_budgets_route():
    user = g.current_user
    if request.method == 'GET':
        month = request.args.get('month', datetime.datetime.utcnow().strftime('%Y-%m'))
        envelopes = EnvelopeBudget.query.filter_by(user_id=user.id, month=month).all()
        return jsonify([{
            'id': e.id,
            'category': e.category,
            'assigned': e.assigned,
            'activity': e.activity,
            'available': e.available,
            'month': e.month,
            'rollover': e.rollover,
            'priority': e.priority,
            'notes': e.notes
        } for e in envelopes])

    data = request.json or {}
    month = data.get('month', datetime.datetime.utcnow().strftime('%Y-%m'))
    envelope = EnvelopeBudget(
        user_id=user.id,
        category=data.get('category', 'General'),
        assigned=float(data.get('assigned', 0) or 0),
        activity=float(data.get('activity', 0) or 0),
        available=float(data.get('available', 0) or 0),
        month=month,
        rollover=data.get('rollover', True),
        priority=int(data.get('priority', 5) or 5),
        notes=data.get('notes')
    )
    db.session.add(envelope)
    db.session.commit()
    return jsonify({'status': 'ok', 'id': envelope.id}), 201

@app.route('/api/envelope-budgets/<int:id>', methods=['PUT', 'DELETE'])
@auth_required
def envelope_budget_modify(id):
    user = g.current_user
    envelope = EnvelopeBudget.query.get_or_404(id)
    if envelope.user_id != user.id:
        return jsonify({'error': 'not authorized'}), 403

    if request.method == 'DELETE':
        db.session.delete(envelope)
        db.session.commit()
        return jsonify({'status': 'deleted'})

    data = request.json or {}
    envelope.assigned = float(data.get('assigned', envelope.assigned) or 0)
    envelope.activity = float(data.get('activity', envelope.activity) or 0)
    envelope.available = float(data.get('available', envelope.available) or 0)
    envelope.rollover = data.get('rollover', envelope.rollover)
    envelope.priority = int(data.get('priority', envelope.priority) or 5)
    envelope.notes = data.get('notes', envelope.notes)
    db.session.commit()
    return jsonify({'status': 'updated'})

# Recurring Transactions
@app.route('/api/recurring-transactions', methods=['GET', 'POST'])
@auth_required
def recurring_transactions_route():
    user = g.current_user
    if request.method == 'GET':
        recurring = RecurringTransaction.query.filter_by(user_id=user.id).all()
        return jsonify([{
            'id': r.id,
            'type': r.type,
            'category': r.category,
            'merchant': r.merchant,
            'amount': r.amount,
            'frequency': r.frequency,
            'start_date': r.start_date,
            'next_date': r.next_date,
            'end_date': r.end_date,
            'active': r.active,
            'account_id': r.account_id
        } for r in recurring])

    data = request.json or {}
    recurring = RecurringTransaction(
        user_id=user.id,
        account_id=data.get('account_id'),
        type=data.get('type', 'expense'),
        category=data.get('category', 'General'),
        merchant=data.get('merchant', 'Unknown'),
        amount=float(data.get('amount', 0) or 0),
        frequency=data.get('frequency', 'monthly'),
        start_date=data.get('start_date', datetime.datetime.utcnow().strftime('%Y-%m-%d')),
        next_date=data.get('next_date', datetime.datetime.utcnow().strftime('%Y-%m-%d')),
        end_date=data.get('end_date'),
        active=data.get('active', True)
    )
    db.session.add(recurring)
    db.session.commit()
    return jsonify({'status': 'ok', 'id': recurring.id}), 201

@app.route('/api/recurring-transactions/<int:id>', methods=['PUT', 'DELETE'])
@auth_required
def recurring_transaction_modify(id):
    user = g.current_user
    recurring = RecurringTransaction.query.get_or_404(id)
    if recurring.user_id != user.id:
        return jsonify({'error': 'not authorized'}), 403

    if request.method == 'DELETE':
        db.session.delete(recurring)
        db.session.commit()
        return jsonify({'status': 'deleted'})

    data = request.json or {}
    recurring.active = data.get('active', recurring.active)
    recurring.amount = float(data.get('amount', recurring.amount) or 0)
    recurring.next_date = data.get('next_date', recurring.next_date)
    recurring.end_date = data.get('end_date', recurring.end_date)
    db.session.commit()
    return jsonify({'status': 'updated'})

# Investments
@app.route('/api/investments', methods=['GET', 'POST'])
@auth_required
def investments_route():
    user = g.current_user
    if request.method == 'GET':
        investments = Investment.query.filter_by(user_id=user.id).all()
        total_value = sum(i.quantity * i.current_price for i in investments)
        total_cost = sum(i.quantity * i.purchase_price for i in investments)
        gain_loss = total_value - total_cost

        return jsonify({
            'investments': [{
                'id': i.id,
                'symbol': i.symbol,
                'name': i.name,
                'type': i.type,
                'quantity': i.quantity,
                'purchase_price': i.purchase_price,
                'current_price': i.current_price,
                'purchase_date': i.purchase_date,
                'total_value': i.quantity * i.current_price,
                'gain_loss': (i.current_price - i.purchase_price) * i.quantity
            } for i in investments],
            'summary': {
                'total_value': total_value,
                'total_cost': total_cost,
                'gain_loss': gain_loss,
                'gain_loss_percentage': (gain_loss / total_cost * 100) if total_cost > 0 else 0
            }
        })

    data = request.json or {}
    investment = Investment(
        user_id=user.id,
        account_id=data.get('account_id'),
        symbol=data.get('symbol', '').upper(),
        name=data.get('name', 'Investment'),
        type=data.get('type', 'stock'),
        quantity=float(data.get('quantity', 0) or 0),
        purchase_price=float(data.get('purchase_price', 0) or 0),
        current_price=float(data.get('current_price', 0) or 0),
        purchase_date=data.get('purchase_date', datetime.datetime.utcnow().strftime('%Y-%m-%d'))
    )
    db.session.add(investment)
    db.session.commit()
    return jsonify({'status': 'ok', 'id': investment.id}), 201

@app.route('/api/investments/<int:id>', methods=['PUT', 'DELETE'])
@auth_required
def investment_modify(id):
    user = g.current_user
    investment = Investment.query.get_or_404(id)
    if investment.user_id != user.id:
        return jsonify({'error': 'not authorized'}), 403

    if request.method == 'DELETE':
        db.session.delete(investment)
        db.session.commit()
        return jsonify({'status': 'deleted'})

    data = request.json or {}
    investment.current_price = float(data.get('current_price', investment.current_price) or 0)
    investment.quantity = float(data.get('quantity', investment.quantity) or 0)
    investment.updated_at = datetime.datetime.utcnow()
    db.session.commit()
    return jsonify({'status': 'updated'})

# Net Worth Tracking
@app.route('/api/net-worth', methods=['GET', 'POST'])
@auth_required
def net_worth_route():
    user = g.current_user
    if request.method == 'GET':
        snapshots = NetWorthSnapshot.query.filter_by(user_id=user.id).order_by(NetWorthSnapshot.date.desc()).all()
        return jsonify([{
            'id': s.id,
            'date': s.date,
            'assets': s.assets,
            'liabilities': s.liabilities,
            'net_worth': s.net_worth
        } for s in snapshots])

    # Calculate current net worth
    accounts = Account.query.filter_by(user_id=user.id).all()
    total_assets = sum(a.balance for a in accounts if a.type in ['checking', 'savings', 'investment'])
    total_liabilities = sum(abs(a.balance) for a in accounts if a.type in ['credit', 'loan'])

    # Add investments
    investments = Investment.query.filter_by(user_id=user.id).all()
    total_assets += sum(i.quantity * i.current_price for i in investments)

    net_worth = total_assets - total_liabilities

    # Create snapshot
    snapshot = NetWorthSnapshot(
        user_id=user.id,
        date=datetime.datetime.utcnow().strftime('%Y-%m-%d'),
        assets=total_assets,
        liabilities=total_liabilities,
        net_worth=net_worth
    )
    db.session.add(snapshot)
    db.session.commit()
    return jsonify({
        'status': 'ok',
        'assets': total_assets,
        'liabilities': total_liabilities,
        'net_worth': net_worth
    }), 201

# Age of Money Calculation
@app.route('/api/analytics/age-of-money')
@auth_required
def age_of_money():
    user = g.current_user

    # Get last 10 income transactions
    income_transactions = Transaction.query.filter_by(
        user_id=user.id,
        type='income'
    ).order_by(Transaction.date.desc()).limit(10).all()

    if not income_transactions:
        return jsonify({'age_of_money': 0, 'message': 'No income data available'})

    # Calculate average days between earning and spending
    total_days = 0
    count = 0

    for income in income_transactions:
        # Find next expense after this income
        next_expense = Transaction.query.filter_by(
            user_id=user.id,
            type='expense'
        ).filter(Transaction.date >= income.date).first()

        if next_expense:
            from datetime import datetime as dt
            income_date = dt.strptime(income.date, '%Y-%m-%d')
            expense_date = dt.strptime(next_expense.date, '%Y-%m-%d')
            days = (expense_date - income_date).days
            total_days += days
            count += 1

    age = total_days / count if count > 0 else 0
    return jsonify({
        'age_of_money': round(age, 1),
        'message': f'On average, you spend money {round(age)} days after earning it'
    })

# Budget Templates
@app.route('/api/budget-templates', methods=['GET'])
@auth_required
def budget_templates():
    templates = BudgetTemplate.query.filter_by(is_public=True).all()
    return jsonify([{
        'id': t.id,
        'name': t.name,
        'description': t.description,
        'categories': t.categories
    } for t in templates])

# Export transactions (CSV)
@app.route('/api/transactions/export')
@auth_required
def export_transactions():
    import csv, io
    user = g.current_user
    items = Transaction.query.filter_by(user_id=user.id).order_by(Transaction.created_at.desc()).all()
    si = io.StringIO()
    writer = csv.writer(si)
    writer.writerow(['id','type','category','amount','merchant','date','time'])
    for t in items:
        writer.writerow([t.id,t.type,t.category,t.amount,t.merchant,t.date,t.time])
    return app.response_class(si.getvalue(), mimetype='text/csv', headers={'Content-Disposition':'attachment;filename=transactions.csv'})

# Serve frontend build (if exists)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    build_dir = os.path.join(os.path.dirname(__file__), '..', 'build')
    if path != "" and os.path.exists(os.path.join(build_dir, path)):
        return send_from_directory(build_dir, path)
    index_path = os.path.join(build_dir, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(build_dir, 'index.html')
    return jsonify({'status':'backend running','message':'No frontend build found. Use npm run build to create it.'})

if __name__ == '__main__':
    app.run(debug=True)
