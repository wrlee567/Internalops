import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CPIRegistry from '@/app/opsec/cpi/page';
import { MOCK_CPIS } from '@/lib/mockData';

// Next.js Link needs a router context we don't have in unit tests.
// We swap it for a plain <a> tag — navigation behavior is covered by E2E tests.
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

// Helper: render and wait for localStorage loading to complete
async function renderReady() {
  const result = render(<CPIRegistry />);
  // The component returns null until useLocalStorage finishes reading.
  // waitFor keeps retrying until a mock CPI name appears.
  await waitFor(() =>
    expect(screen.getByText(MOCK_CPIS[0].cpiName, { exact: false })).toBeInTheDocument()
  );
  return result;
}

describe('CPI Registry page', () => {
  describe('initial render', () => {
    it('shows all mock CPIs in the table', async () => {
      await renderReady();
      for (const cpi of MOCK_CPIS) {
        expect(screen.getByText(cpi.programName)).toBeInTheDocument();
      }
    });

    it('shows the correct classification badges', async () => {
      await renderReady();
      // getAllByText because the same label appears in both table cells AND select options
      expect(screen.getAllByText('TS/SCI').length).toBeGreaterThan(0);
      expect(screen.getAllByText('TOP SECRET').length).toBeGreaterThan(0);
      expect(screen.getAllByText('SECRET').length).toBeGreaterThan(0);
    });

    it('shows the row count footer', async () => {
      await renderReady();
      expect(screen.getByText(`${MOCK_CPIS.length} of ${MOCK_CPIS.length} CPIs shown`)).toBeInTheDocument();
    });
  });

  describe('search filtering', () => {
    it('filters rows when the user types in the search box', async () => {
      const user = userEvent.setup();
      await renderReady();

      const search = screen.getByPlaceholderText(/search/i);
      await user.type(search, 'GUARDIAN');

      await waitFor(() => {
        expect(screen.getByText('GUARDIAN')).toBeInTheDocument();
        // Other programs should no longer be visible
        expect(screen.queryByText('CIPHER')).not.toBeInTheDocument();
      });
    });

    it('shows "No CPIs match" when nothing matches the search', async () => {
      const user = userEvent.setup();
      await renderReady();

      const search = screen.getByPlaceholderText(/search/i);
      await user.type(search, 'XYZZY_NO_MATCH');

      await waitFor(() =>
        expect(screen.getByText(/no cpis match/i)).toBeInTheDocument()
      );
    });

    it('resets to all rows when the search is cleared', async () => {
      const user = userEvent.setup();
      await renderReady();

      const search = screen.getByPlaceholderText(/search/i);
      await user.type(search, 'GUARDIAN');
      await user.clear(search);

      await waitFor(() =>
        expect(screen.getByText(`${MOCK_CPIS.length} of ${MOCK_CPIS.length} CPIs shown`)).toBeInTheDocument()
      );
    });
  });

  describe('status filter', () => {
    it('filters by protection status', async () => {
      const user = userEvent.setup();
      await renderReady();

      // There are 3 selects: classification filter (index 0), status filter (index 1)
      const statusSelect = screen.getAllByRole('combobox')[1];
      await user.selectOptions(statusSelect, 'At-Risk');

      await waitFor(() => {
        // NIGHTWATCH is the only At-Risk CPI in mock data
        expect(screen.getByText('NIGHTWATCH')).toBeInTheDocument();
        expect(screen.queryByText('GUARDIAN')).not.toBeInTheDocument();
      });
    });
  });

  describe('add CPI modal', () => {
    it('opens the modal when "Add CPI" is clicked', async () => {
      const user = userEvent.setup();
      await renderReady();

      await user.click(screen.getByRole('button', { name: /add cpi/i }));
      expect(screen.getByText('Register New CPI')).toBeInTheDocument();
    });

    it('closes the modal when Cancel is clicked', async () => {
      const user = userEvent.setup();
      await renderReady();

      await user.click(screen.getByRole('button', { name: /add cpi/i }));
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() =>
        expect(screen.queryByText('Register New CPI')).not.toBeInTheDocument()
      );
    });

    it('does not save when required fields are empty', async () => {
      const user = userEvent.setup();
      await renderReady();

      await user.click(screen.getByRole('button', { name: /add cpi/i }));
      await user.click(screen.getByRole('button', { name: /register cpi/i }));

      // Modal stays open because validation failed
      expect(screen.getByText('Register New CPI')).toBeInTheDocument();
    });

    it('adds a new CPI and it appears in the table', async () => {
      const user = userEvent.setup();
      await renderReady();

      await user.click(screen.getByRole('button', { name: /add cpi/i }));

      const modal = screen.getByText('Register New CPI').closest('div')!.parentElement!;
      const inputs = within(modal).getAllByRole('textbox');

      // Program Name is first input, CPI Name is third (after classification select)
      await user.type(inputs[0], 'PHANTOM');
      await user.type(inputs[1], 'Stealth Propulsion Array');

      await user.click(screen.getByRole('button', { name: /register cpi/i }));

      await waitFor(() => {
        expect(screen.getByText('PHANTOM')).toBeInTheDocument();
        expect(screen.getByText(/stealth propulsion array/i)).toBeInTheDocument();
      });
    });
  });

  describe('delete CPI', () => {
    it('removes a CPI from the table after confirming deletion', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();
      await renderReady();

      // Find the first Delete button and click it
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() =>
        expect(screen.getByText(`${MOCK_CPIS.length - 1} of ${MOCK_CPIS.length - 1} CPIs shown`)).toBeInTheDocument()
      );
    });

    it('does NOT remove a CPI when deletion is cancelled', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const user = userEvent.setup();
      await renderReady();

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() =>
        expect(screen.getByText(`${MOCK_CPIS.length} of ${MOCK_CPIS.length} CPIs shown`)).toBeInTheDocument()
      );
    });
  });

  describe('localStorage persistence', () => {
    it('loads CPIs that were previously saved to localStorage', async () => {
      // Simulate a previous session where the user had saved custom data
      const saved = [{ ...MOCK_CPIS[0], programName: 'RESTORED' }];
      window.localStorage.setItem('secops-cpis', JSON.stringify(saved));

      render(<CPIRegistry />);
      await waitFor(() =>
        expect(screen.getByText('RESTORED')).toBeInTheDocument()
      );
    });
  });
});
