import pytest
from backend.app import app, db, User
import json

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

def register_and_login(client, username='test', password='pass'):
    r = client.post('/api/register', json={'username':username,'password':password})
    assert r.status_code in (200,201)
    data = r.get_json()
    token = data.get('token')
    assert token
    return token

def test_register_login(client):
    token = register_and_login(client)
    assert token

def test_protected_transactions(client):
    token = register_and_login(client)
    headers = {'Authorization': f'Bearer {token}'}
    r = client.post('/api/transactions', json={'type':'expense','category':'Food','amount':10,'merchant':'Cafe'}, headers=headers)
    assert r.status_code == 201
    r2 = client.get('/api/transactions', headers=headers)
    assert r2.status_code == 200
    data = r2.get_json()
    assert isinstance(data, list) and len(data) == 1
