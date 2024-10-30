<div class="d-flex justify-content-between gap-2 align-items-center formatting-bar m-0">
	<ul class="list-unstyled mb-0 d-flex formatting-group gap-2 overflow-auto">
		{{{ each formatting }}}
			{{{ if ./spacer }}}
			<li class="small spacer"></li>
			{{{ else }}}
			{{{ if (./visibility.desktop && ((isTopicOrMain && ./visibility.main) || (!isTopicOrMain && ./visibility.reply))) }}}
			{{{ if ./dropdownItems.length }}}
			<li class="dropdown bottom-sheet" title="{./title}">
				<button class="btn btn-sm btn-link text-reset" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" aria-label="{./title}">
					<i class="{./className}"></i>
				</button>
				<ul class="dropdown-menu p-1" role="menu">
				{{{ each ./dropdownItems }}}
					<li>
						<a href="#" data-format="{./name}" class="dropdown-item rounded-1 position-relative" role="menuitem">
							<i class="{./className} text-secondary"></i> {./text}
							{{{ if ./badge }}}
							<span class="px-1 position-absolute top-0 start-100 translate-middle badge rounded text-bg-info"></span>
							{{{ end }}}
						</a>
					</li>
				{{{ end }}}
				</ul>
			</li>
			{{{ else }}}
			<li title="{./title}">
				<button data-format="{./name}" class="btn btn-sm btn-link text-reset position-relative" aria-label="{./title}">
					<i class="{./className}"></i>
					{{{ if ./badge }}}
					<span class="px-1 position-absolute top-0 start-100 translate-middle badge rounded text-bg-info"></span>
					{{{ end }}}
				</button>
			</li>
			{{{ end }}}
			{{{ end }}}
			{{{ end }}}
		{{{ end }}}

		{{{ if privileges.upload:post:image }}}
		<li title="[[modules:composer.upload-picture]]">
			<button data-format="picture" class="img-upload-btn btn btn-sm btn-link text-reset" aria-label="[[modules:composer.upload-picture]]">
				<i class="fa fa-file-image-o"></i>
			</button>
		</li>
		{{{ end }}}

		{{{ if privileges.upload:post:file }}}
		<li title="[[modules:composer.upload-file]]">
			<button data-format="upload" class="file-upload-btn btn btn-sm btn-link text-reset" aria-label="[[modules:composer.upload-file]]">
				<i class="fa fa-file-o"></i>
			</button>
		</li>
		{{{ end }}}

		<form id="fileForm" method="post" enctype="multipart/form-data">
			<input type="file" id="files" name="files[]" multiple class="hide"/>
		</form>
	</ul>
	<div class="d-flex align-items-center gap-1">
		<div class="draft-icon m-2 hidden-xs hidden-sm"></div>
		<button class="btn btn-sm btn-link py-2 text-body fw-semibold text-nowrap" data-action="preview">
			<i class="fa fa-eye"></i>
			<span class="d-none d-md-inline show-text">[[modules:composer.show-preview]]</span>
			<span class="d-none d-md-inline hide-text">[[modules:composer.hide-preview]]</span>
		</button>
		{{{ if composer:showHelpTab }}}
		<button class="btn btn-sm btn-link py-2 text-body fw-semibold text-nowrap" data-action="help">
			<i class="fa fa-question"></i>
			<span class="d-none d-md-inline">[[modules:composer.help]]</span>
		</button>
		{{{ end }}}
	</div>
</div>

