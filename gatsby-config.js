module.exports = {
  siteMetadata: {
    title: `Johnathan Gilday`,
    blogTitle: `/ gilday / blog`,
    author: {
      name: `Johnathan Gilday`,
      summary: `Red Bank, NJ, USA based software developer.`,
    },
    description: `Personal landing page, blog, and resume.`,
    siteUrl: `https://johnathangilday.com/`,
    social: {
      email: `me@johnathangilday.com`,
      github: `gilday`,
      linkedIn: "johnathan-gilday",
      twitter: `jdgilday`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/resume`,
        name: `resume`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 440,
              quality: 90,
              linkImagesToOriginal: false,
              wrapperStyle: {
                borderRadius: "2px",
              },
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-emotion`,
    {
      resolve: `gatsby-plugin-postcss`,
      options: {
        postCssPlugins: [require(`postcss-custom-media`)({ stage: 0 })],
      },
    },
    `gatsby-plugin-react-helmet`,
  ],
}
