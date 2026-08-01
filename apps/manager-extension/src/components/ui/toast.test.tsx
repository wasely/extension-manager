import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import { Toast } from './toast';

it('announces and dismisses action feedback', async () => {
  const user = userEvent.setup();
  const onDismiss = vi.fn();

  render(
    <Toast
      message="Research Clipper reloaded"
      onDismiss={onDismiss}
      tone="success"
    />,
  );

  expect(screen.getByRole('status')).toHaveTextContent(
    'Research Clipper reloaded',
  );
  await user.click(
    screen.getByRole('button', { name: 'Dismiss notification' }),
  );
  expect(onDismiss).toHaveBeenCalledOnce();
});
