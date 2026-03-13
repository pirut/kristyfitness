import { DocumentRenderer } from "@keystatic/core/renderer";
import type { ReactNode } from "react";

type Props = {
  document: Parameters<typeof DocumentRenderer>[0]["document"];
};

export default function BlogDocument({ document }: Props) {
  const renderHeading = (
    level: 1 | 2 | 3 | 4 | 5 | 6,
    children: ReactNode,
    textAlign: "center" | "end" | undefined
  ) => {
    const style = textAlign ? { textAlign } : undefined;

    switch (level) {
      case 1:
        return <h1 style={style}>{children}</h1>;
      case 2:
        return <h2 style={style}>{children}</h2>;
      case 3:
        return <h3 style={style}>{children}</h3>;
      case 4:
        return <h4 style={style}>{children}</h4>;
      case 5:
        return <h5 style={style}>{children}</h5>;
      default:
        return <h6 style={style}>{children}</h6>;
    }
  };

  return (
    <div className="blog-prose">
      <DocumentRenderer
        document={document}
        renderers={{
          block: {
            paragraph: ({ children, textAlign }) => (
              <p style={textAlign ? { textAlign } : undefined}>{children}</p>
            ),
            heading: ({ children, level, textAlign }) => renderHeading(level, children, textAlign),
            blockquote: ({ children }) => <blockquote>{children}</blockquote>,
            code: ({ children }) => <pre><code>{children}</code></pre>,
            divider: () => <hr />,
            list: ({ children, type }) =>
              type === "ordered" ? <ol>{children}</ol> : <ul>{children}</ul>,
            image: ({ src, alt, title }) => (
              <figure>
                <img src={src} alt={alt} loading="lazy" decoding="async" />
                {title ? <figcaption>{title}</figcaption> : null}
              </figure>
            ),
            table: ({ head, body }) => (
              <div className="table-wrap">
                <table>
                  {head ? (
                    <thead>
                      <tr>
                        {head.map((cell, index) => (
                          <th key={index} colSpan={cell.colSpan} rowSpan={cell.rowSpan}>
                            {cell.children}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  ) : null}
                  <tbody>
                    {body.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} colSpan={cell.colSpan} rowSpan={cell.rowSpan}>
                            {cell.children}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ),
          },
        }}
      />
    </div>
  );
}
