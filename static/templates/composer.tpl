<div component="composer" class="composer<!-- IF resizable --> resizable<!-- ENDIF resizable --><!-- IF !isTopicOrMain --> reply<!-- ENDIF !isTopicOrMain -->">

	<div class="composer-container">
		<nav class="navbar navbar-fixed-top mobile-navbar hidden-md hidden-lg">
			<div class="btn-group">
				<button class="btn btn-sm btn-primary composer-discard" data-action="discard" tabindex="-1"><i class="fa fa-times"></i></button>
				<button class="btn btn-sm btn-primary composer-minimize" data-action="minimize" tabindex="-1"><i class="fa fa-minus"></i></button>
			</div>
			<!-- IF isTopic -->
			<div class="category-name-container">
				<span class="category-name"></span> <i class="fa fa-sort"></i>
			</div>
			<!-- ENDIF isTopic -->
			<!-- IF !isTopicOrMain -->
			<h4 class="title">[[topic:composer.replying_to, "{title}"]]</h4>
			<!-- ENDIF !isTopicOrMain -->
			<div class="display-scheduler pull-right{{{ if !canSchedule }}} hidden{{{ end }}}">
				<i class="fa fa-clock-o"></i>
			</div>
			<div class="btn-group">
				<button class="btn btn-sm btn-primary composer-submit" data-action="post" tabindex="-1"><i class="fa fa-chevron-right"></i></button>
			</div>
		</nav>
		<div class="row title-container">
			<!-- IF showHandleInput -->
			<div data-component="composer/handle">
				<input class="handle form-control" type="text" tabindex="1" placeholder="[[topic:composer.handle_placeholder]]" value="{handle}" />
			</div>
			<!-- ENDIF showHandleInput -->
			<div data-component="composer/title">
				<!-- IF isTopicOrMain -->
				<input class="title form-control" type="text" tabindex="1" placeholder="[[topic:composer.title_placeholder]]" value="{title}"/>
				<!-- ELSE -->
				<span class="title form-control">[[topic:composer.replying_to, "{title}"]]</span>
				<!-- ENDIF isTopicOrMain -->
				<div id="quick-search-container" class="quick-search-container hidden">
					<div class="quick-search-results-container"></div>
				</div>
			</div>

			{{{ if isTopic }}}
			<div class="category-list-container hidden-sm hidden-xs">
				<!-- IMPORT partials/category-selector.tpl -->
			</div>
			{{{ end }}}

			<div class="pull-right draft-icon hidden-xs hidden-sm"></div>

			<div class="display-scheduler pull-right hidden-sm hidden-xs{{{ if !canSchedule }}} hidden{{{ end }}}">
				<i class="fa fa-clock-o"></i>
			</div>

			<div class="btn-group pull-right action-bar hidden-sm hidden-xs">
				<button class="btn btn-default composer-discard" data-action="discard" tabindex="-1"><i class="fa fa-times"></i> [[topic:composer.discard]]</button>

				<button class="btn btn-primary composer-submit" data-action="post" tabindex="6" data-text-variant=" [[topic:composer.schedule]]"><i class="fa fa-check"></i> [[topic:composer.submit]]</button>
			</div>
		</div>

		<div class="category-tag-row">
			<div class="btn-toolbar formatting-bar">
				<ul class="formatting-group">
					<!-- BEGIN formatting -->
						<!-- IF formatting.spacer -->
						<li class="spacer"></li>
						<!-- ELSE -->
						<!-- IF !formatting.mobile -->
						<li tabindex="-1" data-format="{formatting.name}" title="{formatting.title}"><i class="{formatting.className}"></i></li>
						<!-- ENDIF !formatting.mobile -->
						<!-- ENDIF formatting.spacer -->
					<!-- END formatting -->

					<!--[if gte IE 9]><!-->
						<!-- IF privileges.upload:post:image -->
						<li class="img-upload-btn hide" data-format="picture" tabindex="-1" title="[[modules:composer.upload-picture]]">
							<i class="fa fa-file-image-o"></i>
						</li>
						<!-- ENDIF privileges.upload:post:image -->
						<!-- IF privileges.upload:post:file -->
						<li class="file-upload-btn hide" data-format="upload" tabindex="-1" title="[[modules:composer.upload-file]]">
							<span class="fa-stack">
								<i class="fa fa-file-o fa-stack-1x"></i>
								<i class="fa fa-arrow-up fa-stack-1x"></i>
							</span>
						</li>
						<!-- ENDIF privileges.upload:post:file -->
					<!--<![endif]-->

					<!-- IF allowTopicsThumbnail -->
					<li tabindex="-1">
						<i class="fa fa-th-large topic-thumb-btn topic-thumb-toggle-btn hide" title="[[topic:composer.thumb_title]]"></i>
					</li>
					<div class="topic-thumb-container center-block hide">
						<form id="thumbForm" method="post" class="topic-thumb-form form-inline" enctype="multipart/form-data">
							<img class="topic-thumb-preview"></img>
							<div class="form-group">
								<label for="topic-thumb-url">[[topic:composer.thumb_url_label]]</label>
								<input type="text" id="topic-thumb-url" class="form-control" placeholder="[[topic:composer.thumb_url_placeholder]]" />
							</div>
							<div class="form-group">
								<label for="topic-thumb-file">[[topic:composer.thumb_file_label]]</label>
								<input type="file" id="topic-thumb-file" class="form-control" />
							</div>
							<div class="form-group topic-thumb-ctrl">
								<i class="fa fa-spinner fa-spin hide topic-thumb-spinner" title="[[topic:composer.uploading]]"></i>
								<i class="fa fa-times topic-thumb-btn hide topic-thumb-clear-btn" title="[[topic:composer.thumb_remove]]"></i>
							</div>
						</form>
					</div>
					<!-- ENDIF allowTopicsThumbnail -->

					<form id="fileForm" method="post" enctype="multipart/form-data">
						<!--[if gte IE 9]><!-->
							<input type="file" id="files" name="files[]" multiple class="gte-ie9 hide"/>
						<!--<![endif]-->
						<!--[if lt IE 9]>
							<input type="file" id="files" name="files[]" class="lt-ie9 hide" value="Upload"/>
						<![endif]-->
					</form>
				</ul>
			</div>
		</div>

		<div class="row write-preview-container">
			<div class="write-container">
				<div></div>
				<textarea></textarea>
			</div>
		</div>

		<!-- IF isTopicOrMain -->
		<div class="tag-row">
			<div class="tags-container">
				<div class="btn-group dropup <!-- IF !tagWhitelist.length -->hidden<!-- ENDIF !tagWhitelist.length -->" component="composer/tag/dropdown">
					<button class="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button">
						<span class="visible-sm-inline visible-md-inline visible-lg-inline"><i class="fa fa-tags"></i></span>
						[[tags:select_tags]]
					</button>

					<ul class="dropdown-menu">
						<!-- BEGIN tagWhitelist -->
						<li data-tag="{@value}"><a href="#">{@value}</a></li>
						<!-- END tagWhitelist -->
					</ul>
				</div>
				<input class="tags" type="text" class="form-control" placeholder="[[tags:enter_tags_here, {minimumTagLength}, {maximumTagLength}]]" tabindex="5"/>
			</div>
		</div>
		<!-- ENDIF isTopicOrMain -->

		<div class="imagedrop"><div>[[topic:composer.drag_and_drop_images]]</div></div>

		<div class="resizer"><div class="trigger text-center"><i class="fa"></i></div></div>
	</div>
</div>
