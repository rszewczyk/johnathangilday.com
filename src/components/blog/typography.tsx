import Typography from "typography"
import theme from "typography-theme-sutro"

theme.overrideThemeStyles = ({ rhythm }, options, styles) => {
  const darkModeStyles = {
    body: {
      backgroundColor: "#121212",
      color: "#ffffff",
    },
    a: {
      color: "#06ff68",
    },
    "a.gatsby-resp-image-link": {
      boxShadow: `none`,
    },
    blockquote: {
      borderLeftColor: `rgba(6, 255, 104)`,
      color: `rgba(6, 255, 104, 0.64)`,
    },
  }

  const lightModeStyles = {
    "a.gatsby-resp-image-link": {
      boxShadow: `none`,
    },
  }

  return {
    ...lightModeStyles,
    "@media (prefers-color-scheme: dark)": darkModeStyles,
  }
}

delete theme.googleFonts

const typography = new Typography(theme)

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
