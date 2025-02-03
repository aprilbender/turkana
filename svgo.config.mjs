export default {
    // this is the equiv of the --pretty flag, I think
    js2svg: { indent: 2, pretty: true },
    plugins: [
      {
        // This will prepend all IDs with the filename, munged with underscores. Example:
        // Before: id="foo"
        // After:  id="somefile_svg__foo"
        name: "prefixIds",
      },
    ],
  };