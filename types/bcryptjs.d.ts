declare module 'bcryptjs' {
  export function compare(data: string | Buffer, hash: string): Promise<boolean>;
  export function hash(data: string | Buffer, saltOrRounds: string | number): Promise<string>;
  export function genSalt(rounds?: number): Promise<string>;
  export function getRounds(hash: string): number;
}
