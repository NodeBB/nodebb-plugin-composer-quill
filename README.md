# Quill composer for NodeBB

This plugin activates the WYSIWYG Quill composer for NodeBB. Please ensure that:

* The markdown plugin is disabled (see note below, re: markdown)
* Any other composers (i.e. nodebb-plugin-composer-default) are disabled
* **Warning** This composer saves its data in a unique format that is only compatible with Quill. If you switch to Quill, it may not be advisable to switch back without some sort of converter (which does not exist at this time).

## Migration concerns

### nodebb-plugin-composer-default/nodebb-plugin-markdown

If you used the default composer, chances are you also had the markdown plugin active. If that is the case, any posts made before the switch are still in markdown format, and are not saved into html (in a manner than quill can digest). You can leave the markdown plugin enabled, which will preserve the formatting for those old posts, but there are no guarantees that the Quill composer will work nicely with the markdown plugin enabled alongside. Your mileage may vary.

### nodebb-plugin-redactor

Your posts should automatically work with Quill. Redactor saves HTML into the database, and the Quill plugin is set up so it can digest that html and backport it to Quill's internal format if the post is edited. That said, when you edit a post originally made in Redactor, you'll see the html tags, which are now extraneous. You can remove them as part of your edit.

## Contributors Welcome
This plugin is in its early stages. If you'd like to look at the [documentation](https://quilljs.com/docs/) and add a feature, or take a look at the GitHub Issues and do something from there then please do. All pull requests lovingly reviewed.

## Screenshots

### Desktop

![Desktop](/screenshots/desktop.png)

### Mobile

![Mobile](/screenshots/mobile.png)
