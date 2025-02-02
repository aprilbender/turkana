export default {
    // this is the equiv of the --pretty flag, I think
    js2svg: { indent: 2, pretty: true },
    plugins: [
        // The default presets might include things that I'm not aware of,
        // so for now I'm disabling them all for an opt-in approach.
    //   {
    //     name: 'preset-default',
    //     params: {
    //       overrides: {
    //         // disable a default plugin
    //         cleanupIds: false,
  
    //         // customize the params of a default plugin
    //         inlineStyles: {
    //           onlyMatchedOnce: false,
    //         },
    //       },
    //     },
    //   },
      {
        // This will prepend all IDs with the filename, munged with underscores. Example:
        // Before: id="foo"
        // After:  id="somefile_svg__foo"
        name: "prefixIds",
      },
    ],
  };