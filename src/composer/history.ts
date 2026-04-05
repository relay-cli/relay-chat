export class DraftHistory {
  readonly #entries: string[] = [];
  #index = 0;
  #pending = '';

  push(value: string): void {
    const normalized = value.trim();
    if (normalized === '') return;
    if (this.#entries.at(-1) !== normalized) this.#entries.push(normalized);
    this.#index = this.#entries.length;
    this.#pending = '';
  }

  previous(current: string): string {
    if (this.#entries.length === 0) return current;
    if (this.#index === this.#entries.length) this.#pending = current;
    this.#index = Math.max(0, this.#index - 1);
    return this.#entries[this.#index] ?? current;
  }

  next(current: string): string {
    if (this.#entries.length === 0) return current;
    this.#index = Math.min(this.#entries.length, this.#index + 1);
    return this.#index === this.#entries.length ? this.#pending : (this.#entries[this.#index] ?? current);
  }
}
