"""
Database initialization script for MyMoney Pro
Seeds default budget templates
"""

from backend.app import app, db, BudgetTemplate
import json

def seed_budget_templates():
    """Add default budget templates to the database"""

    templates = [
        {
            'name': '50/30/20 Rule',
            'description': 'Allocate 50% to needs, 30% to wants, and 20% to savings',
            'categories': json.dumps([
                {'category': 'Housing', 'percentage': 25, 'type': 'need'},
                {'category': 'Utilities', 'percentage': 5, 'type': 'need'},
                {'category': 'Transportation', 'percentage': 10, 'type': 'need'},
                {'category': 'Groceries', 'percentage': 10, 'type': 'need'},
                {'category': 'Dining Out', 'percentage': 10, 'type': 'want'},
                {'category': 'Entertainment', 'percentage': 10, 'type': 'want'},
                {'category': 'Shopping', 'percentage': 10, 'type': 'want'},
                {'category': 'Emergency Fund', 'percentage': 10, 'type': 'savings'},
                {'category': 'Retirement', 'percentage': 10, 'type': 'savings'},
            ]),
            'is_public': True
        },
        {
            'name': 'Zero-Based Budget',
            'description': 'YNAB-style budget where every dollar has a job',
            'categories': json.dumps([
                {'category': 'Rent/Mortgage', 'priority': 1},
                {'category': 'Utilities', 'priority': 1},
                {'category': 'Groceries', 'priority': 1},
                {'category': 'Transportation', 'priority': 2},
                {'category': 'Insurance', 'priority': 2},
                {'category': 'Debt Payments', 'priority': 2},
                {'category': 'Emergency Fund', 'priority': 3},
                {'category': 'Savings Goals', 'priority': 4},
                {'category': 'Entertainment', 'priority': 5},
                {'category': 'Dining Out', 'priority': 5},
            ]),
            'is_public': True
        },
        {
            'name': 'Dave Ramsey Budget',
            'description': 'Baby steps approach with focus on debt elimination',
            'categories': json.dumps([
                {'category': 'Food', 'percentage': 10},
                {'category': 'Housing', 'percentage': 25},
                {'category': 'Transportation', 'percentage': 10},
                {'category': 'Insurance', 'percentage': 10},
                {'category': 'Utilities', 'percentage': 5},
                {'category': 'Personal/Clothing', 'percentage': 5},
                {'category': 'Recreation', 'percentage': 5},
                {'category': 'Debt Snowball', 'percentage': 20},
                {'category': 'Emergency Fund', 'percentage': 10},
            ]),
            'is_public': True
        },
        {
            'name': 'Minimalist Budget',
            'description': 'Simple budget with essential categories only',
            'categories': json.dumps([
                {'category': 'Housing', 'percentage': 30},
                {'category': 'Food', 'percentage': 15},
                {'category': 'Transportation', 'percentage': 15},
                {'category': 'Healthcare', 'percentage': 10},
                {'category': 'Savings', 'percentage': 20},
                {'category': 'Everything Else', 'percentage': 10},
            ]),
            'is_public': True
        },
        {
            'name': 'Aggressive Savings',
            'description': 'For those focused on building wealth quickly',
            'categories': json.dumps([
                {'category': 'Housing', 'percentage': 20},
                {'category': 'Food', 'percentage': 10},
                {'category': 'Transportation', 'percentage': 10},
                {'category': 'Utilities', 'percentage': 5},
                {'category': 'Emergency Fund', 'percentage': 15},
                {'category': 'Investments', 'percentage': 25},
                {'category': 'Retirement', 'percentage': 10},
                {'category': 'Discretionary', 'percentage': 5},
            ]),
            'is_public': True
        }
    ]

    with app.app_context():
        # Check if templates already exist
        existing = BudgetTemplate.query.filter_by(is_public=True).count()
        if existing > 0:
            print(f"✓ Budget templates already exist ({existing} templates)")
            return

        # Add templates
        for template_data in templates:
            template = BudgetTemplate(**template_data)
            db.session.add(template)

        db.session.commit()
        print(f"✓ Successfully added {len(templates)} budget templates")

if __name__ == '__main__':
    print("Initializing MyMoney Pro database...")
    seed_budget_templates()
    print("✓ Database initialization complete!")

