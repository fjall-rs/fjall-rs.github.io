import type { PostListStyle } from "./components/PostListing";

/// Configure your page here
export default {
  /// Global configuration
  site: {
    // SETUP:
    /// Your public page URL
    url: "https://fjall-rs.github.io",

    // SETUP:
    baseUrl: "",

    // SETUP:
    /// Your site's title
    title: "fjall-rs",

    // SETUP:
    /// Default site description
    description: "Organizing data in Rust",
  },

  layout: {
    pageSize: 10,

    /// Post list style
    postListStyle: "list" as PostListStyle,

    landingPage: {
      /// Show recent posts on landing page
      showRecentPosts: true,
    },

    topbar: {
      links: [
        ["Posts", "/posts"],
        ["Tags", "/tags"],
      ],

      showThemeSwitch: true,

      showRssFeed: true,
    },

    footer: {
      showPoweredBy: true,
    },
  },

  /// Post page configuration
  post: {
    /// Show reading progress bar on top of page
    showReadingProgress: true,

    /// Shows a reading time estimate on top of every blog post
    readingTime: {
      enabled: true,

      /// Reading speed in words per minute (WPM) - 200 is a good baseline
      speed: 180,
    },

    /// Code editor configuration
    code: {
      /// See https://github.com/shikijs/shiki/blob/main/docs/themes.md
      ///
      /// NOTE: After changing, you need to restart the dev server because
      /// of a bug in Astro
      theme: {
        light: "rose-pine-moon",
        dark: "rose-pine-moon",
      },
    },
  },
};
