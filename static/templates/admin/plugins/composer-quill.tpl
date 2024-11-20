<div class="acp-page-container">
	<style>#save {display: none;}</style>
	<!-- IMPORT admin/partials/settings/header.tpl -->

	<div class="row m-0">
		<div id="spy-container" class="col-12 col-md-8 px-0 mb-4" tabindex="0">
			<p>
				<a href="https://quilljs.com/">Quill</a> is a free, open source WYSIWYG editor built for the modern web. With its modular architecture and expressive API, it is completely customizable to fit any need.
			</p>

			<hr/>

			<div>
				<h5>Migration</h5>

				<p>
					If you are switching to Quill from a different composer (i.e. composer-default/markdown), you will need to convert your existing posts to Quill's format. You may use the utilities below to do so.
				</p>

				<button class="btn btn-light" data-action="migrate/in">Migrate to Quill <i class="fa fa-arrow-circle-o-left"></i></button>
				<button class="btn btn-light" data-action="migrate/out">Migrate from Quill <i class="fa fa-arrow-circle-o-right"></i></button>
			</div>

			<hr />

			<div>
				<h5>Compatibility Checks</h5>

				<ul class="list-group">
					<li class="list-group-item list-group-item-{{{ if checks.markdown }}}success{{{ else }}}danger{{{ end }}}">
						<strong>Markdown Compatibility</strong>
						{{{ if checks.markdown }}}
						<i class="fa fa-check"></i>
						<p>The Markdown plugin is either disabled, or HTML sanitization is disabled</p>
						{{{ else }}}
						<i class="fa fa-times"></i>
						<p>
							In order to render post content correctly, the Markdown plugin needs to have HTML sanitization disabled,
							or the entire plugin should be disabled altogether.
						</p>
						{{{ end }}}
					</li>
					<li class="list-group-item list-group-item-{{{ if checks.composer }}}success{{{ else }}}danger{{{ end }}}">
						<strong>Composer Conflicts</strong>
						{{{ if checks.composer }}}
						<i class="fa fa-check"></i>
						<p>Great! Looks like Quill is the only composer active</p>
						{{{ else }}}
						<i class="fa fa-times"></i>
						<p>Quill must be the only composer active. Please disable other composers and reload NodeBB.</p>
						{{{ end }}}
					</li>
				</ul>
			</div>
		</div>

		<!-- IMPORT admin/partials/settings/toc.tpl -->
	</div>
</div>

