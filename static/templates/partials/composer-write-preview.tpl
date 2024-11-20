<div class="write-preview-container d-flex gap-2 flex-grow-1 overflow-auto">
	<div class="write-container d-flex flex-column w-100 position-relative">
		<div></div>
		<!--
		<div component="composer/post-queue/alert" class="m-2 alert alert-info fade pe-none position-absolute top-0 start-0 alert-dismissible">[[modules:composer.post-queue-alert]]<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>
		<div class="draft-icon position-absolute end-0 top-0 mx-2 my-1 hidden-md hidden-lg"></div>
		-->
		<textarea class="write shadow-none rounded-1 w-100 form-control" placeholder="[[modules:composer.textarea.placeholder]]">{body}</textarea>
	</div>
	<!-- no need for preview container in quill -->
	<div class="preview-container d-none d-md-flex w-50" style="display:none!important;">
		<div class="preview w-100 overflow-auto"></div>
	</div>

</div>