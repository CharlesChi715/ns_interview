import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '../src/App';
import { calculate } from '../src/api/client';

vi.mock('../src/api/client', () => ({ calculate: vi.fn() }));
const calculateMock = vi.mocked(calculate);

const expectResult = (text: string) =>
  waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(text));

beforeEach(() => {
  calculateMock.mockReset();
});

describe('App', () => {
  it('sends the clicked expression and shows the result', async () => {
    calculateMock.mockResolvedValue({ ok: true, result: '14' });
    const user = userEvent.setup();
    render(<App />);

    for (const name of ['2', 'plus', '3', 'multiply', '4', 'equals']) {
      await user.click(screen.getByRole('button', { name }));
    }

    await expectResult('14');
    expect(calculateMock).toHaveBeenCalledWith('2+3*4');
  });

  it('works from the keyboard', async () => {
    calculateMock.mockResolvedValue({ ok: true, result: '11' });
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard('2+3*(4-1){Enter}');

    await expectResult('11');
    expect(calculateMock).toHaveBeenCalledWith('2+3*(4-1)');
  });

  it('shows the backend error, marks the position and offers no retry', async () => {
    calculateMock.mockResolvedValue({
      ok: false,
      retryable: false,
      error: { code: 'DIVISION_BY_ZERO', message: 'Cannot divide by zero.', position: 1 },
    });
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard('1/0{Enter}');

    expect(await screen.findByText('Cannot divide by zero.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Cannot divide by zero.');
    expect(screen.getByTestId('expression').querySelector('mark')).toHaveTextContent('/');
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('offers retry when the service is unreachable', async () => {
    calculateMock
      .mockResolvedValueOnce({
        ok: false,
        retryable: true,
        error: { code: 'NETWORK', message: 'Calculator service unreachable.' },
      })
      .mockResolvedValueOnce({ ok: true, result: '3' });
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard('1+2{Enter}');
    await user.click(await screen.findByRole('button', { name: 'Retry' }));

    await expectResult('3');
    expect(calculateMock).toHaveBeenCalledTimes(2);
    expect(calculateMock).toHaveBeenLastCalledWith('1+2');
  });
});
