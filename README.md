# Quill composer for NodeBB

This plugin activates the WYSIWYG Quill composer for NodeBB. Please ensure that:

* The markdown plugin is disabled (see note below, re: markdown)
* Any other composers (i.e. nodebb-plugin-composer-default) are disabled
* **Warning** This composer saves its data in a unique format that is only compatible with Quill. If you switch to Quill, any posts made with Quill cannot be migrated back to Markdown.

## Migration concerns

### nodebb-plugin-composer-default/nodebb-plugin-markdown

If you used the default composer, chances are you also had the markdown plugin active. If that is the case, any posts made before the switch are still in markdown format, and are not saved into html (in a manner than quill can digest). A migrator tool has been bundled with v1.1 of the Quill Composer, which you can use to migrate posts in markdown and html into the Quill-compatible format.

### nodebb-plugin-redactor

Your posts should automatically work with Quill. Redactor saves HTML into the database, and the Quill plugin is set up so it can digest that html and backport it to Quill's internal format if the post is edited. That said, when you edit a post originally made in Redactor, you'll see the html tags, which are now extraneous. You can remove them as part of your edit. Alternatively, you can use the bundled migrator to convert posts to the Quill-compatible format.

## Contributors Welcome
This plugin is considered _production ready_. Please report any bugs to our issue tracker and we will take a look.

If you'd like to look at the [documentation](https://quilljs.com/docs/) and add a feature, or take a look at the GitHub Issues and do something from there then please do. All pull requests lovingly reviewed.

## Screenshots

### Desktop

![Desktop](/screenshots/desktop.png)

### Mobile

![Mobile](/screenshots/mobile.png)
