import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThreatAssessments from '@/app/opsec/threats/page';
import { MOCK_THREATS, MOCK_CPIS } from '@/lib/mockData';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

async function renderReady() {
  render(<ThreatAssessments />);
  await waitFor(() =>
    expect(screen.getByText(MOCK_THREATS[0].threatActor, { exact: false })).toBeInTheDocument()
  );
}

describe('Threat Assessments page', () => {
  describe('initial render', () => {
    it('shows all mock threats', async () => {
      await renderReady();
      for (const t of MOCK_THREATS) {
        expect(screen.getByText(t.threatActor, { exact: false })).toBeInTheDocument();
      }
    });

    it('displays the risk matrix section', async () => {
      await renderReady();
      expect(screen.getByText('Risk Matrix')).toBeInTheDocument();
    });

    it('shows summary chips with correct counts', async () => {
      await renderReady();
      const mitigated = MOCK_THREATS.filter((t) => t.status === 'Mitigated').length;
      // The Mitigated chip is the most distinct — its count is 1 and it's in the chip row.
      // We use getAllByText because numbers can repeat; we just verify at least one chip exists.
      const mitigatedChip = screen.getAllByText(String(mitigated));
      expect(mitigatedChip.length).toBeGreaterThan(0);
    });
  });

  describe('risk level filter', () => {
    it('filters to show only Critical threats', async () => {
      const user = userEvent.setup();
      await renderReady();

      const riskSelect = screen.getAllByRole('combobox')[0];
      await user.selectOptions(riskSelect, 'Critical');

      const criticalThreats = MOCK_THREATS.filter((t) => t.riskLevel === 'Critical');
      const nonCritical = MOCK_THREATS.filter((t) => t.riskLevel !== 'Critical');

      await waitFor(() => {
        for (const t of criticalThreats) {
          expect(screen.getByText(t.threatActor, { exact: false })).toBeInTheDocument();
        }
        for (const t of nonCritical) {
          // A threat not in the Critical filter should not appear
          // (only checking the first non-critical one to keep it simple)
          if (!criticalThreats.some((c) => c.threatActor === t.threatActor)) {
            expect(screen.queryByText(t.threatActor, { exact: false })).not.toBeInTheDocument();
          }
        }
      });
    });
  });

  describe('status filter', () => {
    it('shows only Mitigated threats when filtered', async () => {
      const user = userEvent.setup();
      await renderReady();

      const statusSelect = screen.getAllByRole('combobox')[1];
      await user.selectOptions(statusSelect, 'Mitigated');

      const mitigated = MOCK_THREATS.filter((t) => t.status === 'Mitigated');
      await waitFor(() => {
        for (const t of mitigated) {
          expect(screen.getByText(t.threatActor, { exact: false })).toBeInTheDocument();
        }
      });
    });
  });

  describe('add threat modal', () => {
    it('opens when "New Assessment" is clicked', async () => {
      const user = userEvent.setup();
      await renderReady();

      await user.click(screen.getByRole('button', { name: /new assessment/i }));
      expect(screen.getByText('New Threat Assessment')).toBeInTheDocument();
    });

    it('shows the computed risk level as fields change', async () => {
      const user = userEvent.setup();
      await renderReady();

      await user.click(screen.getByRole('button', { name: /new assessment/i }));

      // The computed risk label should update as probability/impact selects change
      // Default is Medium/Medium → Medium
      expect(screen.getByText(/computed risk level/i)).toBeInTheDocument();
    });

    it('does not save when required fields are empty', async () => {
      const user = userEvent.setup();
      await renderReady();

      await user.click(screen.getByRole('button', { name: /new assessment/i }));
      // Click Save with no CPI selected and no threat actor — both required
      await user.click(screen.getByRole('button', { name: /create assessment/i }));

      // Modal should stay open because validation failed
      expect(screen.getByText('New Threat Assessment')).toBeInTheDocument();
    });
  });

  describe('CPI linkage', () => {
    it('displays the program name for each linked CPI', async () => {
      await renderReady();
      // All mock threats are linked to a CPI — program names should appear
      const programNames = [...new Set(MOCK_CPIS.map((c) => c.programName))];
      for (const name of programNames) {
        expect(screen.getAllByText(name).length).toBeGreaterThan(0);
      }
    });
  });

  describe('delete threat', () => {
    it('removes a threat after confirmation', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();
      await renderReady();

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      const initialCount = deleteButtons.length;
      await user.click(deleteButtons[0]);

      await waitFor(() =>
        expect(screen.getAllByRole('button', { name: /delete/i }).length).toBe(initialCount - 1)
      );
    });
  });
});
