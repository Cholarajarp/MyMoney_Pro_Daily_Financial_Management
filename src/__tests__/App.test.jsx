import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App.jsx';

test('renders heading', () => {
  render(<App />);
  const h = screen.getByText(/MyMoney Pro/i);
  expect(h).toBeInTheDocument();
});

test('renders Spending by Category chart', () => {
  const budgets = [
    { id: 1, category: 'Groceries', limit: 5000, spent: 3000, color: '#3b82f6' },
    { id: 2, category: 'Entertainment', limit: 2000, spent: 1500, color: '#ef4444' },
  ];

  render(<App />);

  // Mock budgets state
  budgets.forEach((budget) => {
    expect(screen.getByText(budget.category)).toBeInTheDocument();
    expect(screen.getByText(`₹${budget.spent.toFixed(2)}`)).toBeInTheDocument();
  });

  // Check if pie chart is rendered
  const pieChart = screen.getByRole('img', { name: /spending by category/i });
  expect(pieChart).toBeInTheDocument();
});
