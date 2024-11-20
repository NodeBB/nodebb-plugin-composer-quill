<div class="tag-row">
	<div class="tags-container d-flex align-items-center {{{ if tagWhitelist.length }}}haswhitelist{{{ end }}}">
		<div class="btn-group dropup me-2 {{{ if !tagWhitelist.length }}}hidden{{{ end }}}" component="composer/tag/dropdown">
			<button class="btn btn-sm btn-link text-body dropdown-toggle" data-bs-toggle="dropdown" type="button" aria-haspopup="true" aria-expanded="false">
				<span class="visible-sm-inline visible-md-inline visible-lg-inline"><i class="fa fa-tags"></i></span>
				[[tags:select-tags]]
			</button>

			<ul class="dropdown-menu" role="menu">
				<!-- BEGIN tagWhitelist -->
				<li data-tag="{@value}"><a class="dropdown-item" href="#" role="menuitem">{@value}</a></li>
				<!-- END tagWhitelist -->
			</ul>
		</div>
		<input class="tags" type="text" class="" placeholder="[[tags:enter-tags-here, {minimumTagLength}, {maximumTagLength}]]" />
	</div>
</div>