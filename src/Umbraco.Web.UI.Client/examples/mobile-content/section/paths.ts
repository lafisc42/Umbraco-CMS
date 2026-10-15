import { EXAMPLE_MOBILE_CONTENT_SECTION_PATH, EXAMPLE_MOBILE_CONTENT_SECTION_PATHNAME } from '../constants.js';
import { UMB_DOCUMENT_ENTITY_TYPE } from '@umbraco-cms/backoffice/document';
import { UMB_WORKSPACE_EDIT_PATH_PATTERN } from '@umbraco-cms/backoffice/workspace';

export const EXAMPLE_MOBILE_CONTENT_BROWSE_PATHNAME = 'browse';

/**
 * Absolute path of the list for the given parent, or the section root for `null`.
 * @param {string | null} unique - The parent document unique, or null for the root.
 * @returns {string} The absolute browse path.
 */
export function getBrowsePath(unique: string | null): string {
	return unique
		? `${EXAMPLE_MOBILE_CONTENT_SECTION_PATH}/${EXAMPLE_MOBILE_CONTENT_BROWSE_PATHNAME}/${unique}`
		: EXAMPLE_MOBILE_CONTENT_SECTION_PATH;
}

/**
 * Absolute path of the document workspace inside the mobile section.
 * @param {string} unique - The document unique.
 * @returns {string} The absolute edit path.
 */
export function getEditPath(unique: string): string {
	return UMB_WORKSPACE_EDIT_PATH_PATTERN.generateAbsolute({
		sectionName: EXAMPLE_MOBILE_CONTENT_SECTION_PATHNAME,
		entityType: UMB_DOCUMENT_ENTITY_TYPE,
		unique,
	});
}
