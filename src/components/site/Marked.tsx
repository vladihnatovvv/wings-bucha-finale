/**
 * Renders text where the part between asterisks is emphasised: "Дім серед *сосен,*".
 * Used for headings that the owner edits in the admin panel.
 */
export function Marked({ text, emphasisClassName }: { text: string; emphasisClassName: string }) {
  return (
    <>
      {text.split("*").map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className={emphasisClassName}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
