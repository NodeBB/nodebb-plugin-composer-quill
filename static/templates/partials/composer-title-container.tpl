<div class="title-container align-items-center gap-2 d-flex">
	{{{ if isTopic }}}
	<div class="category-list-container {{{ if !template.compose }}}d-none d-md-block{{{ end }}} align-self-center">
		<!-- IMPORT partials/category/selector-dropdown-left.tpl -->
	</div>
	{{{ end }}}

	{{{ if showHandleInput }}}
	<div data-component="composer/handle">
		<input class="handle form-control h-100 border-0 shadow-none" type="text" placeholder="[[topic:composer.handle-placeholder]]" value="{handle}" />
	</div>
	{{{ end }}}

	<div data-component="composer/title" class="position-relative flex-1" style="min-width: 0;">
		{{{ if isTopicOrMain }}}
		<input class="title form-control h-100 rounded-1 shadow-none" type="text" placeholder="[[topic:composer.title-placeholder]]" value="{topicTitle}" />
		{{{ else }}}
		<span class="{{{ if !template.compose }}}d-none d-md-block{{{ else }}}d-block{{{ end }}} title h-100 text-truncate">{{{ if isEditing }}}[[topic:composer.editing-in, "{topicTitle}"]]{{{ else }}}[[topic:composer.replying-to, "{topicTitle}"]]{{{ end }}}</span>
		{{{ end }}}
		<div id="quick-search-container" class="quick-search-container mt-2 dropdown-menu d-block p-2 hidden">
			<div class="text-center loading-indicator"><i class="fa fa-spinner fa-spin"></i></div>
			<div class="quick-search-results-container"></div>
		</div>
	</div>

	<div class="{{{ if !template.compose }}}d-none d-md-flex{{{ else }}}d-flex{{{ end }}} action-bar gap-1 align-items-center">
		<button class="btn btn-sm btn-link text-body fw-semibold composer-minimize" data-action="hide"><i class="fa fa-angle-down"></i> <span class="d-none d-md-inline">[[topic:composer.hide]]</span></button>
		<button class="btn btn-sm btn-link composer-discard text-body fw-semibold" data-action="discard"><i class="fa fa-trash"></i> <span class="d-none d-md-inline">[[topic:composer.discard]]</button>
		<div class="btn-group btn-group-sm" component="composer/submit/container">
			<button class="btn btn-primary composer-submit fw-bold {{{ if !(submitOptions.length || canSchedule) }}}rounded-1{{{ end }}}" data-action="post" data-text-variant=" [[topic:composer.schedule]]"><i class="fa fa-check"></i> <span class="d-none d-md-inline">[[topic:composer.submit]]</span></button>
			<div component="composer/submit/options/container" data-submit-options="{submitOptions.length}" class="btn-group btn-group-sm {{{ if !(submitOptions.length || canSchedule) }}}hidden{{{ end }}}">
				<button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					<i class="fa fa-caret-down"></i>
					<span class="sr-only">[[topic:composer.additional-options]]</span>
				</button>
				<ul class="dropdown-menu dropdown-menu-end p-1" role="menu">
					<li><a class="dropdown-item rounded-1 display-scheduler {{{ if !canSchedule }}}hidden{{{ end }}}" role="menuitem">[[topic:composer.post-later]]</a></li>
					<li><a class="dropdown-item rounded-1 cancel-scheduling hidden" role="menuitem">[[modules:composer.cancel-scheduling]]</a></li>
					{{{ each submitOptions }}}
					<li><a class="dropdown-item rounded-1" href="#" data-action="{./action}" role="menuitem">{./text}</a></li>
					{{{ end }}}
				</ul>
			</div>
		</div>
	</div>
</div>
