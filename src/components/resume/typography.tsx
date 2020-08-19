import Typography from "typography"

const fonts = ["Helvetica Neue", "Helveticaa", "Arial", "sans-serif"]
const typography = new Typography({
  baseFontSize: 14,
  headerFontFamily: fonts,
  bodyFontFamily: fonts,
  overrideStyles: ({ adjustFontSizeTo, rhythm }, options, styles) => ({
    "h1,h2,h3,h4,h5": {
      lineHeight: "40px",
    },
  }),
})

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
