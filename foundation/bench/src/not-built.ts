/** Thrown by every part of the contract that is declared and not yet written. */
export class NotBuilt extends Error {
  constructor(name: string) {
    super(`${name} is declared by the contract and not written yet`);
    this.name = "NotBuilt";
  }
}
