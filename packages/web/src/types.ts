// MEMO: handleXXは、component用のevent handlerの命名で、(props, state, payload)を持つ
export type ComponentEventHandler<P, S, V> = (
  props: P,
  state: S,
  val?: V
) => void;
