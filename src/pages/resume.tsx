import React from "react"
import { Helmet } from "react-helmet"
import { css } from "@emotion/core"
import { Link, graphql } from "gatsby"
import { TypographyStyle } from "react-typography"

import SEO from "../components/seo"
import Resume from "../components/resume"
import typography from "../components/resume/typography"

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: { fileAbsolutePath: { regex: "/resume/" } }
    ) {
      edges {
        node {
          frontmatter {
            era
            date
            title
          }
          html
        }
      }
    }
  }
`

const ResumePage = ({ data, location }) => {
  const title = data.site.siteMetadata.title
  const timeline = data.allMarkdownRemark.edges.reduce((eras, edge) => {
    let list = eras[edge.node.frontmatter.era]
    if (!list) {
      list = []
      eras[edge.node.frontmatter.era] = list
    }
    list.push({
      date: edge.node.frontmatter.date,
      html: edge.node.html,
      title: edge.node.frontmatter.title,
    })
    return eras
  }, {})

  return (
    <div>
      <TypographyStyle typography={typography} />
      <SEO title="Resume" />
      <Resume timeline={timeline} />
    </div>
  )
}
export default ResumePage
