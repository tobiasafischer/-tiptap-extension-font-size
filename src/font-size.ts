import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

type FontSizeOptions = {
	types: string[];
};

const destroyTempSpan = (fontSize: string, p: Element): boolean => {
	// if our current fontsize is equal to the incoming we dont want to inject
	let shouldInject = true;
	// loop through the child nodes (span) to remove the empty span
	p?.childNodes.forEach((child) => {
		// if the span contains &ZeroWidthSpace
		if ((child as HTMLSpanElement).innerHTML === String.fromCodePoint(0x200b)) {
			// if our fontSize does not equal the incoming then we want to remove the temp-span
			if ((child as HTMLSpanElement).style?.fontSize !== fontSize) p.removeChild(child);
			// if they are equal then we do not want to inject another
			else shouldInject = false;
		}
	});
	return shouldInject;
};

const injectTempSpan = (fontSize: string) => {
	// grab the p tag which holds the span elements
	const p = Array.from(document.querySelector('.ProseMirror')?.children || [])[0];

	// destroy any previous temporary span elements
	// exits function if fontSize is the same as temporary ones
	if (!destroyTempSpan(fontSize, p)) return;

	// create a new temporary span element
	const span = document.createElement('span');
	// inject new desired fontSize onto it
	span.style.fontSize = fontSize;
	// set the innerHTML as &ZeroWidthSpace; so it declares an empty span element
	span.innerHTML = '&ZeroWidthSpace;';
	// append the span to the p tag
	p?.appendChild(span);
};

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		fontSize: {
			/**
			 * Set the font family
			 */
			setFontSize: (fontSize: string) => ReturnType;
		};
	}
}

export const FontSize = Extension.create<FontSizeOptions>({
	name: 'fontSize',
	addGlobalAttributes: () => [
		{
			types: ['textStyle'],
			attributes: {
				fontSize: {
					default: null,
					parseHTML: (element) => element.style.fontSize,
					renderHTML: (attributes) => {
						if (!attributes.fontSize) return {};
						return {
							style: `font-size: ${attributes.fontSize}`,
						};
					},
				},
			},
		},
	],
	addCommands: () => ({
		setFontSize:
			(fontSize: string) =>
			({ chain }: any) => {
				injectTempSpan(fontSize);
				return chain().setMark('textStyle', { fontSize }).run();
			},
	}),
});
