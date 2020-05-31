export default ({ children }) => (
  <div
    css={{
      backgroundImage: 'url("../img/lightgrey.png")',
      backgroundRepeat: "repeat-y",
      backgroundPosition: "center",
      padding: "0.25rem 0",
      position: "relative",
    }}
  >
    {children}
  </div>
)
