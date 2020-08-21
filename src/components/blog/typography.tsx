import Typography from "typography"
import theme from "typography-theme-sutro"

theme.overrideThemeStyles = () => {
  return {
    "a.gatsby-resp-image-link": {
      boxShadow: `none`,
    },
  }
}

delete theme.googleFonts

const typography = new Typography(theme)

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
