// Button
// Link
// ButtonLink(中身はLink)
// TextButton(中身はButton)

export function Button(props: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={props.onClick || (() => {})}
      className="rounded-full border px-4 py-2 focus-visible:bg-gray-200 text-center"
    >
      {props.children}
    </button>
  );
}

export function Link(props: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={props.href}
      className="focus-visible:bg-gray-200 text-center font-bold"
    >
      {props.children}
    </a>
  );
}

export function ButtonLink(props: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={props.href}
      className="rounded-full border px-4 py-2 focus-visible:bg-gray-200 text-center"
    >
      {props.children}
    </a>
  );
}
