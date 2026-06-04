import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OpsecIndicators from '@/app/opsec/indicators/page';
import { MOCK_INDICATORS } from '@/lib/mockData';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

async function renderReady() {
  render(<OpsecIndicators />);
  await waitFor(() =>
    expect(screen.getByText(MOCK_INDICATORS[0].description, { exact: false })).toBeInTheDocument()
  );
}

describe('OPSEC Indicators page', () => {
  describe('initial render', () => {
    it('renders all mock indicators', async () => {
      await renderReady();
      for (const ind of MOCK_INDICATORS) {
        expect(screen.getByText(ind.description, { exact: false })).toBeInTheDocument();
      }
    });

    it('shows the alert banner when indicators have no countermeasure', async () => {
      await renderReady();
      const unmitigated = MOCK_INDICATORS.filter(
        (i) => !i.countermeasureApplied && i.currentExposure !== 'Mitigated'
      );
      if (unmitigated.length > 0) {
        // The banner text is unique: it's in the alert div, not in the indicator cards
        expect(screen.getByText(/review and assign mitigations/i)).toBeInTheDocument();
      }
    });

    it('does NOT show the alert banner when all indicators are covered', async () => {
      // Override localStorage with all indicators having countermeasures applied
      const allCovered = MOCK_INDICATORS.map((i) => ({ ...i, countermeasureApplied: true }));
      window.localStorage.setItem('secops-indicators', JSON.stringify(allCovered));

      render(<OpsecIndicators />);
      await waitFor(() =>
        expect(screen.getByText(allCovered[0].description, { exact: false })).toBeInTheDocument()
      );
      expect(screen.queryByText(/no countermeasure applied/i)).not.toBeInTheDocument();
    });
  });

  describe('countermeasure toggle', () => {
    it('flips "No Countermeasure" to "Countermeasure Applied" on click', async () => {
      const user = userEvent.setup();
      // Start with one indicator that has NO countermeasure
      const noCM = [{ ...MOCK_INDICATORS[1], countermeasureApplied: false }];
      window.localStorage.setItem('secops-indicators', JSON.stringify(noCM));

      render(<OpsecIndicators />);
      await waitFor(() => screen.getByText(/mark cm applied/i));

      await user.click(screen.getByRole('button', { name: /mark cm applied/i }));

      await waitFor(() =>
        expect(screen.getByText(/countermeasure applied/i)).toBeInTheDocument()
      );
    });

    it('persists the toggle state to localStorage', async () => {
      const user = userEvent.setup();
      const noCM = [{ ...MOCK_INDICATORS[0], countermeasureApplied: false, id: 'ind-test' }];
      window.localStorage.setItem('secops-indicators', JSON.stringify(noCM));

      render(<OpsecIndicators />);
      await waitFor(() => screen.getByRole('button', { name: /mark cm applied/i }));

      await user.click(screen.getByRole('button', { name: /mark cm applied/i }));

      await waitFor(() => {
        const stored = JSON.parse(window.localStorage.getItem('secops-indicators')!);
        expect(stored[0].countermeasureApplied).toBe(true);
      });
    });
  });

  describe('filters', () => {
    it('filters by criticality level', async () => {
      const user = userEvent.setup();
      await renderReady();

      const criticalitySelect = screen.getAllByRole('combobox')[0];
      await user.selectOptions(criticalitySelect, 'Critical');

      const criticalIndicators = MOCK_INDICATORS.filter((i) => i.criticality === 'Critical');
      await waitFor(() => {
        for (const ind of criticalIndicators) {
          expect(screen.getByText(ind.description, { exact: false })).toBeInTheDocument();
        }
      });
    });

    it('filters to show only indicators without countermeasures', async () => {
      const user = userEvent.setup();
      await renderReady();

      const cmSelect = screen.getAllByRole('combobox')[2];
      await user.selectOptions(cmSelect, 'no');

      const withoutCM = MOCK_INDICATORS.filter((i) => !i.countermeasureApplied);
      await waitFor(() => {
        for (const ind of withoutCM) {
          expect(screen.getByText(ind.description, { exact: false })).toBeInTheDocument();
        }
      });
    });
  });

  describe('delete indicator', () => {
    it('removes an indicator after confirmation', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();
      await renderReady();

      const initialCount = MOCK_INDICATORS.length;
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() =>
        expect(screen.getByText(`${initialCount - 1} of ${initialCount - 1} indicators shown`)).toBeInTheDocument()
      );
    });
  });
});
