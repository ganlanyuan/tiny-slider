// Next processes plain stylesheet imports through its own pipeline; TypeScript
// just needs to know the side-effect import is legal.
declare module '*.css';
