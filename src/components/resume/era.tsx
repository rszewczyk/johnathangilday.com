import colors from "./colors"

export default ({ title, children }) => (
  <section
    css={{
      "&:after": {
        // clearfix
        content: '""',
        display: "table",
        clear: "both",
      },
    }}
  >
    <h2
      css={{
        backgroundColor: colors.grayLight,
        textAlign: "center",
        width: "180px",
        borderRadius: "4px",
        clear: "both",
        margin: "1rem auto",
      }}
    >
      {title}
    </h2>
    {children}
  </section>
)
