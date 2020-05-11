<div class="row">
	<div class="col-lg-8 col-sm-6">
		<div class="panel panel-default">
			<div class="panel-heading">Quill Composer</div>
			<div class="panel-body">
				<p>
					<a href="https://quilljs.com/">Quill</a> is a free, open source WYSIWYG editor built for the modern web. With its modular architecture and expressive API, it is completely customizable to fit any need.
				</p>
			</div>
		</div>
	</div>
	<div class="col-lg-4 col-sm-6">
		<div class="panel panel-default">
			<div class="panel-heading">Migration</div>
			<div class="panel-body">
				<p>
					If you are switching to Quill from a different composer (i.e. composer-default/markdown), you will need to convert your existing posts to Quill's format. You may use the utilities below to do so.
				</p>

				<button class="btn btn-block btn-default" data-action="migrate/in">Migrate to Quill <i class="fa fa-arrow-circle-o-left"></i></button>
				<button class="btn btn-block btn-default" data-action="migrate/out">Migrate from Quill <i class="fa fa-arrow-circle-o-right"></i></button>
			</div>
		</div><div class="panel panel-default">
			<div class="panel-heading">Compatibility Checks</div>
			<div class="panel-body">
				<ul class="list-group">
					<li class="list-group-item list-group-item-<!-- IF checks.markdown -->success<!-- ELSE -->danger<!-- ENDIF checks.markdown -->">
						<strong>Markdown Compatibility</strong>
						<!-- IF checks.markdown -->
						<span class="badge"><i class="fa fa-check"></i></span>
						<p>The Markdown plugin is either disabled, or HTML sanitization is disabled</p>
						<!-- ELSE -->
						<span class="badge"><i class="fa fa-times"></i></span>
						<p>
							In order to render post content correctly, the Markdown plugin needs to have HTML sanitization disabled,
							or the entire plugin should be disabled altogether.
						</p>
						<!-- ENDIF checks.markdown -->
					</li>
					<li class="list-group-item list-group-item-<!-- IF checks.composer -->success<!-- ELSE -->danger<!-- ENDIF checks.composer -->">
						<strong>Composer Conflicts</strong>
						<!-- IF checks.composer -->
						<span class="badge"><i class="fa fa-check"></i></span>
						<p>Great! Looks like Quill is the only composer active</p>
						<!-- ELSE -->
						<span class="badge"><i class="fa fa-times"></i></span>
						<p>Quill must be the only composer active. Please disable other composers and reload NodeBB.</p>
						<!-- ENDIF checks.composer -->
					</li>
				</ul>
			</div>
		</div>
	</div>
</div>
