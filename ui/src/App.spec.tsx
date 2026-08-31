import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

beforeAll(() => {
  if (typeof globalThis.crypto === 'undefined') {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: () => 'mocked-uuid-1234-5678-90ab-cdef01234567'
      },
      writable: true,
      configurable: true
    });
  } else {
    try {
      Object.defineProperty(globalThis.crypto, 'randomUUID', {
        value: () => 'mocked-uuid-1234-5678-90ab-cdef01234567',
        writable: true,
        configurable: true
      });
    } catch (e) {
      (globalThis.crypto as any).randomUUID = () => 'mocked-uuid-1234-5678-90ab-cdef01234567';
    }
  }
});

describe('CloakPass Frontend Integration Tests', () => {
  it('should render the brand logo and name in the navbar', () => {
    render(<App />);
    const brandElements = screen.getAllByText(/CloakPass/i);
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it('should display the default Connect Wallet button in the navbar', () => {
    render(<App />);
    const connectBtn = screen.getByRole('button', { name: /Connect Wallet/i });
    expect(connectBtn).toBeDefined();
  });

  it('should switch between Member Access and Admin Vault tabs successfully', () => {
    render(<App />);
    
    // Default tab should show Member Verification heading
    const memberAccessHeader = screen.getByRole('heading', { name: /Member Verification/i });
    expect(memberAccessHeader).toBeDefined();

    // Click Admin Vault tab
    const adminTabBtn = screen.getByRole('button', { name: /Admin Vault/i });
    fireEvent.click(adminTabBtn);

    // Should now show Admin Vault text / headers
    const adminVaultHeader = screen.getByRole('heading', { name: /Admin Vault/i });
    expect(adminVaultHeader).toBeDefined();
  });
});
