import React from "react"
import { Helmet } from "react-helmet"
import { css } from "@emotion/react"
import { TypographyStyle, GoogleFont } from "react-typography"
import Typography from "typography"
import { Link, graphql } from "gatsby"

import { breakpoints, media } from "../utils/responsive"

import Container from "../components/container"
import SEO from "../components/seo"
import Envelope from "../components/envelope"
import GitHub from "../components/github-logo"
import LinkedIn from "../components/linked-in"
import StackOverflow from "../components/stack-overflow"

const fonts = [
  "Schoolbell",
  "Helvetica Neue",
  "Helveticaa",
  "Arial",
  "sans-serif",
]
const chalk = "rgba(220, 220, 220, 0.8)"
const typography = new Typography({
  baseFontSize: "22px",
  headerFontFamily: fonts,
  bodyFontFamily: fonts,
  bodyColor: chalk,
  googleFonts: [
    {
      name: "Schoolbell",
      styles: ["400"],
    },
  ],
  overrideStyles: () => ({
    a: {
      color: chalk,
    },
    "h1,h2,h3,h4,h5": {
      textTransform: "uppercase",
      textAlign: "center",
      lineHeight: 1.6,
      letterSpacing: "2px",
    },
  }),
})

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        social {
          email
          github
          linkedIn
          twitter
        }
      }
    }
  }
`

const LandingPage = ({ data }) => {
  return (
    <div>
      <TypographyStyle typography={typography} />
      <GoogleFont typography={typography} />
      <SEO title="JohnathanGilday.com" />
      <Helmet>
        <style type="text/css">{`
          body {
            /** Photo by <a href="https://unsplash.com/@resourceboy?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Resource Boy</a> on <a href="https://unsplash.com/photos/a-black-and-white-photo-of-a-blackboard-B2ploCySfxU?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a> */
            background: repeat url("img/chalk.jpg");
        `}</style>
      </Helmet>
      <Container width={breakpoints.large}>
        <header
          css={{
            marginTop: typography.rhythm(1.25),
            marginBottom: typography.rhythm(1.25),
          }}
        >
          <h1>
            {data.site.siteMetadata.title}
            <p style={{ fontSize: typography.rhythm(0.8) }}>
              Software Developer
            </p>
          </h1>
          <FlexList>
            <Link to="/blog/">Blog</Link>
            {/** TODO use trailing slash once redirect is set-up */}
            <Link to="/resume/">Resume</Link>
          </FlexList>
        </header>
        <main>
          <Section>
            <SectionText>
              <h2>
                Automated code fixes made daily in Red Bank, NJ at{" "}
                <a href="https://pixee.ai/">Pixee</a>.
              </h2>
              <UndecoratedList>
                <li>
                  <UndecoratedAbbr title="Master of Science">
                    M.S.
                  </UndecoratedAbbr>{" "}
                  Computer Science, Johns Hopkins University
                </li>
                <li>
                  <UndecoratedAbbr title="Bachelor of Science">
                    B.S.
                  </UndecoratedAbbr>{" "}
                  Computer Science, Rutgers University
                </li>
              </UndecoratedList>
            </SectionText>
            <SectionGraphic>
              <img src="img/baltimore-chalk.png" alt="Baltimore" />
            </SectionGraphic>
          </Section>
          <Section>
            <SectionGraphic>
              <img
                src="img/java-chalk.png"
                alt="Specializing in JVM technologies"
              />
            </SectionGraphic>
            <SectionText>
              <h2>Specializing in</h2>
              <ul>
                <li>Java Agent Development</li>
                <li>
                  JVM based services{" "}
                  <small>
                    (Spring, Jersey, OK HTTP, Jackson, Guice, Scala, Akka)
                  </small>
                </li>
                <li>
                  Enterprise Java{" "}
                  <small>
                    (JAX-RS, JPA, JDBC, JAX-WS, JAXP, JAXB, Servlets, OSGi)
                  </small>
                </li>
                <li>
                  Data Persistence Technologies{" "}
                  <small>(Berkeley DB, MongoDB, RDBMS)</small>
                </li>
                <li>
                  Automation{" "}
                  <small>
                    (Gradle, Maven, Bash, git, CI/CD, JUnit Jupiter, Vagrant,
                    Packer)
                  </small>
                </li>
                <li>
                  Web{" "}
                  <small>(Angular, webpack, Gatsby, Bootstrap, Jasemine)</small>
                </li>
                <li>
                  Cloud <small>(AWS, OpenStack, Docker)</small>
                </li>
                <li>Android mobile apps</li>
              </ul>
            </SectionText>
          </Section>
          <footer>
            <FlexList>
              <SocialLink
                href={`https://github.com/${data.site.siteMetadata.social.github}`}
                aria-label="GitHub"
              >
                <GitHub />
              </SocialLink>
              <SocialLink
                href={`https://linkedin.com/in/${data.site.siteMetadata.social.linkedIn}`}
                aria-label="LinkedIn"
              >
                <LinkedIn />
              </SocialLink>
              <SocialLink
                href={`https://stackoverflow.com/users/501368/jdgilday/`}
                aria-label="Stack Overflow"
              >
                <StackOverflow />
              </SocialLink>
              <SocialLink
                href={`mailto:${data.site.siteMetadata.social.email}`}
                aria-label="E-Mail"
              >
                <Envelope />
              </SocialLink>
            </FlexList>
          </footer>
        </main>
      </Container>
    </div>
  )
}

export default LandingPage

const FlexList = ({ children }) => {
  const items = React.Children.map(children, child => (
    <li style={{ listStyle: "none" }}>{child}</li>
  ))
  const style = css({
    padding: 0,
    display: "flex",
    justifyContent: "space-around",
  })
  return <ul css={style}>{items}</ul>
}

const Section = ({ children }) => {
  const style = css({
    display: "flex",
    flexDirection: "column",
    margin: "2rem 0",
    [media.large]: {
      flexDirection: "row",
    },
    "> div": {
      flex: 1,
    },
  })
  return <div css={style}>{children}</div>
}

const SectionText = ({ children }) => (
  <div
    css={{
      marginTop: "24px",
    }}
  >
    {children}
  </div>
)

const SectionGraphic = ({ children }) => {
  const style = css({
    display: "none",
    [media.large]: {
      display: "flex",
      justifyContent: "center",
      "> img": {
        height: "280px",
      },
    },
  })
  return <div css={style}>{children}</div>
}

const UndecoratedList = ({ children }) => (
  <ul css={{ listStyle: "none" }}>{children}</ul>
)

const UndecoratedAbbr = ({ children, title }) => (
  <abbr
    title={title}
    css={{
      textDecoration: "none",
      border: "none",
    }}
  >
    {children}
  </abbr>
)

const SocialLink = ({ children, href, ariaLabel }) => (
  <a
    href={href}
    aria-label={ariaLabel}
    css={{
      boxShadow: "none",
      svg: {
        height: "4rem",
        width: "4rem",
        "> path": {
          stroke: chalk,
        },
        "&:hover > path": {
          fill: chalk,
        },
      },
    }}
  >
    {children}
  </a>
)
