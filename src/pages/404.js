import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/blog/layout"
import SEO from "../components/seo"

const NotFoundPage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title

  return (
    <Layout
      location={location}
      title={siteTitle}
      author={data.site.siteMetadata.author.name}
    >
      <SEO title="404: Not Found" />
      <h1>
        <span id="not-found-heading">Page Not Found</span>
        <span role="img" aria-labelledby="not-found-heading">
          🤷‍♂️
        </span>
      </h1>
    </Layout>
  )
}

export default NotFoundPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        author {
          name
        }
        title
      }
    }
  }
`
