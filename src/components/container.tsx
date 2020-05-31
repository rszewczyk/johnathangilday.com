import React from "react"
import { css } from "@emotion/core"

export default ({ children, width }) => (
  <div
    css={{
      maxWidth: width,
      margin: "0 auto",
    }}
  >
    {children}
  </div>
)
