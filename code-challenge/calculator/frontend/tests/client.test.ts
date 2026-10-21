import { calculate } from '../src/api/client';

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('calculate client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the expression and returns the result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { expression: '1+1', result: '2' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(calculate('1+1')).resolves.toEqual({ ok: true, result: '2' });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/calculate');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ expression: '1+1' });
  });

  it('passes backend errors through as not retryable', async () => {
    const error = { code: 'SYNTAX_ERROR', message: 'Unexpected end.', position: 2 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(400, { error })));

    await expect(calculate('2+')).resolves.toEqual({ ok: false, retryable: false, error });
  });

  it('treats a server error as retryable', async () => {
    const error = { code: 'INTERNAL', message: 'Something went wrong on our side.', position: null };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(500, { error })));

    await expect(calculate('1')).resolves.toEqual({ ok: false, retryable: true, error });
  });

  it('reports an unreachable service as retryable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const outcome = await calculate('1');
    expect(outcome).toMatchObject({ ok: false, retryable: true, error: { code: 'NETWORK' } });
  });
});
