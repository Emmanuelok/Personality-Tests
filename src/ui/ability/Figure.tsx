/** Renders a self-contained SVG-string figure from the ability item bank. */
export function Figure({ svg, className = "" }: { svg: string; className?: string }) {
  return <span className={`abfig ${className}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}
