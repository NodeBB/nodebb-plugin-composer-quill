'use strict';

define('quill-mbq', ['quill'], (quill) => {
	// Multi-line blockquote formatting
	const Parchment = quill.import('parchment');
	const ClassAttributor = Parchment.Attributor.Class;
	const Scope = Parchment.Scope;

	class MbqAttributor extends ClassAttributor {
		add(node, value) {
			const current = super.value(node) || 0;

			if (!current) {
				return super.add(node, value);
			}

			this.remove(node);
			return true;
		}

		value(node) {
			return super.value(node) || node.classList.contains('ql-mbq-true');
		}
	}

	const MbqClass = new MbqAttributor('mbq', 'ql-mbq', {
		scope: Scope.BLOCK,
		whitelist: [true],
	});

	quill.register(MbqClass);
});
