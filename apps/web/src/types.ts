// MEMO: handleXXは、component用のevent handlerの命名で、(props, state, payload)を持つ
export type ComponentEventHandler<
  P = Record<string, unknown>,
  S = Record<string, unknown>,
  V = unknown,
> = (props: P, state: S, val?: V) => void;
