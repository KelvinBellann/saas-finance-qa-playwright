import { seedUsers } from '../../src/app/data/seeds.js';

const financeManager = seedUsers.find((user) => user.role === 'finance_manager');
const financeAnalyst = seedUsers.find((user) => user.role === 'finance_analyst');

if (!financeManager || !financeAnalyst) {
  throw new Error('Seed users are missing required roles.');
}

export const users = {
  financeManager: {
    email: financeManager.email,
    password: financeManager.password,
    name: financeManager.name,
    role: financeManager.role,
  },
  financeAnalyst: {
    email: financeAnalyst.email,
    password: financeAnalyst.password,
    name: financeAnalyst.name,
    role: financeAnalyst.role,
  },
  invalidCredentials: {
    email: 'blocked.user@sentinel.local',
    password: 'WrongPassword!123',
  },
  newViewer: {
    name: 'Bianca Prado',
    email: 'bianca.prado@sentinel.local',
    password: 'Playwright@123',
    role: 'finance_viewer' as const,
  },
};
