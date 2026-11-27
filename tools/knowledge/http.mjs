import { setTimeout as sleep } from 'node:timers/promises';

export class Deadline extends Error {}
export class HttpError extends Error {
  constructor(status, host) { super(`HTTP ${status} from ${host}`); this.status = status; }
}
export class Budget {
  constructor({ now = () => performance.now(), searchMs = 540_000, totalMs = 780_000 } = {}) {
    this.now = now; this.start = now(); this.searchEnd = this.start + searchMs; this.end = this.start + totalMs;
  }
  remaining(phase = 'search') { return (phase === 'search' ? this.searchEnd : this.end) - this.now(); }
  check(phase = 'search', minimum = 1000) { if (this.remaining(phase) < minimum) throw new Deadline('Execution budget exhausted'); }
}
export class Client {
  constructor({ token = '', budget = new Budget(), fetcher = fetch, wait = sleep, clock = () => performance.now() } = {}) {
    Object.assign(this, { token, budget, fetcher, wait, clock }); this.nextCrossref = 0;
  }
  async request(url, { method = 'GET', body, phase = 'search', allow404 = false } = {}) {
    const target = new URL(url);
    if (!['https://api.github.com', 'https://api.crossref.org'].includes(target.origin)) throw new Error('Disallowed API origin');
    for (let attempt = 0; attempt < 3; attempt++) {
      this.budget.check(phase);
      const crossref = target.hostname === 'api.crossref.org';
      const pause = crossref ? Math.max(0, this.nextCrossref - this.clock()) : 0;
      if (pause) { this.budget.check(phase, pause + 1000); await this.wait(pause); }
      const headers = { Accept: 'application/json', 'User-Agent': 'base-de-projetos-knowledge-refinement/1.0 (https://github.com/PHnsilva/base-de-projetos)' };
      if (!crossref) {
        headers.Accept = 'application/vnd.github+json'; headers['X-GitHub-Api-Version'] = '2026-03-10';
        headers['Time-Zone'] = 'America/Sao_Paulo';
        if (this.token) headers.Authorization = 'Bearer ' + this.token;
      }
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      let response;
      try {
        response = await this.fetcher(url, { method, headers, redirect: 'error',
          signal: AbortSignal.timeout(Math.min(15_000, Math.max(1, Math.floor(this.budget.remaining(phase))))),
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
        if (crossref) {
          const interval = Number.parseFloat(response.headers.get('x-rate-limit-interval')) || 1;
          const limit = Number(response.headers.get('x-rate-limit-limit')) || 1;
          this.nextCrossref = this.clock() + Math.max(1100, interval * 1000 / Math.max(1, limit));
        }
        if (allow404 && response.status === 404) { await response.body?.cancel(); return null; }
        if (response.ok) {
          const chunks = []; let size = 0;
          for await (const chunk of response.body ?? []) {
            size += chunk.length;
            if (size > 8_000_000) { throw new Error('API response exceeds size limit'); }
            chunks.push(chunk);
          }
          return size ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : null;
        }
        const limited = response.status === 429 || (response.status === 403 && (response.headers.get('x-ratelimit-remaining') === '0' || response.headers.has('retry-after')));
        const transient = limited || response.status >= 500;
        await response.body?.cancel();
        if (method !== 'GET' || !transient || attempt === 2) throw new HttpError(response.status, target.hostname);
        const retry = response.headers.get('retry-after');
        const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000 - Date.now();
        const delay = Math.max(2 ** attempt * 1000, retry ? (/^\d+$/.test(retry) ? Number(retry) * 1000 : Date.parse(retry) - Date.now()) : limited ? reset : 0);
        // Do not retry earlier than requested or hold the publication reserve hostage.
        if (delay > 30_000) throw new HttpError(response.status, target.hostname);
        this.budget.check(phase, delay + 1000); await this.wait(delay);
      } catch (error) {
        if (error instanceof HttpError || error instanceof Deadline || method !== 'GET' || attempt === 2) throw error;
        this.budget.check(phase, 3000); await this.wait(1000 * (attempt + 1));
      }
    }
  }
  async pages(url, options = {}) {
    const all = [];
    for (let page = 1; page <= 20; page++) {
      const result = await this.request(url + (url.includes('?') ? '&' : '?') + `per_page=100&page=${page}`, options);
      if (!Array.isArray(result)) throw new Error('Expected paginated array');
      all.push(...result);
      if (result.length < 100) return all;
    }
    throw new Error('Pagination limit reached; refusing incomplete inventory');
  }
}
