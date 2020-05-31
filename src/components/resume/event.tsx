import colors from "./colors"
import { media } from "../../utils/responsive"

export default ({ event }) => (
  <article
    css={{
      backgroundColor: colors.white,
      border: `1px solid ${colors.grayLight}`,
      borderRadius: "2px",
      marginBottom: "40px",
      wordWrap: "break-word",
      margin: "40px 8px",
      [media.large]: {
        margin: "40px 0",
        width: "458px",
        float: "left",
        "&:nth-child(even)": {
          clear: "left",
        },
        "&:nth-child(odd)": {
          float: "right",
        },
      },
    }}
  >
    <Arrow />
    <div
      css={{
        backgroundColor: colors.grayLighter,
        borderBottom: `1px solid ${colors.grayDarker}`,
        margin: "0 0 4px 0",
      }}
    >
      <h3
        css={{
          // TODO should some of this be in typography configuration instead?
          fontSize: "1.1em",
          color: colors.grayDark,
          padding: "0 0.5em",
          margin: "0",
        }}
      >
        {event.title}
      </h3>
    </div>
    <div
      css={{
        textAlign: "justify",
        padding: "0 8px",
        "& img, & iframe": {
          borderRadius: "2px",
        },
      }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: event.html,
        }}
      />
    </div>
  </article>
)

const Arrow = () => (
  <span
    css={{
      backgroundRepeat: "no-repeat",
      display: "block",
      height: "20px",
      width: "10px",
      position: "absolute",
      zIndex: 2,
      marginTop: "40px",
      "article:nth-child(odd) &": {
        marginLeft: "-10px",
        backgroundImage: `url("img/leftarrow.png")`,
      },
      "article:nth-child(even) &": {
        marginLeft: "456px",
        backgroundImage: `url("img/rightarrow.png")`,
      },
    }}
  />
)
