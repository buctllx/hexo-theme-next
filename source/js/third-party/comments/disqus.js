/* global NexT, CONFIG, DISQUS */

document.addEventListener('page:loaded', () => {

  if (CONFIG.disqus.count) {
    if (window.DISQUSWIDGETS) {
      window.DISQUSWIDGETS.getCount();
      // count-data.js does not reload when user revisit the same page
      // So we need to manually call displayCount to update the count
      window.DISQUSWIDGETS.displayCount({});
    } else {
      // Defer loading until the whole page loading is completed
      NexT.utils.getScript(`https://${CONFIG.disqus.shortname}.disqus.com/count.js`, {
        attributes: { id: 'dsq-count-scr', defer: true }
      }).then(() => {
        let allCounts = [];
        let defaultText;
        const { displayCount } = window.DISQUSWIDGETS;
        // Hook the original displayCount function to make it PJAX compatible
        // It should take effect before the first count-data.js is loaded & evaluated
        window.DISQUSWIDGETS.displayCount = function({ text, counts }) {
          if (counts) allCounts = allCounts.concat(counts);
          if (text) defaultText = text;
          // Pass a clone of allCounts, because the original displayCount function will modify it
          displayCount({ text: defaultText, counts: [...allCounts] });
        };
      });
    }
  }

  if (CONFIG.page.comments) {
    // `disqus_config` should be a global variable
    // See https://help.disqus.com/en/articles/1717084-javascript-configuration-variables
    window.disqus_config = function() {
      this.page.url = CONFIG.page.permalink;
      this.page.identifier = CONFIG.page.path;
      this.page.title = CONFIG.page.title;
      if (CONFIG.disqus.i18n.disqus !== 'disqus') {
        this.language = CONFIG.disqus.i18n.disqus;
      }
    };
    NexT.utils.loadComments('#disqus_thread').then(() => {
      if (window.DISQUS) {
        DISQUS.reset({
          reload: true,
          config: window.disqus_config
        });
      } else {
        NexT.utils.getScript(`https://${CONFIG.disqus.shortname}.disqus.com/embed.js`, {
          attributes: { dataset: { timestamp: '' + +new Date() } }
        });
      }
    });
  }

});
