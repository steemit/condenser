/**
 * Reputation — "(73)" style reputation number after an author name.
 * Ported from legacy src/app/components/elements/Reputation.jsx.
 */
export default function Reputation({ value }: { value: number }) {
  if (Number.isNaN(value)) {
    console.log('Unexpected rep value:', value);
    return null;
  }
  return (
    <span className="Reputation" title="Reputation">
      ({Math.floor(value)})
    </span>
  );
}
